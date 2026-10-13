import { XMLParser } from "fast-xml-parser";
import sanitizeHtml from "sanitize-html";
import type { BlogPost } from "../types/blog";

export const blogConfig = {
  label: "Blog",
  publicationName: "ikigai Insights",
  publicationUrl: "https://886studios.substack.com",
  publicationImage: "/assets/ikigai-insights-substack-wide-1280.webp",
  publicationImageSrcset:
    "/assets/ikigai-insights-substack-wide-640.webp 640w, /assets/ikigai-insights-substack-wide-1280.webp 1280w",
  feedUrl: "https://886studios.substack.com/feed",
  subscribeUrl: "https://886studios.substack.com/subscribe",
  description:
    "Curated stories, fresh takes, and hidden gems from the tech and startup world - brought to you monthly by 886 Studios",
  subscriberNote: "Every new post will be sent directly to your email inbox.",
} as const;

const substackAuthorOverrides: Record<string, string> = {
  "on-our-radar-ai-native-professional": "Max Hsieh",
  "find-truth-faster": "Carter Wang",
  "5-thing-we-learned-from-the-founders": "Carter Wang",
  "ikigai-launchpad-spring-2026-sp26": "Carter Wang",
  "ikigai-launchpad-s25-demo-day": "Carter Wang",
  "a-look-into-ikigai": "Carter Wang",
  "the-llm-wars-continue-humanoid-robots": "Carter Wang",
  "rocket-launches-wooly-mammoths-the": "Carter Wang",
};

// These archive posts use the old cohort names, including standalone abbreviations.
// Keep their original slugs and destinations; normalize only editorial text.
const legacyBatchPosts = new Set([
  "find-truth-faster",
  "ikigai-launchpad-spring-2026-sp26",
  "ikigai-launchpad-s25-demo-day",
  "a-look-into-ikigai",
]);

function normalizeBatchNames(value: string) {
  const apostrophe = "(?:['’]|&#(?:39|8217);|&#x(?:27|2019);|&apos;)";
  for (const [season, abbreviation, name] of [
    ["Fall 2024", `F${apostrophe}24`, "ikigai #01"],
    ["Summer 2025", `S${apostrophe}25`, "ikigai #02"],
    ["Spring 2026", `Sp?${apostrophe}26`, "ikigai #03"],
  ]) {
    // Dates such as "happening in Spring 2026" remain historical schedule details.
    const batchName = new RegExp(
      `\\b(?:ikigai(?: Launchpad)?\\s+(?:${season}|${abbreviation})|${season}(?=\\s+(?:\\(${abbreviation}\\)|batch\\b|applications\\b))|${abbreviation})(?:\\s+\\(${abbreviation}\\))?(?!\\w)(?:\\s+ikigai\\b)?`,
      "gi",
    );
    value = value.replace(batchName, name);
  }
  return value;
}

// Verified replacements for moved pages linked from the imported archive.
const archivedLinkReplacements: Record<string, string> = {
  "https://withikigai.com/partners/886-partners-1/kai-huang": "https://www.886studios.com/team/kai",
  "https://withikigai.com/partners/886-partners-1/kevin-lin": "https://www.886studios.com/team/kevin-lin",
  "https://withikigai.com/partners/886-partners-1/chris-wang": "https://www.886studios.com/team/chris",
  "https://withikigai.com/partners/886-partners-1/jacob-hsu": "https://www.886studios.com/team/jacob",
  "https://ramp.com/leading-indicators/april-2026-ai-index": "https://ramp.com/data/april-2026-ai-index",
};

interface ParsedFeedItem {
  title?: unknown;
  description?: unknown;
  link?: unknown;
  pubDate?: unknown;
  enclosure?: {
    "@_url"?: unknown;
  };
  "dc:creator"?: unknown;
  "content:encoded"?: unknown;
}

interface ParsedFeed {
  rss?: {
    channel?: {
      item?: ParsedFeedItem[];
    };
  };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "#cdata",
  textNodeName: "#text",
  parseTagValue: false,
  trimValues: false,
  isArray: (_name, path) => path === "rss.channel.item",
});

