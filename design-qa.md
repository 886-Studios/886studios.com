# Team page QA — 2026-10-01

final result: blocked

## Layout refinement — 2026-10-01

Impeccable layout pass, preserving the compact ticket design, content and original portraits.

- Reading path: Operating Team → Batch Partners → Supporting Partners remains the DOM and keyboard order. At widths of 1100px and above, Operating Team occupies columns 1–3 and Batch Partners occupies columns 5–6 of one six-track grid; Supporting Partners spans the next row. The empty fourth track deliberately separates the two leading groups.
- Grouping and rhythm: 12px horizontal card/heading gaps, 24px card-row gaps, 48px between desktop sections and before Careers, and 32px between narrow-screen groups. Existing spacing tokens replace arbitrary group intervals.
- Density: leading groups now share a row without stretching their cards. The six supporting columns retain the requested compact scale.
- Adaptation: below 1100px, groups stack in DOM order and the grid chooses as many 140px-minimum cards as fit. Two cards fit typical phone widths; very narrow containers use one to preserve readable content.
- Extremes: names and social links now share normal-flow grid tracks, preventing stacked social icons from overlapping the description. Names can wrap in unusually narrow containers; no company text is truncated. Touch profile links are 44px tall; touch social links are 32px square.
- Mechanical evidence: independent initial layout scan and final full detector both returned no findings. Astro check reports zero errors, warnings and hints. `git diff --check` passed. The local server HTML includes the new section classes and layout rules.
- Browser verification resolved: Chrome had current markup but a stale Vite-injected component stylesheet (the roster computed to one 1060px track at a 1139px viewport). Restarting the existing Astro dev server on port 4321 cleared its stale stylesheet cache. Chrome then computed six 166.664px tracks; Operating Team and Batch Partners both started at y=96px, and Supporting Partners started at y=468px. Native screenshots confirmed the intended desktop grouping and the 390 × 844 mobile two-column cards with legible names and no visible overlap. The corrected desktop preview was left open. No additional source-code changes were necessary.
- Existing full-width Careers copy is retained per the project's explicit copy-layout guidance.

## Size revision — 2026-10-01

The user requested cards 50% smaller. Card width, portraits, name text, padding, and ticket details are reduced to approximately half their previous desktop dimensions. The grid now has six desktop columns, four tablet columns, and two mobile columns. Supporting copy retains a 12px minimum for readability. Native Chrome desktop capture in the conversation confirms all 15 cards render with readable names and intact content; Astro check reports no diagnostics. This supersedes the earlier three-column layout notes below. No photos or partner information changed in this revision.

## Current status

Implementation is available at http://localhost:4321/team. The user confirmed Kevin Lin. Kai Huang and Kevin Lin now appear under Batch Partners, both labeled Managing Partner; the other ten partners appear under Supporting Partners. Native Chrome accessibility output verified the three operating team members, both batch partners, and all ten supporting partners in order. Astro check passes with no diagnostics. The remaining formal visual-comparison limitation is documented below.

## Evidence and verification

- Source visual: the user's 1254 × 1254 reference attachment in this conversation, superseded by the request to remove card logos/captions and arrows.
- Implementation screenshots: native Chrome screenshots returned in the conversation by `mcp__cua_repl` (desktop and 390 × 844 responsive emulation); no filesystem screenshot paths were returned.
- Desktop capture: full native Chrome window, 3388 × 2626 pixels including browser chrome, approximately 2× density. Not an exact viewport match to the source.
- Mobile state: 390 × 844 CSS pixels, DevTools fit-to-window preview. No supplied mobile reference.
- Full-view review: three equal desktop columns, cream cards, dotted separators, ticket notches, large black names, purple headings and plain profile links.
- Focused review: name wrapping, social link placement, Max's role line, original faces, and mobile card spacing are visible in the native captures.
- Source and implementation have not been assembled in a single normalized comparison artifact; formal same-viewport fidelity QA remains incomplete.
- Clicked Kai Huang's profile link and verified the existing profile loaded; followed Back to Team successfully.
- Browser console showed zero visible messages with default log levels (two hidden messages and one improvement issue).
- Astro check: zero errors, warnings, or hints. All 37 tests pass. Production build passes (87 pages).

## Fidelity surfaces

