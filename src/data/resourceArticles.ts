type ResourceLink = {
  label: string;
  href: string;
};

type ResourceCard = {
  title: string;
  meta?: string;
  body?: string;
  href?: string;
};

type ResourceTable = {
  headers: string[];
  rows: string[][];
};

type ResourceQuote = {
  text: string;
  author: string;
  role?: string;
};

type ResourceSubsection = {
  title: string;
  body?: string;
  list?: string[];
};

type ResourceSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
  cards?: ResourceCard[];
  quotes?: ResourceQuote[];
  links?: ResourceLink[];
  table?: ResourceTable;
  subsections?: ResourceSubsection[];
};

type ResourceDirectoryEntry = {
  name: string;
  focus?: string;
  url?: string;
  href?: string;
  year?: string;
  contact?: string;
  range?: string;
  stage?: string;
};

type ResourceDirectoryGroup = {
  title: string;
  entries: ResourceDirectoryEntry[];
};

export type ResourceArticle = {
  slug: string;
  title: string;
  intro?: string;
  parent?: { label: string; href: string };
  sections?: ResourceSection[];
  directoryGroups?: ResourceDirectoryGroup[];
};

export const resourceArticles: ResourceArticle[] = [
  {
    slug: "y-combinator-101",
    title: "Y Combinator 101",
    intro:
      "We provide the hints and tips from experienced founders, former YC Partners, and 886 Partners to allow founders to submit their best possible application.",
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "Have a question about preparing your application? Send us your question through our Founder AMA form. For YC's own application guidance, read How to Apply to Y Combinator.",
        ],
        links: [
          { label: "Ask an application question", href: "https://tally.so/r/m626gk" },
          {
            label: "How to Apply to Y Combinator",
            href: "https://www.ycombinator.com/howtoapply.html",
          },
        ],
      },
      {
        title: "Partner Notes",
        quotes: [
          {
            author: "Kevin Lin",
            role: "Twitch Co-founder · YC Visiting Partner",
            text: "Dig deep. Research. Know the landscape. Understand the problem deeply.",
          },
          {
            author: "Lyle Fong",
            role: "Lithium, now Khoros, Co-founder · YC Visiting Partner",
            text: "Helping founders figure out what actually matters at their stage of company, then focusing all their efforts on that is usually the first step in building a great business.",
          },
          {
            author: "Holly Liu",
            role: "Kabam Co-founder, PKO Investments Co-founder · YC Visiting Partner",
            text: "It’s better to know more about the problem and your customers than your product.",
          },
        ],
      },
      {
        title: "Tips",
        list: [
          "We are not asking for the execution or 5 or 10 year plan. We want your vision: how you want your company to be.",
          "Use comparisons to existing products or companies to help your explanations.",
          "Be concise when answering questions. Less is more.",
          "Do not go into too many features.",
          "Use simple words and an easy-going tone.",
        ],
      },
      {
        title: "Read More",
        links: [
          {
            label: "Michael Seibel on X",
            href: "https://twitter.com/mwseibel",
          },
          {
            label:
              "Article - YC’s latest batch sure was a lot of ‘maybe AI can do… this?’",
            href: "https://techcrunch.com/2023/04/08/ycs-latest-batch-sure-was-a-lot-of-maybe-ai-can-do-this/",
          },
        ],
      },
    ],
  },
  {
    slug: "application-guide",
    title: "Accelerator application guide",
    intro:
      "Prepare accelerator applications with a founder checklist, clear written answers, a one-minute video, and ikigai Launchpad eligibility and first interview guidance.",
  },
  {
    slug: "safe-note-guide",
    title: "What is a SAFE note?",
    intro:
      "Learn how a SAFE note works, how post-money valuation caps set ownership, how SAFEs compare with convertible notes, and what to check before signing.",
  },
  {
    slug: "cap-table-guide",
    title: "What is a cap table?",
    intro:
      "Learn what a cap table shows, how fully diluted ownership works, and how SAFEs, option pools, vesting and new rounds change founder ownership.",
  },
  {
    slug: "term-sheet-guide",
    title: "What is a term sheet?",
    intro:
      "Learn to read your first startup term sheet, understand valuation and investor rights, and prepare for negotiation with examples and a review checklist.",
  },
  {
    slug: "burn-rate-runway-guide",
    title: "What are burn rate and runway?",
    intro:
      "Calculate startup burn rate and runway with plain-English formulas, a Taiwan startup example, and a practical checklist for early-stage founders.",
  },
  {
    slug: "founders-frequently-asked-questions",
    title: "Founders FAQs",
    intro:
      "Founders Frequently Asked Questions (FFAQ) offers essential insights directly from seasoned entrepreneurs. Dive into expert advice tailored for startup success.",
    sections: [
      {
        title: "Co-Founders",
        cards: [
          {
            title: "Finding a Co-Founder",
            href: "/resources/finding-a-co-founder",
          },
          {
            title: "The Role of Expertise",
            href: "/resources/the-role-of-expertise",
          },
          {
            title: "Choosing the Right Co-Founder",
            href: "/resources/choosing-the-right-co-founder",
          },
          { title: "Lessons Learned", href: "/resources/lessons-learned" },
        ],
      },
      {
        title: "Investor Relations",
        cards: [
          {
            title: "Leadership in Funding Rounds",
            href: "/resources/leadership-in-funding-rounds",
          },
          {
            title: "Encouraging Leadership",
            href: "/resources/encouraging-leadership",
          },
          {
            title: "Engagement During Fundraising",
            href: "/resources/engagement-during-fundraising",
          },
          {
            title: "Negotiating with Lead Investors",
            href: "/resources/negotiating-with-lead-investors",
          },
        ],
      },
      {
        title: "Networking",
        cards: [
          {
            title: "Warm Introductions",
            href: "/resources/warm-introductions",
          },
          { title: "Dos and Don'ts", href: "/resources/dos-and-donts" },
        ],
      },
      {
        title: "Seeking More Advice",
        paragraphs: [
          "We are here to help! Ask your questions directly to the 886 partners here:",
        ],
        links: [
          { label: "Contact Us Here", href: "https://tally.so/r/m626gk" },
        ],
      },
    ],
  },
  {
    slug: "ecosystem-database",
    title: "Ecosystem Database",
    intro:
      "In Taiwan’s ecosystem, there are several accredited accelerators and VCs to choose from. We’ve compiled information on some of a startup’s options in Taiwan.",
    directoryGroups: [
      {
        title: "Accelerators",
        entries: [
          {
            name: "ikigai Launchpad",
            focus:
              "AI, IoT, Gaming, Consumer, Digital Transformation, Sportstech, Web 3, etc",
            url: "886studios.com/ikigai-launchpad",
            href: "/ikigai-launchpad",
            year: "2024",
            contact: "carter@886studios.com",
          },
          {
            name: "AppWorks",
            focus: "AI, IoT, Web 3",
            url: "appworks.tw",
            href: "https://appworks.tw/",
            year: "2010",
            contact: "a@appworks.tw",
          },
          {
            name: "Garage+",
            focus:
              "AI, Big Data, IoT, HealthTech, 5G, Robotics, Energy, Transportation",
            url: "www.garageplus.asia",
            href: "https://www.garageplus.asia/",
            year: "2008",
            contact: "info@garageplus.asia",
          },
          {
            name: "IAPS",
            focus:
              "AI, IoT, Sustainability, Manufacturing, Defense, BioMed Agritech, FoodTech, Lifestyle, SportTech",
            url: "iaps.ord.nycu.edu.tw",
            href: "https://iaps.ord.nycu.edu.tw/",
            year: "2013",
            contact: "anitahsieh@g2.nctu.edu.tw",
          },
          {
            name: "TAcc+",
            focus: "AI, IoT, Cybersecurity, Healthcare, Sustainability, etc.",
            url: "startup.sme.gov.tw/taccplus",
            href: "https://startup.sme.gov.tw/taccplus/",
            year: "2019",
            contact: "support@taccplus.com",
          },
          {
            name: "Asia Blockchain Accelerator",
            focus: "Web 3, Blockchain",
            url: "www.abatw.io",
            href: "https://www.abatw.io/",
            year: "2018",
            contact: "contact@abatw.io",
          },
          {
            name: "APT 5G Accelerator",
            focus: "ICT, IoT, 5G, AI, Cloud, Big data",
            url: "aptg5gaccel.com",
            href: "https://aptg5gaccel.com/",
            year: "2018",
            contact: "aptg5gaccel@gmail.com",
          },
          {
            name: "StarFab Accelerator",
            focus:
              "AIoT, 5G, XR, Cybersecurity, Digital Transformation, Industrial Automation, Retail, Hospitality, Medical, and Automobile",
            url: "www.starfabx.com",
            href: "https://www.starfabx.com/",
            year: "2016",
          },
          {
            name: "SparkLabs Taiwan",
            url: "www.sparklabstaiwan.com",
            href: "https://www.sparklabstaiwan.com/",
            year: "2013",
            contact: "info@sparklabstaiwan.com",
          },
        ],
      },
      {
        title: "VC Firms",
        entries: [
          {
            name: "Cornerstone Ventures",
            focus: "AI, Big Data, Digital",
            range: "$200,000 - 1,000,000",
            stage: "Early Stage",
            url: "cornerstonevc.tw",
            href: "https://cornerstonevc.tw/",
            contact: "contact@cornerstonevc.tw",
          },
          {
            name: "Cherubic Ventures",
            focus: "SaaS, Consumer Tech",
            range: "$500,000 - 1,000,000",
            stage: "Pre-Seed - Seed",
            url: "cherubic.com",
            href: "https://cherubic.com/",
            contact: "bp@cherubic.com",
          },
          {
            name: "Cathay Venture",
            focus:
              "Biotech, Electronics, Software, Consumer, Manufacturing, Automobile, Sustainability",
            range: "$1,000,000 - 2,300,000",
            stage: "Seed - Series A+",
            url: "www.cathayholdings.com",
            href: "https://www.cathayholdings.com/",
            contact: "80357826@cathaycapital.com.tw",
          },
          {
            name: "Hive Ventures",
            focus:
              "AI, Big Data, SaaS, Web3, Enterprise Software, Smart Manufacturing",
            range: "$300,000-500,000",
            stage: "Seed - Pre-A",
            url: "www.hiveventures.io",
            href: "https://www.hiveventures.io/",
            contact: "ideas@hiveventures.io",
          },
          {
            name: "Mesh Ventures",
            focus: "AI, IoT, Consumer Electronics, Semiconductor",
            range: "$500,000-$1,000,000",
            stage: "Seed - Series A",
            url: "mesh.vc",
            href: "https://mesh.vc/",
            contact: "hello@mesh.vc",
          },
          {
            name: "Trans-Pacific Technology Fund",
            focus: "Medical & Health, Advanced Materials, IoT, AI, Fintech",
            range: "$1,000,000-4,000,000",
            stage: "Unspecified Stage",
            url: "tptf.co",
            href: "https://tptf.co/",
            contact: "flee@tptf.co",
          },
          {
            name: "CSC Venture Capital Corp.",
            focus: "Lifestyle, HealthTech, ICT, Connectivity, Media, IoT",
            range: "$1,000,000-3,000,000",
            stage: "Series A",
            url: "www2.capital.com.tw",
            href: "https://www2.capital.com.tw/",
            contact: "service@capital.com.tw",
          },
          {
            name: "LUCIMA",
            focus:
              "AR/VR, AI, Platform, Media, Digital Content & Experience Technology, Martech, HealthTech, Connectivity, Sustainability, Green Energy, SaaS",
            range: "$100,000-1,000,000",
            stage: "Pre A - Series B",
            url: "lucima.com",
            href: "https://lucima.com/",
            contact: "Info@lucima.com",
          },
          {
            name: "Taipei Angels",
            focus:
              "BioTech, Cultural Creativity, Mobile & Commerce, Software & Services, Technology & Hardware",
            range: "$30,000-160,000",
            stage: "Angel - Seed",
            url: "www.taipeiangels.com",
            href: "https://www.taipeiangels.com/",
            contact: "contact@taipeiangels.com",
          },
          {
            name: "Smart Capital",
            focus: "Unspecified Industry",
            range: "$100,000-1,000,000",
            stage: "Angel - Pre A",
            url: "angel-investor.org",
            href: "https://angel-investor.org/",
            contact: "fundraising@angel-investor.org",
          },
          {
            name: "Creative Ventures",
            focus:
              "AgriTech, FoodTech, Health Tech, Manufacturing, Logistics, Automotive, Energy, PropTech",
            range: "Unspecified Range",
            stage: "Early Stage",
            url: "creativeventures.vc",
            href: "https://creativeventures.vc/",
            contact: "invest@creativeventures.vc",
          },
          {
            name: "Ace Capital",
            focus:
              "AI, IoT, Fintech, Blockchain, Sustainability, AgriTech, Media, Connectivity, SaaS",
            range: "$100,000-1,000,000",
            stage: "Series A",
            url: "www.theacecapital.com",
            href: "https://www.theacecapital.com/",
            contact: "info@theAceCapital.com",
          },
        ],
      },
      {
        title: "Accelerator / Incubator",
        entries: [
          {
            name: "FinTechSpace",
            url: "www.fintechspace.com.tw",
            href: "https://www.fintechspace.com.tw/",
            contact: "fintechspace@iii.org.tw",
          },
          {
            name: "VIVE X",
            url: "vivex.vive.com",
            href: "https://vivex.vive.com/",
          },
          {
            name: "TEC",
            url: "tec.ntu.edu.tw",
            href: "https://tec.ntu.edu.tw/",
            contact: "ntutec@ntutec.com",
          },
          {
            name: "StarFab Accelerator",
            url: "www.starfabx.com",
            href: "https://www.starfabx.com/",
          },
          {
            name: "Orange Fab Asia",
            url: "orangefab.com",
            href: "https://orangefab.com/",
          },
          {
            name: "SparkLabs Taiwan",
            url: "www.sparklabstaiwan.com",
            href: "https://www.sparklabstaiwan.com/",
            contact: "info@sparklabstaiwan.com",
          },
          {
            name: "IAPS",
            url: "iaps.ord.nycu.edu.tw",
            href: "https://iaps.ord.nycu.edu.tw/",
            contact: "https://iaps.ord.nycu.edu.tw/contact-us/",
          },
          {
            name: "Orbit Startups",
            url: "orbitstartups.com",
            href: "https://orbitstartups.com/",
          },
          {
            name: "Garage +",
            url: "www.garageplus.asia",
            href: "https://www.garageplus.asia/",
            contact: "info@garageplus.asia",
          },
          {
            name: "Dit Startup",
            url: "www.ditstartup.com",
            href: "https://www.ditstartup.com/",
            contact: "service@ditstartup.com",
          },
          {
            name: "BE Health",
            url: "www.behealthventures.com",
            href: "https://www.behealthventures.com/",
            contact: "service@behealthventures.com",
          },
          {
            name: "AI ROBOT",
            url: "www.stsp.gov.tw",
            href: "https://www.stsp.gov.tw/",
            contact: "ai_robot@mail.mirdc.org.tw",
          },
          {
            name: "AppWorks",
            url: "appworks.tw",
            href: "https://appworks.tw/",
            contact: "a@appworks.tw",
          },
          {
            name: "Anchor Taiwan",
            url: "www.anchortaiwan.com",
            href: "https://www.anchortaiwan.com/",
            contact: "info@anchortaiwan.com",
          },
          {
            name: "AAMA Taipei",
            url: "www.aamataipei.com.tw",
            href: "https://www.aamataipei.com.tw/",
            contact: "tccfe.aama@tccfe.org.tw",
          },
        ],
      },
      {
        title: "Co-working Space",
        entries: [
          {
            name: "FinTechSpace",
            url: "www.fintechspace.com.tw",
            href: "https://www.fintechspace.com.tw/",
            contact: "fintechspace@iii.org.tw",
          },
          {
            name: "Futureward",
            url: "futureward.com",
            href: "https://futureward.com/",
            contact: "admin@futureward.com",
          },
          {
            name: "Monospace",
            url: "monospace.tw",
            href: "https://monospace.tw/",
            contact: "hq@monospace.tw",
          },
          {
            name: "Taipei Co-space",
            url: "www.cospace-taipei.com",
            href: "https://www.cospace-taipei.com/",
            contact: "taipei.cospace@gmail.com",
          },
          { name: "SkyCo", contact: "https://www.skycowork.com/contact-us" },
          {
            name: "One&Co Taipei",
            url: "www.oneandco.tw",
            href: "https://www.oneandco.tw/",
            contact: "https://www.oneandco.tw/zh/contact/",
          },
          {
            name: "Pun Place",
            url: "www.facebook.com",
            href: "https://www.facebook.com/",
            contact: "punplace@panmedia.asia",
          },
          {
            name: "Star Roket",
            url: "starrocket.io",
            href: "https://starrocket.io/",
            contact: "info@starrocket.io",
          },
          { name: "JustCo" },
          {
            name: "Popop Taipei",
            url: "popoptaipei.com",
            href: "https://popoptaipei.com/",
          },
          {
            name: "t.Hub",
            url: "www.t-hubtaipei.com",
            href: "https://www.t-hubtaipei.com/",
            contact: "service@t-hubtaipei.com",
          },
          {
            name: "WeWork",
            url: "www.wework.com",
            href: "https://www.wework.com/",
          },
          {
            name: "CIT",
            url: "www.cit.tw",
            href: "https://www.cit.tw/",
            contact: "hun@theplanb.cc",
          },
          { name: "Regus", contact: "https://www.regus.com/zh-tw/enquiry2" },
        ],
      },
      {
        title: "Community",
        entries: [
          {
            name: "AAMA Taipei",
            url: "www.aamataipei.com.tw",
            href: "https://www.aamataipei.com.tw/",
            contact: "tccfe.aama@tccfe.org.tw",
          },
          {
            name: "Futureward",
            url: "futureward.com",
            href: "https://futureward.com/",
            contact: "admin@futureward.com",
          },
          {
            name: "DAKUO",
            url: "dakuo.koda.net.tw",
            href: "https://dakuo.koda.net.tw/",
            contact: "ervice@legendinno.com.tw",
          },
          {
            name: "iiiNNO",
            url: "www.iiinno.co",
            href: "https://www.iiinno.co/",
            contact: "contact@iiinno.co",
          },
          {
            name: "Techstars",
            url: "www.techstars.com",
            href: "https://www.techstars.com/",
            contact: "https://www.techstars.com/contact",
          },
          {
            name: "Meet",
            url: "meet.bnext.com.tw",
            href: "https://meet.bnext.com.tw/",
            contact: "service@bnext.com.tw",
          },
          {
            name: "11Fleet",
            url: "www.11fleet.com",
            href: "https://www.11fleet.com/",
            contact: "info@11fleet.com",
          },
          {
            name: "NTPC Innosquare",
            url: "www.facebook.com",
            href: "https://www.facebook.com/",
            contact: "innosquare.new.taipei@gmail.com",
          },
          {
            name: "Startup Stadium",
            url: "www.startupstadium.tw",
            href: "https://www.startupstadium.tw/",
          },
          {
            name: "Taiwan Employment Gold Card",
            url: "goldcard.nat.gov.tw",
            href: "https://goldcard.nat.gov.tw/",
            contact: "help@taiwangoldcard.tw",
          },
        ],
      },
      {
        title: "Government",
        entries: [
          {
            name: "Startup Stadium",
            url: "www.startupstadium.tw",
            href: "https://www.startupstadium.tw/",
          },
          {
            name: "Taiwan Employment Gold Card",
            url: "goldcard.nat.gov.tw",
            href: "https://goldcard.nat.gov.tw/",
            contact: "help@taiwangoldcard.tw",
          },
          {
            name: "Contact Taiwan",
            url: "contacttaiwan.tw",
            href: "https://contacttaiwan.tw/",
            contact: "recruit@moea.gov.tw",
          },
          {
            name: "Taiwan Startup Terrace Linkou",
            url: "www.startupterrace.tw",
            href: "https://www.startupterrace.tw/",
          },
          {
            name: "Taiwan Tech Arena",
            url: "www.taiwanarena.tech",
            href: "https://www.taiwanarena.tech/",
          },
          {
            name: "FITI",
            url: "fiti.stpi.narl.org.tw",
            href: "https://fiti.stpi.narl.org.tw/",
          },
          {
            name: "ASVA (formerly ASVDA)",
            url: "www.asva.org.tw",
            href: "https://www.asva.org.tw/",
          },
          {
            name: "TRIPLE",
            url: "www.triplelinkage.com",
            href: "https://www.triplelinkage.com/",
          },
          {
            name: "ITRI",
            url: "www.itri.org.tw",
            href: "https://www.itri.org.tw/",
          },
          {
            name: "Angel885",
            url: "www.angel885.org.tw",
            href: "https://www.angel885.org.tw/",
          },
          {
            name: "SITI",
            url: "industry-incentive.taipei",
            href: "https://industry-incentive.taipei/",
          },
          {
            name: "Crossroads",
            url: "crossroads.tw",
            href: "https://crossroads.tw/",
            contact: "service@crossroads.tw",
          },
          {
            name: "Tainan City Government Economic Development Bureau",
            url: "economic.tainan.gov.tw",
            href: "https://economic.tainan.gov.tw/",
          },
        ],
      },
      {
        title: "Media",
        entries: [
          {
            name: "Digitimes",
            url: "www.digitimes.com.tw",
            href: "https://www.digitimes.com.tw/",
            contact: "marketing@digitimes.com",
          },
          {
            name: "TechOrange",
            url: "buzzorange.com",
            href: "https://buzzorange.com/",
            contact: "pr@fusionmedium.com",
          },
          {
            name: "The News Lens",
            url: "www.thenewslens.com",
            href: "https://www.thenewslens.com/",
            contact: "press@thenewslens.com",
          },
          {
            name: "Business Next",
            url: "www.bnext.com.tw",
            href: "https://www.bnext.com.tw/",
            contact: "service@bnext.com.tw",
          },
          {
            name: "Inside",
            url: "www.inside.com.tw",
            href: "https://www.inside.com.tw/",
            contact: "contact@inside.com.tw",
          },
          {
            name: "TechNews",
            url: "technews.tw",
            href: "https://technews.tw/",
          },
          {
            name: "Taiwan News",
            url: "www.taiwannews.com.tw",
            href: "https://www.taiwannews.com.tw/",
            contact: "taiwannewseditor@gmail.com",
          },
        ],
      },
      {
        title: "Talent Platform",
        entries: [
          {
            name: "Terminal 1",
            url: "t1.co",
            href: "https://t1.co/",
            contact: "hi@t1.co",
          },
          {
            name: "Yourator",
            url: "www.yourator.co",
            href: "https://www.yourator.co/",
          },
          {
            name: "meet.jobs",
            url: "meet.jobs",
            href: "https://meet.jobs/",
            contact: "service@meet.jobs",
          },
          {
            name: "Cake",
            url: "www.cakeresume.com",
            href: "https://www.cakeresume.com/",
          },
          {
            name: "ALPHA camp",
            url: "tw.alphacamp.co",
            href: "https://tw.alphacamp.co/",
            contact: "taiwan@alphacamp.co",
          },
        ],
      },
      {
        title: "Venture Capital",
        entries: [
          {
            name: "886 Studios",
            url: "www.886studios.com",
            href: "https://www.886studios.com/",
          },
          {
            name: "BE Health",
            url: "www.behealthventures.com",
            href: "https://www.behealthventures.com/",
            contact: "service@behealthventures.com",
          },
          {
            name: "AppWorks",
            url: "appworks.tw",
            href: "https://appworks.tw/",
            contact: "a@appworks.tw",
          },
          {
            name: "BRV Capital",
            url: "brvcapital.com",
            href: "https://brvcapital.com/",
          },
          {
            name: "ITIC, Industrial Technology Invesment Corporation",
            url: "itic.com.tw",
            href: "https://itic.com.tw/",
            contact: "service@itic.com.tw",
          },
          { name: "500", url: "500.co", href: "https://500.co/" },
          {
            name: "KGI Financial (formerly China Development Financial)",
            url: "www.kgi.com/en",
            href: "https://www.kgi.com/en",
          },
          {
            name: "TAIWANIA",
            url: "www.taiwaniacapital.com",
            href: "https://www.taiwaniacapital.com/",
            contact:
              "https://www.taiwaniacapital.com/%e8%81%af%e7%b5%a1%e6%88%91%e5%80%91/",
          },
          {
            name: "Taipei Angels",
            url: "www.taipeiangels.com",
            href: "https://www.taipeiangels.com/",
            contact: "contact@taipeiangels.com",
          },
          {
            name: "WI Harper Group",
            url: "wiharper.com",
            href: "https://wiharper.com/",
          },
          {
            name: "MESH",
            url: "mesh.vc",
            href: "https://mesh.vc/",
            contact: "hello@mesh.vc",
          },
          {
            name: "Cherubic",
            url: "cherubic.com",
            href: "https://cherubic.com/",
            contact: "bp@cherubic.com",
          },
          {
            name: "Kyber Capital",
            url: "www.kybercap.com",
            href: "https://www.kybercap.com/",
            contact: "info@kybercap.com",
          },
          {
            name: "Headline",
            url: "headline.com",
            href: "https://headline.com/",
            contact: "hello@headline.com",
          },
          {
            name: "Pinehurst",
            url: "pinehurstadvisors.com",
            href: "https://pinehurstadvisors.com/",
            contact: "info@pinehurstadvisors.com",
          },
        ],
      },
      {
        title: "Venture Studios",
        entries: [
          {
            name: "Elmntri",
            url: "elmntri.com",
            href: "https://elmntri.com/",
            contact:
              "https://coda.io/form/Build-with-us-at-Elmntri_dumwMaTE6E8",
          },
          {
            name: "Sudo Labs",
            url: "www.sudolabs.co",
            href: "https://www.sudolabs.co/",
            contact: "hello@sudolabs.co",
          },
        ],
      },
    ],
  },
  {
    slug: "finding-a-co-founder",
    title: "Finding a Co-Founder",
    parent: {
      label: "Founders FAQs",
      href: "/resources/founders-frequently-asked-questions",
    },
    intro: "We asked three of our 886 partners this question:",
    sections: [
      {
        title:
          "Could you share any personal lessons or stories from working with your co-founders? What worked, what didn't, and how did you navigate challenges?",
        cards: [
          {
            title: "Charles Huang",
            meta: "Co-founder of RedOctane",
            body: "I started 3 companies with my brother. I started 2 companies with former co-workers. I started 1 company by myself. I started 1 company with a high school classmate. Based on that set of experiences, I highly recommend you have a co-founder. I prefer someone I have known for years. It eliminates a few risks: 1. Chemistry risk: we can work with each other. 2. Skills fit risk: we know what each person can do.",
          },
          {
            title: "Kai Huang",
            meta: "Co-founder of RedOctane",
            body: "For two companies that I started the co-founder was my brother. For one it was with someone I worked with and trusted in the past. For the other two they were friend referrals. I think working with someone you've worked with previously (or lived with) really makes sure you're compatible before becoming startup founders. You should always be expanding your network by meeting people, and making sure you keep in touch with past connections.",
          },
          {
            title: "Joseph Hei",
            meta: "Co-founder of OrbitBaby",
            body: "I've started companies with friends, with co-workers or people who worked for me who became friends, and with my wife! I think the theme is, people I knew well (or at least thought I knew well…).",
          },
        ],
      },
    ],
  },
  {
    slug: "the-role-of-expertise",
    title: "The Role of Expertise",
    parent: {
      label: "Founders FAQs",
      href: "/resources/founders-frequently-asked-questions",
    },
    intro: "We asked three of our 886 partners this question:",
    sections: [
      {
        title:
          "In your experience, is having a co-founder with technical or business expertise essential? Why or why not?",
        cards: [
          {
            title: "Charles Huang",
            meta: "Co-founder of RedOctane",
            body: 'Until you find PM Fit and some scale, you will likely need to build, sell and pivot several times. So it\'s very hard to identify specific technical or business skills you need in co-founders at the start. I think well rounded people who can work very "hands on" are good co-founders. After you find PM Fit, you can start to find specialists to fill in gaps on the team.',
          },
          {
            title: "Kai Huang",
            meta: "Co-founder of RedOctane",
            body: "I believe having a co-founding team with a mix of both business and technical experience is crucial. This lets you split technical and business responsibilities and divide work to people with better expertise. For example, the technical co-founder can focus on product while the business co-founder can focus on fundraising and marketing.",
          },
          {
            title: "Joseph Hei",
            meta: "Co-founder of OrbitBaby",
            body: "I agree with Charles on this, especially for true early stage co-founders. It's hard to know what specific areas you need more strength in when things are that early. Another way to think about it is that early stage co-founders basically by definition need to do a lot of different things well, so if you're looking for a specialist that early you're already going down the wrong path. I do think though that successful partnerships end up figuring out that some people more naturally contribute value in one way or another, and you find different roles that best help the business move forward.",
          },
        ],
      },
    ],
  },
  {
    slug: "choosing-the-right-co-founder",
    title: "Choosing the Right Co-Founder",
    parent: {
      label: "Founders FAQs",
      href: "/resources/founders-frequently-asked-questions",
    },
    intro: "We asked three of our 886 partners this question:",
    sections: [
      {
        title:
          "What criteria should founders consider when selecting their co-founder? Are there particular traits or skills that are more critical?",
        cards: [
          {
            title: "Charles Huang",
            meta: "Co-founder of RedOctane",
            body: "I think it's important to find a co-founder who can hustle (hustle = build + sell). You need people who can build things quickly and cost efficiently. And you need people who can sell things to different customers or partners. If you have these 2 qualities in your founding team, you have a shot to find PM Fit before you run out of runway.",
          },
          {
            title: "Kai Huang",
            meta: "Co-founder of RedOctane",
            body: "A co-founder should have your same level of enthusiasm, dedication, willingness to sacrifice, and be as open minded as you. If a co-founder can't match you in any of these categories, it will be very difficult to work together long term, especially when one co-founder thinks they are doing more than another. Also, they should balance out the team so that if you're technical then you want to find at least 1 business co-founder.",
          },
          {
            title: "Joseph Hei",
            meta: "Co-founder of OrbitBaby",
            body: 'One comment here is that if you\'re truly "co" founders, then they are choosing you as much as you are choosing them. Otherwise you\'re just hiring them. An underrated quality I think co-founders need is the attitude that they are trying to build on your ideas and efforts, and vice versa, not trying to find holes or blockers in what you\'re doing. I think startup co-founders need to have an everyday "yes, and…" approach, and fundamentally be optimistic that things can be done.',
          },
        ],
      },
    ],
  },
  {
    slug: "lessons-learned",
    title: "Lessons Learned",
    parent: {
      label: "Founders FAQs",
      href: "/resources/founders-frequently-asked-questions",
    },
    intro: "We asked three of our 886 partners this question:",
    sections: [
      {
        title:
          "Could you share any personal lessons or stories from working with your co-founders? What worked, what didn't, and how did you navigate challenges?",
        cards: [
          {
            title: "Charles Huang",
            meta: "Co-founder of RedOctane",
            body: "Here's a fun example. I started RedOctane with my brother, Kai. Pros: We've known each other our whole lives. I know how he thinks before I even ask. I trust him 100%. Cons: We acted like we were brothers growing up. We fought and argued a lot. I don't think we realized that it was terrible for our employees to see us disagree and fight. They don't want to upset one brother, so they would just avoid the work if they saw that we disagreed. Be aware of how you and your co-founders affect your team.",
          },
          {
            title: "Kai Huang",
            meta: "Co-founder of RedOctane",
            body: 'Having a sibling as a co-founder is one of the hardest things to go through. Having a sibling as a co-founder is also one of the easiest things to go through. The challenge we had was that we treated our business relationship similar to our family relationship. Once we understood this issue we changed our behavior and things got a lot better for the entire company. I also worked with remote co-founders and this was too challenging. The remote co-founder can feel "left out" and it\'s hard to have critical discussions when a co-founder is not around to provide input.',
          },
          {
            title: "Joseph Hei",
            meta: "Co-founder of OrbitBaby",
            body: "Starting Orbit Baby with my wife would probably be the more dramatic and interesting story. I think what made it work is that we had some good boundaries and rules, for example, a rule of not talking about the business during or after dinner. We also tried to carve out different business responsibilities. It was a good lesson in general: if you're really building something with people, you need to trust them and let them do their thing. It's such a common problem for leaders to want to micro manage, and because it definitely does not work to attempt to micro manage your wife, you end up realizing it's a good lesson in how to work with your co-founders in general.",
          },
        ],
      },
    ],
  },
  {
    slug: "leadership-in-funding-rounds",
    title: "Leadership in Funding Rounds",
    parent: {
      label: "Founders FAQs",
      href: "/resources/founders-frequently-asked-questions",
    },
    intro: "We asked two of our 886 partners this question:",
    sections: [
      {
        title:
          "What steps would you take if investors show interest in your project but none want to lead the round?",
        cards: [
          {
            title: "Kevin Chou",
            meta: "Co-Founder of Kabam",
            body: "I would put forward a set of terms to the investors that have interest and ask if it is acceptable. If the founder is not knowledgeable about typical round structures, ask an advisor or 886. If it is, in the next investor meeting, I'd present the terms as acceptable to other investors.",
          },
          {
            title: "Jameson Hsu",
            meta: "Co-Founder of Mochi Media",
            body: "I would put together a favorable offer to the new investors to encourage one of them to take the lead in the round. If none of the investors are interested, then I would continue the search for a lead.",
          },
        ],
      },
    ],
  },
  {
    slug: "encouraging-leadership",
    title: "Encouraging Leadership",
    parent: {
      label: "Founders FAQs",
      href: "/resources/founders-frequently-asked-questions",
    },
    intro: "We asked two of our 886 partners this question:",
    sections: [
      {
        title:
          "How can founders effectively encourage an investor to take the lead?",
        cards: [
          {
            title: "Kevin Chou",
            meta: "Co-Founder of Kabam",
            body: "Create FOMO, and have a high degree of self-confidence. Investing is as much an emotional decision as it is a rational one.",
          },
          {
            title: "Jameson Hsu",
            meta: "Co-Founder of Mochi Media",
            body: "Speed is an entrepreneur's greatest ally when trying to close a round of funding. Deals that take too long to close end up with investors that lose interest. Lining up investor meetings close together and moving quickly to close is the best way to surface a lead. Hot deals usually have investors that are eager to lead and get the deal done. If the deal is dragging on and taking a long time to close then you have to resort to giving favorable terms to one investor to encourage someone to take the lead.",
          },
        ],
      },
    ],
  },
  {
    slug: "engagement-during-fundraising",
    title: "Engagement During Fundraising",
    parent: {
      label: "Founders FAQs",
      href: "/resources/founders-frequently-asked-questions",
    },
    intro: "We asked two of our 886 partners this question:",
    sections: [
      {
        title:
          "What are key factors in keeping interested investors engaged throughout the fundraising process?",
        cards: [
          {
            title: "Kevin Chou",
            meta: "Co-Founder of Kabam",
            body: "Show momentum either through business progress or funding progress (more committed investors).",
          },
          {
            title: "Jameson Hsu",
            meta: "Co-Founder of Mochi Media",
            body: "Frequent updates from the founders with measurable progress on action items and clear steps laid out on how to keep the company moving forward. Also asking new investors for assistance in getting connected with other investors or help in other ways. Make your investors feel like they're adding value.",
          },
        ],
      },
    ],
  },
  {
    slug: "negotiating-with-lead-investors",
    title: "Negotiating with Lead Investors",
    parent: {
      label: "Founders FAQs",
      href: "/resources/founders-frequently-asked-questions",
    },
    intro: "We asked two of our 886 partners this question:",
    sections: [
      {
        title:
          "Can you provide any insights or personal experiences in negotiating with potential lead investors?",
        cards: [
          {
            title: "Kevin Chou",
            meta: "Co-Founder of Kabam",
            body: "Understand the key leverage points in your negotiations. The 4 key leverage points will always be: A) Is the funding market in a bull or bear stance? B) Is your market segment bullish? C) Is your business growing revenues quickly? D) Do you have another term sheet? If all 4 of these leverage points are in your favor, you have all the leverage in negotiating with the lead investor. As you lose leverage points, you will find that you lose more and more favorable terms.",
          },
          {
            title: "Jameson Hsu",
            meta: "Co-Founder of Mochi Media",
            body: "Usually only companies with something unique and desirable have room to negotiate. Figure out what makes your company special and use that to get your deal closed quickly. As entrepreneurs pitch their companies they will quickly learn what resonates with investors and what doesn't. Use that knowledge to amplify the things that resonate with investors to get the best terms possible.",
          },
        ],
      },
    ],
  },
  {
    slug: "warm-introductions",
    title: "Warm Introductions",
    parent: {
      label: "Founders FAQs",
      href: "/resources/founders-frequently-asked-questions",
    },
    intro: "We asked an 886 partner this question:",
    sections: [
      {
        title:
          "What strategies have you found most effective for asking for warm introductions?",
        cards: [
          {
            title: "James Hong",
            meta: "Co-Founder of HOTorNOT",
            body: "Never ask for an introduction. Ask if someone would be willing to forward something like an email. Then provide the introducer with an email they can forward that explains what you are doing and why you are trying to make contact with the target person. That person can then just forward the email and ask if they'd be interested in an introduction. Basically the person making the introduction needs to make sure it's ok with the other person first, so make it as easy as possible for them to do that step.",
          },
        ],
      },
    ],
  },
  {
    slug: "dos-and-donts",
    title: "Dos and Don'ts",
    parent: {
      label: "Founders FAQs",
      href: "/resources/founders-frequently-asked-questions",
    },
    intro: "We asked an 886 partner this question:",
    sections: [
      {
        title:
          "What are some key dos and don'ts when reaching out to someone new in your network?",
        cards: [
          {
            title: "James Hong",
            meta: "Co-Founder of HOTorNOT",
            body: "The best time to network is when you don't actually want anything from someone (you are not trying to pitch them). It's almost always best to meet people under some other context where you don't have any objective. The best way to grow your network is to offer your network to other people. Connecting someone to someone else where they both benefit from the introduction makes your own network stronger and increases the chance you can grow it as well. The secret to networking is to primarily give, not take. But you have to do so with discretion too. Never make an introduction that won't benefit both parties involved.",
          },
        ],
      },
    ],
  },
];

