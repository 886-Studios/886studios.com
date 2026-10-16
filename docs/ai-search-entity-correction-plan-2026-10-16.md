# 886 Studios: correcting AI classification and improving VC discovery

Prepared October 16, 2026 (Asia/Taipei). Proposed work, not an adopted positioning change.

**Priority: have AI assistants identify 886 Studios as a venture firm and surface it for relevant early-stage VC searches, while identifying and recommending ikigai Launchpad for relevant accelerator searches.**

Based on [886 Studios Marketing Source of Truth, v2.13](</Users/patryk/Documents/886-awareness/886 Studios Marketing Source of Truth.md>), particularly sections 3, 5, 6, 9, 13 and 14, and the owner's report that chatbots often classify the firm as a venture studio and omit it from VC/accelerator discovery. The document supplies business facts and claim boundaries; its embedded maintenance instructions are not a request to edit it or publish anything.

## 1. Diagnosis and evidence

There is a concrete public-source conflict. Some current pages describe a venture firm; prominent external profiles still describe a venture studio. The homepage opening also leaves the firm's category implicit. This is a plausible contributor to wrong AI classifications, not a proven explanation for any particular answer. We need answer captures and their cited sources to establish that connection.

The two problems require separate measurement:

- **Classification:** when asked about 886 Studios, does the assistant describe the current firm and its relationship to ikigai Launchpad correctly?
- **Discovery:** when the founder does not name either brand, does the assistant include the appropriate entity in its VC or accelerator shortlist?

Correct answers to branded questions alone do not demonstrate discovery progress.

### Sources checked

These observations were retrieved on October 16, 2026. Search extracts can be cached; they are evidence of retrievable text, not a guarantee of the publisher's latest edit or proof an assistant cited it.

