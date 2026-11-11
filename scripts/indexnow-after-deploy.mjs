import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { captureSnapshot, changedUrls, readSnapshot } from "./lib/indexnow-snapshot.mjs";

function submitUrls(urls) {
  const script = fileURLToPath(new URL("./submit-indexnow.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [script, ...urls.map((url) => "--url=" + url)], { stdio: "inherit" });
  if (result.status !== 0) throw new Error("IndexNow was not accepted; preserving the previous snapshot.");
}

export async function notifyAfterDeployment({
  output = ".artifacts/indexnow/production-snapshot.json",
  previousPath = "scripts/data/indexnow-baseline.json",
  dryRun = false,
  baselineOnly = false,
  capture = captureSnapshot,
  submit = submitUrls,
  log = console.log,
} = {}) {
  const current = readSnapshot(await capture());
  const previous = baselineOnly ? undefined : readSnapshot(JSON.parse(await readFile(previousPath, "utf8")));
  const urls = previous ? changedUrls(previous, current) : [];
  log(JSON.stringify({ mode: baselineOnly ? "baseline" : dryRun ? "dry-run" : "submit", publicPages: Object.keys(current.pages).length, changedUrls: urls }, null, 2));
  // A comparison must never replace accepted state, even if --output points at it.
  if (dryRun) return { current, urls };
  if (urls.length) await submit(urls);
  // Never advance stored state if capture or submission fails.
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(current, null, 2) + "\n");
  log("Snapshot saved to " + output);
  return { current, urls };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const argument = (name, fallback) => process.argv.find((value) => value.startsWith(name + "="))?.slice(name.length + 1) || fallback;
  await notifyAfterDeployment({
    output: argument("--output", ".artifacts/indexnow/production-snapshot.json"),
    previousPath: argument("--previous", "scripts/data/indexnow-baseline.json"),
    dryRun: process.argv.includes("--dry-run"),
    baselineOnly: process.argv.includes("--baseline-only"),
  });
}