export const standaloneResourceArticles: ResourceArticle[] = [
  {
    slug: "incorporation-101",
    title: "Startup incorporation 101",
    intro:
      "Compare startup incorporation options, US business structures, and Taiwan subsidiaries, branches, and representative offices. A founder guide with sources.",
  },
  {
    slug: "interview-guidebook",
    title: "Interview Guidebook",
    sections: [
      {
        title: "The First Interview",
        paragraphs: [
          "Your first ikigai Launchpad interview is a 20-minute conversation with us. You don’t need a pitch deck. Come ready to discuss your team, the problem you’re solving, what you’re building, and what you’ve learned so far.",
          "The first interview takes place via Zoom. We expect all co-founders to be on the call. In return, expect 1-2 of our partners to be present, in addition to our operating team and program directors.",
        ],
      },
      {
        title: "How to Prepare",
        list: [
          "Online Etiquette - Preemptively address potential technical issues. Have resources prepared and accessible, and make sure Zoom works without interruptions or updates.",
          "The Conversation - Don’t try to memorize a script. Prepare concise talking points and conduct market research beforehand, but aim to be familiar enough that you do not rely heavily on notes.",
          "Your Questions - Think about what you would like to ask us about ikigai Launchpad and how it could support your startup.",
        ],
      },
      {
        title: "What We Look For",
        list: [
          "Progress - We are interested in seeing the progress you have made since applying or contacting us.",
          "About You - Be ready to describe your team's size, experience, the problem you are solving, and why solving it is personally significant to you.",
          "Your Product - Be ready to explain what you are building, who it is for, and how it addresses the problem.",
          "Data - Be ready to share monthly operating expenses, runway, previous funding, and user or revenue metrics if applicable.",
        ],
      },
      {
        title: "Questions",
        paragraphs: [
          "Our interviews are not meant to be an interrogation where we expect you to know absolutely everything. We appreciate sincerity and understand that some questions can be unexpected.",
        ],
        list: [
          "What feedback have you gathered from beta testing or users? How did you apply it?",
          "How do you differentiate from competitors? What are competitors doing well or wrong?",
          "When have you pivoted and why?",
          "What stage of the process are you in? What does your timeline look like?",
          "How do you plan to scale your product? Who is your target audience?",
          "What do you hope to gain out of our program? What makes ikigai Launchpad a good fit for you?",
        ],
      },
      {
        title: "After the Interview",
        paragraphs: [
          "If we have additional follow-up questions, our operations team will contact you via email. If our partners wish to have further discussions, we may request a second round of interviews. Final decisions are generally communicated after interviews are completed and all applicants have been reviewed.",
          "Good luck to all applicants!",
        ],
      },
    ],
  },
];

export const allResourceArticles = [
  ...resourceArticles,
  ...standaloneResourceArticles,
];
