import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { notifyAfterDeployment } from "../scripts/indexnow-after-deploy.mjs";
import { captureSnapshot, changedUrls, productionOrigin as origin, publicUrl } from "../scripts/lib/indexnow-snapshot.mjs";

const hash = (character) => character.repeat(64);
const snapshot = (pages) => ({ version: 1, origin, pages });
test("notifies additions, content changes and removals, but leaves unchanged URLs alone", () => {
  const previous = snapshot({ [origin + "/"]: hash("a"), [origin + "/same"]: hash("b"), [origin + "/removed"]: hash("c") });
  const current = snapshot({ [origin + "/"]: hash("d"), [origin + "/same"]: hash("b"), [origin + "/new"]: hash("e") });
  assert.deepEqual(changedUrls(previous, current), [origin + "/", origin + "/new", origin + "/removed"]);
  assert.deepEqual(changedUrls(current, current), []);
});
test("rejects private, external and noncanonical URLs even in old state", () => {
  for (const url of [origin + "/perks", origin + "/perks/team", "https://apply.886studios.com/", "https://example.com/", origin + "/?email=test", origin + "/#fragment"]) {
    assert.throws(() => publicUrl(url));
    assert.throws(() => changedUrls(snapshot({ [url]: hash("a") }), snapshot({})));
  }
});
const sitemap = (urls) => new Response("<urlset>" + urls.map((url) => "<url><loc>" + url + "</loc></url>").join("") + "</urlset>", { headers: { "content-type": "application/xml" } });
const page = (html, headers = {}) => new Response(html, { headers: { "content-type": "text/html", ...headers } });
test("fingerprints live HTML and ignores sitemap lastmod-only changes", async () => {
  const capture = (date, html) => captureSnapshot(async (url) => url.endsWith("sitemap.xml")
    ? new Response("<urlset><url><loc>" + origin + "/</loc><lastmod>" + date + "</lastmod></url></urlset>")
    : page(html));
  const first = await capture("2026-01-01", "<h1>First</h1>");
  assert.deepEqual(changedUrls(first, await capture("2026-02-01", "<h1>First</h1>")), []);
  assert.deepEqual(changedUrls(first, await capture("2026-02-01", "<h1>Changed</h1>")), [origin + "/"]);
});
test("aborts on failed fetches, redirects, non-HTML or noindex instead of recording a partial baseline", async () => {
  for (const response of [
    new Response("failure", { status: 503 }),
    new Response(null, { status: 301, headers: { location: "/another" } }),
    new Response("{}"),
    page('<meta content="noindex,follow" name="robots">'),
    page("<h1>Private</h1>", { "x-robots-tag": "noindex" }),
  ]) {
    await assert.rejects(captureSnapshot(async (url) => url.endsWith("sitemap.xml") ? sitemap([origin + "/"]) : response));
  }
});
test("rejects empty and private sitemaps before fetching pages", async () => {
  for (const urls of [[], [origin + "/perks/team"]]) {
    await assert.rejects(captureSnapshot(async () => sitemap(urls)));
  }
});

test("advances the snapshot only after changed URLs are accepted; failures and dry runs preserve state", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "886-indexnow-state-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const previousPath = path.join(directory, "accepted.json");
  const before = snapshot({ [origin + "/"]: hash("a") });
  const after = snapshot({ [origin + "/"]: hash("b") });
  const original = JSON.stringify(before);
  await writeFile(previousPath, original);
  const options = { previousPath, output: previousPath, capture: async () => after, log: () => {} };
  let attempts = 0;
  const failingSubmit = async (urls) => {
    attempts++;
    assert.deepEqual(urls, [origin + "/"]);
    throw new Error("Submission rejected");
  };
  await assert.rejects(notifyAfterDeployment({ ...options, submit: failingSubmit }), /Submission rejected/);
  assert.equal(await readFile(previousPath, "utf8"), original);
  await assert.rejects(notifyAfterDeployment({ ...options, capture: async () => { throw new Error("Capture failed"); }, submit: failingSubmit }), /Capture failed/);
  assert.equal(await readFile(previousPath, "utf8"), original);
  await notifyAfterDeployment({ ...options, dryRun: true, submit: failingSubmit });
  assert.equal(attempts, 1);
  assert.equal(await readFile(previousPath, "utf8"), original);
  await notifyAfterDeployment({ ...options, submit: async (urls) => {
    assert.equal(await readFile(previousPath, "utf8"), original);
    assert.deepEqual(urls, [origin + "/"]);
  } });
  assert.deepEqual(JSON.parse(await readFile(previousPath, "utf8")), after);
  await notifyAfterDeployment({ ...options, submit: failingSubmit });
  assert.equal(attempts, 1, "unchanged URLs must not be submitted");
});
