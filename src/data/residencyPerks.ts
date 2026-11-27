/**
 * Deliberate public allowlist, reviewed 2026-11-27. Never derive this from the
 * portfolio catalog or from a missing portfolio-only flag. Launch Station is
 * the former Residency program; its applicability tag is supporting evidence,
 * not permission to override a partner's eligibility text.
 *
 * Sources: Notion Program Perks (285e8ea1e4204e0783071d8ad4f20c62),
 * Launch Station Perks (1acb93834d6980b89198fba9dbde0e3b), and the local private
 * website catalog. Live /perks was checked but its catalog requires a session.
 * Public partner terms below take precedence over outdated benefit amounts.
 *
 * Excluded: OpenAI, Deel, Goodwin, Supabase and Granola require
 * portfolio backing; Stripe's restricted referral needs separate confirmation.
 * Public startup programs without an 886 partnership are excluded.
 * AWS Activate remains in the private portfolio catalog only.
 * Linear's current partner page explicitly includes the 886 Studios community;
 * DocSend and Mercury have Residency applicability and current partner terms.
 * Craft is portfolio-only; Ramp, UXY and Zettabyte remain unconfirmed.
 * Webflow stopped accepting startup applications on 2026-06-30:
 * https://help.webflow.com/hc/en-us/articles/33961217659923-How-to-redeem-your-Webflow-for-startups-discount
 * No private referral URLs, access codes, or partner contacts belong here.
 */
export interface ResidencyPerk {
  id: string;
  label: string;
  logoSrc?: string;
  benefit: string;
  eligibility: string[];
  href: string;
  sourcePage: string;
}

