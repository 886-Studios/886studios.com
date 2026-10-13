import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, "dist");
const productionOrigin = "https://www.886studios.com";
const currentIsoDate = new Date().toISOString().slice(0, 10);
const failures = [];

const fail = (message) => failures.push(message);

const decodeHtml = (value = "") =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");

function parseAttributes(tag) {
  const attributes = new Map();
  const attributePattern = /([^\s=<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;

  while ((match = attributePattern.exec(tag))) {
    const name = match[1].toLowerCase();
    if (name.startsWith("<")) continue;
    attributes.set(name, decodeHtml(match[2] ?? match[3] ?? match[4] ?? ""));
  }

  return attributes;
}

function getTags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => ({
    raw: match[0],
    attributes: parseAttributes(match[0]),
  }));
}

function getMetaContent(head, attribute, value) {
  return getTags(head, "meta")
    .filter((tag) => tag.attributes.get(attribute) === value)
    .map((tag) => tag.attributes.get("content") ?? "");
}

function getLinkHref(head, rel) {
  return getTags(head, "link")
    .filter((tag) => tag.attributes.get("rel")?.split(/\s+/).includes(rel))
    .map((tag) => tag.attributes.get("href") ?? "");
}

function getRoute(filePath) {
  const relativePath = path.relative(distRoot, filePath).split(path.sep).join("/");
  if (relativePath === "index.html") return "/";
  if (relativePath.endsWith("/index.html")) return `/${relativePath.slice(0, -"/index.html".length)}`;
  return `/${relativePath.slice(0, -".html".length)}`;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(entryPath) : [entryPath];
    }),
  );

  return files.flat();
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function routeExists(pathname) {
  if (pathname === "/") return pathExists(path.join(distRoot, "index.html"));

  const relative = pathname.replace(/^\/+/, "");
  return (
    (await pathExists(path.join(distRoot, relative, "index.html"))) ||
    (await pathExists(path.join(distRoot, `${relative}.html`))) ||
    (await pathExists(path.join(distRoot, relative)))
  );
}

function assertSingle(values, label, route) {
  if (values.length !== 1 || !values[0].trim()) {
    fail(`${route}: expected one non-empty ${label}, found ${values.length}`);
    return undefined;
  }

  return values[0].trim();
}

let builtFiles;
try {
  builtFiles = await walk(distRoot);
} catch {
  throw new Error("dist is missing. Run npm run build before npm run check:seo.");
}

const htmlFiles = builtFiles.filter((file) => file.endsWith(".html"));
const pages = [];
const titles = new Map();
const descriptions = new Map();
const indexableCanonicals = new Set();
const pageModifiedDates = new Map();

