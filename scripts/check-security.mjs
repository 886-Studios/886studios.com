import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { hasPrivatePerksReference, isPrivatePerksUrl } from "./lib/private-perks.mjs";

const config = JSON.parse(await readFile("vercel.json", "utf8"));
const policy = config.headers.flatMap((entry) => entry.headers)
  .find((header) => header.key === "Content-Security-Policy")?.value;
const scriptSources = policy?.split(";").map((directive) => directive.trim())
  .find((directive) => directive.startsWith("script-src "))?.split(/\s+/).slice(1);
assert.ok(scriptSources?.includes("'self'"), "A script CSP is required");
assert.ok(!scriptSources.includes("'unsafe-inline'") && !scriptSources.includes("'unsafe-eval'"),
  "The script CSP must reject inline code and eval");

const productionAnalytics = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";
const siteUrl = "https://www.886studios.com";
let pages = 0;

async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      assert.ok(!isPrivatePerksUrl(`/${path.relative("dist", file).split(path.sep).join("/")}`),
        `${file}: private perks must not be emitted as public static pages`);
      await checkDirectory(file);
      continue;
    }
    if (!/\.(?:html|xml|txt|json|js)$/i.test(entry.name)) continue;
    const html = await readFile(file, "utf8");
    assert.ok(!hasPrivatePerksReference(html),
      `${file}: public content must not expose the private perks portal`);
    if (!entry.name.endsWith(".html")) continue;
    pages += 1;
    assert.equal(html.includes("data-google-analytics-id="), productionAnalytics,
      `${file}: Google analytics must match the deployment environment`);
    assert.equal(html.includes('data-linkedin-partner-id="10287404"'), productionAnalytics,
      `${file}: LinkedIn analytics must match the deployment environment`);
    assert.equal(html.includes("https://px.ads.linkedin.com/collect/?pid=10287404&amp;fmt=gif"), productionAnalytics,
      `${file}: LinkedIn fallback pixel must match the deployment environment`);
    assert.equal(html.includes("<vercel-analytics"), productionAnalytics && !file.includes(`${path.sep}apply${path.sep}`),
      `${file}: Vercel analytics must match the deployment environment`);
    for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      // JSON-LD is structured data, not executable JavaScript.
      if (/\btype=["']application\/ld\+json["']/i.test(attributes)) continue;
      const src = attributes.match(/\bsrc=["']([^"']+)["']/i)?.[1];
      assert.ok(src && !body.trim(), `${file}: executable scripts must use external files`);
      const url = new URL(src, siteUrl);
      assert.ok(url.origin === siteUrl || scriptSources.includes(url.origin),
        `${file}: script source ${url.origin} is not allowed by CSP`);
      if (url.origin === siteUrl) await access(path.join("dist", url.pathname));
    }
  }
}

await checkDirectory("dist");
assert.ok(pages > 0, "No built pages found");
console.log(`Security validation passed: ${pages} pages; no inline JavaScript; analytics ${productionAnalytics ? "production only" : "disabled"}.`);
