import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
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

test("every resource route keeps its rendered guide, metadata, and structured data", async () => {
  assert.deepEqual(await resourceRoutes(), fixtures.resources.map((fixture) => fixture.route).sort());
  for (const { route, ...expected } of fixtures.resources) {
    assert.deepEqual(resourceContract(await readBuiltPage(route)), expected, route);
  }
});

test("archived drafts remain unpublished and absent from the sitemap", async () => {
  const sitemap = await readBuiltFile("sitemap.xml");
  for (const route of ["/manifesto", "/about/manifesto", "/rising-star", "/community/rising-star"]) {
    await assert.rejects(access(new URL(`../../dist${route}/index.html`, import.meta.url)), { code: "ENOENT" });
    assert.ok(!sitemap.includes(`<loc>https://www.886studios.com${route}</loc>`), route);
  }
});