for (const filePath of htmlFiles) {
  const html = await readFile(filePath, "utf8");
  const route = getRoute(filePath);
  const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? "";
  const titleValues = [...head.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map((match) =>
    decodeHtml(match[1].replace(/<[^>]+>/g, "").trim()),
  );
  const robots = getMetaContent(head, "name", "robots")[0]?.toLowerCase() ?? "";
  const isIndexable = route !== "/404" && !robots.includes("noindex");
  const title = assertSingle(titleValues, "title", route);

  if (!/<html\b[^>]*\blang="en"/i.test(html)) fail(`${route}: missing html lang=\"en\"`);
  if (html.includes("—")) fail(`${route}: generated copy contains an em dash`);
  if (/\bIkigai\b/.test(html)) fail(`${route}: generated copy capitalizes ikigai`);

  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (isIndexable && h1Count !== 1) fail(`${route}: expected one H1, found ${h1Count}`);

  if (isIndexable && (!title?.startsWith("886 Studios |") && !title?.endsWith("| 886 Studios"))) {
    fail(`${route}: title does not use the standard 886 Studios brand pattern`);
  }
  if (title?.includes("—")) fail(`${route}: title contains an em dash`);

  const descriptionValues = getMetaContent(head, "name", "description");
  const canonicalValues = getLinkHref(head, "canonical");
  const rssLinks = getTags(head, "link").filter(
    (tag) =>
      tag.attributes.get("rel")?.split(/\s+/).includes("alternate") &&
      tag.attributes.get("type") === "application/rss+xml",
  );
  const llmsLinks = getTags(head, "link").filter(
    (tag) =>
      tag.attributes.get("rel")?.split(/\s+/).includes("alternate") &&
      tag.attributes.get("type") === "text/markdown",
  );

  if (isIndexable) {
    const description = assertSingle(descriptionValues, "meta description", route);
    const canonical = assertSingle(canonicalValues, "canonical", route);
    if (
      rssLinks.length !== 1 ||
      rssLinks[0].attributes.get("href") !== `${productionOrigin}/rss.xml` ||
      rssLinks[0].attributes.get("title") !== "886 Studios Blog"
    ) {
      fail(`${route}: expected one valid RSS auto-discovery link`);
    }
    if (
      route === "/" &&
      (llmsLinks.length !== 1 ||
        llmsLinks[0].attributes.get("href") !== `${productionOrigin}/llms.txt` ||
        llmsLinks[0].attributes.get("title") !== "886 Studios machine-readable summary")
    ) {
      fail("/: expected one valid llms.txt discovery link");
    }

    if (description) {
      if (/(?:\.\.\.|…)\s*$/.test(description)) {
        fail(`${route}: meta description ends with an ellipsis; write a complete summary`);
      }
      if (/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/i.test(description)) {
        fail(`${route}: meta description contains a literal HTML entity after decoding`);
      }
      if (description.length < 50 || description.length > 180) {
        fail(`${route}: meta description length is ${description.length}, expected 50-180 characters`);
      }
      const routes = descriptions.get(description) ?? [];
      routes.push(route);
      descriptions.set(description, routes);
    }

    if (canonical) {
      let canonicalUrl;
      try {
        canonicalUrl = new URL(canonical);
      } catch {
        fail(`${route}: canonical is not a valid absolute URL`);
      }

      if (canonicalUrl) {
        if (canonicalUrl.origin !== productionOrigin || canonicalUrl.protocol !== "https:") {
          fail(`${route}: canonical does not use the production HTTPS origin`);
        }
        if (canonicalUrl.search || canonicalUrl.hash) fail(`${route}: canonical contains a query or fragment`);
        if (canonicalUrl.pathname.replace(/\/$/, "") !== route.replace(/\/$/, "")) {
          fail(`${route}: canonical path does not self-reference the route`);
        }
      }

      indexableCanonicals.add(canonical);
    }

    const requiredOg = ["og:type", "og:url", "og:title", "og:description", "og:site_name", "og:locale", "og:image", "og:image:alt", "og:image:type", "og:image:width", "og:image:height"];
    const requiredTwitter = ["twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"];

    for (const property of requiredOg) assertSingle(getMetaContent(head, "property", property), property, route);
    for (const name of requiredTwitter) assertSingle(getMetaContent(head, "name", name), name, route);

    const ogUrl = getMetaContent(head, "property", "og:url")[0];
    const ogImage = getMetaContent(head, "property", "og:image")[0];
    const twitterImage = getMetaContent(head, "name", "twitter:image")[0];
    if (canonical && ogUrl !== canonical) fail(`${route}: og:url does not match the canonical`);
    for (const [label, value] of [["og:image", ogImage], ["twitter:image", twitterImage]]) {
      if (value && !value.startsWith("https://")) fail(`${route}: ${label} is not an absolute HTTPS URL`);
    }

    const schemaScripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    if (schemaScripts.length !== 1) {
      fail(`${route}: expected one JSON-LD graph, found ${schemaScripts.length}`);
    } else {
      try {
        const schema = JSON.parse(schemaScripts[0][1]);
        const graph = Array.isArray(schema["@graph"]) ? schema["@graph"] : [];
        const types = graph.flatMap((node) => Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]]);
        if (!types.includes("Organization")) fail(`${route}: JSON-LD is missing Organization`);
        if (!types.includes("WebSite")) fail(`${route}: JSON-LD is missing WebSite`);
        if (!types.some((type) => ["WebPage", "AboutPage", "ContactPage", "CollectionPage", "ProfilePage"].includes(type))) {
          fail(`${route}: JSON-LD is missing a page entity`);
        }

        const ids = graph.map((node) => node["@id"]).filter(Boolean);
        if (new Set(ids).size !== ids.length) fail(`${route}: JSON-LD contains duplicate entity IDs`);
        if (JSON.stringify(schema).match(/localhost|\.vercel\.app|http:\/\//i)) {
          fail(`${route}: JSON-LD contains a local, preview, or non-HTTPS URL`);
        }

        const webpageSchema = graph.find(
          (node) => typeof node["@id"] === "string" && node["@id"].endsWith("#webpage"),
        );
        const webpageDateModified = webpageSchema?.dateModified;
        const requiresSourcedModifiedDate =
          [
            "/",
            "/blog",
            "/incorporation-101",
            "/interview-guidebook",
            "/ikigai-launchpad",
            "/launch-station",
            "/resources",
          ].includes(route) ||
          route.startsWith("/blog/") ||
          route.startsWith("/resources/");
        if (requiresSourcedModifiedDate && !webpageDateModified) {
          fail(`${route}: WebPage schema is missing its required sourced dateModified`);
        }
        if (webpageDateModified !== undefined) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(webpageDateModified)) {
            fail(`${route}: WebPage dateModified is not an ISO date`);
          } else if (webpageDateModified > currentIsoDate) {
            fail(`${route}: WebPage dateModified is in the future`);
          } else if (canonical) {
            pageModifiedDates.set(canonical, webpageDateModified);
          }
        }

        for (const article of graph.filter((node) => node["@type"] === "Article")) {
          if (!article.dateModified) {
            fail(`${route}: Article schema is missing dateModified`);
          } else if (article.dateModified !== webpageDateModified) {
            fail(`${route}: Article and WebPage dateModified values do not match`);
          }
        }

        if (route === "/") {
          const homepageSchema = webpageSchema?.["@id"] === `${productionOrigin}/#webpage`
            ? webpageSchema
            : undefined;
          if (!homepageSchema?.dateModified) {
            fail("/: homepage WebPage schema is missing a valid ISO dateModified");
          }
          if (homepageSchema?.abstract !== description) {
            fail("/: homepage WebPage abstract does not match the existing page summary");
          }
          if (homepageSchema?.mainEntity?.["@id"] !== `${productionOrigin}/#organization`) {
            fail("/: homepage WebPage mainEntity does not identify 886 Studios");
          }
          if (
            homepageSchema?.mentions?.["@id"] !==
            `${productionOrigin}/ikigai-launchpad#ikigai-launchpad`
          ) {
            fail("/: homepage WebPage does not identify ikigai Launchpad as its primary mention");
          }
          if (homepageSchema?.significantLink !== `${productionOrigin}/ikigai-launchpad`) {
            fail("/: homepage WebPage does not identify the ikigai Launchpad page as significant");
          }
        }

        for (const event of graph.filter((node) => node["@type"] === "Event")) {
          if (!event.name || !event.startDate || !event.location || !event.url) {
            fail(`${route}: Event schema is missing a required factual field`);
          }
        }
      } catch (error) {
        fail(`${route}: JSON-LD does not parse (${error.message})`);
      }
    }

    for (const elementName of ["header", "nav", "main", "footer"]) {
      if (!new RegExp(`<${elementName}\\b`, "i").test(html)) fail(`${route}: missing ${elementName} landmark`);
    }
  } else if (route === "/404") {
    if (canonicalValues.length) fail("/404: should not emit a canonical");
    if (/application\/ld\+json/i.test(html)) fail("/404: should not emit structured data");
  }

  if (title) {
    const routes = titles.get(title) ?? [];
    routes.push(route);
    titles.set(title, routes);
  }

  for (const image of getTags(html, "img")) {
    if (!image.attributes.has("alt")) fail(`${route}: image is missing an alt attribute`);
    if (!image.attributes.has("width") || !image.attributes.has("height")) {
      fail(`${route}: image is missing explicit width and height attributes`);
    }
  }

  for (const frame of getTags(html, "iframe")) {
    if (!frame.attributes.get("title")) fail(`${route}: iframe is missing a title`);
  }

  const labels = new Set(getTags(html, "label").map((label) => label.attributes.get("for")).filter(Boolean));
  for (const controlName of ["input", "textarea", "select"]) {
    for (const control of getTags(html, controlName)) {
      const type = control.attributes.get("type");
      if (type === "hidden") continue;
      const id = control.attributes.get("id");
      if (!control.attributes.get("aria-label") && (!id || !labels.has(id))) {
        fail(`${route}: ${controlName} is missing an associated label`);
      }
    }
  }

  pages.push({ route, html, isIndexable });
}

