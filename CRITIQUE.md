# UI Critique — The Bloodweb
*Generated 2026-05-19*

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2/4 | Loading states are plain text; no skeleton loaders; no count of rated vs unrated perks anywhere |
| 2 | Match System / Real World | 4/4 | Octagon icons, Cinzel, A–F grading, amber — all match DBD's visual and mental models exactly |
| 3 | User Control and Freedom | 3/4 | Ratings are de-selectable; modals have multiple escape paths; no undo for clearing a build |
| 4 | Consistency and Standards | 4/4 | Ember pattern applied uniformly across every interactive state; octagon used consistently at all sizes |
| 5 | Error Prevention | 2/4 | No feedback when attempting to add a 5th perk to a full 4-slot build; no guard on clearing a build |
| 6 | Recognition Rather Than Recall | 3/4 | Filters and sort controls are all visible; but rated vs unrated perk count is never surfaced as a number |
| 7 | Flexibility and Efficiency | 2/4 | No search in the rating view (only in BuildMaker); no keyboard shortcuts; no bulk actions |
| 8 | Aesthetic and Minimalist Design | 3/4 | 3 rows of filter chrome above every perk list; 14-button category filter is heavy even when user hasn't rated anything |
| 9 | Error Recovery | 2/4 | Auth errors shown correctly; "build is full" state is silent — dimmed perks give no explanation |
| 10 | Help and Documentation | 2/4 | No onboarding, no grading guide, no empty states, no tooltip on category colors for first-timers |
| **Total** | | **27/40** | **Functional, with clear gaps in discoverability and load management** |

---

## Anti-Patterns Verdict

### LLM Assessment — does this look AI-generated?

Not obviously, but it doesn't fully clear the second-order reflex test. The specific choices are genuinely crafted: the octagonal clip-path is a real design decision, Cinzel + Oswald with aggressive tracking is a deliberate pairing, and the category color system is data-driven rather than decorative. The ember glow vocabulary is consistent and restrained.

However: amber-on-near-black for a gaming tool is the *first* training-data answer for this domain. "DBD adjacent tool → dark + warm amber + gothic serif" is identifiable from a thumbnail. The goal in PRODUCT.md is "bold, expressive, editorial" — but what exists is "atmospheric and faithful." The editorial ambition hasn't been realized yet. The interface feels like a very well-executed version of the obvious answer rather than a surprising one.

### Deterministic Scan

One finding: `BuildMaker.tsx:219` — `cubic-bezier(0.34, 1.56, 0.64, 1)` flagged as bounce/elastic easing. This is the FLIP animation easing for perk slot fills. The overshoot (the `1.56` control point) produces a spring-like snap that violates the "exponential ease-out only" rule. One occurrence, warning severity.

---

## Overall Impression

The system has genuine craft and coherence — the ember vocabulary, the octagon, the tracking on Cinzel. It reads as *designed*, not assembled. The problems are not visual: they're informational. Three rows of filter chrome greet users before they've done anything. The primary action (rating a perk) has no fast path for casual use. And the atmospheric dark-plus-amber mood, while executed well, hasn't yet reached the "bold, editorial" register that PRODUCT.md describes as the goal.

The single biggest opportunity: **the filter system is designed for power users and presented to everyone simultaneously.** Collapsing it or deferring it would immediately make the primary experience feel faster and less demanding.

---

## What's Working

**1. The ember interaction vocabulary is cohesive and satisfying.** Every interactive state — hover, active, focus — uses the same amber signal at varying intensities. The system feels like a single authorial decision rather than accumulated convention. The card hover lift + glow intensification gives genuine tactile feedback.

**2. The octagonal perk icon is a true identity mark.** It's not a rounded square, not a circle — it's the in-game shape, applied at every size with pixel-consistent padding. Category colors bleeding through as the "border" color is clever: the icon does two jobs (identity + categorisation) without adding any UI chrome.

**3. The tab underline navigation is clean.** No background fills, no pill shapes — just a 2px amber underline. One of the few places where the design is quieter than convention, and it works precisely because everything else is atmospheric.

---

## Priority Issues

### [P1] Filter chrome: three rows of controls before any content

The sort bar, category filter (up to 14 buttons), and rating filter (7 buttons) stack above the perk list on every view. A casual user arriving to rate a perk they used last session has to process 24+ controls before seeing a single perk. The category filter especially — 14 colored pills with taxonomy labels like "hinderance" and "obstruction" — is designed for systematic filtering, not casual browsing.

**Why it matters:** PRODUCT.md's primary user is post-session and time-limited. Every row of chrome between them and the content is friction against the stated speed goal.

**Fix:** Collapse the category and rating filters behind a single "Filter" toggle, revealed on demand. The sort bar can stay visible — it's 3 options and changes the list rather than hiding it. Show active filter count on the toggle button so filtered state is still visible.

**Suggested command:** `/impeccable distill`

---

