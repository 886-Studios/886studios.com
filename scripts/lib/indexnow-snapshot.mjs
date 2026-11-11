import { createHash } from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import { isPrivatePerksUrl } from "./private-perks.mjs";

export const productionOrigin = "https://www.886studios.com";

export function publicUrl(value) {
  const url = new URL(value);
  if (url.origin !== productionOrigin || url.username || url.password ||
      url.search || url.hash || isPrivatePerksUrl(url.href)) {
    throw new Error("Snapshot contains a noncanonical or private URL: " + value);
  }
  return url.href;
}

export function readSnapshot(value) {
  if (value.version !== 1 || value.origin !== productionOrigin ||
      !value.pages || Array.isArray(value.pages) || typeof value.pages !== "object") {
    throw new Error("Invalid production snapshot.");
  }
  for (const [url, digest] of Object.entries(value.pages)) {
    publicUrl(url);
    if (!/^[a-f0-9]{64}$/.test(digest)) throw new Error("Invalid page fingerprint.");
  }
  return value;
}

export function changedUrls(previous, current) {
  readSnapshot(previous);
  readSnapshot(current);
  return [...new Set([...Object.keys(previous.pages), ...Object.keys(current.pages)])]
    .filter((url) => previous.pages[url] !== current.pages[url]).sort();
}

export async function captureSnapshot(fetcher = fetch) {
  const request = (url) => fetcher(url, {
    redirect: "manual",
    headers: { "User-Agent": "886Studios-IndexNow/1.0", "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(20_000),
  });
  const sitemap = await request(productionOrigin + "/sitemap.xml");
  if (!sitemap.ok) throw new Error("Production sitemap returned HTTP " + sitemap.status);
  const parsed = new XMLParser().parse(await sitemap.text());
  const entries = parsed.urlset?.url;
  const urls = [...new Set((Array.isArray(entries) ? entries : entries ? [entries] : [])
    .map((entry) => publicUrl(entry.loc)))].sort();
  if (!urls.length || urls.length > 10_000) throw new Error("Invalid production sitemap size.");
  const pages = {};
  // A small concurrency limit avoids overwhelming the public site.
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(4, urls.length) }, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      const response = await request(url);
      if (!response.ok) throw new Error("Public page returned HTTP " + response.status + ": " + url);
      if (!response.headers.get("content-type")?.includes("text/html")) {
        throw new Error("Expected HTML: " + url);
      }
      const html = await response.text();
      if (/noindex/i.test(response.headers.get("x-robots-tag") || "") ||
          /<meta\b(?=[^>]*\bname=["'](?:robots|googlebot|bingbot)["'])(?=[^>]*\bcontent=["'][^"']*noindex)[^>]*>/i.test(html)) {
        throw new Error("A sitemap page is marked noindex: " + url);
      }
      pages[url] = createHash("sha256").update(html).digest("hex");
    }
  }));
  return { version: 1, origin: productionOrigin, pages: Object.fromEntries(urls.map((url) => [url, pages[url]])) };
}
