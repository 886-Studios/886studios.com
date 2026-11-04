import { applicationUrl } from "../config/site";

const launchpadNextBatch = "Spring 2027";
const launchpadScheduleNote = `Applications are open on a rolling basis. The next 886 Launchpad batch will take place in ${launchpadNextBatch}.`;

export const brand = {
  name: "886 Studios",
  logoAlt: "886 Studios",
  logoUrl: "/assets/886-logo.avif",
  logoWidth: 384,
  logoHeight: 384,
};

export const discordCommunityUrl = "https://discord.gg/FGcEHJyB3F";

export const socialLinks = [
  {
    platform: "x",
    href: "https://x.com/886Studios",
    ariaLabel: "886 Studios on X",
  },
  {
    platform: "linkedin",
    href: "https://www.linkedin.com/company/886studios/",
    ariaLabel: "886 Studios on LinkedIn",
  },
  {
    platform: "instagram",
    href: "https://www.instagram.com/ikigai_launchpad/",
    ariaLabel: "886 Studios on Instagram",
  },
  {
    platform: "threads",
    href: "https://www.threads.net/@ikigai_launchpad",
    ariaLabel: "886 Launchpad on Threads",
  },
  {
    platform: "discord",
    href: discordCommunityUrl,
    ariaLabel: "886 Studios on Discord",
  },
  {
    platform: "substack",
    href: "https://886studios.substack.com/",
    ariaLabel: "886 Insights on Substack",
  },
  {
    platform: "rss",
    href: "/rss.xml",
    ariaLabel: "Subscribe to the 886 Studios blog RSS feed",
  },
] as const;

// Categorize by the core product and market, rather than enabling technologies
// such as AI.
export type PortfolioCategory =
  | "Consumer Social"
  | "Consumer Apps"
  | "B2B SaaS"
  | "Marketing Tech"
  | "Healthcare"
  | "Health & Wellness"
  | "Media & Entertainment"
  | "Hardware & Infrastructure";

export interface PortfolioCompany {
  name: string;
  slug: string;
  relationship: "Partner-backed" | "886-backed";
  category: PortfolioCategory;
  program?: string;
  status?: "Active" | "Inactive" | "Acquired";
  websiteUrl?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  founders?: readonly {
    name: string;
    linkedinUrl?: string;
    xUrl?: string;
  }[];
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
    imageClass?: "is-wordmark" | "is-tall" | "is-compact" | "is-app-icon";
  };
  description: string;
  descriptionLinks?: readonly {
    text: string;
    href: string;
  }[];
}

