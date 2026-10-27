import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const content = await readFile(
  new URL("../src/data/siteContent.ts", import.meta.url),
  "utf8",
);
const resourcesPage = await readFile(
  new URL("../src/components/pages/ResourcesPage.astro", import.meta.url),
  "utf8",
);
const mercuryLogo = await readFile(
  new URL("../public/assets/logos/mercury.svg", import.meta.url),
  "utf8",
);
const stripeLogo = await readFile(
  new URL("../public/assets/logos/stripe.svg", import.meta.url),
  "utf8",
);
const zettabyteLogo = await readFile(
  new URL("../public/assets/logos/zettabyte.svg", import.meta.url),
  "utf8",
);
const linearLogo = await readFile(
  new URL("../public/assets/logos/linear.svg", import.meta.url),
  "utf8",
);

test("Exclusive Perks appear on program pages before joining and FAQ, not in the resource library", async () => {
  assert.doesNotMatch(resourcesPage, /resources\.perks|ProgramPerks|res-perks/);
  assert.ok(resourcesPage.indexOf("<!-- AMA Feature Card -->") > resourcesPage.indexOf('aria-label="Resource library"'));

  for (const [file, followingSection] of [
    ["LaunchStationPage.astro", 'class="launch-station-joining"'],
    ["ProgramsPage.astro", 'class="prog-faq reveal"'],
  ]) {
    const page = await readFile(new URL(`../src/components/pages/${file}`, import.meta.url), "utf8");
    const perksPosition = page.indexOf("<ProgramPerks ");
    assert.ok(perksPosition >= 0, `${file} must include partner perks`);
    assert.ok(perksPosition < page.indexOf(followingSection), `${file} must place perks before the requested section`);
  }
});

test("resource guides follow the topic reading order", () => {
  const library = content.slice(
    content.indexOf("    libraryItems: ["),
    content.indexOf("    ama: {"),
  );
  const titles = [...library.matchAll(/title: "([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(titles, [
    "Founders FAQs",
    "Incorporation 101",
    "Cap Table Guide",
    "SAFE Note Guide",
    "Term Sheet Guide",
    "Burn Rate & Runway Guide",
    "Application Guide",
    "Interview Guidebook",
    "Ecosystem Database",
    "Y Combinator 101",
  ]);
});

test("resource perks keep their intentional category and item order", () => {
  const perks = content.slice(
    content.indexOf("    perks: {"),
    content.indexOf("  about: {"),
  );
  const categories = [...perks.matchAll(/title: "([^"]+)",\n\s+items: \[([\s\S]*?)\n\s+\],/g)];

  assert.equal(categories.length, 4);
  assert.deepEqual(
    categories.map(([, category]) => category),
    ["Engineering", "Productivity", "Finances", "Marketing"],
  );

  for (const [, category, items] of categories) {
    const labels = [...items.matchAll(/label: "([^"]+)"/g)].map((match) => match[1]);
    const sortableLabels = category === "Engineering" ? labels.slice(1) : labels;
    const sortedLabels = [...sortableLabels].sort((a, b) => a.localeCompare(b));

    if (category === "Engineering") {
      assert.equal(labels[0], "OpenAI");
    }
    assert.deepEqual(sortableLabels, sortedLabels, `${category} perks are not alphabetized`);
  }
});

test("resource perk links use public company homepages", () => {
  const perks = content.slice(
    content.indexOf("    perks: {"),
    content.indexOf("  about: {"),
  );
  const hrefs = [...perks.matchAll(/href: "(https:\/\/[^\"]+)"/g)].map(
    (match) => match[1],
  );

  assert.equal(hrefs.length, 19);
  for (const href of hrefs) {
    const url = new URL(href);
    assert.equal(url.pathname, "/", `${href} is not a company homepage`);
    assert.equal(url.search, "", `${href} includes query parameters`);
    assert.equal(url.hash, "", `${href} includes a fragment`);
  }
});

test("OpenAI is listed as an Engineering perk without publishing the credit amount", () => {
  const engineering = content.slice(
    content.indexOf('title: "Engineering"'),
    content.indexOf("          ],", content.indexOf('title: "Engineering"')),
  );

  assert.match(engineering, /label: "OpenAI"/);
  assert.match(engineering, /href: "https:\/\/openai\.com"/);
  assert.match(engineering, /logoSrc: "\/assets\/logos\/openai\.svg"/);
  assert.doesNotMatch(engineering, /5\s*k|5,000|5000/i);
});

test("Mercury uses its current fintech mark in the perks icon slot", () => {
  assert.match(content, /logoSrc: "\/assets\/logos\/mercury\.svg"/);
  assert.match(mercuryLogo, /viewBox="0 0 500 500"/);
  assert.match(mercuryLogo, /fill="#f4f5f9"/);
  assert.equal((mercuryLogo.match(/<path\b/g) ?? []).length, 1);
  assert.doesNotMatch(mercuryLogo, /prefers-color-scheme|viewBox="43\.5 8 13\.5 16"/);
});

test("Zettabyte is listed as an Engineering perk with its official mark", () => {
  const engineering = content.slice(
    content.indexOf('title: "Engineering"'),
    content.indexOf("          ],", content.indexOf('title: "Engineering"')),
  );

  assert.match(engineering, /label: "Zettabyte"/);
  assert.match(engineering, /href: "https:\/\/www\.zettabyte\.space\/"/);
  assert.match(engineering, /logoSrc: "\/assets\/logos\/zettabyte\.svg"/);
  assert.match(zettabyteLogo, /viewBox="0 0 54 54"/);
  assert.equal((zettabyteLogo.match(/<path\b/g) ?? []).length, 3);
});

test("Stripe is listed as a Finances perk with its purple wordmark", () => {
  const finances = content.slice(
    content.indexOf('title: "Finances"'),
    content.indexOf("          ],", content.indexOf('title: "Finances"')),
  );

  assert.match(finances, /label: "Stripe"/);
  assert.match(finances, /href: "https:\/\/stripe\.com"/);
  assert.match(finances, /logoSrc: "\/assets\/logos\/stripe\.svg"/);
  assert.match(stripeLogo, /fill="#635BFF"/);
  assert.doesNotMatch(stripeLogo, /fill="white"/);
});

test("Linear is listed as a Productivity perk with its public website and official mark", () => {
  const productivity = content.slice(
    content.indexOf('title: "Productivity"'),
    content.indexOf("          ],", content.indexOf('title: "Productivity"')),
  );

  assert.match(productivity, /label: "Linear"/);
  assert.match(productivity, /href: "https:\/\/linear\.app"/);
  assert.match(productivity, /logoSrc: "\/assets\/logos\/linear\.svg"/);
  assert.match(linearLogo, /viewBox="0 0 100 100"/);
  assert.match(linearLogo, /fill="#fff"/);
  assert.equal((linearLogo.match(/<path\b/g) ?? []).length, 1);
});