const supportedImagePattern = /\.(?:avif|gif|jpe?g|png|webp)(?:[?#]|$)/i;
const blogContentImageSizes = "(max-width: 820px) calc(100vw - 40px), 760px";
const substackImageHost = "substack-post-media.s3.amazonaws.com";
const substackCdnHost = "substackcdn.com";
let substackPostsPromise: Promise<BlogPost[]> | undefined;

export function getSubstackPosts() {
  substackPostsPromise ??= fetchBlogPosts().catch((error) => {
    substackPostsPromise = undefined;
    throw error;
  });
  return substackPostsPromise;
}

export function formatBlogDate(value: string, style: "long" | "short" = "long") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getBlogImageUrl(value: string, width = 960) {
  const originalUrl = getOriginalSubstackImageUrl(value);
  if (!originalUrl) return value;

  return [
    "https://substackcdn.com/image/fetch/",
    `w_${width},c_limit,f_auto,q_auto:good,fl_progressive:steep/`,
    encodeURIComponent(originalUrl),
  ].join("");
}

export function getBlogImageSrcset(
  value: string,
  widths: readonly number[] = [480, 960, 1440],
) {
  if (!getOriginalSubstackImageUrl(value)) return undefined;

  return widths
    .map((width) => `${getBlogImageUrl(value, width)} ${width}w`)
    .join(", ");
}

export function parseBlogFeed(xml: string): BlogPost[] {
  const parsed = parser.parse(xml) as ParsedFeed;
  const items = parsed.rss?.channel?.item ?? [];
  const seenSlugs = new Set<string>();

  return items.flatMap((item) => {
    const substackUrl = readValue(item.link);
    const publishedAt = readValue(item.pubDate);
    const rawContent = readValue(item["content:encoded"]);
    const slug = getSlug(substackUrl);
    const normalizeText = (value: string) => normalizeEditorialText(
      legacyBatchPosts.has(slug) ? normalizeBatchNames(value) : value,
    );
    const title = normalizeText(readValue(item.title));

    if (!title || !slug || !substackUrl || !rawContent || !isValidDate(publishedAt)) {
      return [];
    }

    if (seenSlugs.has(slug)) return [];
    seenSlugs.add(slug);

    const contentWithGalleries = replaceImageGalleries(rawContent);
    const contentHtml = sanitizePostHtml(contentWithGalleries, normalizeText);
    const textContent = toPlainText(contentHtml);
    const description = normalizeText(
      toPlainText(readValue(item.description)) ||
      `${textContent.slice(0, 157).trimEnd()}${textContent.length > 157 ? "..." : ""}`,
    );
    const enclosureUrl = readValue(item.enclosure?.["@_url"]);
    const contentImageUrl = getFirstImageUrl(contentHtml);
    const imageUrl = isSupportedImage(enclosureUrl)
      ? enclosureUrl
      : contentImageUrl || undefined;
    const imageDimensions = imageUrl ? getImageDimensions(imageUrl) : undefined;

    return [{
      source: "substack" as const,
      title,
      slug,
      description,
      substackUrl,
      publishedAt: new Date(publishedAt).toISOString(),
      author:
        substackAuthorOverrides[slug] ||
        readValue(item["dc:creator"]) ||
        "886 Studios",
      imageUrl,
      imageWidth: imageDimensions?.width,
      imageHeight: imageDimensions?.height,
      contentHtml,
      readingMinutes: Math.max(1, Math.ceil(textContent.split(/\s+/).filter(Boolean).length / 220)),
    }];
  }).sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
}

async function fetchBlogPosts() {
  try {
    const response = await fetch(blogConfig.feedUrl, {
      headers: {
        Accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8",
        "User-Agent": "886Studios.com Blog Feed/1.0",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`Substack returned ${response.status}`);
    }

    const posts = parseBlogFeed(await response.text());
    if (posts.length === 0) {
      throw new Error("Substack returned no readable articles");
    }
    return posts;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    // A successful empty build would delete all imported article routes, RSS
    // entries, and sitemap URLs from the next production deployment.
    throw new Error(`[blog] Could not load ikigai Insights: ${reason}. Refusing to publish without the blog archive.`, {
      cause: error,
    });
  }
}

function readValue(value: unknown): string {
  if (typeof value === "string") return value.trim();

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const cdata = record["#cdata"];
    const text = record["#text"];

    if (typeof cdata === "string") return cdata.trim();
    if (typeof text === "string") return text.trim();
  }

  return "";
}

function getSlug(url: string) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== "886studios.substack.com") return "";

    const match = parsedUrl.pathname.match(/^\/p\/([^/]+)\/?$/);
    return match?.[1]?.replace(/[^a-zA-Z0-9_-]/g, "") ?? "";
  } catch {
    return "";
  }
}

