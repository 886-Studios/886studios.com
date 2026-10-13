import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const sourceUrl = new URL("../src/lib/substack.ts", import.meta.url);
const { outputText } = ts.transpileModule(await readFile(sourceUrl, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
});

// Execute the real feed adapter with an isolated fetch for deterministic failures.
function loadAdapter(fetch) {
  const exports = {};
  new Function("exports", "require", "fetch", "AbortSignal", outputText)(
    exports, createRequire(sourceUrl), fetch, AbortSignal,
  );
  return exports;
}

const feed = `<rss><channel><item>
  <title>Founder lessons</title>
  <link>https://886studios.substack.com/p/founder-lessons</link>
  <pubDate>Tue, 11 Aug 2026 00:00:00 GMT</pubDate>
  <content:encoded><![CDATA[<p>Lessons for founders.</p>]]></content:encoded>
</item></channel></rss>`;

test("a successful feed is shared across article, RSS, and sitemap consumers", async () => {
  let requests = 0;
  const adapter = loadAdapter(async () => { requests += 1; return new Response(feed); });
  const [posts, samePosts] = await Promise.all([adapter.getSubstackPosts(), adapter.getSubstackPosts()]);
  assert.equal(requests, 1);
  assert.equal(posts, samePosts);
  assert.equal(posts[0].slug, "founder-lessons");
  assert.equal(posts[0].contentHtml, "<p>Lessons for founders.</p>");
});

for (const [name, fetch] of [
  ["network outage", async () => { throw new TypeError("fetch failed"); }],
  ["HTTP failure", async () => new Response("Unavailable", { status: 503 })],
  ["empty feed", async () => new Response("<rss><channel></channel></rss>")],
  ["invalid response", async () => new Response("<html>Service unavailable</html>")],
  ["unreadable articles", async () => new Response("<rss><channel><item><title>Incomplete</title></item></channel></rss>")],
]) {
  test(`${name} blocks a release instead of deleting the blog archive`, async () => {
    await assert.rejects(loadAdapter(fetch).getSubstackPosts(), /Refusing to publish without the blog archive/);
  });
}

test("a failed request can recover without restarting the development server", async () => {
  let requests = 0;
  const adapter = loadAdapter(async () => {
    requests += 1;
    if (requests === 1) throw new TypeError("temporary outage");
    return new Response(feed);
  });
  await assert.rejects(adapter.getSubstackPosts());
  assert.equal((await adapter.getSubstackPosts())[0].slug, "founder-lessons");
  assert.equal(requests, 2);
});