export const portfolioCompanies = [
  {
    name: "Dexter",
    slug: "dexter",
    websiteUrl: "https://www.dexterai.org/",
    relationship: "886-backed",
    category: "Media & Entertainment",
    program: "886 Launchpad #04",
    founders: [
      {
        name: "Astemir Azhakhov",
        xUrl: "https://x.com/astemir_dex",
      },
      {
        name: "Kanshobi Azh",
        xUrl: "https://x.com/kantemirdex",
      },
    ],
    logo: {
      src: "/assets/portfolio/dexter.jpg",
      alt: "Dexter logo",
      width: 1024,
      height: 1024,
      imageClass: "is-app-icon",
    },
    description:
      "Dexter is an AI cohost for live streamers. Just talk to it, and Dexter handles the production: running OBS, designing overlays, moderating chat and taking care of the technical stuff, so streamers can focus on entertaining. It learns each streamer's audience and style, breaks down every stream to show what's working, and it's actually fun to talk to.",
  },
  {
    name: "Amicare",
    slug: "amicare",
    websiteUrl: "https://www.amicare.io/",
    relationship: "886-backed",
    category: "Healthcare",
    program: "886 Launchpad #04",
    founders: [
      {
        name: "Martin Droruga",
        linkedinUrl: "https://www.linkedin.com/in/martin-droruga/",
        xUrl: "https://x.com/mr_s0l0_d0lo",
      },
      { name: "Azaan Azam" },
      { name: "Tayo M Alemi" },
    ],
    logo: {
      src: "/assets/portfolio/amicare.jpg",
      alt: "Amicare logo",
      width: 1024,
      height: 1024,
      imageClass: "is-app-icon",
    },
    description:
      "Amicare is building AI-powered shared infrastructure that connects healthcare providers as patients transition between care settings. The platform helps care teams coordinate transitions, intelligently route patients to the right providers, and gain visibility into available care capacity, making it easier for patients to access the care they need.",
  },
  {
    name: "footnotes",
    slug: "footnotes",
    relationship: "886-backed",
    category: "Consumer Apps",
    program: "886 Launchpad #03",
    status: "Active",
    websiteUrl: "https://footnotes.rest/",
    appStoreUrl: "https://apps.apple.com/app/footnotes-notes-for-noticing/id6803869918",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.doppler.capture",
    founders: [
      {
        name: "Julia Cheung",
        linkedinUrl: "https://www.linkedin.com/in/cheungjw/",
      },
      {
        name: "Prasenjit Das",
        linkedinUrl: "https://www.linkedin.com/in/prasenjitdasln/",
      },
      {
        name: "Kartikay S.",
        linkedinUrl: "https://www.linkedin.com/in/kartikaysh/",
      },
    ],
    logo: {
      src: "/assets/portfolio/footnotes.png",
      alt: "footnotes logo",
      width: 499,
      height: 500,
      imageClass: "is-app-icon",
    },
    description:
      "footnotes is a quiet notebook for the photographs, voices, passing thoughts and ordinary moments that make up a life.",
  },
  {
    name: "diffusr.",
    slug: "diffusr",
    relationship: "886-backed",
    category: "Marketing Tech",
    program: "886 Launchpad #03",
    status: "Active",
    websiteUrl: "https://www.diffusr.ai",
    founders: [
      {
        name: "Sharan Mansukhani",
        linkedinUrl: "https://www.linkedin.com/in/sharan-mansukhani-17306a234/",
      },
      {
        name: "Kristian Resabal",
        linkedinUrl: "https://www.linkedin.com/in/jkresabal",
        xUrl: "https://x.com/jkresabal",
      },
      {
        name: "Justin To",
        linkedinUrl: "https://sg.linkedin.com/in/justin-to-4a5401202",
      },
    ],
    logo: {
      src: "/assets/portfolio/diffusr.svg",
      alt: "diffusr. logo",
      width: 512,
      height: 512,
    },
    description:
      "diffusr. helps brands launch AI-generated UGC campaigns at social-platform scale. The company operates as a managed service that develops creative concepts, produces avatar-led video variants, and distributes campaigns so brands can test and amplify messages faster than a traditional creator workflow.",
  },
  {
    name: "Peeps",
    slug: "peeps",
    relationship: "886-backed",
    category: "Consumer Social",
    program: "886 Launchpad #03",
    status: "Active",
    websiteUrl: "https://playpeeps.app",
    appStoreUrl: "https://apps.apple.com/tw/app/peeps-%E8%88%87%E6%9C%8B%E5%8F%8B%E5%90%8C%E5%B1%85/id6753601581",
    playStoreUrl: "https://play.google.com/store/apps/details?id=dev.ymin.peeps",
    founders: [
      {
        name: "Marx Yeh",
        linkedinUrl: "https://www.linkedin.com/in/you-ming-yeh-00b50b272/",
      },
      {
        name: "Ronny Yen",
        linkedinUrl: "https://www.linkedin.com/in/yyz71/",
      },
    ],
    logo: {
      src: "/assets/portfolio/peeps.jpg",
      alt: "Peeps logo",
      width: 512,
      height: 512,
    },
    description:
      "Peeps is a gamified social app that gives close friends and couples a place to live together online. It's a private space to decorate, hang out, share daily moments, play mini-games, and raise pets together. Rather than another feed or chat box, Peeps is built around presence: lightweight, playful ways to stay close without the pressure of posting or texting.\n\nFounded by a two-person Gen Z team, Peeps has grown to nearly 177K users in just a few weeks through organic word of mouth, and the team is building toward making it the default place where close relationships stay connected online.",
  },
  {
    name: "lfg",
    slug: "lfg",
    relationship: "886-backed",
    category: "Consumer Social",
    program: "886 Launchpad #03",
    status: "Active",
    websiteUrl: "https://lfg.place/",
    appStoreUrl: "https://apps.apple.com/us/app/lfg-on-demand-hangouts/id6762966872",
    founders: [
      {
        name: "Julia Cheung",
        linkedinUrl: "https://www.linkedin.com/in/cheungjw/",
      },
      {
        name: "Prasenjit Das",
        linkedinUrl: "https://www.linkedin.com/in/prasenjitdasln/",
      },
      {
        name: "Kartikay S.",
        linkedinUrl: "https://www.linkedin.com/in/kartikaysh/",
      },
    ],
    logo: {
      src: "/assets/portfolio/lfg.jpg",
      alt: "lfg logo",
      width: 512,
      height: 512,
    },
    description:
      "lfg is a social planning app for on-demand hangouts with friends in real life. It turns places discovered on Instagram, TikTok, Google Maps, and elsewhere into a shared map, then lets users pick a spot, invite the right people, and coordinate plans without getting stuck in group-chat back-and-forth.",
  },
  {
    name: "Persona2 AI",
    slug: "persona2-ai",
    relationship: "886-backed",
    category: "Media & Entertainment",
    program: "886 Launchpad #03",
    status: "Active",
    websiteUrl: "https://persona2.ai/",
    playStoreUrl: "https://play.google.com/store/apps/details?id=ai.persona2.app",
    logo: {
      src: "/assets/portfolio/persona2-ai.png",
      alt: "Persona2 AI logo",
      width: 512,
      height: 512,
      imageClass: "is-app-icon",
    },
    description:
      "Persona2 AI is a platform for RPGs, where anyone can vibe-code, play, and share role-playing games. It brings AI-powered text simulators, role-playing, and interactive narrative creation into a creator-driven game lobby where players can start instantly and build their own unique stories.\n\nPersona2 AI hit 120K users in 3 days, with power users spending 7 hours a day on the platform.",
  },
  {
    name: "Hushli",
    slug: "hushli",
    relationship: "886-backed",
    category: "Health & Wellness",
    program: "886 Launchpad #02",
    status: "Active",
    websiteUrl: "https://hushli.ai/",
    appStoreUrl: "https://apps.apple.com/tw/app/hushli-ai-confidant-journal/id6748250163?l=en-GB",
    founders: [
      {
        name: "Tim Chen",
        linkedinUrl: "https://www.linkedin.com/in/timychen12/",
      },
      {
        name: "Sharon Wu",
        linkedinUrl: "https://www.linkedin.com/in/sharonwu333/",
      },
    ],
    logo: {
      src: "/assets/portfolio/hushli.jpg",
      alt: "Hushli logo",
      width: 512,
      height: 512,
    },
    description:
      "Hushli is an app that helps you navigate breakups, relationship challenges, and difficult emotions.\n\nSimply talk with Hushli like you would with a trusted confidant. It understands your emotions, remembers the meaningful moments you share, and automatically creates a journal of your journey, helping you reflect, heal, and better understand yourself over time.\n\nBuilt by Tim Chen and Sharon Wu, whose personal experiences with Tourette syndrome and high sensitivity (HSP) inspired Hushli, their mission is to make mental wellness more accessible and affordable for everyone.",
  },
  {
    name: "InstaPodz",
    slug: "instapodz",
    relationship: "886-backed",
    category: "Media & Entertainment",
    program: "886 Launchpad #02",
    status: "Active",
    websiteUrl: "https://instapodz.com/",
    appStoreUrl: "https://apps.apple.com/us/app/instapodz-ai-podcast-creator/id6744011584",
    logo: {
      src: "/assets/portfolio/instapodz.jpg",
      alt: "InstaPodz logo",
      width: 512,
      height: 512,
    },
    description:
      "InstaPodz creates personalized AI radio and podcast episodes from topics, questions, links, or daily learning goals. Users can choose show length, host style, language, and even character-style voices, making it a lightweight way to turn news, research, and curiosity into audio that fits a commute or short break.",
  },
  {
    name: "PictureCook",
    slug: "picturecook",
    relationship: "886-backed",
    category: "Consumer Apps",
    program: "886 Launchpad #02",
    status: "Active",
    websiteUrl: "https://picture-cook.com/",
    appStoreUrl: "https://apps.apple.com/sg/app/picturecook-kid-english-buddy/id6746742382",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.picturecook.interactiveaudiobook",
    logo: {
      src: "/assets/portfolio/picturecook.jpg",
      alt: "PictureCook logo",
      width: 512,
      height: 512,
    },
    description:
      "PictureCook is an AI-powered English learning companion for children. Its interactive picture books combine narration, tap-to-learn vocabulary, kid-safe stories, and AI character conversations so young learners can practice reading, listening, and speaking through storytime rather than formal lessons.",
  },
  {
    name: "Sugar AI",
    slug: "sugar-ai",
    relationship: "886-backed",
    category: "Media & Entertainment",
    program: "886 Launchpad #02",
    status: "Active",
    websiteUrl: "https://sugarai.tw/",
    appStoreUrl: "https://apps.apple.com/tw/app/sugar-%E4%BD%A0%E7%9A%84%E6%AD%A3%E7%89%88%E6%BC%AB%E7%95%ABai%E8%A7%92%E8%89%B2/id6744877922",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.sugar.ai.dev",
    logo: {
      src: "/assets/portfolio/sugar-ai.jpg",
      alt: "Sugar AI logo",
      width: 512,
      height: 512,
    },
    description:
      "Sugar AI turns officially licensed comic and manga characters into interactive AI companions for fans. Characters are supervised around creator-approved personalities, remember conversations, unlock story branches and memories through chat, and give IP owners a new direct-to-fan format for character engagement.",
  },
  {
    name: "Tellit Now",
    slug: "tellit-now",
    relationship: "886-backed",
    category: "Marketing Tech",
    program: "886 Launchpad #02",
    status: "Active",
    websiteUrl: "https://www.tellitapp.ai/",
    appStoreUrl: "https://apps.apple.com/us/app/tell-it-now-%E6%8E%A2%E5%BA%97%E5%A4%A7%E8%81%B2%E5%85%AC/id6448947278",
    playStoreUrl: "https://play.google.com/store/apps/details?id=ai.tellit.tellitapp",
    logo: {
      src: "/assets/portfolio/tellit-now.jpg",
      alt: "Tellit Now logo",
      width: 512,
      height: 512,
    },
    description:
      "Tellit Now is a map-based word-of-mouth marketing platform for local stores, brands, and influential consumers. Businesses can publish nearby check-in and content tasks, while consumers discover offers, visit locations, post to social channels, and earn cash or reciprocal rewards after merchants review the promotion.",
  },
  {
    name: "GitRoll",
    slug: "gitroll",
    relationship: "886-backed",
    category: "B2B SaaS",
    program: "886 Launchpad #01",
    status: "Acquired",
    websiteUrl: "https://gitroll.io/",
    logo: {
      src: "/assets/portfolio/gitroll-wordmark.png",
      alt: "GitRoll logo",
      width: 296,
      height: 74,
      imageClass: "is-wordmark",
    },
    description:
      "GitRoll helps engineering teams evaluate developers by turning real code history into data-driven coding profiles. Its AI analyzes open-source activity, builds skill evidence from actual repositories, and gives recruiters a way to assess candidates without relying only on resumes, trivia-style interviews, or take-home tests.",
  },
  {
    name: "Kardomo",
    slug: "kardomo",
    relationship: "886-backed",
    category: "Consumer Social",
    program: "886 Launchpad #03",
    status: "Active",
    websiteUrl: "https://kardomo.com/",
    appStoreUrl: "https://apps.apple.com/tw/app/kardomo-%E5%8F%B0%E7%81%A3%E5%B0%88%E5%B1%AC%E7%9A%84-kpop-%E4%BA%A4%E5%8F%8B%E5%9C%88/id6748519302",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.kardomo.kardomo",
    founders: [
      {
        name: "Marx Yeh",
        linkedinUrl: "https://www.linkedin.com/in/you-ming-yeh-00b50b272/",
      },
      {
        name: "Ronny Yen",
        linkedinUrl: "https://www.linkedin.com/in/yyz71/",
      },
    ],
    logo: {
      src: "/assets/portfolio/kardomo.webp",
      alt: "Kardomo logo",
      width: 512,
      height: 669,
      imageClass: "is-tall",
    },
    description:
      "Kardomo is a Taiwan-focused K-pop fan platform that brings photocard collections, idol schedules, fan diaries, music rankings, and discussion threads into one community app. Fans can track events, organize collections, share moments, and connect with other fans around the groups and artists they follow.",
  },
  {
    name: "PicPet",
    slug: "o3o-labs",
    relationship: "886-backed",
    category: "Consumer Social",
    program: "886 Launchpad #01",
    status: "Active",
    appStoreUrl: "https://apps.apple.com/us/app/picpet/id6742077014",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.o3o.android.picpet",
    logo: {
      src: "/assets/portfolio/o3o-labs.jpg",
      alt: "PicPet logo",
      width: 512,
      height: 512,
    },
    description:
      "PicPet is a social game for close friends built around raising a shared virtual pet. Friends feed the pet with photos, earn coins, unlock rewards, customize rooms and pets, and use the daily routine as a playful reason to stay connected with the people they care about. PicPet joined a16z Speedrun Cohort 006.",
    descriptionLinks: [
      {
        text: "a16z Speedrun Cohort 006",
        href: "https://speedrun.a16z.com/companies/picpet",
      },
    ],
  },
  {
    name: "Dentscape",
    slug: "dentscape",
    relationship: "886-backed",
    category: "Healthcare",
    program: "Velocity",
    status: "Active",
    websiteUrl: "https://dentscape.ai/",
    logo: {
      src: "/assets/portfolio/dentscape.png",
      alt: "Dentscape logo",
      width: 840,
      height: 840,
    },
    description:
      "Dentscape builds AI dental-design software for labs that need faster CAD workflows. Its platform positions itself as a personalized AI dental designer that can help produce high volumes of crown designs quickly, reducing repetitive manual work while fitting into the bread-and-butter production flow of dental labs.",
  },
  {
    name: "Preciser",
    slug: "preciser",
    relationship: "886-backed",
    category: "B2B SaaS",
    program: "Velocity",
    status: "Active",
    websiteUrl: "https://www.preciser.io/",
    logo: {
      src: "/assets/portfolio/preciser.png",
      alt: "Preciser logo",
      width: 256,
      height: 256,
    },
    description:
      "Preciser is an AI and computer-vision analytics platform for sports video, with current support for basketball and baseball. Teams, coaches, leagues, and organizations can upload or stream game footage and receive automated stats, highlights, reports, and video insights without spending hours on manual tagging.",
  },
  {
    name: "Valtec",
    slug: "valtec",
    relationship: "886-backed",
    category: "Hardware & Infrastructure",
    websiteUrl: "https://www.valtec.ai/",
    logo: {
      src: "/assets/portfolio/valtec.png",
      alt: "Valtec logo",
      width: 257,
      height: 257,
    },
    description:
      "Valtec builds aerial maritime intelligence systems that use AI detection to monitor ocean activity in real time. Its technology is focused on turning data captured from above into practical awareness for maritime operators, helping teams detect, track, and respond to activity across coastal and open-water environments.",
  },
  {
    name: "Miso",
    slug: "miso",
    relationship: "886-backed",
    category: "B2B SaaS",
    websiteUrl: "https://miso.ai/",
    logo: {
      src: "/assets/portfolio/miso.png",
      alt: "Miso logo",
      width: 512,
      height: 512,
    },
    description:
      "Miso builds AI answer and search technology for publishers and content platforms that need trustworthy discovery. Instead of returning only vague search results, Miso grounds responses in a publisher's own content, adds citations, and helps readers get useful answers while keeping traffic and engagement inside the publisher experience.",
  },
  {
    name: "Discord",
    slug: "discord",
    relationship: "Partner-backed",
    category: "Consumer Social",
    websiteUrl: "https://discord.com/",
    appStoreUrl: "https://apps.apple.com/us/app/discord-talk-play-hang-out/id985746746",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.discord",
    logo: {
      src: "/assets/portfolio/discord.jpg",
      alt: "Discord logo",
      width: 512,
      height: 512,
    },
    description:
      "Discord is a consumer communication platform built for voice, video, text, and shared online spaces. People use it to play games, hang out with friends, organize private groups, or build larger communities, with customizable servers that combine casual chat, live presence, and community tools.",
  },
  {
    name: "OURA",
    slug: "oura",
    relationship: "Partner-backed",
    category: "Health & Wellness",
    websiteUrl: "https://ouraring.com/",
    appStoreUrl: "https://apps.apple.com/us/app/oura/id1043837948",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.ouraring.oura",
    logo: {
      src: "/assets/portfolio/oura.png",
      alt: "OURA logo",
      width: 400,
      height: 400,
    },
    description:
      "OURA is a health technology company best known for the Oura Ring, a smart ring that tracks sleep, fitness, stress, and broader wellness signals around the clock. Its product turns passive biometric data into daily readiness, recovery, and health insights that help people understand patterns in their bodies over time.",
  },
  {
    name: "Crunchyroll",
    slug: "crunchyroll",
    relationship: "Partner-backed",
    category: "Media & Entertainment",
    websiteUrl: "https://www.crunchyroll.com/",
    appStoreUrl: "https://apps.apple.com/us/app/crunchyroll/id329913454",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.crunchyroll.crunchyroid",
    logo: {
      src: "/assets/portfolio/crunchyroll.jpg",
      alt: "Crunchyroll logo",
      width: 512,
      height: 512,
    },
    description:
      "Crunchyroll is a global anime brand and streaming service serving fans across shows, films, manga, games, theatrical releases, events, and merchandise. The company has become one of the central distribution and community platforms for anime outside Japan, connecting licensed content with audiences across markets and devices.",
  },
  {
    name: "Gogoro",
    slug: "gogoro",
    relationship: "Partner-backed",
    category: "Hardware & Infrastructure",
    websiteUrl: "https://www.gogoro.com/",
    appStoreUrl: "https://apps.apple.com/us/app/gogoro/id927757129",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.gogoro.smartclient",
    logo: {
      src: "/assets/portfolio/gogoro.jpg",
      alt: "Gogoro logo",
      width: 512,
      height: 512,
    },
    description:
      "Gogoro builds electric urban mobility infrastructure around smart scooters, swappable batteries, fleet tools, and the Gogoro Network. Its platform is designed to make refueling electric two-wheelers fast, help cities and logistics operators manage energy more efficiently, and support cleaner transportation in dense urban markets.",
  },
  {
    name: "P. LEAGUE+",
    slug: "p-league-plus",
    relationship: "Partner-backed",
    category: "Media & Entertainment",
    websiteUrl: "https://pleagueofficial.com/",
    logo: {
      src: "/assets/portfolio/p-league-plus.png",
      alt: "P. LEAGUE+ logo",
      width: 152,
      height: 152,
      imageClass: "is-compact",
    },
    description:
      "P. LEAGUE+ is a professional men's basketball league in Taiwan focused on higher-quality home-game experiences and stronger fan interaction. The league brings together Taiwanese clubs, publishes schedules, standings, statistics, video, ticketing, and media content, and has played a visible role in growing Taiwan's basketball entertainment market.",
  },
  {
    name: "KKBOX",
    slug: "kkbox",
    relationship: "Partner-backed",
    category: "Media & Entertainment",
    websiteUrl: "https://www.kkbox.com/",
    appStoreUrl: "https://apps.apple.com/tw/app/kkbox-%E9%9F%B3%E6%A8%82-podcast/id300915900",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.skysoft.kkbox.android",
    logo: {
      src: "/assets/portfolio/kkbox.jpg",
      alt: "KKBOX logo",
      width: 512,
      height: 512,
    },
    description:
      "KKBOX is a music streaming and digital entertainment platform with deep roots in Taiwan and other Asian markets. The service is known for licensed music discovery, playlists, podcasts, and live entertainment features, giving Mandarin and Asian music fans a regional alternative to global streaming services.",
  },
] satisfies readonly PortfolioCompany[];