- Typography: existing Geist font, bold two-line names, legible company text and monospaced section labels. Mobile screenshot shows no clipped text in the first card.
- Spacing/layout: three columns on desktop, two at intermediate widths, one on mobile; 18px desktop column gaps. Removed the large page hero while retaining a screen-reader H1.
- Colors: cream #f5f2e9, black text, purple links and section labels on the existing dark page.
- Images: all original portrait files reused without generation, filters, retouching, or file modifications. Original photo backgrounds and colors intentionally differ from the mockup to preserve faces.
- Copy: all 15 members, companies, biographies, and social/profile URLs preserved. Kai Huang and Kevin Lin have the user-requested Managing Partner titles; partner group headings reflect the subsequent user request.

## Findings / remaining work

- Content clarification resolved: Kevin Lin joins Kai Huang in Batch Partners; the remaining ten partners are Supporting Partners.
- Formal normalized, same-input source/implementation comparison remains incomplete; do not claim pixel-perfect fidelity.
- No actionable layout defect was observed in the desktop and mobile screenshots reviewed.

## Iteration history

1. Replaced avatar tiles with the reference's ticket card layout using original photos.
2. Applied user steering: removed card branding/captions; plain profile links without arrows.
3. Added Kai's Managing Partner label while preserving Guitar Hero / Blue Goji.
4. Verified desktop/mobile rendering and existing profile navigation. No visual fix was required from those checks.
5. Split partners into Batch Partners (Kai Huang, Kevin Lin) and Supporting Partners (the remaining ten). Added Kevin Lin’s confirmed Managing Partner label and verified rendered headings/member order in Chrome.

---

# ikigai Launchpad Design QA

## Source and implementation evidence

- Source capture: `.artifacts/design-qa/source-programs-desktop-viewport.png`
- Implementation capture: `.artifacts/design-qa/implementation-programs-desktop-v2.png`
- Same-input comparison: `.artifacts/design-qa/comparison-source-implementation-desktop.png`
- Extended page contact sheet: `.artifacts/design-qa/implementation-section-contact-sheet.png`
- Mobile hero: `.artifacts/design-qa/implementation-programs-mobile-v1.png`
- Mobile application: `.artifacts/design-qa/implementation-programs-mobile-apply-v4.png`
- Mobile navigation: `.artifacts/design-qa/implementation-mobile-menu-v1.png`
- Revised “What we look for” flow: `.artifacts/design-qa/revised-what-we-look-for-mobile.png`
- Revised FAQ-to-Launch Station flow: `.artifacts/design-qa/revised-faq-launch-station-mobile.png`
- Compact desktop: `.artifacts/design-qa/implementation-programs-tablet-900-top-v2.png`
- Tablet: `.artifacts/design-qa/implementation-programs-tablet-1024-v1.png`
- Expanded FAQ with keyboard focus: `.artifacts/design-qa/implementation-faq-open-desktop-v2.png`

## Viewport and state coverage

- Desktop: 1440 × 900, hero, benefits, application process, FAQ, and Launch Station.
- Tablet/compact desktop: 1024 × 900 and 900 × 900, including the longer navigation label.
- Mobile: 390 × 844, hero, application process, FAQ, Launch Station, and the open menu drawer.
- Interactive states: menu open/close, native FAQ disclosure expanded, FAQ summary keyboard focus, and Apply CTA targets.
- The implementation preserves the source page's dark editorial hierarchy, typography, photography, restrained purple accents, borders, and spacing while adding the approved content architecture.

## Focused comparison

The source and implementation hero captures use the same 1440 × 900 viewport and appear together in `comparison-source-implementation-desktop.png`. The primary visual language remains consistent: oversized launchpad title, concise supporting copy, purple primary action, right-aligned offer facts, and full-width program photography. Intentional differences are limited to approved offer precision, the application status line, the renamed navigation item, and more useful fact labels.

The extended-page contact sheet verifies the initial benefits, fit, beyond-the-batch, application, FAQ, and Launch Station treatment. The two revised mobile captures supersede its fit/beyond and proof-link portions: those editorial image slots and the “Go deeper” section were removed in the follow-up pass.

## Findings and iteration history