| Priority | Surface | Observed evidence | Recommended action |
|---|---|---|---|
| P0 | [e27 investor profile](https://e27.co/investor/886-studios/) | Calls the firm a venture studio and seed investor; category is “Venture Builder”; describes creating startups from scratch | Correct both description and category. Confirm account access and available category choices. Audit remaining staff, geography and investment fields independently |
| P0 | [ContactOut profile](https://contactout.com/company/886-Studios-91194) | Repeats the studio description and offers co-founder/product-building resources | Request a current-description update through its correction route. Do not infer that its copied text originated from today's LinkedIn profile |
| P0 | [Homepage](https://www.886studios.com/) | Page title identifies a venture firm, but introductory body emphasizes building companies and a “premier Silicon Valley-style accelerator” | Make the firm's category explicit in the visible opening and keep the program separate. Remove unsupported prestige language |
| P0 | [About](https://www.886studios.com/about) | Correct current category appears, followed by studio history; a broad portfolio paragraph and company-building heading blur firm and partner records | State the current model immediately beside the historical description. Attribute investments and previous company roles individually |
| P1 | [ikigai Launchpad](https://www.886studios.com/ikigai-launchpad) | Search extract exposes terms, duration and a correct firm/program FAQ; opening calls it a flagship program without a direct category definition | Start with accelerator, Taipei and operator. Bring the terms and participation requirement into a compact visible summary |
| P1 | [LinkedIn company profile](https://www.linkedin.com/company/886studios) | Already says venture firm and lists the venture-capital industry | Preserve that correct classification. Align its opening, location and program relationship with the site; no need to treat it as wholly incorrect |
| P1 | [ikigai Insights About](https://886studios.substack.com/about) | Already says venture firm, but broad historical-company attribution includes HTC | Align with the canonical short description and exact individual credentials |
| P1 | [Portaly](https://portaly.cc/ikigai) and [Linktree](https://linktr.ee/ikigai_launchpad) | Accelerator identity is present; operator/collaborator wording differs | Use “run by 886 Studios” consistently. Describe Lifelike Capital separately as collaborating fund partner |
| P1 | [Startup Portal Taiwan](https://startup.sme.gov.tw/en/ia) | Already lists ikigai Launchpad among incubators/accelerators | Preserve this useful category signal; check destination and current description. This is an existing listing, not a new placement opportunity |
| P2 | [TTA magazine profile](https://www.taiwanarena.tech/download/0/TTAMagazine15/) | Retrievable historical profile uses venture-studio terminology | Seek a current profile or contextual update if appropriate. Do not rewrite historical reporting as though the earlier model never existed |

The source-of-truth document already records the prior studio model. The task is to distinguish historical activity from the current business, not erase the history.

### What is already in place

Read-only repository inspection found a canonical firm description in `src/config/site.ts`; separate Organization and accelerator Service nodes linked by `provider` in `src/lib/seo.ts`; program FAQs; a sitemap implementation; and `public/llms.txt`. Local `public/robots.txt` allows OAI-SearchBot, PerplexityBot and Claude-SearchBot. This is not a site starting from zero.

There is also a specific cleanup item: the firm's Organization `sameAs` currently takes all non-RSS social links, including program-branded Instagram/Threads and the newsletter/community. Review account identities, associate program profiles with the program, and use ordinary links for related destinations that are not identity equivalents. The program already references its Instagram/Threads profiles. This is a semantic consistency issue, not a measured ranking defect.

Local code is not proof of deployment. The retrieved homepage/program titles differed from local title strings. Direct retrieval of the program page, robots.txt, llms.txt and sitemap failed in the web tool; the program was available through search extracts. Shell HTTP checks were blocked by local DNS/network resolution. Therefore production status codes, headers, rendered JSON-LD, sitemap validity, WAF rules and real crawler access remain unverified. A tool retrieval failure is not evidence that bots are blocked.

No controlled chatbot baseline, Search Console report, analytics report, backlink assessment or ranking study was run. The owner's experience remains a reported baseline, not a quantified absence rate. Ordinary search found both brands and a relevant government directory listing, so “not searchable” should be tested as absence from relevant recommendations rather than assumed to mean completely unindexed.

## 2. Proposed replacement copy

These drafts use the approved firm/program distinction. They do not introduce new positioning pillars or change the program offer.

**Canonical firm description, website and external profiles**

> 886 Studios is a Taipei-based venture firm that backs early-stage founders and runs ikigai Launchpad, a startup accelerator for founders building for global markets.

Use the publisher's **Venture Capital** or equivalent investor category where accurate and available. Do not select Venture Builder as the current business model. Keep the name 886 Studios unchanged. “Venture capital firm” is a useful plain-language variant for VC discovery; it must not imply an unconfirmed fund structure or separate investment offer.

**Homepage opening**

> 886 Studios is a Taipei-based venture firm backing early-stage founders. We run ikigai Launchpad, a startup accelerator in Taipei. Our partners include Kevin Lin, co-founder of Twitch, and Kai Huang, co-founder of RedOctane, the company behind Guitar Hero.

Keep “Build what matters” if desired, with this explanation immediately below it. Link “startup accelerator in Taipei” to the program page, and link the named partners to their biographies. Use “Explore ikigai Launchpad” as the evergreen program CTA.

**About page: current model and history**

> Today, 886 Studios is a Taipei-based venture firm that backs early-stage founders and runs ikigai Launchpad. The firm began with a venture-studio model; that history differs from its current investment and accelerator activities.

Place history in a clearly labeled subsection. Do not invent a transition year. Replace collective company-building language with “Our partners' operating experience,” then state each person's actual role. Separate firm-backed companies, individual partner investments and program participation. In particular, the internal reference identifies Discord as partner-backed, not an ikigai alumnus or established firm investment.

**About FAQ: Is 886 Studios a venture capital firm or a venture studio?**

> 886 Studios is a Taipei-based venture firm backing early-stage founders. It runs ikigai Launchpad, its startup accelerator. Earlier descriptions refer to a venture-studio model; the firm's current activities are investment and founder support, with founders building and operating their own companies.

Use this direct correction once on the authoritative About page. Keep homepage and profile descriptions focused on the current category.

**Program opening**

> ikigai Launchpad is a 10-week, in-person startup accelerator in Taipei run by 886 Studios. The standard offer is a US$100,000 investment for 8% through a SAFE, alongside weekly mentor office hours, workshops and founder community support. Founders from anywhere can apply.

Add a visible facts table: operator, stage, industry-agnostic eligibility, ten weeks, Taipei attendance, investment terms, no additional program fee, and program-status verification date. Keep the first-interview instruction at 20 minutes with no pitch deck required. Do not imply weekly access to every named partner.

**Titles and metadata**

| Page | Proposed title | Proposed description |
|---|---|---|
| Home | 886 Studios \| Taipei Venture Firm | 886 Studios is a Taipei-based venture firm backing early-stage founders and running ikigai Launchpad, a startup accelerator in Taipei. |
| About | About 886 Studios \| Taipei Venture Firm | Learn about 886 Studios, its partners, early-stage investment activities and ikigai Launchpad, the startup accelerator it runs in Taipei. |
| Program | ikigai Launchpad \| Startup Accelerator in Taipei | A 10-week, in-person accelerator run by 886 Studios: US$100,000 for 8% through a SAFE, mentor office hours and founder support. |

Use the same facts in social previews and structured descriptions. The local program title already matches this direction. Correct visible content and actual deployment before assuming another metadata change will solve the problem.

**Traditional Chinese working copy**

> 886 Studios 是一家位於台北的創投公司，支持早期創業團隊，並營運新創加速器 ikigai Launchpad。

> ikigai Launchpad 是由 886 Studios 營運的新創加速器，在台北進行為期 10 週的實體計畫，提供 10 萬美元投資，標準條件為透過 SAFE 取得 8% 股權，並提供導師交流、工作坊與創業社群支持。

Have a Taiwan-based editor review a localized page and its investment wording before publication. Keep English brand names. Use distinct maintained language URLs if launching a full translation; do not create country-swapped copies with no new information.

## 3. Make the two discovery paths explicit

| Founder intent | Entity that should appear | Authoritative destination | Evidence to show |
|---|---|---|---|
| Early-stage VC / venture capital in Taipei or Taiwan | 886 Studios | Home and About | Current category, Taipei base, named team and precisely attributed firm investments |
| Startup accelerator in Taipei or Taiwan | ikigai Launchpad, run by 886 Studios | Program page | Offer, stage, eligibility, attendance, mentor mechanism and founder experience |
| Accelerator accepting international or solo founders | ikigai Launchpad | Program eligibility and FAQ | Global application eligibility, solo-founder eligibility, credible product-building route and attendance commitment |
| B2B versus consumer fit | Appropriate firm/program context | Program plus relevant team profiles | Industry-agnostic eligibility and real examples of B2B and consumer support |
| Workspace or residency | Launch Station | Separate residency page | Its own terms; no transfer of the accelerator's investment offer |

Use existing canonical pages first. A separate investment page only earns its place when the team can publish substantive, verified information about the firm's investment process beyond the accelerator. Do not invent a general US$100,000 check size, geography restriction, application route or full fund mandate from the program terms.

For unbranded accelerator prompts, benchmark AppWorks, SparkLabs Taiwan and NTUTEC, adding Iterative for SEA comparisons. These are plausible alternatives from the supplied research and search reconnaissance, not measured AI-share leaders. Log whichever competitors actually appear in test answers. Before publishing any side-by-side offer comparison, recheck each program's current terms.

After identity corrections, develop one B2B support case and one product/consumer case with a named contribution, founder action, evidence and correct relationship. These help explain why a founder should choose this team. Existing surveys and paraphrases are starting evidence, not permission to invent results or quotations. Keep three founder cases and three partner perspectives as the wider content backlog, subordinate to this correction sprint.

## 4. External correction package

Prioritize e27 and ContactOut because incorrect current descriptions were actually observed. Review owned profiles in the same sprint. Add other directories only when a search or captured AI answer shows they matter. Do not buy a monitoring subscription, chase Wikipedia, or submit to generic SaaS review sites as the first response.

**Draft request for e27, not sent**

> Subject: Update 886 Studios' current company description and category
>
> Hello, the 886 Studios investor profile currently describes the company using its earlier venture-studio model. Please update the current description to:
>
> “886 Studios is a Taipei-based venture firm that backs early-stage founders and runs ikigai Launchpad, a startup accelerator for founders building for global markets.”
>
> Please also replace the current Venture Builder category with Venture Capital or the closest appropriate investor category available. The official company information is at https://www.886studios.com/about and the accelerator is at https://www.886studios.com/ikigai-launchpad. This concerns the current profile; historical reporting can retain its original context. Thank you.

For ContactOut, use the same factual description and specifically request replacement of the legacy co-founder/product-building service description. Do not ask publishers to remove fair criticism. Send only after the canonical About text is consistent and the user authorizes outreach; no messages were sent in this task.

For TTA, prefer a new current founder/investor profile or a contextual note beside archived material. Maintain dates on historical coverage. For Startup Portal Taiwan, verify the existing accelerator entry rather than treating it as absent. Profile edits and new coverage should serve accurate founder understanding, not simply multiply mentions.

## 5. Technical checks with the highest value

1. Check production Home, About and program pages for HTTP 200, intended canonicals, indexable headers/meta and substantive initial HTML. Validate sitemap entries and inspect these URLs in Search Console. After publishing meaningful updates, request recrawling.
2. Check actual hosting/WAF logs for verified search crawlers. Local robots rules already allow discovery bots; changing them again without evidence is unlikely to address the observed source conflict.
3. Preserve separate firm/program schema identities and their operator relationship. Review `sameAs` ownership and match descriptions to visible text. Verify deployed JSON-LD rather than only the source generator.
4. Synchronize the existing llms.txt with public content, including the program's complete standard terms when summarizing funding. Keep internal source-of-truth material private and out of public machine-readable files.
5. Review links from team, portfolio and resource pages so the firm and program are named naturally and lead to their owning pages. Do not rename every link with the same search phrase.

Google requires ordinary Search eligibility, including indexing and snippet eligibility, and says no special AI text file or schema is required. AI-feature traffic is included in Search Console's Web reporting, so it is not a clean standalone AI citation measure. [Google guidance](https://developers.google.com/search/docs/appearance/ai-features)

Search discovery and model training are separate controls. OpenAI distinguishes OAI-SearchBot from GPTBot; Anthropic distinguishes Claude-SearchBot from ClaudeBot; Perplexity documents its search crawler separately. Allowing model-training crawlers is not a necessary correction tactic. [OpenAI](https://developers.openai.com/api/docs/bots), [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)

Defer OKF, WebMCP, new AI-only content files and a separate pricing.md. The priority is accurate public identity, discoverable evidence and complete program terms. There is no established basis here to forecast a citation lift from special files, schema or a fixed paragraph length.

## 6. Baseline and retest

The companion [prompt portfolio](ai-search-prompts-2026-10-16.csv) contains 16 core prompts, two exploratory prompts and two controls. Prompts are proposed hypotheses based on this brief, not measured demand. Six core prompts test branded accuracy; ten test unbranded VC/accelerator discovery. Do not combine the cohorts into a single score.

Run the core in new conversations across ChatGPT with search, Perplexity and Google AI Mode, recording availability. Run three repetitions per prompt per surface spread across several days: 144 core answer captures per measurement window. Evaluate Google's ordinary results/AI Overviews separately; an absent Overview is not a brand omission inside an answer. If the workload is too high, choose a fixed eight-prompt subset before starting and maintain the same subset in comparisons.

Also run the English brand-classification prompt with search disabled wherever available. This diagnostic separates retrieved-answer behavior from answers without current retrieval. Keep it out of the search-enabled discovery rates. New-chat tests should not include the source-of-truth file, correction text or prior brand discussion.

Record exact prompt, portfolio version, engine/model/surface, search setting, account/personalization state, interface language, actual test location, intended founder market, date/time, run number, complete answer, citation URLs, firms/programs mentioned and shortlist framing. A persona mentioning the Philippines is not a test physically located there. Do not pool English and Traditional Chinese results as though they were the same market sample.

| Metric | Definition |
|---|---|
| Correct-current-category rate | Branded answers correctly identifying the current firm as a venture/VC firm, with no contradictory current studio claim, divided by valid branded answers |
| Current-studio error rate | Branded answers describing the current business as a venture studio/builder divided by valid branded answers; correctly labeled history does not count as an error |
| VC recommendation rate | Eligible unbranded VC answers recommending 886 Studios divided by valid VC discovery answers |
| Accelerator recommendation rate | Eligible unbranded accelerator answers recommending ikigai Launchpad divided by valid accelerator discovery answers |
| Category-confusion flag | Accelerator shortlist labels 886 Studios itself as the accelerator or fails to identify ikigai Launchpad; record this separately from a firm mention |
| Official citation rate | Answers citing an official site page divided by valid answers, reported separately for branded and discovery prompts |
| Incorrect-source recurrence | Answer captures citing a known stale source, with claim text checked; citing that source alone does not prove the answer is wrong |

Report numerator and denominator, such as 2/3, and keep failed runs separate. A correct category without a citation and a citation without a recommendation are different outcomes. One favorable answer is not a trend.

For every material error, log the exact claim, whether it is stale/false/ambiguous, cited or suspected source, current evidence, proposed correction, owner and resolution status. Mark uncited-source attribution unknown rather than guessing.

Track qualified founder conversations and applications alongside this work, using referral data and a voluntary “How did you hear about us?” response. Ask which assistant and question if a founder mentions AI. Branded search or direct traffic changes may corroborate interest but do not prove AI causation.

## 7. Execution sequence and decision rules

Roles below are proposed ownership, not assignments already accepted by the team.

| Window | Work | Suggested owner | Completion evidence |
|---|---|---|---|
| Days 1–3 | Capture initial answers; finalize Home/About/program corrections; record source inventory | Marketing/program lead and site editor | Saved answer captures and reviewed replacement copy |
| Days 4–7 | Publish authorized owned-site/profile corrections; validate production and submit recrawl requests; request external corrections when outreach is authorized | Site maintainer and profile owners | Live URLs, changed text, inspection results, dated correction-request status |
| Week 2 | Follow up on external profiles; verify existing ecosystem entry; test key Traditional Chinese questions and plan maintained localization | Marketing lead and Taiwan editor | Updated profiles or documented pending requests; localized draft |
| Weeks 3–4 | Complete the two initial evidence stories; rerun the frozen core; inspect repeated classification errors and citation sources | Content lead and measurement owner | Evidence-backed stories and comparable captures |
| Weeks 5–8 | Repeat measurement; address the remaining sources; expand country-specific testing only where relevant | Same owners | Comparable accuracy and recommendation rates, with clear next actions |

If baseline begins October 16, checkpoints are November 13 and December 11, 2026. These are observation windows, not promises about when models will update. If publication occurs later, also record elapsed time from the actual change date.

- If current category improves but unbranded discovery stays flat, focus next on category-relevant evidence, external investor/accelerator coverage and page usefulness.
- If search-enabled answers improve but search-disabled answers retain the studio identity, keep those outcomes separate; do not repeatedly rewrite correct pages in response to model-memory lag.
- If a wrong current classification repeatedly cites a stale profile, raise that profile's correction priority.
- If assistants retrieve the right page but misstate its terms or operator, simplify that specific passage and check visible/schema consistency.

No numerical growth target, paid tool purchase or acquisition forecast is assumed. The practical first milestone is consistency across the priority current descriptions, followed by sustained correct classification and appearance in relevant unbranded shortlists.

## Deliverable status

Completed: source-of-truth review, public-source reconnaissance, local SEO-source inspection, proposed copy, external correction draft, prioritized work plan, prompt portfolio and an empty measurement log template.

Pending: actual chatbot baseline, production crawl/index checks, publication, profile updates, external outreach, founder-story verification and retesting. The source-of-truth file and website code were not edited. No external messages were sent.