test("the merged blog also recovers after an upstream failure", async () => {
  const source = await readFile(new URL("../src/lib/blog.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  let requests = 0;
  const exports = {};
  const dependencies = {
    "astro:content": { getCollection: async () => [] },
    "./substack": {
      getSubstackPosts: async () => {
        requests += 1;
        if (requests === 1) throw new Error("temporary outage");
        return [{ slug: "founder-lessons", publishedAt: "2026-08-11" }];
      },
    },
  };
  new Function("exports", "require", compiled)(exports, (name) => dependencies[name]);
  await assert.rejects(exports.getBlogPosts());
  assert.equal((await exports.getBlogPosts())[0].slug, "founder-lessons");
  assert.equal(requests, 2);
});

test("imported articles and RSS retain working destinations for moved references", () => {
  const { parseBlogFeed } = loadAdapter();
  const links = [
    ...["kai-huang", "kevin-lin", "chris-wang", "jacob-hsu"].map((slug) => [
      `https://withikigai.com/partners/886-partners-1/${slug}`,
      `https://www.886studios.com/team/${slug === "kevin-lin" ? slug : slug.split("-")[0]}`,
    ]),
    ["https://ramp.com/leading-indicators/april-2026-ai-index", "https://ramp.com/data/april-2026-ai-index"],
  ];
  for (const [oldUrl, newUrl] of links) {
    const xml = feed.replace("<p>Lessons for founders.</p>", `<p><a href="${oldUrl}/?source=archive#details">Read more</a></p>`);
    const html = parseBlogFeed(xml)[0].contentHtml;
    assert.ok(html.includes(`href="${newUrl}?source=archive#details"`));
    assert.ok(!html.includes(oldUrl));
  }
  const unrelated = feed.replace("<p>Lessons for founders.</p>", '<p><a href="https://example.com/reference">Reference</a></p>');
  assert.ok(parseBlogFeed(unrelated)[0].contentHtml.includes('href="https://example.com/reference"'));
});

test("legacy batch names are consistent in imported titles, summaries, body text, and image labels", () => {
  const { parseBlogFeed } = loadAdapter();
  const slug = "ikigai-launchpad-spring-2026-sp26";
  const articleUrl = `https://886studios.substack.com/p/${slug}`;
  const imageUrl = "https://example.com/ikigai-S'25.jpg";
  const xml = feed
    .replace("Founder lessons", "ikigai Launchpad Spring 2026 (Sp'26) Applications Are Now OPEN")
    .replace("https://886studios.substack.com/p/founder-lessons", articleUrl)
    .replace("<pubDate>", "<description>ikigai Launchpad S'26 batch</description><pubDate>")
    .replace("<p>Lessons for founders.</p>", `
      <h2>ikigai Launchpad Spring 2026 (Sp&#8217;26)</h2>
      <p>Summer 2025 (S&#8217;25) batch; ikigai F'24; ikigai S'26.</p>
      <p>Happening in <strong>Spring 2026</strong>. March 3, 2026.</p>
      <a href="${articleUrl}">ikigai S'25</a>
      <img src="${imageUrl}" alt="ikigai Launchpad S'25 batch" title="ikigai S'26">
    `);
  const post = parseBlogFeed(xml)[0];
  assert.equal(post.title, "ikigai #03 Applications Are Now OPEN");
  assert.equal(post.description, "ikigai #03 batch");
  assert.equal(post.slug, slug);
  assert.equal(post.substackUrl, articleUrl);
  assert.ok(post.contentHtml.includes("<h2>ikigai #03</h2>"));
  assert.ok(post.contentHtml.includes("ikigai #02 batch; ikigai #01; ikigai #03."));
  assert.ok(post.contentHtml.includes('alt="ikigai #02 batch"'));
  assert.ok(post.contentHtml.includes('title="ikigai #03"'));
  assert.ok(post.contentHtml.includes(`src="${imageUrl}"`));
  assert.ok(post.contentHtml.includes(`href="${articleUrl}"`));
  assert.ok(post.contentHtml.includes("Happening in <strong>Spring 2026</strong>. March 3, 2026."));

  const unrelated = feed.replace("Founder lessons", "YC S'25 and Fall 2026 applications");
  assert.equal(parseBlogFeed(unrelated)[0].title, "YC S'25 and Fall 2026 applications");
});

test("imported picture links are named and sources use the article column width", () => {
  const { parseBlogFeed } = loadAdapter();
  const imageUrl = "https://substack-post-media.s3.amazonaws.com/public/images/banner_1456x762.webp";
  const sourceSet = "https://example.com/banner-480.webp 480w, https://example.com/banner-960.webp 960w";
  const html = parseBlogFeed(feed.replace("<p>Lessons for founders.</p>", `
    <a href="${imageUrl}"><picture>
      <source type="image/webp" srcset="${sourceSet}" sizes="100vw" media="(min-width: 400px)">
      <img src="${imageUrl}" alt="" sizes="100vw">
    </picture></a>
    <a href="${imageUrl}?download=1" aria-label="View the original banner" onclick="alert(1)"><img src="${imageUrl}" alt=""></a>
    <a href="https://example.com/article">Read the article</a>
  `))[0].contentHtml;

  const sourceTag = html.match(/<source\b[^>]*>/)?.[0];
  const imageTag = html.match(/<img\b[^>]*>/)?.[0];
  const sizes = 'sizes="(max-width: 820px) calc(100vw - 40px), 760px"';
  assert.ok(sourceTag?.includes(sizes));
  assert.ok(imageTag?.includes(sizes));
  assert.ok(sourceTag.includes(`srcset="${sourceSet}"`));
  assert.ok(sourceTag.includes('type="image/webp"'));
  assert.ok(sourceTag.includes('media="(min-width: 400px)"'));
  assert.ok(imageTag.includes('alt=""'));
  assert.ok(html.includes('aria-label="Open full-size image"'));
  assert.ok(html.includes('aria-label="View the original banner"'));
  assert.ok(!html.includes("onclick"));
  const articleLink = html.match(/<a\b[^>]*href="https:\/\/example.com\/article"[^>]*>/)?.[0];
  assert.ok(articleLink && !articleLink.includes("aria-label"));
});

test("feed summaries decode entities once and keep unsafe HTML out of article content", () => {
  const { parseBlogFeed } = loadAdapter();
  const xml = feed.replace("<pubDate>", `<description><![CDATA[<p>Pitch &amp; Connect: &#8220;founders&#8221; &lt; builders &gt; investors.</p><script>alert(1)</script>]]></description><pubDate>`);
  const post = parseBlogFeed(xml)[0];
  assert.equal(post.description, 'Pitch & Connect: “founders” < builders > investors.');
  assert.equal(post.contentHtml, "<p>Lessons for founders.</p>");
  assert.doesNotMatch(post.description, /alert|<script|&amp;/);

  const fallback = parseBlogFeed(feed.replace("Lessons for founders.", "Founders &amp; builders share &#39;lessons&#39;."))[0];
  assert.equal(fallback.description, "Founders & builders share 'lessons'.");
  assert.ok(fallback.contentHtml.includes("&amp;"), "HTML must retain its output escaping");
});
