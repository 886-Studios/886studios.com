import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { contentDates } from "../../src/data/contentDates.generated.ts";
import { attributes, canonical, metadata, readBuiltFile, readBuiltPage, resourceContract, resourceRoutes, tags, textContent } from "../helpers/built-pages.mjs";

// Recorded from the unmodified site. Review deliberate content changes rather
// than regenerating expectations automatically during a build.
const fixtures = JSON.parse(await readFile(new URL("../fixtures/route-contracts.json", import.meta.url), "utf8"));

for (const fixture of fixtures.redirects) {
  test(`${fixture.route} preserves its redirect and no-JavaScript fallback`, async () => {
    const html = await readBuiltPage(fixture.route);
    assert.equal(textContent(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ""), fixture.title);
    assert.equal(metadata(html, "robots"), "noindex, follow");
    assert.equal(canonical(html), `https://www.886studios.com${fixture.destination}`);
    assert.equal(tags(html, "meta").find((tag) => tag["http-equiv"] === "refresh")?.content, `0;url=${fixture.destination}`);
    const links = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
      .map(([, attrs, text]) => ({ ...attributes(attrs), text: textContent(text) }));
    assert.ok(links.some((link) => link.href === fixture.destination && link.text === fixture.label));

    const scripts = await Promise.all(tags(html, "script").filter((script) => script.src?.startsWith("/_astro/"))
      .map((script) => readBuiltFile(script.src)));
    const redirectScripts = scripts.filter((script) => script.includes("location.replace"));
    assert.equal(redirectScripts.length, 1, "exactly one executable redirect script");
    for (const [search, hash] of [["", ""], ["?ref=legacy&value=a%26b", ""], ["", "#details"], ["?ref=legacy", "#details"]]) {
      const destinations = [];
      vm.runInNewContext(redirectScripts[0], {
        window: { location: { search, hash, replace: (value) => destinations.push(value) } },
        document: {
          querySelector(selector) {
            const link = links.find((item) => selector.startsWith("#") ? item.id === selector.slice(1) :
              selector === "[data-redirect-destination]" && Object.hasOwn(item, "data-redirect-destination"));
            return link ? { getAttribute: (name) => link[name] } : null;
          },
        },
      });
      assert.deepEqual(destinations, [`${fixture.destination}${search}${hash}`]);
    }
  });
}

test("886 Residency uses its new canonical route, schema, sitemap, and navigation", async () => {
  const html = await readBuiltPage("/residency");
  const url = "https://www.886studios.com/residency";
  assert.equal(canonical(html), url);
  assert.ok(!metadata(html, "robots")?.includes("noindex"));
  assert.match(textContent(html), /886 Residency/);
  const graph = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap(([, json]) => JSON.parse(json)["@graph"] ?? []);
  const service = graph.find((entry) => entry["@type"] === "Service");
  assert.equal(service?.url, url);
  assert.equal(service?.["@id"], `${url}#residency`);
  assert.equal(service?.mainEntityOfPage?.["@id"], `${url}#webpage`);
  const sitemap = await readBuiltFile("sitemap.xml");
  assert.ok(sitemap.includes(`<loc>${url}</loc>`));
  assert.ok(!sitemap.includes("/launch-station</loc>"));
  for (const route of ["/", "/residency", "/accelerator", "/resources/application-guide"]) {
    const links = tags(await readBuiltPage(route), "a");
    assert.ok(links.some((link) => link.href === "/residency"), `${route}: missing residency link`);
    assert.ok(!links.some((link) => /^\/(?:programs\/)?launch-station(?:[?#/]|$)/.test(link.href ?? "")), `${route}: stale residency link`);
  }
});

test("886 Launchpad uses the accelerator canonical URL, schema, and navigation", async () => {
  const html = await readBuiltPage("/accelerator");
  const url = "https://www.886studios.com/accelerator";
  assert.equal(canonical(html), url);
  assert.ok(!metadata(html, "robots")?.includes("noindex"));
  assert.equal(textContent(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? ""), "886 Launchpad");
  const graph = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap(([, json]) => JSON.parse(json)["@graph"] ?? []);
  const service = graph.find((entry) => entry["@type"] === "Service");
  assert.equal(service?.name, "886 Launchpad");
  assert.equal(service?.url, url);
  assert.equal(service?.["@id"], `${url}#launchpad`);
  const sitemap = await readBuiltFile("sitemap.xml");
  assert.ok(sitemap.includes(`<loc>${url}</loc>`));
  assert.ok(!sitemap.includes("/ikigai-launchpad</loc>"));
  for (const route of ["/", "/accelerator", "/residency", "/resources/application-guide"]) {
    const page = await readBuiltPage(route);
    assert.ok(tags(page, "a").some((link) => link.href === "/accelerator"), route);
    assert.ok(!tags(page, "a").some((link) => /^\/ikigai-launchpad(?:[?#/]|$)/.test(link.href ?? "")), route);
    assert.ok(!/ikigai-(?:logo|mark|wordmark)/i.test(page), route);
  }
});

test("newsletter branding uses 886 Insights and retains the subscription destination", async () => {
  const html = await readBuiltPage("/blog");
  assert.match(textContent(html), /886 Insights/);
  assert.ok(!html.includes("ikigai-insights-substack-wide"));
  assert.ok(tags(html, "form").some((form) => form.action === "https://886studios.substack.com/subscribe"));
});

test("every resource route keeps its rendered guide, metadata, and structured data", async () => {
  assert.deepEqual(await resourceRoutes(), fixtures.resources.map((fixture) => fixture.route).sort());
  for (const { route, ...expected } of fixtures.resources) {
    const dateModified = contentDates[route];
    assert.match(dateModified, /^\d{4}-\d{2}-\d{2}$/, `${route}: missing generated content date`);
    const structuredData = expected.structuredData.map((entry) =>
      entry.type === "WebPage" || entry.type === "Article" ? { ...entry, dateModified } : entry,
    );
    assert.deepEqual(resourceContract(await readBuiltPage(route)), { ...expected, structuredData }, route);
  }
});

test("archived drafts remain unpublished and absent from the sitemap", async () => {
  const sitemap = await readBuiltFile("sitemap.xml");
  for (const route of ["/manifesto", "/about/manifesto", "/rising-star", "/community/rising-star"]) {
    await assert.rejects(access(new URL(`../../dist${route}/index.html`, import.meta.url)), { code: "ENOENT" });
    assert.ok(!sitemap.includes(`<loc>https://www.886studios.com${route}</loc>`), route);
  }
});