for (const [title, routes] of titles) {
  const indexableRoutes = routes.filter((route) => pages.find((page) => page.route === route)?.isIndexable);
  if (indexableRoutes.length > 1) fail(`duplicate title \"${title}\": ${indexableRoutes.join(", ")}`);
}

for (const [description, routes] of descriptions) {
  if (routes.length > 1) fail(`duplicate description \"${description}\": ${routes.join(", ")}`);
}

for (const page of pages) {
  for (const anchor of getTags(page.html, "a")) {
    const href = anchor.attributes.get("href");
    if (!href || href.startsWith("#")) continue;

    let url;
    try {
      url = new URL(href, `${productionOrigin}${page.route}`);
    } catch {
      fail(`${page.route}: invalid link ${href}`);
      continue;
    }

    if (url.origin !== productionOrigin) continue;
    if (!(await routeExists(url.pathname))) fail(`${page.route}: broken internal link to ${url.pathname}`);
  }
}

const sitemapXml = await readFile(path.join(distRoot, "sitemap.xml"), "utf8");
const sitemapEntries = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => {
  const entry = match[1];
  const loc = decodeHtml(entry.match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim() ?? "");
  const lastmods = [...entry.matchAll(/<lastmod>([\s\S]*?)<\/lastmod>/g)].map((lastmod) =>
    decodeHtml(lastmod[1].trim()),
  );
  return { loc, lastmods };
});
const sitemapUrls = new Set(sitemapEntries.map((entry) => entry.loc));