1. Initial FAQ expansion showed the answer too close to the focused summary outline (P2). Added 10px top padding to the answer region and recaptured the expanded/focused state. Resolved.
2. Compact desktop navigation was checked at 900px. The full navigation, `ikigai Launchpad` label, and Apply button fit without collision or horizontal overflow. Resolved without code changes.
3. The first mobile application capture occurred before its reveal paint completed. Recaptured after the section reached its visible state. Resolved.
4. Follow-up revision removed program-page hover treatments, the “Go deeper” section, and the additional fit/beyond image slots. “Founder fit” became “What we look for.” Verified the new FAQ-to-Launch Station transition and text-only section flow.
5. No broken program images, clipped text, horizontal overflow, console warnings, or console errors were found in the final pass.

## Functional and accessibility checks

- One H1 and a logical H1/H2/H3 heading hierarchy.
- Eight native, keyboard-operable `<details>` disclosures.
- Visible focus styling on the FAQ summary.
- Descriptive alternatives on every program image.
- All Apply links resolve to the existing Tally form.
- The Interview Guidebook, contact, Tally application, and Launch Station links remain present.
- Canonical URL, title, description, breadcrumb, `Service`, and `Offer` JSON-LD validate in the rendered page.
- Desktop, tablet, compact desktop, and mobile document widths match their viewports.

Final result: passed

## Blog newsletter card — July 29, 2026

### Source and implementation evidence

- Source visual truth: `.artifacts/design-qa/ikigai-subscribe-reference-full.png`
- Normalized source card: `.artifacts/design-qa/ikigai-subscribe-reference-card.png`
- Desktop implementation: `.artifacts/design-qa/ikigai-blog-subscribe-implementation-refined.png`
- Same-input comparison: `.artifacts/design-qa/ikigai-subscribe-qa-final.png`
- Mobile implementation: `.artifacts/design-qa/ikigai-blog-subscribe-mobile.png`

### Viewport and normalization

- Desktop browser viewport: 1656 × 1144 CSS pixels at device scale 1.
- Source image: 2078 × 638 pixels. The card region was cropped and normalized to 1096 × 290 pixels.
- Desktop implementation card: 1096 × 295 pixels at the same visual width as the normalized source.
- Mobile browser viewport: 500 × 844 CSS pixels at device scale 1. The screenshot content area is 485 × 819 pixels after browser scrollbars.
- State: Blog index scrolled to its final newsletter card; email form idle.

### Full-view and focused comparison

The source and implementation cards appear together in `ikigai-subscribe-qa-final.png`. The implementation preserves the source hierarchy: branded artwork, publication title and description, a short subscription prompt, and a single-row email action. The comparison is intentionally component-focused because the source is a newsletter-card reference rather than a full Blog page.

The implementation retains the existing 886 product system instead of copying another publication's identity: Geist typography, real ikigai Insights artwork, restrained purple border, purple pill action, and the site's dark surface. The supplied 1280 × 640 ikigai image remains at its natural 2:1 aspect ratio without stretching or an invented replacement.

### Required fidelity surfaces

- Fonts and typography: Hierarchy and relative scale match the reference. Geist is retained as an intentional 886 brand adaptation instead of cloning the source serif face.
- Spacing and layout rhythm: Desktop composition follows the same artwork-left/content-right structure. The final card differs by only 5 pixels in normalized height. Mobile collapses to one column without horizontal overflow.
- Colors and visual tokens: The reference's orange palette is intentionally translated to existing 886 purple, background, border, and text tokens.
- Image quality and asset fidelity: The real ikigai Insights asset is sharp, correctly cropped, and rendered at 2:1. No generated, placeholder, CSS-drawn, or invented brand asset is used.
- Copy and content: The card uses the real publication name and description plus a concise subscription prompt. The existing Substack form action is preserved.

### Findings and comparison history

1. The first desktop implementation measured 1096 × 335 pixels versus the normalized 1096 × 290 source, creating a visibly taller and denser block (P2). Reduced the vertical padding from 50px to 30px. The revised implementation measures 1096 × 295 and matches the source proportion closely.
2. The reference uses a square publication icon, while the established ikigai artwork is a wide 2:1 brand image. Retaining the real rectangular asset is an intentional product constraint based on the site's existing branding, not a fidelity defect.
3. The 500px responsive pass shows no horizontal overflow, clipped copy, distorted image, or collapsed controls.
4. The email field accepted and cleared a test value, and the Subscribe button remained enabled. The form was not submitted to the external service during QA.
5. Browser console check returned no errors.

### Remaining acceptable differences

