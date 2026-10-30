import { readFile, writeFile } from "node:fs/promises";
import { fetchLumaCover } from "./lib/luma-cover.mjs";

const archiveUrl = new URL("../src/data/luma-events.json", import.meta.url);
const publicItemsEndpoint = "https://api.luma.com/calendar/get-items";
const publicIcsEndpoint = "https://api2.luma.com/ics/get";
const defaultTimeZone = "Asia/Taipei";
const isDryRun = process.argv.includes("--dry-run");

const archive = JSON.parse(await readFile(archiveUrl, "utf8"));
const existingEvents = Array.isArray(archive.events) ? archive.events : [];
const existingUpcomingEventIds = Array.isArray(archive.upcomingEventIds)
  ? archive.upcomingEventIds
  : [];
const fetchedEvents = await fetchCurrentEvents(archive.calendarId);
const now = Date.now();
const existingById = new Map(existingEvents.map((event) => [event.id, event]));
const fetchedById = new Map(fetchedEvents.map((event) => [event.id, event]));

const mergedById = new Map();

for (const event of existingEvents) {
  if (getEventEnd(event) < now) mergedById.set(event.id, event);
}

for (const event of fetchedEvents) {
  const previous = existingById.get(event.id);
  const merged = mergeEvent(previous, event);
  if (!merged.coverUrl && merged.url) {
    try {
      const coverUrl = await fetchLumaCover(merged);
      if (coverUrl) merged.coverUrl = coverUrl;
    } catch (error) {
      console.warn(`[events] Could not load artwork for ${merged.id}: ${error.message}`);
    }
  }
  mergedById.set(event.id, merged);
}

const events = [...mergedById.values()].sort((a, b) => a.startAt.localeCompare(b.startAt));
const upcomingEventIds = events
  .filter((event) => getEventEnd(event) >= now)
  .map((event) => event.id)
  .sort();
const nextArchive = { calendarId: archive.calendarId, upcomingEventIds, events };
const nextJson = `${JSON.stringify(nextArchive, null, 2)}\n`;
const currentJson = `${JSON.stringify({
  calendarId: archive.calendarId,
  upcomingEventIds: existingUpcomingEventIds,
  events: existingEvents,
}, null, 2)}\n`;

const added = events.filter((event) => !existingById.has(event.id)).length;
const updated = events.filter((event) => {
  const previous = existingById.get(event.id);
  return previous && JSON.stringify(previous) !== JSON.stringify(event);
}).length;
const removedFuture = existingEvents.filter(
  (event) => getEventEnd(event) >= now && !fetchedById.has(event.id),
).length;

if (currentJson === nextJson) {
  console.log(`[events] Archive is current (${events.length} events).`);
  process.exit(0);
}

console.log(
  `[events] ${events.length} events after sync: ${added} added, ${updated} updated, ${removedFuture} unpublished future event(s) removed.`,
);

if (!isDryRun) {
  await writeFile(archiveUrl, nextJson, "utf8");
}

async function fetchCurrentEvents(calendarId) {
  if (typeof calendarId !== "string" || !calendarId.startsWith("cal-")) {
    throw new Error("The event archive has an invalid calendarId.");
  }

  try {
    const periods = await Promise.all([
      fetchPublicPeriod(calendarId, "future"),
      fetchPublicPeriod(calendarId, "past"),
    ]);

    return dedupe(periods.flat());
  } catch (error) {
    console.warn(`[events] Public event list failed; falling back to Luma iCal: ${error.message}`);
    return fetchIcsEvents(calendarId);
  }
}

async function fetchPublicPeriod(calendarId, period) {
  const url = new URL(publicItemsEndpoint);
  url.searchParams.set("calendar_api_id", calendarId);
  url.searchParams.set("pagination_limit", "100");
  url.searchParams.set("period", period);

  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) throw new Error(`Luma returned ${response.status} for ${period} events.`);

  const payload = await response.json();
  if (!Array.isArray(payload.entries)) throw new Error("Luma returned an unexpected event-list shape.");

  return payload.entries
    .map((entry) => normalizePublicEvent(entry?.event ?? entry))
    .filter(Boolean);
}

function normalizePublicEvent(event) {
  if (!event || typeof event !== "object") return null;
  if (!isString(event.api_id) || !isString(event.name) || !isIsoDate(event.start_at)) return null;

  const isOnline = /meet|zoom|online/i.test(stringValue(event.location_type));

  return compact({
    id: event.api_id.trim(),
    title: event.name.trim(),
    startAt: new Date(event.start_at).toISOString(),
    endAt: isIsoDate(event.end_at) ? new Date(event.end_at).toISOString() : undefined,
    timezone: safeTimeZone(event.timezone),
    coverUrl: safeHttpsUrl(event.cover_url),
    url: getLumaUrl(event.url ?? event.slug),
    locationName: isOnline ? "Online" : getPublicLocation(event),
    isOnline,
  });
}