if (!/^<\?xml version="1\.0" encoding="UTF-8"\?>/.test(sitemapXml)) fail("sitemap.xml: missing XML declaration");
if (!sitemapXml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) fail("sitemap.xml: missing sitemap namespace");

const homepageSitemapEntry = sitemapEntries.find((entry) => entry.loc === `${productionOrigin}/`);
if (!homepageSitemapEntry) fail("sitemap.xml: homepage entry is missing");
for (const entry of sitemapEntries) {
  const pageModifiedDate = pageModifiedDates.get(entry.loc);
  if (entry.lastmods.length > 1) {
    fail(`sitemap.xml: ${entry.loc} has multiple lastmod values`);
    continue;
  }
  if (entry.lastmods.length === 0) {
    if (pageModifiedDate) {
      fail(`sitemap.xml: ${entry.loc} is missing its sourced lastmod value`);
    }
    continue;
  }

  const [lastmod] = entry.lastmods;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) {
    fail(`sitemap.xml: ${entry.loc} lastmod is not an ISO date`);
  } else if (lastmod > currentIsoDate) {
    fail(`sitemap.xml: ${entry.loc} lastmod is in the future`);
  } else if (!pageModifiedDate) {
    fail(`sitemap.xml: ${entry.loc} has a lastmod value without a reliable page date`);
  } else if (lastmod !== pageModifiedDate) {
    fail(`sitemap.xml: ${entry.loc} lastmod does not match its WebPage dateModified`);
  }
}

