import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fetchLumaCover } from "../scripts/lib/luma-cover.mjs";

const archive = JSON.parse(
  await readFile(new URL("../src/data/luma-events.json", import.meta.url), "utf8"),
);
const syncScript = await readFile(
  new URL("../scripts/sync-luma-events.mjs", import.meta.url),
  "utf8",
);
const workflow = await readFile(
  new URL("../.github/workflows/sync-luma-events.yml", import.meta.url),
  "utf8",
);

test("event archive retains the complete seed and current upcoming event", () => {
  const ids = archive.events.map((event) => event.id);

  assert.ok(ids.includes("evt-rBcbL2sy2os0YPm"), "oldest archived event is missing");
  assert.ok(ids.includes("evt-gUg5eDr1ZdDDH5q"), "current upcoming event is missing");
  assert.ok(archive.events.length >= 15);
});

test("archived events are unique, chronological, and safe to render", () => {
  const ids = archive.events.map((event) => event.id);
  const dates = archive.events.map((event) => event.startAt);

  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(dates, [...dates].sort());

  for (const event of archive.events) {
    assert.ok(event.title);
    assert.ok(!Number.isNaN(new Date(event.startAt).valueOf()));
    assert.match(event.url, /^https:\/\/luma\.com\//);
    if (event.coverUrl) assert.match(event.coverUrl, /^https:\/\//);
  }
});

test("automatic sync preserves past events and runs without a premium API key", () => {
  assert.match(workflow, /cron: "\*\/30 \* \* \* \*"/);
  assert.match(workflow, /node scripts\/sync-luma-events\.mjs/);
  assert.match(syncScript, /if \(getEventEnd\(event\) < now\) mergedById\.set\(event\.id, event\)/);
  assert.match(syncScript, /publicIcsEndpoint/);
  assert.doesNotMatch(syncScript, /LUMA_API_KEY|x-luma-api-key/);
});

const event = { id: "evt-artwork", url: "https://luma.com/artwork" };
const coverUrl = "https://images.lumacdn.com/uploads/test/cover.jpg";
const eventPage = (details) => new Response(
  `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
    props: { pageProps: { initialData: { data: { event: details } } } },
  })}</script>`,
);

test("missing iCal artwork can be recovered from the matching public event page", async () => {
  const cover = await fetchLumaCover(event, async (url) => {
    assert.equal(url.href, event.url);
    return eventPage({ api_id: event.id, cover_url: coverUrl });
  });
  assert.equal(cover, coverUrl);
});

test("artwork lookup handles events with no cover", async () => {
  assert.equal(await fetchLumaCover(event, async () => eventPage({ api_id: event.id })), undefined);
});

test("artwork lookup rejects failed pages, mismatched events, and unsafe images", async () => {
  await assert.rejects(fetchLumaCover(event, async () => new Response("", { status: 429 })), /429/);
  await assert.rejects(fetchLumaCover(event, async () => new Response("Unavailable")), /missing event data/);
  await assert.rejects(fetchLumaCover(event, async () => eventPage({ api_id: "evt-other", cover_url: coverUrl })), /ID does not match/);
  for (const unsafeCover of ["http://images.lumacdn.com/cover.jpg", "https://example.com/cover.jpg"]) {
    await assert.rejects(fetchLumaCover(event, async () => eventPage({ api_id: event.id, cover_url: unsafeCover })), /artwork URL/);
  }
});
