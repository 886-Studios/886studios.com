import { getCollection } from "astro:content";
import { getSubstackPosts } from "./substack";
import type { BlogPost } from "../types/blog";

let blogPostsPromise: Promise<BlogPost[]> | undefined;

export function getBlogPosts() {
  blogPostsPromise ??= loadBlogPosts().catch((error) => {
    blogPostsPromise = undefined;
    throw error;
  });
  return blogPostsPromise;
}

export function getBlogMetaDescription(post: BlogPost) {
  const description = normalizeText(post.description);
  if (description.length >= 50) return description;

  const lead = description ? `${description.replace(/[.!?]+$/, "")}. ` : "";
  const source =
    post.source === "substack"
      ? "886 Insights, the 886 Studios blog"
      : "the 886 Studios blog";

  return `${lead}Read ${post.title} from ${source}.`;
}

export function getBlogModifiedDate(post: BlogPost) {
  return new Date(post.updatedAt ?? post.publishedAt).toISOString().slice(0, 10);
}

export function getLatestBlogModifiedDate(posts: BlogPost[]) {
  return posts.map(getBlogModifiedDate).sort().at(-1);
}

export function getBlogAuthorHref(author: string) {
  const authorProfiles: Record<string, string> = {
    "Carter Wang": "/team/carter",
    "Max Hsieh": "/team/max",
  };
  return authorProfiles[author];
}

async function loadBlogPosts() {
  const [localEntries, substackPosts] = await Promise.all([
    getCollection("blog", ({ data }) => !data.draft),
    getSubstackPosts(),
  ]);

  const localPosts: BlogPost[] = localEntries.map((entry) => ({
    source: "local",
    title: entry.data.title,
    slug: entry.id,
    description: entry.data.description,
    publishedAt: entry.data.publishedAt.toISOString(),
    updatedAt: entry.data.updatedAt?.toISOString(),
    author: entry.data.author,
    imageUrl: entry.data.image,
    imageAlt: entry.data.imageAlt,
    imageWidth: entry.data.imageWidth,
    imageHeight: entry.data.imageHeight,
    readingMinutes: getMarkdownReadingMinutes(entry.body ?? ""),
    substackUrl: entry.data.substackUrl,
    contentHtml: entry.rendered?.html,
    localEntryId: entry.id,
  }));

  const localSlugs = new Set(localPosts.map((post) => post.slug));
  const uniqueSubstackPosts = substackPosts.filter((post) => {
    if (!localSlugs.has(post.slug)) return true;
    console.warn(`[blog] Local article overrides Substack slug "${post.slug}".`);
    return false;
  });

  return [...localPosts, ...uniqueSubstackPosts].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
}

function getMarkdownReadingMinutes(markdown: string) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~|-]/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 220));
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
