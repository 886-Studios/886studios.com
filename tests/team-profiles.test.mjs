import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import * as launchpadSchedule from "../src/data/launchpadSchedule.ts";

function loadData(path, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  new Function("exports", "require", outputText)(exports, (name) => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  });
  return exports;
}
const { siteContent } = loadData("../src/data/siteContent.ts", {
  "../config/site": { applicationUrl: "https://example.com/apply" },
  "./launchpadSchedule": launchpadSchedule,
});
const { partnerProfiles } = loadData("../src/data/partnerProfiles.ts", {
  "./siteContent": { siteContent },
});
const { redirects } = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
const expected = {
  "Kai Huang": "kai", "Kevin Lin": "kevin-lin", "Kevin Chou": "kevin-chou",
  "Max Hsieh": "max", "Patryk Chojecki": "patryk", "Carter Wang": "carter",
  "Phil Chen": "phil", "James Hong": "james", "Jameson Hsu": "jameson",
  "Charles Huang": "charles", "Chris Wang": "chris", "Joseph Hei": "joseph",
  "Jacob Hsu": "jacob", "Steven Chiang": "steven", "Timothy Chen": "timothy",
};

test("all team profiles use unique first-name routes, disambiguating the two Kevins", () => {
  assert.equal(partnerProfiles.length, 15);
  assert.equal(new Set(partnerProfiles.map((profile) => profile.slug)).size, 15);
  for (const profile of partnerProfiles) assert.equal(profile.slug, expected[profile.name]);
});

test("profile identity fields match the directory roster and have portrait cutouts", () => {
  const roster = [...siteContent.about.team, ...siteContent.about.partners];
  for (const profile of partnerProfiles) {
    const person = roster.find((person) => person.name === profile.name);
    assert.ok(person);
    assert.equal(profile.role, person.role);
    assert.equal(profile.company, person.company ?? "");
    assert.equal(profile.photo, person.photo);
    assert.ok(existsSync(new URL(`../public${profile.photo.replace("/headshots/", "/headshots/team/")}`, import.meta.url)));
    if (person.linkedinUrl) assert.equal(profile.socials.find((link) => link.platform === "linkedin").href, person.linkedinUrl);
  }
});

// Match the repository's literal, parameter, and alternation redirect patterns.
function matches(source, path) {
  const pattern = source.replace(/:([a-zA-Z]+)\(([^)]+)\)/g, "($2)")
    .replace(/:[a-zA-Z]+\+/g, ".+").replace(/:[a-zA-Z]+\*/g, ".*").replace(/:[a-zA-Z]+/g, "[^/]+");
  return new RegExp(`^${pattern}$`).test(path);
}

test("old profile URLs redirect directly to canonical team pages without redirect loops", () => {
  for (const profile of partnerProfiles) {
    const destination = `/team/${profile.slug}`;
    const oldRoute = redirects.find((rule) => !rule.has && matches(rule.source, `/about/${profile.legacySlug}`));
    assert.equal(oldRoute?.destination, destination);
    assert.equal(oldRoute?.permanent, true);
    assert.equal(redirects.find((rule) => !rule.has && matches(rule.source, destination)), undefined, destination);
  }
});