- The source's warm orange glow, serif wordmark, and square artwork belong to Flying Arrows. The implementation intentionally uses ikigai's image and 886's typography and purple interaction styling.
- The mobile state has no direct source reference; it was checked for faithful hierarchy, readability, and functional responsiveness.

Final result: passed

## Testimonial card revision — July 13, 2026

### Evidence

- Source visual truth: `.artifacts/design-qa/source-testimonial-cards-reference.png`
- Desktop implementation: `.artifacts/design-qa/implementation-testimonial-cards-desktop.png`
- Mobile implementation: `.artifacts/design-qa/implementation-testimonial-cards-mobile.png`
- Same-input desktop comparison: `.artifacts/design-qa/comparison-testimonial-cards-desktop.png`
- Desktop viewport/state: 1440 × 1000, testimonial section centered, four complete quotes visible.
- Mobile viewport/state: 390 × 844, testimonial section, vertically stacked complete quote cards.

### Focused comparison

The comparison isolates the testimonial section because the supplied reference is a component-level layout target rather than a full 886 page. The implementation preserves the reference's essential structure—independent light cards, a distinct person header, a divider, and the quote below—while intentionally retaining 886's dark page background, Geist typography, purple metadata, and restrained radius. Profile photos are intentionally omitted until the user supplies the founder images.

### Required fidelity surfaces

- Fonts and typography: Existing Geist and Geist Mono families retained; hierarchy matches the reference with founder name first, company metadata second, and the full quote below.
- Spacing and layout rhythm: Cards are visibly separated by consistent gaps. Desktop uses four columns for the four available quotes; compact desktop uses two columns; mobile stacks one card per row without clipped text or empty carousel space.
- Colors and visual tokens: The requested off-white card background is retained. Purple metadata and borders connect the cards to the existing 886 palette.
- Image quality and asset fidelity: No invented avatars or placeholder graphics were used. The card header is ready for supplied profile photos in a later pass.
- Copy and content: All four founder quotes and attributions remain complete and unchanged.

### Findings and comparison history

1. Initial mobile implementation used a horizontal rail whose height was controlled by the longest quote, leaving excessive empty space on shorter cards (P2). Replaced the rail with naturally sized stacked cards on mobile. Post-fix browser evidence shows complete quotes, separate cards, and no unused card area.
2. The first implementation joined all testimonials inside one shared light field (P1 relative to the revised reference). Replaced it with four independent cards separated by visible gutters.
3. Browser console pass found no warnings or errors. Desktop, compact desktop, and mobile layouts have no clipped testimonial text or horizontal overflow.

### Remaining acceptable difference

- Founder profile photos are absent because the user said they will supply them later. This is expected, not a QA blocker.

Final result: passed

## Team page — approved purple portrait design (2026-10-02)

### Target and constraints
- Approved visual: solid-purple portrait silhouettes on the existing black page, with monochrome photos and social icons.
- Source visual: `/Users/patryk/.codex/generated_images/01a0fa70-816d-71a3-8c6f-5b7d816766f0/exec-5d7c2e1d-f58c-4a4b-a896-d2f848fb9527.png`.
- Implementation: `http://127.0.0.1:4173/team`, branch `feature/new-information-architecture`.
- User constraint supersedes generated portrait likenesses: retain the existing photographs, changing only background transparency and monochrome display. All 15 output cutouts were compared against their original decoded RGB; every visible pixel is unchanged. CSS handles grayscale and framing. Originals are untouched.

### Browser comparison
- Native Safari used after both in-app and Chrome browser automation surfaces were unavailable.
- Compared source and rendered page side by side in one browser capture. Source normalized to 1440px width; implementation iframe 1440px wide, both displayed at 50% scale on a 2x display. Header/footer and careers intentionally retain the existing production components/content.
- Evidence: `.artifacts/team/desktop-comparison.png`, `.artifacts/team/desktop-comparison-bottom.png`, `.artifacts/team/desktop-final.png`.
- Also rendered 320px, 390px, and 768px iframe viewports side by side. Verified readable wrapping, contained portraits, and responsive grids. The narrowest title wraps naturally. No horizontal content overflow observed.
- Typography: Georgia serif heading matches the selected direction, with the existing Geist body font. Existing brand tokens supply black, white, lavender, and solid purple `#8b5cf6`.
- Layout: centered 2-person batch group, 3-person operating group, 4-column supporting grid with the last pair centered; mobile reflows to 1/2 columns.
- Copy: all 15 current names, roles, and affiliations retained. Original profile/social links remain functional. No invented addresses.