function getPublicLocation(event) {
  const geo = event.geo_address_json;
  if (geo && typeof geo === "object") {
    return stringValue(geo.address) || stringValue(geo.city_state) || stringValue(geo.city) || "Location TBD";
  }

  return "Location TBD";
}

async function fetchIcsEvents(calendarId) {
  const url = new URL(publicIcsEndpoint);
  url.searchParams.set("entity", "calendar");
  url.searchParams.set("id", calendarId);

  const response = await fetch(url, {
    headers: { accept: "text/calendar" },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) throw new Error(`Luma iCal returned ${response.status}.`);

  const text = (await response.text()).replace(/\r?\n[ \t]/g, "");
  const blocks = text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];
  const events = blocks.map(normalizeIcsEvent).filter(Boolean);

  if (events.length === 0) throw new Error("Luma iCal returned no readable events.");
  return dedupe(events);
}

function normalizeIcsEvent(block) {
  const uid = getIcsValue(block, "UID").split("@", 1)[0];
  const title = unescapeIcs(getIcsValue(block, "SUMMARY"));
  const startAt = parseIcsDate(getIcsValue(block, "DTSTART"));
  const endAt = parseIcsDate(getIcsValue(block, "DTEND"));
  const description = unescapeIcs(getIcsValue(block, "DESCRIPTION"));
  const rawLocation = unescapeIcs(getIcsValue(block, "LOCATION"));
  const hasCoordinates = Boolean(getIcsValue(block, "GEO"));
  const isOnline = rawLocation.startsWith("https://luma.com/event/") && !hasCoordinates;

  if (!uid || !title || !startAt) return null;

  return compact({
    id: uid,
    title,
    startAt,
    endAt,
    timezone: defaultTimeZone,
    url: getLumaUrl(description.match(/https:\/\/luma\.com\/[^\s]+/)?.[0]),
    locationName: isOnline ? "Online" : getIcsLocation(description, rawLocation),
    isOnline,
  });
}

function getIcsValue(block, name) {
  const line = block.split(/\r?\n/).find((candidate) => {
    const key = candidate.split(":", 1)[0];
    return key === name || key.startsWith(`${name};`);
  });

  return line ? line.slice(line.indexOf(":") + 1).trim() : "";
}

function parseIcsDate(value) {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!match) return undefined;

  const [, year, month, day, hour, minute, second] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString();
}

function getIcsLocation(description, rawLocation) {
  const lines = description.split("\n").map((line) => line.trim()).filter(Boolean);
  const addressIndex = lines.findIndex((line) => line === "Address:");
  const describedLocation = addressIndex >= 0 ? lines[addressIndex + 1] : "";

  if (describedLocation && !/check event page/i.test(describedLocation)) return describedLocation;
  if (rawLocation && !rawLocation.startsWith("https://")) return rawLocation.split(",", 1)[0];
  return "Location TBD";
}

function mergeEvent(previous, incoming) {
  if (!previous) return incoming;

  return compact({
    ...previous,
    ...incoming,
    coverUrl: incoming.coverUrl ?? previous.coverUrl,
    url: incoming.url ?? previous.url,
    locationName:
      incoming.locationName === "Location TBD"
        ? previous.locationName ?? incoming.locationName
        : incoming.locationName,
  });
}

function getEventEnd(event) {
  const value = new Date(event.endAt ?? event.startAt).valueOf();
  return Number.isNaN(value) ? Number.NEGATIVE_INFINITY : value;
}

function getLumaUrl(value) {
  const candidate = stringValue(value);
  if (!candidate) return undefined;
  if (/^https:\/\/luma\.com\//i.test(candidate)) return safeHttpsUrl(candidate);
  if (/^[a-zA-Z0-9_-]+$/.test(candidate)) return `https://luma.com/${candidate}`;
  return undefined;
}

function safeHttpsUrl(value) {
  if (!isString(value)) return undefined;

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function safeTimeZone(value) {
  const candidate = stringValue(value) || defaultTimeZone;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: candidate }).format(new Date());
    return candidate;
  } catch {
    return defaultTimeZone;
  }
}

function isIsoDate(value) {
  return isString(value) && !Number.isNaN(new Date(value).valueOf());
}

function isString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function stringValue(value) {
  return isString(value) ? value.trim() : "";
}

function unescapeIcs(value) {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function compact(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}

function dedupe(events) {
  return [...new Map(events.map((event) => [event.id, event])).values()];
}
