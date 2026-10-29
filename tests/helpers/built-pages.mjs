import { readFile, readdir } from "node:fs/promises";

const buildRoot = new URL("../../dist/", import.meta.url);

export function readBuiltFile(path) {
  return readFile(new URL(path.replace(/^\//, ""), buildRoot), "utf8");
}

export function readBuiltPage(route) {
  return readBuiltFile(`${route === "/" ? "" : route.replace(/^\//, "") + "/"}index.html`);
}

export function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(([, name, value]) => [name, value ?? ""]),
  );
}

export function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))].map(([, tag]) => attributes(tag));
}

export function metadata(html, name) {
  return tags(html, "meta").find((tag) => tag.name === name)?.content;
}

export function canonical(html) {
  return tags(html, "link").find((tag) => tag.rel === "canonical")?.href;
}

export function textContent(html) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function resourceContract(html) {
  return {
    title: textContent(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
    canonical: canonical(html),
    description: metadata(html, "description"),
    headings: [...html.matchAll(/<(h[12])\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map(([, level, text]) => [level, textContent(text)]),
    structuredData: [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
      .flatMap(([, json]) => JSON.parse(json)["@graph"] ?? [])
      .map((entry) => ({
        type: entry["@type"],
        id: entry["@id"],
        ...(entry.dateModified ? { dateModified: entry.dateModified } : {}),
      })),
  };
}

export async function resourceRoutes() {
  const entries = await readdir(new URL("resources/", buildRoot), { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => `/resources/${entry.name}`).sort();
}
