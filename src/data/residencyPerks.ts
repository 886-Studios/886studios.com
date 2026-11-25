/**
 * Deliberate public allowlist, reviewed 2026-11-25. Never derive this from the
 * portfolio catalog or from a missing portfolio-only flag. Launch Station is
 * the former Residency program; its applicability tag is supporting evidence,
 * not permission to override a partner's eligibility text.
 *
 * Sources: Notion Program Perks (285e8ea1e4204e0783071d8ad4f20c62),
 * Launch Station Perks (1acb93834d6980b89198fba9dbde0e3b), and the local private
 * website catalog. Live /perks was checked but its catalog requires a session.
 * Public partner terms below take precedence over outdated benefit amounts.
 *
 * Excluded: OpenAI, Deel, Goodwin, Linear, Supabase and Granola require
 * portfolio backing; Stripe's restricted referral needs separate confirmation.
 * AWS has conflicting program applicability. Ramp has TBD eligibility.
 * Craft, DocSend, Mercury, UXY and Zettabyte lack sufficient eligibility detail.
 * Webflow stopped accepting startup applications on 2026-06-30:
 * https://help.webflow.com/hc/en-us/articles/33961217659923-How-to-redeem-your-Webflow-for-startups-discount
 * No private referral URLs, access codes, or partner contacts belong here.
 */
export interface ResidencyPerk {
  id: string;
  label: string;
  logoSrc?: string;
  benefit: string;
  description: string;
  eligibility: string[];
  href: string;
  sourcePage: string;
}

export const residencyPerksReviewedAt = "2026-11-25";

export const residencyPerkCategories: { id: string; title: string; items: ResidencyPerk[] }[] = [
  {
    id: "engineering",
    title: "Engineering",
    items: [
      {
        id: "github",
        label: "GitHub",
        logoSrc: "/assets/logos/github.svg",
        benefit: "$10,000 in platform credits",
        description: "Credits for eligible GitHub Enterprise products, including Copilot, Actions and security tools, valid for up to 12 months.",
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
        benefit: "Startup cloud support",
        description: "Explore cloud credits and technical resources through our Taiwan startup connection. Ask us to confirm the current partner package before applying.",
        eligibility: [
          "The documented 886 partner offer is for Taiwan customers. Google reviews your company stage, funding and credit history.",
          "Any Google Workspace benefit requires a customer who has never paid for Workspace.",
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
        benefit: "6 months of the Team plan",
        description: "Collaborative docs, tables and workflows, with unlimited Docs AI for approved partner applications. Coda is now Superhuman Docs.",
        eligibility: [
          "Teams at businesses under five years old with less than $10M raised; a company website and business-domain email are required.",
          "No current paid subscription or payment in the last 30 days. The offer cannot be transferred or combined with another offer.",
        ],
        href: "https://help.superhuman.com/hc/en-us/articles/46210187758477-Discounts-for-students-teachers-nonprofits-and-startups-on-Superhuman-Docs",
        sourcePage: "https://www.notion.so/122b93834d69804b80e4d6ec8c6a1409",
      },
      {
        id: "miro",
        label: "Miro",
        logoSrc: "/assets/logos/miro.webp",
        benefit: "Up to 6 months of Business + AI",
        description: "A shared canvas for planning, workshops and product work. The current partner program includes community members as well as portfolio companies.",
        eligibility: [
          "Non-paying Miro customers with fewer than 100 employees, a business website and company-domain email.",
          "The six-month offer requires a partner application link and proof of affiliation. Ask us for the current Residency application route.",
        ],
        href: "https://miro.com/startups/",
        sourcePage: "https://www.notion.so/13fb93834d6980d0a065c832b089f7d9",
      },
      {
        id: "notion",
        label: "Notion",
        logoSrc: "/assets/logos/notion.webp",
        benefit: "Up to 6 months of Business + AI",
        description: "Keep your team's docs, projects and knowledge in one workspace. The trial length depends on Notion's review of your startup and partner affiliation.",
        eligibility: [
          "Non-paying customers with fewer than 100 employees, a valid work email and no previous Notion promotion.",
          "Provide a working business website. Small teams, service businesses and applicants whose startup status cannot be verified may receive a shorter trial.",
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
        benefit: "Founder immigration support",
        description: "A partner introduction for founders exploring U.S. immigration options. Ask the team for the current scope and partner quote.",
        eligibility: [
          "Founders seeking support with a qualifying U.S. immigration case. The provider assesses which service fits your circumstances.",
          "Confirm professional fees, government filing fees and included services directly with the provider before proceeding.",
        ],
        href: "https://www.beyondborderglobal.com/",
        sourcePage: "https://www.notion.so/1f5b93834d69808fb4d1e4b5ff5ee778",
      },
      {
        id: "carta",
        label: "Carta",
        logoSrc: "/assets/logos/carta.webp",
        benefit: "Partner pricing for equity tools",
        description: "Cap table and equity management for your startup. Ask us for the partner introduction and confirm the current discount with Carta.",
        eligibility: [
          "New Carta customers only. Partner discounts cannot be applied retroactively to existing customers.",
          "The plan, discount and any implementation fees must be confirmed in your quote.",
        ],
        href: "https://carta.com/partners/referral/",
        sourcePage: "https://www.notion.so/3bfb93834d69818092e3c2abe7459082",
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
        benefit: "Startup pricing for your CRM",
        description: "Sales, marketing and customer-service software with startup discounts. Your funding stage and chosen products determine the offer.",
        eligibility: [
          "New eligible Professional or Enterprise products; the partner program reviews your startup and funding stage.",
          "Ask us for the Residency referral route and confirm the discount before purchasing.",
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