### Findings and resolution
- P1: first Kai asset had lost its alpha because of Sharp operation order. Fixed the helper to decode RGB before joining alpha, regenerated Kai, and verified transparency plus unchanged visible RGB for every output.
- P2: legacy photo framing varied across the source photos. Added explicit CSS framing offsets/scales, preserving poses and pixels. Fixed bottom-edge gaps by ensuring photographs extend to the crop boundary.
- P2: the existing dev server served stale component CSS. Restarted the preview and verified computed transforms, then repeated the side-by-side comparison. No remaining actionable P0/P1/P2 findings.
- P3: low-resolution source photos (especially seated / wider shots) have natural edge softness. No generative replacement or enhancement was applied.

### Functional verification
- Opened and closed the mobile menu; followed Kai's profile link and verified the destination.
- Verified all 15 internal profile destinations exist in the production build. Social links use existing destinations, accessible names, and 44px targets.
- Safari console checked after navigation: normal font-preconnect / Vite messages only; no errors.
- Astro type check passed with zero errors/warnings. All 37 existing tests passed. Production build passed after enabling access to its required remote blog feed.

final result: passed

### Team typography follow-up (2026-10-02)
- Reused the shared `PageHero` and standard section spacing for consistency with other pages, replacing the custom serif header.
- Removed the top “886 Studios” eyebrow and “Built by real founders, for founders.” lead.
- Reused `section-h2 section-h2--compact` for team groups and Careers: responsive 22–34px headings instead of 11px eyebrow labels.
- Confirmed the updated header and larger group titles in the local Safari preview. `npm run check` passed with zero errors, warnings, or hints; `git diff --check` passed.

### Team layout follow-up (2026-10-02)
- Kept the shared header typography and scoped tighter vertical spacing to Team, using existing spacing tokens.
- Latest grouping: one Operating Team section, ordered Kai Huang, Kevin Lin, Max Hsieh, Patryk Chojecki, Carter Wang. All five share one row at 1100px and wider. Kevin retains the Batch Partner title. Supporting Partners is now Advisors. Both groups use the same responsive five/three/two-column layout.
- Preserved source order, portrait treatment, real content, and 44px social targets. Portraits cap at 200px consistently, with natural text wrapping at narrow widths.
- Reviewed desktop 1440px and phones 390px/320px together in Safari. Section hierarchy stays clear, all three groups remain distinct, and long names/affiliations wrap inside their columns.
- Careers now uses the same purple section label and shared paragraph typography/spacing as Fund Partner on the overview page, per the follow-up request.
- Impeccable detector returned no findings for the team components; Astro check passed with zero errors, warnings, or hints; whitespace check passed.
- Confirmed the merged Operating Team row, requested order, Kevin's title, and Advisors heading in Safari after restarting the preview to clear stale component CSS. Astro check passed again after regrouping.
- Added shared CSS subgrid tracks for portraits, titles, names, companies, and socials. Missing fields retain their track; wrapped text sizes the corresponding track across each row. Verified alignment at 1440px, 390px, and 320px in Safari.
- Role titles now use small, muted uppercase text; company affiliations retain regular-case purple text. Portraits, names, and social targets retain their existing styling. Astro check passed after the markup changes.
- Added Forma to Max Hsieh and individual external links for active companies with their own company websites. Company links sit outside the profile anchor, preserving valid markup, independent keyboard targets, and the five aligned tracks. Per the latest request, verified Wikipedia articles are the fallback for Guitar Hero, Playdom, Mochi Media, Hot or Not, and Tiburon. ThunderCore and Symbio remain plain text because no matching Wikipedia article was found and their prior URLs lead to migration/rebranding pages. Corrected the team label CATCHPLAY.
- Safari confirmed Forma points to joinforma.com and company links are distinct from profile links. Desktop alignment remains intact; Astro check passed for 106 files with zero diagnostics.