export const residencyPerkCategories: { id: string; title: string; items: ResidencyPerk[] }[] = [
  {
    id: "engineering",
    title: "Engineering",
    items: [
      {
        id: "github",
        label: "GitHub",
        logoSrc: "/assets/logos/github.svg",
        benefit: "$10,000 in credits for up to 12 months",
        eligibility: [
          "Partner-affiliated startups with outside funding, at Series B or earlier.",
          "No GitHub Enterprise plan in the past six months and no previous startup credits or licenses. Enterprise Cloud on GitHub.com only.",
        ],
        href: "https://github.com/enterprise/startups",
        sourcePage: "https://www.notion.so/126b93834d69807a9344e4b429be55ff",
      },
      {
        id: "google-cloud",
        label: "Google Cloud",
        logoSrc: "/assets/logos/google-cloud.webp",
        benefit: "Google Cloud credits",
        eligibility: [
          "Taiwan customers. Eligibility depends on company stage, funding and credit history.",
          "Google Workspace benefit: customers who have never paid for Workspace.",
        ],
        href: "https://cloud.google.com/startup",
        sourcePage: "https://www.notion.so/3c3b93834d698139bb4ed1dfcd0c4e68",
      },
    ],
  },
  {
    id: "productivity",
    title: "Productivity",
    items: [
      {
        id: "coda",
        label: "Coda / Superhuman Docs",
        logoSrc: "/assets/logos/coda.webp",
        benefit: "6 months free: Team plan + AI",
        eligibility: [
          "Teams at businesses under five years old with less than $10M raised; a company website and business-domain email are required.",
          "No current paid subscription or payment in the last 30 days. The offer cannot be transferred or combined with another offer.",
        ],
        href: "https://help.superhuman.com/hc/en-us/articles/46210187758477-Discounts-for-students-teachers-nonprofits-and-startups-on-Superhuman-Docs",
        sourcePage: "https://www.notion.so/122b93834d69804b80e4d6ec8c6a1409",
      },
      {
        id: "docsend",
        label: "DocSend",
        logoSrc: "/assets/logos/docsend.webp",
        benefit: "Up to 90% off your first year",
        eligibility: [
          "New customers on annual plans; one offer per startup.",
          "Pre-seed and seed teams with up to $2M raised: 90% off Standard or Advanced. Series A up to $10M: 50% off Advanced. Series B and beyond up to $20M: 20% off Advanced.",
        ],
        href: "https://experience.dropbox.com/docsend/partner-signup",
        sourcePage: "https://www.notion.so/12eb93834d698029a6b3c5ccf34862f9",
      },
      {
        id: "linear",
        label: "Linear",
        logoSrc: "/assets/logos/linear.svg",
        benefit: "3 months of Business free",
        eligibility: [
          "Eligible members of the 886 Studios community with fewer than 50 employees.",
          "Workspace must never have had a paid plan. An admin must redeem the offer; one offer per workspace.",
        ],
        href: "https://linear.app/startups",
        sourcePage: "https://www.notion.so/424b93834d6981729d49dc2f2d26ddb1",
      },
      {
        id: "miro",
        label: "Miro",
        logoSrc: "/assets/logos/miro.webp",
        benefit: "Up to 6 months of Business + AI",
        eligibility: [
          "Non-paying Miro customers with fewer than 100 employees, a business website and company-domain email.",
          "Partner application link and proof of affiliation required for six months.",
        ],
        href: "https://miro.com/startups/",
        sourcePage: "https://www.notion.so/13fb93834d6980d0a065c832b089f7d9",
      },
      {
        id: "notion",
        label: "Notion",
        logoSrc: "/assets/logos/notion.webp",
        benefit: "Up to 6 months of Business + AI",
        eligibility: [
          "Non-paying customers with fewer than 100 employees, a valid work email and no previous Notion promotion.",
          "Business website required. Small teams, service businesses and unverified startups may receive a shorter trial.",
        ],
        href: "https://www.notion.com/startups",
        sourcePage: "https://www.notion.so/e063a2f3ccb44498808b87591972509f",
      },
    ],
  },
  {
    id: "finance-legal",
    title: "Finance & legal",
    items: [
      {
        id: "beyond-border",
        label: "Beyond Border",
        benefit: "U.S. immigration services",
        eligibility: [
          "Founders with a qualifying U.S. immigration case.",
        ],
        href: "https://www.beyondborderglobal.com/",
        sourcePage: "https://www.notion.so/1f5b93834d69808fb4d1e4b5ff5ee778",
      },
      {
        id: "carta",
        label: "Carta",
        logoSrc: "/assets/logos/carta.webp",
        benefit: "Partner pricing",
        eligibility: [
          "New customers only. Discounts cannot be applied retroactively.",
        ],
        href: "https://carta.com/partners/referral/",
        sourcePage: "https://www.notion.so/3bfb93834d69818092e3c2abe7459082",
      },
      {
        id: "mercury",
        label: "Mercury",
        logoSrc: "/assets/logos/mercury.svg",
        benefit: "Up to $1,100 in cash bonuses",
        eligibility: [
          "Companies registered in the U.S. or a U.S. territory, with existing or planned U.S. operations. Non-U.S. founders can apply, subject to country restrictions and account approval.",
          "$1,000 after depositing $100,000 within 90 days of approval, plus $100 after spending $1,000 on debit or credit cards within 90 days.",
        ],
        href: "https://mercury.com/",
        sourcePage: "https://www.notion.so/304b93834d6980479e82c58236fd6186",
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    items: [
      {
        id: "hubspot",
        label: "HubSpot",
        logoSrc: "/assets/logos/hubspot.webp",
        benefit: "Startup discounts",
        eligibility: [
          "New Professional or Enterprise products. Discount depends on funding stage.",
        ],
        href: "https://www.hubspot.com/startups/about",
        sourcePage: "https://www.notion.so/122b93834d698013b52bd5a1571d5491",
      },
    ],
  },
];

export function residencyPerkRequestHref(perk?: string) {
  const subject = perk ? `886 Residency perk: ${perk}` : "886 Residency perks";
  const body = `Hi Carter,\n\nI'd like to request ${perk ?? "partner perk"} access for my Residency company.\n\nName:\nCompany and website:\nWork email:\n${perk ? "" : "Perks I'm interested in:\n"}`;
  return `mailto:carter@886studios.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
