---
target: new global map section
total_score: 23
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 0
timestamp: 2026-10-01T03-15-34Z
slug: src-components-worldmap-astro
---
Method: dual-agent (A: /root/critique_design · B: /root/critique_evidence)

**It feels native to 886, communicates global reach clearly on desktop, and is not overdesigned. Mobile clarity is the main weakness.** The generic quality comes mostly from the copy and the unverified demonstration content, not from the restrained map treatment.

Three decisions are working well:

- **Brand continuity:** Geist, the shared heading scale, near-black ground, purple dots, and existing spacing make this feel like part of the homepage.
- **Placement:** Company credentials → global connections → portfolio is a coherent progression from credibility to breadth to specific companies.
- **Restraint:** The open map and equal dots support the requested editorial feel. The desktop tooltip is a functional disclosure, not decorative card styling.

I would address these three issues, all **P2 refinements**, in this order:

1. **Mobile grouping makes the network look smaller and less geographically accurate.** At 390px, ten cities become six identical-looking dots. Taipei, Bengaluru, Singapore, and Tokyo collapse into one point that sits between their actual positions. San Francisco and New York also merge. “Nearby locations” describes screen proximity, not geographic proximity. Make multi-city groups visibly identifiable with a restrained count and a “4 cities” heading when opened. Keep Founder and Partner markers identical. Let mobile details expand in page flow: the current 300px scrolling panel is almost twice the 157px map height and initially hides some cities. Suggested command: `$impeccable adapt`.

2. **The land becomes too faint on phones.** The purple dots remain clear, but the geography nearly disappears at the smaller scale. That weakens the immediate geographic message. Lift the mobile land fill slightly while keeping country borders subdued and dots dominant. This is a visual-recognition concern, not a text-contrast compliance failure. Suggested command: `$impeccable polish`.

3. **The introduction repeats the heading instead of clarifying the story.** “Around the world” appears twice before the map demonstrates it a third time. Your stated goal is where founders and partners are from. A more precise line is: **“Where our founders and partners come from.”** It also reduces the chance of reading the dots as office locations. Verified names and relationships will provide the strongest 886-specific character; the requested placeholders cannot supply that proof yet. Suggested command: `$impeccable clarify`.

**Design health: 23/28 — Good.** Scores are out of four; three heuristics do not meaningfully apply to this informational marketing section.

| Heuristic | Score | Assessment |
|---|---:|---|
| System status | 3 | Selection is clear; multi-city groups are not visually distinguished. |
| Real-world match | 3 | Familiar geography; mobile centroids obscure actual city positions. |
| User control | 4 | Close, outside dismissal, Escape, and repeat-tap toggle. |
| Consistency | 4 | Strong fit with the existing site. |
| Error prevention | 3 | Usable touch targets; some ambiguity about what a dot represents. |
| Recognition | 3 | Instructions and directory help; specific locations require exploration. |
| Efficiency | n/a | No expert workflow to optimize. |
| Minimalism | 3 | Restrained presentation; compact details carry too much visual weight. |
| Error recovery | n/a | No transaction or user-input error state. |
| Documentation | n/a | Inline guidance is sufficient for this surface. |

For a first-time founder, the section conveys an international network, though the origin of those connections could be clearer. For a distracted phone visitor, the faint geography and scrolling grouped details are the main friction. Cognitive load is otherwise low: the dots are optional exploration points, not competing decisions that require an arbitrary limit.

The emotional progression works: the logos establish credibility, the map creates curiosity, and the portfolio returns to concrete companies. Real content will determine the reward of exploring. Keep the accessible location directory and current visual restraint. Actual screen-reader announcements were not tested.

The deterministic source scan found **zero map findings**. Browser detection also attributed no findings to the map; its full-page notices concerned existing surrounding sections and were excluded. The findings above concern meaning and perception, which the detector does not assess.

For a follow-up, which should lead: **mobile clarity**, **wording**, or **both**? On phones, should the map prioritize **individual city positions** or **clearly marked regional groups**?
