// The iCal feed omits artwork, but Luma's public event page includes it.
export async function fetchLumaCover(event, fetchPage = fetch) {
  const url = new URL(event.url);
  if (url.protocol !== "https:" || url.hostname !== "luma.com") {
    throw new Error("Expected a public Luma event URL.");
  }

  const response = await fetchPage(url, {
    headers: { accept: "text/html" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Luma event page returned ${response.status}.`);

  const html = await response.text();
  const pageData = html.match(/<script\b[^>]*\bid="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  if (!pageData) throw new Error("Luma event page is missing event data.");

  const details = JSON.parse(pageData)?.props?.pageProps?.initialData?.data?.event;
  if (details?.api_id !== event.id) throw new Error("Luma event page ID does not match.");
  if (!details.cover_url) return undefined;

  const cover = new URL(details.cover_url);
  if (cover.protocol !== "https:" || cover.hostname !== "images.lumacdn.com") {
    throw new Error("Expected a Luma artwork URL.");
  }
  return cover.href;
}