### Portrait consistency and sharpening (2026-10-02)
- Added a shared TeamPortrait component for the directory and profile pages, keeping the same cutout assets, framing, monochrome treatment, and purple shapes across both.
- Applied mild display-only sharpening to Kevin Chou, Phil Chen, Charles Huang, and James Hong using an alpha-preserving convolution filter. Source photo files remain unchanged.
- Reviewed the desktop directory, Kevin Chou profile, and mobile Phil Chen profile together in Safari. Portraits render consistently, directory alignment remains intact, and no obvious sharpening halos were observed. Evidence: `.artifacts/team/portrait-consistency.png`.
- Astro check passed for 107 files with zero errors, warnings, or hints; whitespace check passed.
- Follow-up: removed sharpening for Phil Chen and James Hong per user feedback; their team and profile portraits now use the prior unsharpened appearance. Removed the newly added Lifelike Capital affiliation from Kevin Lin's team listing.

### Team profiles and canonical routes (2026-10-02)
- Directory and profile headers now share roster identity data and company/social components, alongside the shared portrait component. Role text remains distinct from linked company names. Corrected Kevin Lin's biography role to Batch Partner and CATCHPLAY spelling in Timothy Chen's profile.
- All 15 canonical profiles now live under `/team/`: unique first names use the first name only; Kevin Lin and Kevin Chou retain surnames. James and Jameson have separate first-name routes.
- Updated directory links, blog author/archive links, breadcrumbs, Person metadata, and sitemap. Added permanent deployment redirects and static fallback pages for old `/about/` profiles; removed the legacy broad redirect that intercepted `/team/` routes.
- Verified directory alignment, Kai's profile, and Kevin Lin's mobile profile in Safari. Navigating to `/about/kai-huang` resolved to `/team/kai`. Evidence: `.artifacts/team/profile-routes-consistency.png`.
- Astro check passed without diagnostics; all 40 tests passed, including roster parity, all profile routes, and redirect-loop coverage. Production build, SEO validation (77 indexable pages), security validation (102 HTML pages), and whitespace checks passed.

### Team polish (2026-10-02)
- Preserved the approved portraits, palette, five-person desktop operating row, copy, and shared profile components.
- Balanced wrapped role/name text; grouped company labels so short company names stay together and separators follow the next company when wrapping. Added understated persistent link underlines to distinguish verified destinations from plain affiliations.
- Matched the optical sizes of X and LinkedIn, retained 44px targets, and added shared hover/focus/pressed feedback. Tightened mobile heading, row, section, and Careers spacing using existing tokens.
- One initial and one confirmation review covered 1440px, 900px, 390px, and 320px together in Safari. Alignment and wrapping remained intact; profile navigation and return were checked. Evidence: `.artifacts/team/polish-responsive.png`.
- Astro check, production build, SEO validation, security validation, and whitespace checks passed. No portrait files or factual copy changed during polish.

### James Hong replacement photo (2026-10-02)
- Replaced James's roster photo with the user-provided Slack image, shared by the directory and `/team/james`. Saved the lossless source as `public/assets/headshots/james-hong-portrait.webp` and the transparent cutout as `public/assets/headshots/team/james-hong-portrait.webp`.
- Used built-in image editing for background extraction, then applied only the resulting alpha mask to the original RGB pixels. The existing helper verified every visible source RGB channel remained unchanged. CSS supplies grayscale and matching framing; James has no sharpening filter.
- Updated social-image dimensions for the 1120×1404 source. Reviewed team, desktop profile, and phone profile together in Safari; confirmed the final crop after one adjustment. Evidence: `.artifacts/team/james-hong-replacement-review.png`; exact prompt: `.artifacts/team/james-hong-edit-prompt.md`.
- Astro check and whitespace checks passed.

### Team delight (2026-10-02)
- Added a small, alternating turn to the existing purple portrait shapes on profile hover, keyboard focus, and press. The photographs, framing, content, and aligned rows remain unchanged. CSS only; no new scripts or dependencies.
- Restricted hover to fine pointers; reduced-motion preferences keep shapes still and retain name-color feedback and focus outlines. Profile-page portraits stay static.
- Removed company-link underlines as requested; links retain color and focus feedback across team and profile pages.
- Reviewed 1440px, 900px, 390px, and 320px together in Safari, confirmed visible keyboard focus, and activated Kai's profile using the keyboard. Evidence: `.artifacts/team/delight-responsive.png`. Reduced-motion behavior was reviewed in CSS; no device preference was changed.
- Astro check passed for 111 files with zero diagnostics; whitespace check passed. Temporary review page moved out of public assets.