function isValidDate(value: string) {
  return Boolean(value) && !Number.isNaN(new Date(value).getTime());
}

function isSupportedImage(value: string) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (supportedImagePattern.test(url.pathname) || url.hostname === "substackcdn.com")
    );
  } catch {
    return false;
  }
}

function getOriginalSubstackImageUrl(value: string) {
  if (!value) return "";

  try {
    const url = new URL(value);

    if (url.hostname === substackImageHost) {
      return url.toString();
    }

    if (url.hostname === substackCdnHost) {
      const encodedOriginal = url.pathname.match(/\/(https?%3A%2F%2F.+)$/i)?.[1];
      if (!encodedOriginal) return "";

      const decodedOriginal = decodeURIComponent(encodedOriginal);
      const originalUrl = new URL(decodedOriginal);
      return originalUrl.protocol === "https:" ? originalUrl.toString() : "";
    }
  } catch {
    return "";
  }

  return "";
}

function getFirstImageUrl(html: string) {
  const match = html.match(/<img\b[^>]*\bsrc="([^"]+)"/i);
  const value = match?.[1] ?? "";
  return isSupportedImage(value) ? value : "";
}

function getImageDimensions(value: string) {
  const match = value.match(/_(\d{2,5})x(\d{2,5})(?:\.|%2E)/i);
  const width = Number.parseInt(match?.[1] ?? "", 10);
  const height = Number.parseInt(match?.[2] ?? "", 10);

  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return { width, height };
  }

  return { width: 1600, height: 900 };
}

function replaceImageGalleries(html: string) {
  return html.replace(
    /<div\b([^>]*\bclass="[^"]*\bimage-gallery-embed\b[^"]*"[^>]*)><\/div>/gi,
    (_match, attributes: string) => {
      const encodedAttributes = attributes.match(/\bdata-attrs="([^"]*)"/i)?.[1];
      if (!encodedAttributes) return "";

      try {
        const decodedAttributes = sanitizeHtml(encodedAttributes, {
          allowedTags: [],
          allowedAttributes: {},
        });
        const data = JSON.parse(decodedAttributes) as {
          gallery?: {
            alt?: string;
            caption?: string;
            staticGalleryImage?: { src?: string };
            images?: Array<{ src?: string }>;
          };
        };
        const gallery = data.gallery;
        if (!gallery) return "";

        const imageUrl =
          gallery.staticGalleryImage?.src ??
          gallery.images?.find((image) => isSupportedImage(image.src ?? ""))?.src;

        if (!imageUrl || !isSupportedImage(imageUrl)) return "";

        const caption = gallery.caption?.trim();
        const alt = gallery.alt?.trim() || caption || "";

        return [
          '<figure class="blog-gallery">',
          `<img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(alt)}" loading="lazy" decoding="async">`,
          caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : "",
          "</figure>",
        ].join("");
      } catch {
        return "";
      }
    },
  );
}