### [P1] No empty state when filters produce zero results

When category + rating filters combine to return nothing, the perk list renders blank with no message, no suggestion to clear filters, nothing.

**Why it matters:** Silent emptiness reads as a bug. Casual users won't know if it's a filter conflict, a loading failure, or a real "no results" state. It also means the Clear filter buttons — the only escape — are invisible since the filter rows scroll out of frame.

**Fix:** A minimal empty state: "No perks match these filters." with a Clear Filters action. One line, no illustration needed.

**Suggested command:** `/impeccable harden`

---

### [P2] In-card description scroll is a hidden affordance

PerkCard truncates descriptions at `max-height: 6.4em` with `overflow-y: auto`. The scrollbar appears on hover on most systems, not at rest. On trackpad or touch devices, attempting to scroll the description will nearly always scroll the page instead — the nested scroll trap is triggered by the page scroll, not the card.

**Why it matters:** Perk descriptions contain the mechanical information users need to make a rating decision. If a description is cut off and users don't discover the scroll, they're rating on incomplete information. On touch devices, this content is functionally inaccessible.

**Fix:** Either remove the height cap (let the card grow to full description length — non-uniform heights are fine in this layout), or truncate with a visible "read more" affordance that opens the PerkModal. The modal already exists for this purpose.

**Suggested command:** `/impeccable harden` for the accessibility aspect; `/impeccable distill` if the right answer is removing the cap.

---

### [P2] The "editorial" ambition in PRODUCT.md isn't realized in the layout

PRODUCT.md says: bold, expressive, editorial — "strong visual opinions." What exists is a competent, cohesive dark theme that faithfully extends DBD's visual language. The card grid is a standard uniform list. The header is a centered title + subtitle. The tab bar is a standard underline tab. Nothing in the *layout* is surprising.

**Why it matters:** The design passes the "AI made this?" test at the component level (the octagon, the tracking), but fails it at the page composition level. From a thumbnail, this reads as a well-executed gaming tool, not an editorial interface with strong opinions.

**Fix:** This is a layout and composition question, not a component polish job. Opportunities: variable card density based on rating, a hero area for the top-rated build, typographic scale variation across sections, breaking the centered-everything composition.

**Suggested command:** `/impeccable layout` or `/impeccable bolder`

---

### [P3] Spring easing on the FLIP animation

`BuildMaker.tsx:219` uses `cubic-bezier(0.34, 1.56, 0.64, 1)`. The overshoot creates a spring finish inconsistent with the system's ease-out-only motion vocabulary and the ceremonial component personality.

**Fix:** Replace with `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-expo). Same speed, no overshoot.

**Suggested command:** `/impeccable animate`

---

## Persona Red Flags

**Morgan (Casual Player, primary user):** Opens the app after a match. Wants to update ratings for the 3 perks they used. No search bar in the rating view — has to scroll manually through 150+ perks or remember the exact name. No "recently viewed" or "unrated" shortcut. The A–F grade buttons are right there on every card, so once they find the perk, rating is one click — but the *finding* is the friction. The filter apparatus above the list doesn't help; it's for systematic browsing, not targeted lookup.

**Jordan (First-Timer):** Sees the tab bar, clicks Perks → Survivor. Sees a sort bar, 14 colored category pills, 7 grade pills, then 150+ cards. Has no mental model for what categories mean or why they're colored differently. Might click a grade button immediately (works) or might click the card to read more (works, but triggers an unexpected modal). Has no idea what "Build" does. Interface is self-discoverable but offers no on-ramp — orientation depends entirely on the user already understanding DBD perk culture.

---

## Minor Observations

- Auth button positioned absolutely at `top: 50%; right: 24px` — on mid-width viewports (641–900px) can feel cramped against the scaled-up title.
- `:global(span)` inside description containers will catch any `<span>` the API adds in future, not just value-highlight spans. Consider scoping more narrowly.
- Custom scrollbar on descriptions (`scrollbar-color: var(--color-ember-dim) transparent`) is only visible on hover, reinforcing the hidden-affordance problem.
- No `prefers-color-scheme` handling — dark-only. Likely correct given the stated user context, but worth a deliberate note.
- **WCAG AAA gap:** Faded Parchment (`#a8957e`) on Cold Ash (`#111111`) is approximately 4.1:1 — passes AA, fails AAA (7:1 required). This is the most common text pairing in the interface: character names, filter labels, secondary descriptions.

---

## Recommended Next Actions

1. `/impeccable distill` — collapse filter chrome; the primary user's fast path depends on it
2. `/impeccable harden` — empty filter state, full-build feedback, description scroll accessibility
3. `/impeccable layout` or `/impeccable bolder` — push the page composition toward the editorial register PRODUCT.md describes
4. `/impeccable animate` — fix the spring easing on the FLIP animation
5. `/impeccable polish` — final pass after the above are done

Re-run `/impeccable critique` after fixes to see the score improve.