### Joseph Hei portrait edge (2026-10-02)
- Identified a bright rightmost pixel column in Joseph's original photo. Added a 0.5% right-edge clip in the shared portrait component to hide that column and its resampling fringe without editing the source or changing his framing.
- Confirmed the line is gone on the team directory and desktop/mobile profile previews after opening the refreshed server on port 4174. Evidence: `.artifacts/team/joseph-edge-fix.png`.
- Astro check passed with zero diagnostics; whitespace check passed. Temporary review page moved out of public assets.

### Application Guide replacement (2026-10-12)
- Replaced the existing guide with the content and responsive layout from https://my-site-01161d08.ploy.build/resources/application-guide. Added a dedicated Astro component, scoped stylesheet, and locally hosted reference Geist font.
- Matched the reading width, typography, section spacing, checklist grid, answer cards, FAQ content, purple CTAs, and flat background. The guide navigation now links to the program review page.
- Compared source and local desktop screenshots; compared both 390px mobile screenshots together in the browser tool output. Verified the local mobile FAQ layout after its anchor finished scrolling. Screenshot evidence is in the task conversation rather than committed image artifacts.
- Verified checklist and FAQ navigation in Chrome; confirmed every generated in-page anchor resolves. Existing site navigation, metadata, footer, and other resource routes remain integrated.
- Validation: Astro check without diagnostics, all 43 tests, production build (102 pages), SEO validation (79 indexable pages), security validation, and whitespace checks passed. The production build requires network access to its existing public blog feed.
- No remaining P0–P2 visual issues observed in the reviewed states. Minor shared navigation icon differences are retained.
- Final result: passed.

### Incorporation 101 replacement (2026-10-13)

- Source: https://staging-my-site-01161d08.ploy.build/incorporation-101; downloaded markup and stylesheet in `/tmp/incorporation-source.html` and `/tmp/incorporation-source.css` supplied the complete content, links, styles, and responsive rules.
- Replaced the generic article with a dedicated Astro component and scoped styles. Preserved the founder checklist, jurisdiction guidance, five-row US comparison, Taiwan office guidance, five FAQs, consultation links, and original source-review date. Program review navigation stays integrated with the existing site.
- Source and implementation desktop captures were compared together at the same Chrome window size (2940 × 1684 screenshot pixels, approximately 1470 CSS px wide at 2× density). Mobile captures used the same 390 × 844 CSS viewport and fit-to-window emulation. Source and local hero/table captures were emitted together in the task conversation; screenshots are conversation artifacts rather than committed files. One mobile hero capture was display-scaled by the tool; the table comparison used matching capture sizes.
- Typography: reused the exact locally hosted Geist file loaded by the reference; matched heading sizes, line heights, weights, wrapping, and letter spacing. The first table comparison exposed lighter antialiasing inherited from the site; scoped the reference's default font smoothing to this route and confirmed it in the final desktop capture.
- Layout: matched the 820px desktop reading width, mobile 20px padding, section rhythm, source-link spacing, table column widths and padding, and consultation divider. Table retains a 760px minimum width inside a focusable horizontal scroll region. Colors: retained the matching dark background, white headings, lavender body text, table borders, and purple CTA tokens. Assets: existing logo and exact local Geist font; no replacement images or hotlinks.
- Content verification: all normalized main-page text and link destinations match the source, with internal production-domain links made relative. All fragment links resolve to generated IDs. Browser verification covered the US structures anchor and keyboard-driven horizontal table scrolling with visible focus. Chrome console showed no visible errors (development messages hidden). External forms were not submitted.
- Validation: Astro check passed for 120 files with no diagnostics; all 43 existing tests, production build (102 pages), SEO check (79 indexable pages), security check, and whitespace validation passed.
- Findings: no actionable P0/P1/P2 issues in reviewed states. P3: retain the existing site's active Community navigation state and small shared hamburger/icon differences; the shared header creates an approximately 1px vertical offset. Lower-page copy and layout rules were verified from source markup rather than an exhaustive screenshot comparison of every paragraph.
- Final result: passed.

### SAFE note guide addition (2026-10-13)

