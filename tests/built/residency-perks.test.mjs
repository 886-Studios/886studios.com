import assert from "node:assert/strict";
import test from "node:test";
import { canonical, metadata, readBuiltFile, readBuiltPage, tags, textContent } from "../helpers/built-pages.mjs";
import { hasPrivatePerksReference } from "../../scripts/lib/private-perks.mjs";

test("Residency surfaces exclude restricted, uncertain and retired offers without changing Launchpad", async () => {
  const excluded = ["OpenAI", "Deel", "Goodwin", "Supabase", "Granola", "Stripe", "Ramp", "Craft", "UXY", "Zettabyte", "Webflow"];
  for (const route of ["/residency-perks", "/residency"]) {
    const html = await readBuiltPage(route);
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
    assert.ok(main, route);
    for (const name of excluded) assert.doesNotMatch(textContent(main), new RegExp(`\\b${name}\\b`, "i"), `${route}: ${name} needs a new eligibility review before inclusion`);
    for (const name of ["GitHub", "Google Cloud", "Superhuman Docs", "Miro", "Notion", "Carta", "Beyond Border", "HubSpot", "AWS Activate Founders", "DocSend", "Linear", "Mercury", "Microsoft for Startups", "PostHog"]) {
      assert.ok(textContent(main).includes(name), `${route}: missing ${name}`);
    }
    assert.equal(hasPrivatePerksReference(html), false, `${route}: private portal link exposed`);
    assert.doesNotMatch(html, /notion\.so\/|app\.notion\.com\/|collection:\/\/|partnerCode=|org_id=|utm_source=886/i);
  }
  const launchpad = textContent(await readBuiltPage("/launchpad"));
  for (const name of ["OpenAI", "Supabase", "Granola", "Webflow"]) assert.ok(launchpad.includes(name), `Launchpad was unintentionally changed: ${name}`);
});

test("Residency perks uses private requests for partner offers and public applications for open programs", async () => {
  const html = await readBuiltPage("/residency-perks");
  const url = "https://www.886studios.com/residency-perks";
  assert.equal(canonical(html), url);
  assert.doesNotMatch(metadata(html, "robots"), /noindex/);
  assert.match(await readBuiltFile("sitemap.xml"), new RegExp(`<loc>${url}</loc>`));
  assert.ok(tags(await readBuiltPage("/residency"), "a").some(a => a.href === "/residency-perks"));
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)[1];
  const requests = tags(main, "a").filter(a => a["aria-label"]?.startsWith("Request "));
  assert.equal(requests.length, 11);
  for (const link of requests) {
    const request = new URL(link.href.replaceAll("&amp;", "&"));
    assert.equal(request.protocol, "mailto:");
    assert.equal(request.pathname, "carter@886studios.com");
    assert.match(request.searchParams.get("subject"), /^886 Residency perk: /);
    assert.match(request.searchParams.get("body"), /Company and website:/);
  }
  const applications = tags(main, "a").filter(a => a["aria-label"]?.startsWith("Apply to "));
  assert.deepEqual(applications.map(a => a.href).sort(), ["https://aws.amazon.com/startups/credits/", "https://portal.azure.com/?homeview=startup", "https://app.posthog.com/startups"].sort());
  for (const link of tags(main, "a").filter(a => a.href?.startsWith("https:") && a.href !== "https://portal.azure.com/?homeview=startup")) {
    assert.equal(new URL(link.href).search, "", "No partner-specific query strings on public links");
  }
});

test("Every perk includes native accessible eligibility details and current restrictions", async () => {
  const html = await readBuiltPage("/residency-perks");
  const cards = [...html.matchAll(/<article\b[^>]*data-perk-id="([^"]+)"[^>]*>([\s\S]*?)<\/article>/gi)];
  assert.equal(cards.length, 14);
  for (const [_, id, card] of cards) {
    assert.equal(tags(card, "details").length, 1, id);
    assert.equal(tags(card, "summary").length, 1, id);
    assert.ok(tags(card, "li").length >= 1, `${id}: missing eligibility`);
  }
  const github = cards.find(([, id]) => id === "github")[2];
  assert.match(textContent(github), /outside funding/);
  assert.doesNotMatch(textContent(github), /20 seats|50% off/);
  const miro = cards.find(([, id]) => id === "miro")[2];
  assert.match(textContent(miro), /fewer than 100 employees/);
  assert.doesNotMatch(textContent(miro), /\$1,000/);
  const aws = cards.find(([, id]) => id === "aws-founders")[2];
  assert.match(textContent(aws), /no partner Org ID required/);
  assert.doesNotMatch(textContent(aws), /\$10,000|\$25,000/);
  const mercury = cards.find(([, id]) => id === "mercury")[2];
  assert.match(textContent(mercury), /\$1,100/);
  assert.doesNotMatch(textContent(mercury), /\$1,200/);
});