function sanitizePostHtml(html: string, normalizeText: (value: string) => string) {
  const withoutSubstackWidgets = sanitizeHtml(html, {
    allowedTags: [
      "a",
      "blockquote",
      "br",
      "button",
      "div",
      "em",
      "figcaption",
      "figure",
      "form",
      "g",
      "h1",
      "h2",
      "h3",
      "hr",
      "img",
      "input",
      "li",
      "line",
      "mark",
      "ol",
      "p",
      "path",
      "picture",
      "polyline",
      "source",
      "span",
      "strong",
      "svg",
      "ul",
    ],
    allowedAttributes: false,
    nonTextTags: ["script", "style"],
    exclusiveFilter: (frame) => {
      const classes = frame.attribs.class?.split(/\s+/) ?? [];
      return (
        classes.includes("subscription-widget-wrap-editor") ||
        classes.includes("subscription-widget") ||
        classes.includes("button-wrapper") ||
        classes.includes("image-link-expand")
      );
    },
  });

  return sanitizeHtml(withoutSubstackWidgets, {
    textFilter: normalizeText,
    allowedTags: [
      "a",
      "blockquote",
      "br",
      "code",
      "em",
      "figcaption",
      "figure",
      "h2",
      "h3",
      "h4",
      "hr",
      "img",
      "li",
      "mark",
      "ol",
      "p",
      "picture",
      "pre",
      "source",
      "strong",
      "ul",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "aria-label"],
      figure: ["class"],
      img: ["src", "srcset", "sizes", "alt", "title", "width", "height", "loading", "decoding"],
      source: ["src", "srcset", "sizes", "type", "media"],
    },
    allowedClasses: {
      figure: ["blog-gallery"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["https"],
      source: ["https"],
    },
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
    nonTextTags: ["button", "form", "input", "script", "style", "svg"],
    transformTags: {
      h1: "h2",
      a: (tagName, attributes) => {
        const href = attributes.href ?? "";
        const safeHref = getSafePostHref(href);
        if (!safeHref) {
          return {
            tagName: "span",
            attribs: {},
          };
        }

        const isExternal = /^https?:\/\//i.test(href);

        return {
          tagName,
          attribs: {
            ...attributes,
            href: safeHref,
            ...(isSupportedImage(safeHref)
              ? { "aria-label": normalizeText(attributes["aria-label"]?.trim() || "Open full-size image") }
              : {}),
            ...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}),
          },
        };
      },
      source: (tagName, attributes) => ({
        tagName,
        attribs: {
          ...attributes,
          sizes: blogContentImageSizes,
        },
      }),
      img: (tagName, attributes) => {
        const dimensions = getImageDimensions(attributes.src ?? "");
        const optimizedSrc = getBlogImageUrl(attributes.src ?? "", 760);
        const optimizedSrcset = getBlogImageSrcset(
          attributes.src ?? "",
          [480, 760, 1200, 1520],
        );

        return {
          tagName,
          attribs: {
            ...attributes,
            src: optimizedSrc,
            ...(optimizedSrcset ? { srcset: optimizedSrcset } : {}),
            alt: normalizeText(attributes.alt ?? ""),
            ...(attributes.title ? { title: normalizeText(attributes.title) } : {}),
            width: attributes.width ?? String(dimensions.width),
            height: attributes.height ?? String(dimensions.height),
            loading: "lazy",
            decoding: "async",
            sizes: blogContentImageSizes,
          },
        };
      },
    },
  });
}

function getSafePostHref(value: string) {
  if (value.startsWith("#") || value.startsWith("/")) return value;

  try {
    const url = new URL(value);
    const replacement = archivedLinkReplacements[`${url.origin}${url.pathname.replace(/\/$/, "")}`];
    if (replacement) return `${replacement}${url.search}${url.hash}`;
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function toPlainText(value: string) {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  })
    // sanitizeHtml returns escaped HTML; callers need text, which Astro/RSS
    // escape again at the output boundary. Decode that serialization once.
    .replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, entity: string) => ({
      amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'",
    } as Record<string, string>)[entity] ?? _)
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeEditorialText(value: string) {
  return value.replaceAll("—", " - ");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