- Source: https://staging-my-site-01161d08.ploy.build/resources/safe-note-guide. Full source markup and stylesheet captured in `/tmp/safe-note-source.html` and `/tmp/safe-note-source.css`.
- Added a full local Astro page at `/resources/safe-note-guide` and a Resources library card pointing to that route. Copied the introduction, how-it-works guidance, six-row comparison table, worked example, founder checklist, five FAQs, source citations, review date, and CTAs. No embed or external-page redirect.
- Exact normalized main-content text and all link destinations match the supplied source, with production-domain internal links made relative. Every fragment link resolves. The generated Resources page links to the new local route; canonical URL, article metadata, content date, and sitemap entry are present.
- Visual comparison: captured source desktop sections through the closing CTA; compared source/local desktop heroes and comparison tables. Compared source/local hero and table at 390 × 844 CSS pixels in Chrome responsive mode. Screenshots are in the task conversation; some were display-scaled by the tool. Matching heading wrapping, paragraph wrapping, reading width, section spacing, colors, font weights, button treatment, and table columns observed. Reused the exact locally hosted reference Geist font and the existing shared logo/footer.
- Corrected the closing small-print paragraph to use the reference's desktop 16px/25.6px typography. Scoped all new styles to this page. Existing active Community navigation and shared menu icons are retained as P3 differences.
- Interaction verification: comparison link updates the local hash and scrolls to the section; keyboard Tab visibly focuses the table region. Mobile table stays inside its horizontal scroll region. No visible page console errors in reviewed captures. Repeated Chrome focus changes to the user's meeting limited further mobile keyboard and lower-page screenshot checks; lower content was checked against exact source markup and responsive CSS instead.
- Validation: Astro check passed for 121 files without diagnostics; all 43 tests passed; production build generated 103 pages; SEO validation passed for 80 indexable pages and sitemap URLs; security and whitespace checks passed.
- No remaining P0–P2 findings in the reviewed states. Final result: passed.

### Cap table guide addition (2026-10-13)

- Source: https://staging-my-site-01161d08.ploy.build/resources/cap-table-guide. Captured complete markup and stylesheet in `/tmp/cap-table-source.html` and `/tmp/cap-table-source.css`.
- Added the complete local `/resources/cap-table-guide` page and a Cap Table Guide card after SAFE Note Guide in Resources. Preserved both tables, the four-step ownership example, option pool guidance, vesting and 83(b) content, founder checks, five FAQs, source links, review date, and CTAs.
- Content parity check passed: all normalized main-content text, 24 links, and 16 section IDs match the reference; internal production-domain links become relative. The shared layout supplies the main-content landmark. Metadata, canonical URL, article schema, content date, and sitemap entry are integrated.
- Compared source and local desktop hero/table screenshots together at the same Chrome window size (approximately 1475 CSS px wide, native 2× capture). Compared source and local mobile heroes together at 390 × 844 CSS pixels using the same fit-to-window emulation. Worked-example/table captures were compared together; anchor animations produced different vertical offsets, so comparison used relative spacing and table geometry rather than absolute screen positions. Evidence is in the task conversation, not committed screenshot files.
- Typography: exact locally hosted reference Geist font; matching heading wraps, body line wraps, sizes, weights, line heights, and antialiasing. Layout: matching 820px desktop reading width, 20px mobile padding, section rhythm, button dimensions, table padding and column proportions. Colors: matching dark background, white headings, lavender body text, purple CTAs, borders, and shaded Total row. Assets: existing local logo/font and shared footer; no image substitutions or hotlinks. Copy: full source parity confirmed.
- Interaction checks: Resources card opens the local guide; Read SAFE guide opens the local SAFE page; Worked example updates the fragment and scrolls to its section. Keyboard Tab focuses the mobile ownership table with a visible outline; repeated Right keys reveal the final round column and totals without widening the page. Console showed no visible errors (development messages hidden). All fragment destinations also validated from markup.
- Reviewed local desktop FAQs and closing CTA. Lower-page copy and responsive styling were checked from the complete source, with sampled visual comparisons rather than exhaustive pixel comparison of every paragraph or external destination.
- Findings: no actionable P0/P1/P2 differences in reviewed states. P3: retained shared active Community navigation, scrollbar/menu icon styling, and approximately 1px header offset. Astro's development toolbar appears only in local development captures.
- Validation: Astro check passed for 122 files with zero diagnostics; all 43 tests passed; production build generated 104 pages; SEO validation passed for 81 indexable pages and sitemap URLs; security and whitespace checks passed.
- Final result: passed.