export const siteContent = {
  announcement: {
    message: "ikigai Launchpad has been rebranded to 886 Launchpad. Applications are open on a rolling basis.",
    ctaLabel: "Apply here",
  },
  nav: {
    cta: {
      label: "Apply Now",
      href: applicationUrl,
    },
    items: [
      { id: "home", label: "Home", href: "/" },
      {
        id: "programs",
        label: "Programs",
        children: [
          { id: "accelerator", label: "886 Launchpad", href: "/accelerator" },
          { id: "launch-station", label: "886 Residency", href: "/residency" },
        ],
      },
      {
        id: "community",
        label: "Community",
        children: [
          { id: "events", label: "Events", href: "/events" },
          { id: "resources", label: "Resources", href: "/resources" },
        ],
      },
      {
        id: "about",
        label: "About us",
        children: [
          { id: "overview", label: "Overview", href: "/about" },
          { id: "team", label: "Team", href: "/team" },
          { id: "portfolio", label: "Portfolio", href: "/portfolio" },
          { id: "blog", label: "Blog", href: "/blog" },
          { id: "newsroom", label: "In the News", href: "/newsroom" },
        ],
      },
      { id: "contact", label: "Contact us", href: "/contact" },
    ],
  },
  home: {
    hero: {
      titleLead: "Build what",
      titleAccent: "matters.",
      body: "886 Studios is where the next generation of global tech companies are built.\nWe run 886 Launchpad, the premier Silicon Valley-style accelerator in Taipei\nbrought to you by the founders of Twitch, Guitar Hero, Playdom, Kabam, & more.",
      cta: {
        label: "Learn more about 886 Launchpad",
        href: "/accelerator",
      },
    },
    photos: {
      items: [
        {
          src: "/assets/landing/launchpad-01-960.webp",
          alt: "886 Studios founders gathered during a community event",
          width: 1800,
          height: 1013,
        },
        {
          src: "/assets/landing/launchpad-02-960.webp",
          alt: "Founders and mentors in conversation at 886 Studios",
          width: 1800,
          height: 1350,
        },
        {
          src: "/assets/landing/launchpad-03-960.webp",
          alt: "886 Studios community members at a founder session",
          width: 1800,
          height: 1350,
        },
        {
          src: "/assets/landing/launchpad-04-960.webp",
          alt: "A workshop moment with the 886 Studios founder community",
          width: 1800,
          height: 1332,
        },
        {
          src: "/assets/landing/launchpad-05-960.webp",
          alt: "Founders watching a presentation during an 886 Studios community session",
          width: 1800,
          height: 1350,
        },
        {
          src: "/assets/landing/launchpad-06-960.webp",
          alt: "886 Studios founders meeting during an in-person program session",
          width: 1800,
          height: 1350,
        },
        {
          src: "/assets/landing/launchpad-07-960.webp",
          alt: "886 Studios founders gathered around a table during a program session",
          width: 1800,
          height: 1350,
        },
      ],
    },
    programs: {
      eyebrow: "Programs",
      title: "How we support founders",
      featured: {
        label: "Accelerator",
        title: "886 Launchpad",
        body: "$100K USD in funding, hands-on mentorship from successful Silicon Valley founders, and a tight-knit 10-week accelerator program designed for startups that want to move fast.",
        meta: ["$100K USD funding", "Partner office hours", "Batch community"],
        ctaLabel: "Learn more →",
        ctaHref: "/accelerator",
      },
      secondary: [
        {
          label: "Residency",
          title: "886 Residency",
          body: "An invite-only, 90-day community program for full-time founders and builders in Taipei. Free dedicated desks at Taiwan Tech Arena, startup perks, and people to build alongside.",
          ctaLabel: "Learn more →",
          ctaHref: "/residency",
        },
      ],
    },
    portfolio: portfolioCompanies,
    newsletter: {
      title: "Subscribe to our newsletter,",
      publicationName: "886 Insights",
      publicationUrl: "https://886studios.substack.com/",
      body: "Only cool things, we promise.",
      placeholder: "you@company.com",
      button: "Subscribe",
      action: "https://886studios.substack.com/subscribe",
    },
  },
  programs: {
    launchpad: {
      name: "886 Launchpad",
      lead: {
        intro: "886 Launchpad, previously known as ikigai Launchpad, is the flagship accelerator run by",
        operator: { label: "886 Studios", href: "/about" },
        body: "$100K USD, mentor office hours, investor intros, and support beyond the batch. From refining their vision to building lasting connections, we help founders move their companies forward. Join us in Taipei.",
      },
      status: {
        nextBatch: launchpadNextBatch,
        announcement: launchpadScheduleNote,
        summary: `Rolling applications · Next batch: ${launchpadNextBatch}.`,
      },
      cta: {
        label: "Apply to 886 Launchpad",
        href: applicationUrl,
      },
      heroPhoto: {
        src: "/assets/programs/ikigai-audience-theater-1280.webp",
        srcset:
          "/assets/programs/ikigai-audience-theater-1280.webp 1280w, /assets/programs/ikigai-audience-theater-1920.webp 1920w",
        sizes: "(max-width: 640px) calc(100vw - 36px), min(calc(100vw - 48px), 1160px)",
        alt: "Founders, mentors, and guests gathered for 886 Launchpad in Taipei",
        width: 1920,
        height: 1280,
      },
      facts: [
        {
          label: "Investment",
          value: "$100K USD",
          note: "For 8% through a SAFE",
        },
        {
          label: "Length",
          value: "10 weeks",
          note: "",
        },
        {
          label: "Location",
          value: "Taipei",
          note: "",
        },
        {
          label: "Support",
          value: "1-on-1 Weekly Office Hours",
          note: "Plus: Workshops, guest speakers, team building, customer and investor intros, and more.",
        },
        {
          label: "Next batch",
          value: launchpadNextBatch,
          note: "",
        },
      ],
      benefits: [
        {
          title: "Funding",
          headline: "$100,000 USD",
          proofPoints: [
            "$100,000 USD funding through a SAFE note",
            "Quit your job and focus full-time on building",
            "Potential follow-on investment from Lifelike Capital",
          ],
          photo: {
            name: "ikigai-founder-table",
            alt: "Founders working together during 886 Launchpad",
            width: 1280,
            height: 960,
          },
        },
        {
          title: "Hands-on support",
          headline: "1-on-1 Weekly Mentor Office Hours",
          proofPoints: [
            "Founder-Led Workshops",
            "Guest Speakers",
            "Warm Introductions + Investor Matching",
            "Exclusive Corporate Perks",
          ],
          photo: {
            name: "ikigai-mentor-session",
            alt: "An 886 Launchpad mentor session with founders",
            width: 1280,
            height: 960,
          },
        },
        {
          title: "Community",
          headline: "Work alongside other founders",
          proofPoints: [
            "Free Office Space in Taipei",
            "Team Building",
            "Networking & Founder Events",
            "Support beyond the 10-week timeframe",
          ],
          photo: {
            name: "ikigai-group-tshirts",
            alt: "886 Launchpad founders together in Taipei",
            width: 1280,
            height: 1707,
          },
        },
      ],
      testimonials: [
        {
          quote:
            "[886 Launchpad] gave me unwavering support and helped me develop a much more global perspective. I'm really grateful for the team (Kevin, Kai, Carter, Freya, and Ginny) and everything they’ve done for me, from helping me think through product to introducing me to helpful connections to being there for moral support through hard times.",
          name: "Jimmy Huang",
          company: "PicPet",
          profileUrl: "/portfolio/o3o-labs",
          profileLabel: "PicPet",
          photo: {
            src: "/assets/programs/testimonials/jimmy-huang.webp",
            alt: "Jimmy Huang smiling in front of the Golden Gate Bridge",
            width: 620,
            height: 880,
            position: "50% 50%",
          },
          logo: {
            src: "/assets/portfolio/o3o-labs.jpg",
            alt: "PicPet logo",
            width: 512,
            height: 512,
          },
        },
        {
          quote:
            "Personally, [886 Launchpad] showed me different ways to approach uncertainty. With Kevin Lin, it was always about possibility: “Hmm, that could work,” and a why-not-try attitude. With Max Hsieh, it was systematic, actionable, and logical: experiment X, measure Y, define success or failure, learn, and iterate. With Kai Huang, it was about weighing options and trusting your best judgment; even the wrong decision beats no decision because indecision teaches you nothing.",
          name: "Julia Cheung",
          company: "footnotes",
          profileUrl: "/portfolio/footnotes",
          profileLabel: "footnotes",
          photo: {
            src: "/assets/programs/testimonials/julia-cheung-speaking.webp",
            alt: "Julia Cheung speaking at a founder community event",
            width: 420,
            height: 900,
            position: "50% 45%",
          },
          logo: {
            src: "/assets/portfolio/footnotes.png",
            alt: "footnotes logo",
            width: 499,
            height: 500,
          },
        },
        {
          quote:
            "Joining the program was one of the best decisions in my entrepreneurial journey. I was impressed by how amazingly the mentors connected startups in Taiwan with resources from Silicon Valley.",
          name: "Sylvie Liu",
          company: "Dentscape",
          profileUrl: "/portfolio/dentscape",
          profileLabel: "Dentscape",
          photo: {
            src: "/assets/programs/testimonials/sylvie-liu.webp",
            alt: "Sylvie Liu speaking at a professional dental event",
            width: 800,
            height: 533,
            position: "50% 48%",
          },
          logo: {
            src: "/assets/portfolio/dentscape.png",
            alt: "Dentscape logo",
            width: 840,
            height: 840,
          },
        },
        {
          quote:
            "886 has been an invaluable partner on our startup journey. With Kai and Joe's Silicon Valley expertise and connections, along with Freya's enthusiasm in organizing collaborative programs, they've been instrumental in fostering your startup’s success and camaraderie among fellow founders. They have genuine interest in helping you grow as a founder. There are no other investors like them.",
          name: "Ser En Low",
          company: "Mecenia / Sendjoy",
          profileUrl: "/portfolio",
          profileLabel: "Sendjoy",
          photo: {
            src: "/assets/programs/testimonials/ser-en-low.webp",
            alt: "Ser En Low smiling with participants at an AI video event in New York",
            width: 400,
            height: 700,
            position: "50% 50%",
          },
          logo: {
            src: "/assets/programs/testimonials/sendjoy-logo.webp",
            alt: "Sendjoy logo",
            width: 1920,
            height: 1920,
          },
        },
        {
          quote:
            "Preciser wouldn't exist without 886 Studios. 886 gave me the structure and direction I needed to take Preciser from MVP to Launch but also pushed, challenged, and guided me through the steps, insecurities, and excitement of building an impact-led business.",
          name: "Shirley Chen",
          company: "Preciser",
          profileUrl: "/portfolio/preciser",
          profileLabel: "Preciser",
          photo: {
            src: "/assets/programs/testimonials/shirley-chen.webp",
            alt: "Shirley Chen seated in a Preciser shirt",
            width: 400,
            height: 420,
            position: "50% 46%",
          },
          logo: {
            src: "/assets/portfolio/preciser.png",
            alt: "Preciser logo",
            width: 256,
            height: 256,
          },
        },
      ],
      fit: {
        eyebrow: "What we look for",
        title: "Founders building for a global market.",
        criteria: [
          {
            label: "Industry",
            body: "Industry-agnostic, as long as the market is large and global enough to support a category-defining company.",
          },
          {
            label: "Stage",
            body: "Early. From friends-and-family through pre-seed and seed, including teams still moving from idea to MVP.",
          },
          {
            label: "Commitment",
            body: "Founders should be working full-time, or ready to work full-time, and able to join the batch in Taipei.",
          },
          {
            label: "Team",
            body: "A co-founder is not required, but the company needs credible technical or domain capability on the founding team.",
          },
          {
            label: "Mindset",
            body: "Hungry, coachable, adaptable, and ready to act on candid feedback",
          },
        ],
      },
      application: {
        eyebrow: "Applications",
        title: "Build with 886 Launchpad.",
        intro: launchpadScheduleNote,
        milestones: [
          {
            date: "Open now",
            label: "Applications",
          },
          {
            date: "Rolling",
            label: "Application review",
          },
          {
            date: launchpadNextBatch,
            label: "Next batch",
          },
        ],
        steps: [
          {
            title: "Submit Application",
          },
          {
            title: "Application Review",
          },
          {
            title: "1st Interview",
          },
          {
            title: "2nd Interview",
          },
        ],
      },
      faqs: [
        {
          question: "What happened to ikigai Launchpad?",
          answer: "The ikigai Launchpad name has been retired. The accelerator is now called 886 Launchpad, aligning its branding with 886 Studios and 886 Residency.",
        },
        {
          question: "When is the next batch?",
          answer: `The next batch is ${launchpadNextBatch}. Applications are open and reviewed on a rolling basis.`,
        },
        {
          question: "What are the investment terms?",
          answer:
            "The standard deal is a $100,000 USD investment for 8% through a SAFE. Follow-on investment from Lifelike Capital may also be available.",
        },
        {
          question: "Do I need to attend in person in Taipei?",
          answer:
            "Yes. The program takes place in Taipei, and all co-founders are expected to attend the core program in person. Office space is provided for the full 10 weeks.",
        },
        {
          question: "Which stages and industries do you invest in?",
          answer:
            "We invest across industries in early-stage companies, from friends-and-family through pre-seed and seed. Your market needs to be large and global enough to support a category-defining company.",
        },
        {
          question: "Can founders outside Taiwan apply?",
          answer: "Yes. We welcome founders from anywhere in the world.",
        },
        {
          question: "What language are the interviews and program conducted in?",
          answer: "All interviews and the entire program are conducted in English.",
        },
        {
          question: "Do I need to incorporate before applying?",
          answer:
            "No. You do not need a legal entity in Taiwan or elsewhere to apply. If accepted, you will typically need to set up a US entity to receive funding.",
        },
        {
          question: "Is there a program fee in addition to the equity?",
          answer: "No. There is no additional program fee beyond the SAFE investment terms.",
        },
        {
          question: "How long is the program?",
          answer:
            "The program runs for 10 weeks. It includes in-person working sessions, office hours, workshops, community activities, fundraising support, and investor matching.",
        },
        {
          question: "Do I need a co-founder?",
          answer: "No. You can apply as a solo founder.",
        },
        {
          question: "Do I need a technical background?",
          answer:
            "Non-technical founders can apply. You should show credible technical capability on your founding team and a clear plan for building the product.",
        },
        {
          question: "Can I apply if I have already raised funding?",
          answer: "Yes. Founders who have already raised capital can apply.",
        },
        {
          question: "How are 886 Studios and 886 Launchpad related?",
          answer:
            "886 Studios is the venture firm that runs 886 Launchpad, our accelerator program.",
        },
        {
          question: "What happens after the program ends?",
          answer:
            "Support continues after the 10-week program. We provide introductions, resources, and help building your company based on your stage and funding needs. The founder community also stays active beyond the batch.",
        },
        {
          question: "How should I prepare for the first interview?",
          answer:
            "Your first interview with us lasts 20 minutes. You do not need a pitch deck. Read the Interview Guidebook before we meet.",
          links: [
            {
              label: "Read the Interview Guidebook",
              href: "/interview-guidebook",
            },
          ],
        },
        {
          question: "Who can I contact with another question?",
          answer: "Contact us if your question isn’t covered here.",
          links: [
            {
              label: "Contact 886 Studios",
              href: "/contact",
            },
          ],
        },
      ],
    },
    launchStation: {
      title: "886 Residency",
      eyebrow: "Builder residency",
      poster: {
        src: "/assets/programs/launch-station-community-collage-800.webp",
        alt: "886 Studios community collage",
        width: 800,
        height: 800,
      },
      heroPhoto: {
        src: "/assets/programs/launch-station-community-collage-800.webp",
        srcset: "/assets/programs/launch-station-community-collage-480.webp 480w, /assets/programs/launch-station-community-collage-800.webp 800w",
        alt: "886 Studios workspace collage with purple 886 lettering at Taiwan Tech Arena",
        width: 800,
        height: 800,
      },
      communityPhotos: [
        {
          caption: "After Prezzy Day",
          src: "/assets/launch-station/community-dinner-960.webp",
          srcset: "/assets/launch-station/community-dinner-480.webp 480w, /assets/launch-station/community-dinner-960.webp 960w, /assets/launch-station/community-dinner-1440.webp 1440w",
          alt: "Friends smiling for a selfie around a shared dinner table after 886 Residency Prezzy Day",
          width: 960,
          height: 720,
        },
        {
          caption: "Community Lunch",
          src: "/assets/launch-station/community-lunch-960.webp",
          srcset: "/assets/launch-station/community-lunch-480.webp 480w, /assets/launch-station/community-lunch-960.webp 960w, /assets/launch-station/community-lunch-1440.webp 1440w",
          alt: "Six people smiling around a restaurant table during an 886 Residency community lunch",
          width: 960,
          height: 720,
        },
      ],
      lead:
        "A community-building program for early-stage founders. Build your startup from a free dedicated desk at Taiwan Tech Arena, alongside a vetted community of founders and the 886 Studios team.",
      introduction:
        "In return, we ask you to be an active part of the community. Bring your ideas, brainstorm, collaborate, and help each other move forward.",
      status: "Invite-only for now.",
      essentials: [
        { label: "Location", value: "Taipei" },
        { label: "Length", value: "90 days" },
        { label: "Entry", value: "Invite-only" },
      ],
      fit: {
        title: "Who it's for",
        criteria: [
          {
            label: "Early-stage founders",
            body: "You have global ambitions, are building full-time in Taipei, and want to be around other serious builders.",
          },
          {
            label: "Creators & builders",
            body: "You're a creator, researcher, engineer, designer, or operator working full-time on something novel, unique, and exciting.",
          },
        ],
      },
      howItWorks: {
        title: "How it works",
        items: [
          "Join by invitation for a 90-day residency.",
          "Work from the office most of the week and take an active part in the community.",
          "Take the initiative to connect, collaborate, and keep each other accountable. Iron sharpens iron.",
        ],
      },
      benefitsTitle: "What members get",
      benefits: [
        {
          title: "People worth knowing",
          body: "Build relationships with talented, vetted founders, investors, and people in the wider 886 Studios community.",
        },
        {
          title: "Your own desk",
          body: "A free dedicated desk in our open, high-energy startup office at Taiwan Tech Arena for 90 days.",
        },
        {
          title: "Exclusive startup perks",
          body: "Access offers from AWS, Notion, Ramp, OpenAI, and more.",
        },
        {
          title: "Events & shared learning",
          body: "Invites to 886 Studios events, workshops, and talks.",
        },
      ],
      expectations: {
        title: "What we expect from members",
        items: [
          {
            label: "Show up",
            body: "Be in the office most of the week. The purpose is to be part of the community.",
          },
          {
            label: "Take ownership",
            body: "Have high agency. You get out what you put in, so take the initiative to build a community that supports and elevates one another.",
          },
          {
            label: "Keep each other accountable",
            body: "Run a short weekly session together: goals for the week, what shipped, and where you're stuck. We'll help set it up at the beginning; members run it themselves.",
          },
          {
            label: "Teach something",
            body: "Volunteer to host a workshop or share what you've learned so everyone learns from each other.",
          },
          {
            label: "Make time for each other",
            body: "Organize lunches, runs, coffee, or whatever brings you together. We'll help facilitate some socials, and we expect members to take the initiative too.",
          },
        ],
      },
      support: {
        title: "What to expect from us",
        items: [
          {
            label: "A vetted community",
            body: "We select and invite each member, bringing together a group of highly talented and ambitious builders who want to contribute. You'll also be invited to 886-hosted events, workshops, and talks.",
          },
          {
            label: "Office space for 90 days",
            body: "A dedicated desk and office space to work from throughout your residency.",
          },
        ],
      },
      accelerator: {
        title: "What about the accelerator?",
        body: "Residents can apply to 886 Launchpad at any time through the same application process as everyone else. A desk isn't an acceptance, but working alongside us is a great way to get to know each other.",
        cta: { label: "Explore 886 Launchpad →", href: "/accelerator" },
      },
      joining: {
        title: "Invite-only for now",
        body: "Have a question or comment about 886 Residency?",
        cta: {
          label: "Ask about the residency",
          href: "mailto:carter@886studios.com?subject=886%20Residency%20inquiry",
        },
      },
      card: {
        body: "An invite-only, 90-day community program for full-time founders and builders in Taipei. Free dedicated desks at Taiwan Tech Arena, startup perks, and a community to build alongside.",
        cta: {
          label: "Explore 886 Residency →",
          href: "/residency",
        },
      },
    },
    footer: "",
  },
  resources: {
    title: "Resources Library",
    // External coverage only; 886 Insights articles belong in the blog.
    newsItems: [
      {
        title: "ikigai Launchpad Debuts in Taipei, Showcasing Taiwan’s Next Generation Startups",
        href: "https://meet-global.bnext.com.tw/articles/view/48332",
        source: "Meet Global",
        publishedAt: "2025-09-25",
        image: {
          src: "/assets/resources/news/launchpad-debut-960.webp",
          alt: "886 Launchpad founders presenting at Demo Day in Taipei",
          width: 1920,
          height: 1440,
        },
      },
      {
        title: "Kevin Lin on Finding Your ikigai: From Twitch to Taiwanese Startups",
        href: "https://youtu.be/wOHsOPxHO58?si=RLMXSJ1yHY5tEmqB",
        source: "CONNECTED on TaiwanPlus",
        publishedAt: "2025-08-14",
        image: {
          src: "/assets/resources/news/kevin-lin-taiwanplus-960.webp",
          alt: "Kevin Lin featured in the TaiwanPlus interview Finding Your ikigai",
          width: 1280,
          height: 720,
        },
      },
      {
        title: "Silicon Valley Founders Launch ikigai to Help Taiwanese Startups Go Global",
        href: "https://meet-global.bnext.com.tw/articles/view/48182",
        source: "Meet Global",
        publishedAt: "2025-03-26",
        image: {
          src: "/assets/resources/news/global-founders-960.webp",
          alt: "Phil Chen and Kai Huang at Dreamers Coffee Roasters",
          width: 1920,
          height: 1279,
        },
        secondaryLink: {
          label: "中文",
          href: "https://meet.bnext.com.tw/articles/view/52166",
        },
      },
      {
        title: "團隊崩潰、FBI上門到獲得大咖合作，AI數據公司Preciser成「最靠近NBA的台灣新創」",
        href: "https://meet.bnext.com.tw/articles/view/52115",
        source: "Meet Global",
        publishedAt: "2025-03-12",
        image: {
          src: "/assets/resources/news/preciser-960.webp",
          alt: "The Preciser founding team seated together in their office",
          width: 1920,
          height: 1279,
        },
      },
    ],
    libraryItems: [
      {
        group: "foundations",
        title: "Founders FAQs",
        href: "/resources/founders-frequently-asked-questions",
        ctaLabel: "Read answers",
        description:
          "Get founder advice on co-founders, investors, and building your network.",
      },
      {
        group: "foundations",
        title: "Incorporation 101",
        href: "/incorporation-101",
        ctaLabel: "Read guide",
        description:
          "Choose where and how to incorporate your startup.",
      },
      {
        group: "fundraising",
        title: "Cap Table Guide",
        href: "/resources/cap-table-guide",
        ctaLabel: "Read guide",
        description:
          "Understand startup ownership, dilution, and employee options.",
      },
      {
        group: "fundraising",
        title: "SAFE Note Guide",
        href: "/resources/safe-note-guide",
        ctaLabel: "Read guide",
        description:
          "Learn how SAFEs work and what to check before signing.",
      },
      {
        group: "fundraising",
        title: "Term Sheet Guide",
        href: "/resources/term-sheet-guide",
        ctaLabel: "Read guide",
        description:
          "Understand the key terms and tradeoffs in your first term sheet.",
      },
      {
        group: "fundraising",
        title: "Burn Rate & Runway Guide",
        href: "/resources/burn-rate-runway-guide",
        ctaLabel: "Read guide",
        description:
          "Calculate how long your startup's cash will last, with formulas and a worked example.",
      },
      {
        group: "accelerators",
        title: "Application Guide",
        href: "/resources/application-guide",
        ctaLabel: "Read guide",
        description:
          "Prepare your pitch and application for an accelerator.",
      },
      {
        group: "accelerators",
        title: "Interview Guidebook",
        href: "/interview-guidebook",
        ctaLabel: "Read guide",
        description:
          "Know what to expect in your 886 Launchpad interview.",
      },
      {
        group: "ecosystem",
        title: "Ecosystem Database",
        href: "/resources/ecosystem-database",
        ctaLabel: "Browse directory",
        description:
          "Find startup programs, investors, and founder communities in Taiwan.",
      },
      {
        group: "ecosystem",
        title: "Y Combinator 101",
        href: "/resources/y-combinator-101",
        ctaLabel: "Read guide",
        description:
          "Prepare for Y Combinator with application and interview advice.",
      },
    ],
    ama: {
      title: "Have more questions?",
      lead:
        "Ask our partners about your business, fundraising, or industry, or get feedback on your idea.",
      ctaLabel: "Founder AMA",
      ctaHref: "https://tally.so/r/m626gk",
    },
    perks: {
      title: "Exclusive Perks",
      categories: [
        {
          title: "Engineering",
          items: [
            {
              label: "AWS Activate",
              href: "https://aws.amazon.com",
              logoSrc: "/assets/logos/aws.webp",
            },
            {
              label: "GitHub",
              href: "https://github.com",
              logoSrc: "/assets/logos/github.svg",
            },
            {
              label: "Google Cloud Startup Program",
              href: "https://cloud.google.com",
              logoSrc: "/assets/logos/google-cloud.webp",
            },
            {
              label: "OpenAI",
              href: "https://openai.com",
              logoSrc: "/assets/logos/openai.svg",
            },
            {
              label: "Supabase",
              href: "https://supabase.com",
              logoSrc: "/assets/logos/supabase.svg",
            },
            {
              label: "Zettabyte",
              href: "https://www.zettabyte.space/",
              logoSrc: "/assets/logos/zettabyte.svg",
            },
          ],
        },
        {
          title: "Productivity",
          items: [
            {
              label: "Coda",
              href: "https://coda.io",
              logoSrc: "/assets/logos/coda.webp",
            },
            {
              label: "Craft",
              href: "https://www.craft.do/",
              logoSrc: "/assets/logos/craft-logo-white.svg",
            },
            {
              label: "DocSend",
              href: "https://www.docsend.com",
              logoSrc: "/assets/logos/docsend.webp",
            },
            {
              label: "Linear",
              href: "https://linear.app",
              logoSrc: "/assets/logos/linear.svg",
            },
            {
              label: "Miro",
              href: "https://miro.com",
              logoSrc: "/assets/logos/miro.webp",
            },
            {
              label: "Notion",
              href: "https://notion.so",
              logoSrc: "/assets/logos/notion.webp",
            },
          ],
        },
        {
          title: "Finance",
          items: [
            {
              label: "Carta",
              href: "https://carta.com",
              logoSrc: "/assets/logos/carta.webp",
            },
            {
              label: "Deel",
              href: "https://www.deel.com/",
              logoSrc: "/assets/logos/deel.svg",
            },
            {
              label: "Mercury",
              href: "https://mercury.com",
              logoSrc: "/assets/logos/mercury.svg",
            },
            {
              label: "Ramp",
              href: "https://ramp.com",
              logoSrc: "/assets/logos/ramp.webp",
            },
            {
              label: "Stripe",
              href: "https://stripe.com",
              logoSrc: "/assets/logos/stripe.svg",
            },
          ],
        },
        {
          title: "Marketing",
          items: [
            {
              label: "HubSpot",
              href: "https://www.hubspot.com",
              logoSrc: "/assets/logos/hubspot.webp",
            },
            {
              label: "Webflow",
              href: "https://webflow.com",
              logoSrc: "/assets/logos/webflow.svg",
            },
          ],
        },
      ],
    },
  },
  about: {
    eyebrow: "About Us",
    title: "Built by founders, for founders.",
    lead: "886 Studios backs ambitious early-stage founders building companies with global potential.",
    columns: [
      {
        eyebrow: "Who We Are",
        title: "",
        paragraphs: [
          "886 Studios is a Taipei-based venture firm that runs 886 Launchpad, previously known as ikigai Launchpad, a startup accelerator supporting early-stage founders building for global markets. Our partners include the founders of Twitch, Kabam, RedOctane (creators of Guitar Hero), Playdom, OrbitBaby, HTC Vive, and other successful companies.",
          "Our portfolio spans industries and geographies, including Discord, OURA, Crunchyroll, Gogoro, P. LEAGUE+, KKBOX, and more. We back ambitious early-stage founders with a commitment to empowering Taiwan's startup ecosystem.",
          "What makes 886 Studios unique is our ability to combine Silicon Valley experience with deep knowledge of Taiwan's talent and market strengths. Based in Taipei, we serve as a bridge between Taiwan and Silicon Valley.",
        ],
      },
      {
        eyebrow: "Our Story",
        title: "",
        paragraphs: [
          "Named after Taiwan's international country code, 886 Studios was born with a singular mission: to foster and grow Taiwan's startup ecosystem.",
          "In our early days, 886 Studios operated as a venture studio. This insight drove us to create 886 Launchpad, our startup accelerator designed to propel founders toward global growth.",
          "Our vision is to create an environment where founders can thrive with the right mix of funding, mentorship, resources, and networks. We are not just building companies. We are shaping the future of innovation in Taiwan and beyond.",
        ],
      },
    ],
    companies: {
      title: "Iconic companies that we've built",
      logos: [
        {
          name: "Twitch",
          src: "/assets/logos/twitch.svg",
          alt: "Twitch logo",
          width: 1140,
          height: 380,
          exit: "Exit · $970M",
          title: "Twitch exit: approximately $970 million",
          imageClass: "is-tall",
        },
        {
          name: "Kabam",
          src: "/assets/logos/kabam.webp",
          alt: "Kabam logo",
          width: 316,
          height: 316,
          exit: "Exit · $800M",
          title: "Kabam exit: approximately $800 million",
          imageClass: "is-tall",
        },
        {
          name: "Guitar Hero",
          src: "/assets/logos/guitar-hero.webp",
          alt: "Guitar Hero logo",
          width: 489,
          height: 352,
          exit: "Exit · $99.9M",
          title: "Guitar Hero exit: approximately $99.9 million",
          imageClass: "is-tall",
        },
        {
          name: "Playdom",
          src: "/assets/logos/playdom-alt.webp",
          alt: "Playdom logo",
          width: 1000,
          height: 244,
          exit: "Exit · $563.2M",
          title: "Playdom exit: approximately $563.2 million",
          imageClass: "is-tall",
        },
        {
          name: "Metatheory",
          src: "/assets/logos/metatheory.webp",
          alt: "Metatheory logo",
          width: 400,
          height: 400,
          imageClass: "is-tall",
        },
        {
          name: "Mochi Media",
          src: "/assets/logos/mochimedia.webp",
          alt: "Mochi Media logo",
          width: 820,
          height: 750,
          exit: "Exit · $80M",
          title: "Mochi Media exit: approximately $80 million",
          imageClass: "is-tall",
        },
        {
          name: "Orbit Baby",
          src: "/assets/logos/orbitbaby.webp",
          alt: "Orbit Baby logo",
          width: 456,
          height: 80,
          exit: "Exit · $17.5M",
          title: "Orbit Baby exit: approximately $17.5 million",
          imageClass: "is-tall",
        },
        {
          name: "Blue Goji",
          src: "/assets/logos/bluegoji.webp",
          alt: "Blue Goji logo",
          width: 256,
          height: 256,
          imageClass: "is-tall",
        },
        {
          name: "Gen.G",
          src: "/assets/logos/geng.webp",
          alt: "Gen.G logo",
          width: 820,
          height: 956,
          imageClass: "is-tall",
        },
        {
          name: "Hot or Not",
          src: "/assets/logos/hotornot.webp",
          alt: "Hot or Not logo",
          width: 1920,
          height: 1272,
          exit: "Exit · $20M",
          title: "Hot or Not exit: approximately $20 million",
          imageClass: "is-tall",
        },
        {
          name: "Rally",
          src: "/assets/logos/rally-official.webp",
          alt: "Rally logo",
          width: 300,
          height: 300,
          imageClass: "is-tall",
        },
        {
          name: "Tiburon Entertainment",
          src: "/assets/logos/tiburon.webp",
          alt: "Tiburon Entertainment logo",
          width: 184,
          height: 184,
          imageClass: "is-tall",
        },
        {
          name: "Catalyte",
          src: "/assets/logos/catalyte-official.webp",
          alt: "Catalyte logo",
          width: 1920,
          height: 1920,
          imageClass: "is-tall",
        },
        {
          name: "Cold Electric",
          src: "/assets/logos/cold-electric.svg",
          alt: "Cold Electric logo",
          width: 298,
          height: 34,
          imageClass: "is-cold-electric",
        },
        {
          name: "New Taipei Kings",
          src: "/assets/logos/new-taipei-kings.webp",
          alt: "New Taipei Kings logo",
          width: 1500,
          height: 771,
          imageClass: "is-tall",
        },
      ],
    },
    teamTitle: "Operating Team",
    team: [
      {
        initials: "MH",
        name: "Max Hsieh",
        role: "Venture Partner & General Manager",
        company: "Forma",
        photo: "/assets/headshots/max-hsieh.webp",
        objectPosition: "top center",
        linkedinUrl: "https://www.linkedin.com/in/max-hsieh-8045875a",
      },
      {
        initials: "PC",
        name: "Patryk Chojecki",
        role: "Program Manager",
        photo: "/assets/headshots/patryk-chojecki.webp",
        linkedinUrl: "https://www.linkedin.com/in/patryk-chojecki/",
      },
      {
        initials: "CW",
        name: "Carter Wang",
        role: "Venture Associate",
        photo: "/assets/headshots/carter-wang.webp",
        linkedinUrl: "https://www.linkedin.com/in/cartergrantwang/",
        xUrl: "https://x.com/carterkowang",
      },
    ],
    partnersTitle: "Partners",
    partners: [
      {
        initials: "KH",
        name: "Kai Huang",
        role: "Managing Partner",
        company: "Guitar Hero / Blue Goji",
        photo: "/assets/headshots/kai-huang.webp",
      },
      {
        initials: "KL",
        name: "Kevin Lin",
        role: "Batch Partner",
        company: "Twitch / Metatheory",
        photo: "/assets/headshots/kevin-lin.webp",
      },
      {
        initials: "KC",
        name: "Kevin Chou",
        company: "Kabam / Gen.G",
        photo: "/assets/headshots/kevin-chou.webp",
      },
      {
        initials: "CW",
        name: "Chris Wang",
        company: "Playdom / ThunderCore",
        photo: "/assets/headshots/chris-wang.webp",
      },
      {
        initials: "PC",
        name: "Phil Chen",
        company: "HTC Vive / New Taipei Kings / Cold Electric",
        photo: "/assets/headshots/phil-chen.webp",
      },
      {
        initials: "JH",
        name: "Jameson Hsu",
        company: "Mochi Media",
        photo: "/assets/headshots/jameson-hsu.webp",
      },
      {
        initials: "JH",
        name: "Joseph Hei",
        company: "Orbit Baby",
        photo: "/assets/headshots/joseph-hei.webp",
      },
      {
        initials: "JH",
        name: "Jacob Hsu",
        company: "Catalyte / Symbio",
        photo: "/assets/headshots/jacob-hsu.webp",
      },
      {
        initials: "CH",
        name: "Charles Huang",
        company: "Guitar Hero / Blue Goji",
        photo: "/assets/headshots/charles-huang.webp",
      },
      {
        initials: "JH",
        name: "James Hong",
        company: "Hot or Not",
        photo: "/assets/headshots/james-hong-portrait.webp",
      },
      {
        initials: "SC",
        name: "Steven Chiang",
        company: "Tiburon / EA Sports",
        photo: "/assets/headshots/steven-chiang.webp",
      },
      {
        initials: "TC",
        name: "Timothy Chen",
        company: "VIA Technologies / CATCHPLAY",
        photo: "/assets/headshots/timothy-chen.webp",
      },
    ],
    collaboration: {
      eyebrow: "Fund Partner",
      title: "Lifelike Capital",
      logo: {
        src: "/assets/about/lifelike-capital.webp",
        alt: "Lifelike Capital",
        width: 750,
        height: 750,
      },
      description:
        "886 Studios and Lifelike Capital work together to support founders building ambitious companies with global potential.",
      program: {
        label: "886 Launchpad",
        href: "/accelerator",
      },
      programDescription:
        "is the result of our collaboration, a shared program created to help the next generation of startups grow globally.",
      links: [
        {
          label: "Website",
          href: "https://www.lifelikecap.com/",
        },
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/company/lifelikecapital/",
        },
      ],
    },
    careers: {
      title: "Careers",
      description: "We are not currently hiring for any full-time roles at the moment.",
      scoutInvitation: "If you interested in becoming a Venture Scout please contact",
      contactEmail: "carter@886studios.com",
    },
  },
  events: {
    eyebrow: "Events",
    title: "What's happening",
    lead: "Meetups, workshops, and demo days for the 886 Studios community.",
    calendarUrl: "https://luma.com/886",
    calendarTitle: "Subscribe to the 886 Studios Luma calendar.",
    calendarText:
      "All of our events are available on Luma. Subscribe there to get the latest sessions, reminders, and updates as soon as they are published.",
    calendarCta: "Subscribe on Luma",
    upcomingTitle: "Upcoming events",
    pastTitle: "Past events",
    emptyTitle: "No upcoming events are published yet.",
    emptyText: "Check back soon for new 886 Studios events.",
  },
  contact: {
    eyebrow: "Contact",
    title: "Let’s build together",
    founders: {
      label: "Founders",
      title: "Building an ambitious startup",
      description:
        "Tell us what you’re working on and apply to 886 Launchpad.",
      scheduleNote: launchpadScheduleNote,
      cta: "Apply to 886 Launchpad",
      href: applicationUrl,
    },
    general: {
      label: "Partnerships & press",
      title: "Work with 886 Studios",
      description:
        "For ecosystem partnerships, media, events, and general questions.",
      address: "it@886studios.com",
      href: "mailto:it@886studios.com",
    },
    community: {
      label: "Community",
      title: "Join our Discord community",
      description:
        "Connect with founders, builders, and the wider 886 Studios community on Discord.",
      cta: "Join us on Discord",
      href: discordCommunityUrl,
    },
  },
  footer: {
    copy: "© 886 Studios 2026",
  },
};
