import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import test from "node:test";
import { fetchIndexNow, getIndexNowConfig } from "../scripts/lib/indexnow-config.mjs";

async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "886-indexnow-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(path.join(directory, "public", "keys"), { recursive: true });
  await writeFile(path.join(directory, "public", "indexnow-key.txt"), "public-key-1234");
  await writeFile(path.join(directory, "public", "keys", "custom.txt"), "public-key-1234");
  return directory;
}

test("default and nested public key paths produce matching HTTPS locations", async (t) => {
  const directory = await fixture(t);
  const config = await getIndexNowConfig({}, directory);
  assert.equal(config.siteUrl.origin, "https://www.886studios.com");
  assert.equal(config.endpoint, "https://api.indexnow.org/indexnow");
  assert.equal(config.keyLocation, "https://www.886studios.com/indexnow-key.txt");
  const custom = await getIndexNowConfig({ INDEXNOW_SITE_URL: "https://example.com", INDEXNOW_KEY_FILE: "keys/custom.txt" }, directory);
  assert.equal(custom.keyLocation, "https://example.com/keys/custom.txt");
});

test("unsafe URLs and key paths fail before any network request", async (t) => {
  const directory = await fixture(t);
  for (const [name, values] of [
    ["INDEXNOW_SITE_URL", ["http://example.com", "https://user:password@example.com", "https://example.com/path", "https://example.com/?query=1", "https://example.com/#fragment", "invalid"]],
    ["INDEXNOW_ENDPOINT", ["http://example.com/indexnow", "https://user:password@example.com", "https://example.com/#fragment", "invalid"]],
    ["INDEXNOW_KEY_FILE", ["../private.txt", "/tmp/private.txt", "keys/../../private.txt", "keys\\private.txt", "//evil.example/key.txt", "key.txt?query=1", "key.txt#fragment", "%2e%2e/private.txt"]],
  ]) {
    for (const value of values) await assert.rejects(getIndexNowConfig({ [name]: value }, directory), new RegExp(name));
  }
  await writeFile(path.join(directory, "private.txt"), "private");
  await symlink(path.join(directory, "private.txt"), path.join(directory, "public", "outside.txt"));
  await assert.rejects(getIndexNowConfig({ INDEXNOW_KEY_FILE: "outside.txt" }, directory), /external symlinks/);
});

test("IndexNow requests retain their payload, have a deadline, and reject redirects", async () => {
  let request;
  const response = new Response("Accepted", { status: 202 });
  assert.equal(await fetchIndexNow("https://api.indexnow.org/indexnow", { method: "POST", body: "payload" }, async (url, options) => {
    request = { url, options };
    return response;
  }), response);
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.body, "payload");
  assert.equal(request.options.redirect, "error");
  assert.ok(request.options.signal instanceof AbortSignal);
  assert.equal(request.options.signal.aborted, false);
});

test("the CLI can inspect a submission without sending or printing its key", async (t) => {
  const directory = await fixture(t);
  const output = execFileSync(process.execPath, [
    fileURLToPath(new URL("../scripts/submit-indexnow.mjs", import.meta.url)),
    "--dry-run", "--url=https://www.886studios.com/contact",
  ], { cwd: directory, env: { PATH: process.env.PATH }, encoding: "utf8" });
  const preview = JSON.parse(output);
  assert.equal(preview.urlCount, 1);
  assert.equal(preview.firstUrl, "https://www.886studios.com/contact");
  assert.ok(!output.includes("public-key-1234"));
});

test("the CLI rejects private portal URLs from explicit arguments and sitemap input", async (t) => {
  const directory = await fixture(t);
  const script = fileURLToPath(new URL("../scripts/submit-indexnow.mjs", import.meta.url));
  await writeFile(path.join(directory, "sitemap.xml"), "<urlset><url><loc>https://www.886studios.com/perks</loc></url></urlset>");
  for (const argument of ["--url=https://www.886studios.com/perks", "--url=https://www.886studios.com/perks/login?q=test", "--sitemap=sitemap.xml"]) {
    const result = spawnSync(process.execPath, [script, "--dry-run", argument], {
      cwd: directory, env: { PATH: process.env.PATH }, encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Private perks URLs must never be submitted/);
  }
});