for (const canonical of indexableCanonicals) {
  if (!sitemapUrls.has(canonical)) fail(`sitemap.xml: missing ${canonical}`);
}
for (const url of sitemapUrls) {
  if (!indexableCanonicals.has(url)) fail(`sitemap.xml: includes non-indexable or non-canonical URL ${url}`);
}

const rssXml = await readFile(path.join(distRoot, "rss.xml"), "utf8");
if (!/^<\?xml version="1\.0" encoding="UTF-8"\?>/.test(rssXml)) {
  fail("rss.xml: missing XML declaration");
}
if (!/<rss\b[^>]*\bversion="2\.0"/i.test(rssXml)) fail("rss.xml: missing RSS 2.0 root");
if (!/xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom"/.test(rssXml)) {
  fail("rss.xml: missing Atom namespace");
}
if (!/xmlns:dc="http:\/\/purl\.org\/dc\/elements\/1\.1\/"/.test(rssXml)) {
  fail("rss.xml: missing Dublin Core creator namespace");
}

const rssChannel = rssXml.match(/<channel>([\s\S]*?)<\/channel>/i)?.[1] ?? "";
for (const [element, expected] of [
  ["title", "886 Studios Blog"],
  ["link", productionOrigin],
  ["language", "en-us"],
]) {
  if (!new RegExp(`<${element}>${expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</${element}>`).test(rssChannel)) {
    fail(`rss.xml: missing valid channel ${element}`);
  }
}
if (!/<description>[^<]+<\/description>/.test(rssChannel)) {
  fail("rss.xml: missing channel description");
}
if (
  !new RegExp(
    `<atom:link\\b(?=[^>]*\\bhref="${productionOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\/rss\\.xml")(?=[^>]*\\brel="self")(?=[^>]*\\btype="application/rss\\+xml")[^>]*/>`,
  ).test(rssChannel)
) {
  fail("rss.xml: missing valid Atom self link");
}

const rssItems = [...rssChannel.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
if (
  rssItems.length > 0 &&
  !/xmlns:content="http:\/\/purl\.org\/rss\/1\.0\/modules\/content\/"/.test(rssXml)
) {
  fail("rss.xml: missing RSS content namespace");
}
for (const [index, item] of rssItems.entries()) {
  for (const element of ["title", "link", "guid", "description", "pubDate", "dc:creator"]) {
    if (!new RegExp(`<${element}\\b[^>]*>[^<]+</${element}>`, "i").test(item)) {
      fail(`rss.xml: item ${index + 1} is missing ${element}`);
    }
  }

  const link = decodeHtml(item.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim() ?? "");
  const guid = decodeHtml(item.match(/<guid\b[^>]*>([\s\S]*?)<\/guid>/i)?.[1]?.trim() ?? "");
  if (!link.startsWith(`${productionOrigin}/blog/`)) {
    fail(`rss.xml: item ${index + 1} does not link to a canonical blog URL`);
  }
  if (guid !== link || !/<guid\b[^>]*\bisPermaLink="true"/i.test(item)) {
    fail(`rss.xml: item ${index + 1} has an invalid permanent GUID`);
  }

  const pubDate = decodeHtml(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() ?? "");
  if (Number.isNaN(Date.parse(pubDate))) {
    fail(`rss.xml: item ${index + 1} has an invalid publication date`);
  }

  const content = decodeHtml(
    item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i)?.[1]?.trim() ?? "",
  );
  if (!/<(?:p|figure|blockquote|h[1-6]|ul|ol|pre)\b/i.test(content)) {
    fail(`rss.xml: item ${index + 1} is missing full article HTML`);
  }
}

