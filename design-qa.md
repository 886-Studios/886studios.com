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
