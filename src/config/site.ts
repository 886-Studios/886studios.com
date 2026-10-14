import { isProductionDeployment } from "./deployment";

// Explicit references let Vite substitute the server-only flags at build time.
export const productionAnalyticsEnabled = isProductionDeployment({
  PROD: import.meta.env.PROD,
  VERCEL: import.meta.env.VERCEL,
  VERCEL_ENV: import.meta.env.VERCEL_ENV,
});

export const applicationUrl = "https://tally.so/r/w5p4jQ";

export const siteConfig = {
  name: "886 Studios",
  url: "https://www.886studios.com",
  defaultTitle: "886 Studios | Taipei Venture Firm",
  defaultDescription:
    "886 Studios is a Taipei-based venture firm that runs ikigai Launchpad, a startup accelerator helping early-stage founders build global technology companies.",
  defaultOgImage: "https://www.886studios.com/assets/886-studios-preview.png",
  defaultOgImageWidth: 1200,
  defaultOgImageHeight: 630,
  defaultOgImageType: "image/png",
  ogImageAlt: "Purple 886 Studios logo on a dark purple and blue background",
  locale: "en-US",
  ogLocale: "en_US",
  twitterSite: "@886Studios",
  themeColor: "#050507",
  googleAnalyticsFallbackId: "G-F0SQCTQJME",
} as const;

export interface SearchEngineVerification {
  google?: string;
  bing?: string;
  yandex?: string;
  baidu?: string;
}

// Search verification tokens are public by design. Keep the production Google
// token as a fallback so ownership survives deployments from environments that
// do not share the locally linked Vercel project's variables.
const googleSiteVerificationFallback = "YIlkZaBUMZkiKjEm8Ph2VZhitwzzs1zxCCQv97WduDg";

interface RouteImagePreload {
  href: string;
  type?: string;
  srcset?: string;
  sizes?: string;
}

const routeImagePreloads: Record<string, RouteImagePreload[]> = {
  "/": [
    {
      href: "/assets/hero/sf-tpe-hero-1280.webp",
      type: "image/webp",
    },
  ],
  "/ikigai-launchpad": [
    {
      href: "/assets/programs/ikigai-audience-theater-1280.webp",
      type: "image/webp",
      srcset:
        "/assets/programs/ikigai-audience-theater-1280.webp 1280w, /assets/programs/ikigai-audience-theater-1920.webp 1920w",
      sizes: "(max-width: 640px) calc(100vw - 36px), min(calc(100vw - 48px), 1160px)",
    },
  ],
};

export function normalizePath(pathname: string) {
  return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
}

export function getCanonicalUrl(pathname: string) {
  const currentPath = normalizePath(pathname);
  return currentPath === "/" ? `${siteConfig.url}/` : `${siteConfig.url}${currentPath}`;
}

export function getRouteImagePreloads(pathname: string) {
  return routeImagePreloads[normalizePath(pathname)] ?? [];
}

export function getGoogleAnalyticsId() {
  return productionAnalyticsEnabled ? siteConfig.googleAnalyticsFallbackId : undefined;
}

export function getSearchEngineVerification(): SearchEngineVerification {
  const getToken = (value: string | undefined) => value?.trim() || undefined;

  return {
    google: getToken(import.meta.env.GOOGLE_SITE_VERIFICATION) ?? googleSiteVerificationFallback,
    bing: getToken(import.meta.env.BING_SITE_VERIFICATION),
    yandex: getToken(import.meta.env.YANDEX_SITE_VERIFICATION),
    baidu: getToken(import.meta.env.BAIDU_SITE_VERIFICATION),
  };
}