const robots = await readFile(path.join(distRoot, "robots.txt"), "utf8");
if (!/^User-agent: \*$/m.test(robots)) fail("robots.txt: missing the general user-agent group");
if (!/^Allow: \/$/m.test(robots)) fail("robots.txt: public crawling is not explicitly allowed");
if (!/^Sitemap: https:\/\/www\.886studios\.com\/sitemap\.xml$/m.test(robots)) fail("robots.txt: missing the production sitemap directive");

for (const crawler of [
  "OAI-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
]) {
  const escapedCrawler = crawler.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!new RegExp(`^User-agent: ${escapedCrawler}\\nAllow: \\/$`, "m").test(robots)) {
    fail(`robots.txt: ${crawler} is not explicitly allowed`);
  }
}

const llms = await readFile(path.join(distRoot, "llms.txt"), "utf8");
if (!llms.startsWith("# 886 Studios")) fail("llms.txt: missing the organization heading");
if (/http:\/\/|localhost|\.vercel\.app/i.test(llms)) fail("llms.txt: contains a non-production URL");
for (const requiredSection of ["## Programs", "## Organization", "## Founder resources", "## Official profiles"]) {
  if (!llms.includes(requiredSection)) fail(`llms.txt: missing ${requiredSection}`);
}
if (!llms.includes("https://www.886studios.com/resources/y-combinator-101")) {
  fail("llms.txt: missing the Y Combinator founder resource");
}

const deploymentConfig = JSON.parse(await readFile(path.join(projectRoot, "vercel.json"), "utf8"));
const redirects = Array.isArray(deploymentConfig.redirects) ? deploymentConfig.redirects : [];
for (const source of ["/programs", "/programs/"]) {
  if (!redirects.some((redirect) =>
    redirect.source === source &&
    redirect.destination === "/ikigai-launchpad" &&
    redirect.permanent === true
  )) fail(`${source}: missing permanent redirect to /ikigai-launchpad`);
}
if (!pages.some((page) => page.route === "/ikigai-launchpad" && page.isIndexable)) {
  fail("/ikigai-launchpad: missing indexable Launchpad page");
}
if (!pages.some((page) => page.route === "/programs" && !page.isIndexable)) {
  fail("/programs: missing noindex redirect fallback");
}
if (!redirects.some((redirect) =>
  redirect.source === "/programs/launch-station/:path*" &&
  redirect.destination === "/launch-station" &&
  redirect.permanent === true
)) fail("/programs/launch-station: missing permanent redirect to /launch-station");
if (!pages.some((page) => page.route === "/launch-station" && page.isIndexable)) {
  fail("/launch-station: missing indexable Launch Station page");
}
if (!pages.some((page) => page.route === "/programs/launch-station" && !page.isIndexable)) {
  fail("/programs/launch-station: missing noindex redirect fallback");
}
if (redirects.some((redirect) => redirect.source === "/launch-station/:path*")) {
  fail("/launch-station: legacy redirect must not intercept the current route");
}
if (deploymentConfig.trailingSlash !== false) fail("vercel.json: trailing slash normalization is not enabled");
if (!redirects.some((redirect) =>
  redirect.has?.some((condition) => condition.type === "host" && condition.value === "886studios.com") &&
  redirect.destination === "https://www.886studios.com/:path*" &&
  redirect.permanent === true
)) {
  fail("vercel.json: missing the permanent non-www to www redirect");
}
if (!redirects.some((redirect) =>
  redirect.source === "/apply" &&
  redirect.destination === "https://tally.so/r/w5p4jQ" &&
  redirect.permanent === false
)) {
  fail("vercel.json: missing the direct application redirect");
}

if (!pages.some((page) => page.route === "/apply" && !page.isIndexable)) fail("/apply: missing intentional noindex fallback page");

if (failures.length) {
  console.error(`SEO validation failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `SEO validation passed for ${indexableCanonicals.size} indexable pages, ${sitemapUrls.size} sitemap URLs, and ${htmlFiles.length} generated HTML files.`,
);
