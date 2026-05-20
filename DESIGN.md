---
name: The Bloodweb
description: Dead by Daylight perk rating and build crafting tool
colors:
  ember: "#e8973a"
  ember-dim: "#6b4318"
  void: "#0a0a0a"
  ash: "#111111"
  blood: "#8b1a1a"
  parchment: "#d4c5a9"
  parchment-dim: "#a8957e"
typography:
  display:
    fontFamily: "Cinzel, serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "6px"
  headline:
    fontFamily: "Cinzel, serif"
    fontSize: "1.1rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "5px"
  title:
    fontFamily: "Cinzel, serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "2px"
  body:
    fontFamily: "Oswald, sans-serif"
    fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Oswald, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: "3px"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.parchment-dim}"
    rounded: "{rounded.sm}"
    padding: "6px 14px"
  button-ghost-hover:
    backgroundColor: "transparent"
    textColor: "{colors.ember}"
    rounded: "{rounded.sm}"
    padding: "6px 14px"
  button-primary:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.void}"
    rounded: "{rounded.sm}"
    padding: "12px"
  button-primary-hover:
    backgroundColor: "#d4873a"
    textColor: "{colors.void}"
    rounded: "{rounded.sm}"
    padding: "12px"
  grade-button:
    backgroundColor: "transparent"
    textColor: "{colors.parchment-dim}"
    rounded: "{rounded.sm}"
    size: "32px"
  grade-button-active:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.void}"
    rounded: "{rounded.sm}"
    size: "32px"
  input:
    backgroundColor: "{colors.ash}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  card:
    backgroundColor: "{colors.ash}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# Design System: The Bloodweb

## 1. Overview

**Creative North Star: "The Grimoire"**

The Bloodweb is a ritual object. Every surface reads as inscribed, not rendered. The interface draws from the visual grammar of Dead by Daylight — octagonal perk slots, amber firelight, archaic serif letterforms — but it is not a copy of the game's UI. It is the game's *soul* rendered as a reference document: the archivist's edition, the annotated compendium.

Darkness here is intentional and specific. A casual DBD player opens this post-session, probably in a dim room, the game still running in the other monitor. The near-black void background is the correct ambient response to that scene. Ember amber appears sparingly — at most 10% of any given screen — which is precisely what makes it feel like candlelight on vellum rather than a notification badge. Everything at rest is cold and still. Interaction reveals fire.

The system explicitly rejects: gamer-generic density (Mobafire, LoLalytics — crowded, low craft, every pixel monetised); heavy texture overlays and faux-grunge horror (oppressive for daily use); and the defaults of standard React component libraries (Material UI, Ant Design — assembled, not designed).

**Key Characteristics:**
- Near-black grounds everything; no softened dark mode, no dark navy, no charcoal
- One accent only: ember amber. Its scarcity is the point
- All typography is uppercase and tracked out; the interface reads like inscriptions, not copy
- Octagonal clip-path is the signature mark: used for every perk icon, consistently
- Interactive surfaces are inert at rest; the ember appears only on hover and active states
- Category colours are a functional secondary palette: 14 distinct hues, one per perk category, applied only to perk icon borders and filter pills

---

## 2. Colors: The Ember Palette

One accent. Maximum restraint. The amber earns its place precisely because it is never overused.

### Primary
- **Ember Flame** (`#e8973a`): The single accent for the entire system. Applied to active tab underlines, active sort/filter buttons (solid fill), perk titles, grade buttons in their active state, perk octagon borders (default fallback), form submit buttons, and interactive hover states. If it glows, it is this color.

### Neutral
- **The Entity's Void** (`#0a0a0a`): Page background. Near-black with a faint radial atmospheric gradient (warm ember from above; cool blue-grey from below). Never pure black.
- **Cold Ash** (`#111111`): Card and modal surfaces. One tonal step above void — just enough to read as a raised surface without a shadow.
- **Worn Parchment** (`#d4c5a9`): Primary text. Aged paper — warm enough to feel analogue, legible against ash.
- **Faded Parchment** (`#a8957e`): Secondary text. Character names, filter labels, placeholder copy, inactive interactive elements. Everything the Grimoire has partially consumed.
- **Smoldering Ash** (`#6b4318`): The ember at low burn. Used for inactive borders, dividers, and button outlines at rest. The fire is still there — barely.
- **Dried Blood** (`#8b1a1a`): Danger and destructive states only. Error text in AuthModal. Clear-build button hover. Used nowhere else.

### Secondary: Category Palette
A functional palette of 14 hues, one per perk category. Applied exclusively to perk octagon borders and category filter pill borders/fills. Never used for UI chrome. Colors are semantically motivated: adaptation (#d4a017 amber), chasing (#e05a20 orange-red), concealment (#4a5ab5 indigo), cruelty (#8b1a2a dark red), enhancement (#e8c030 gold), hinderance (#c85a18 burnt orange), navigation (#2a9d8f teal), obstruction (#8b4a2a rust), perception (#2a6eb5 blue), safeguard (#2a7a3a green), strategy (#6a3a9a purple), support (#c8a020 warm gold), trickery (#8a2a9a violet), tracking (#c87020 amber).

### Named Rules
**The One Ember Rule.** Ember Flame (`#e8973a`) appears on no more than 10% of any given screen at rest. Its rarity is the source of its meaning. Saturate the interface with it and the fire goes out.

**The Dead Colour Rule.** No colour is purely neutral. Void is not `#000000`. Ash is not `#0f0f0f`. Every dark value is the residue of something burned — slightly warm, never clean.

---

## 3. Typography: Inscriptions

**Display Font:** Cinzel (serif fallback)
**Body / Label Font:** Oswald (sans-serif fallback)

**Character:** Cinzel brings Roman lapidary inscriptions to the interface: monumental weight at large sizes, legible precision at small ones. Oswald provides the functional counterpart — condensed, high-contrast at tracked-out sizes, reading like a label pressed into metal rather than typeset. The pairing is archaic and controlled, not decorative.

All text in this system is uppercase and tracked. There is no mixed-case copy. This is a design choice, not a convention: it makes the interface read as carved rather than written.

### Hierarchy
- **Display** (Cinzel 700, clamp(2–3.5rem), line-height 1.1, letter-spacing 6px, uppercase): App title "The Bloodweb" only. Ember-coloured with a faint text glow. Used once per page.
- **Headline** (Cinzel 600, 1.1rem, line-height 1.3, letter-spacing 5px, uppercase): Primary tab labels (Perks / Build) and BuildMaker role toggle. Active state carries a faint text shadow.
- **Title** (Cinzel 600, 1rem, line-height 1.3, letter-spacing 2px, uppercase): Perk names on PerkCard. Ember-coloured. The most frequent use of Cinzel in the product.
- **Body** (Oswald 400, clamp(0.9–1.15rem), line-height 1.6–1.7): Perk descriptions. Faded Parchment color. The DBD API injects `<span>` elements for mechanical values; these render in Ember Flame, same weight. No line-length cap enforced; cards constrain width naturally.
- **Label** (Oswald 300, 0.7rem, line-height 1.4, letter-spacing 3px, uppercase): Character names, filter row labels, sort labels, button text on ghost buttons. Faded Parchment. The workhorse of the secondary layer.

### Named Rules
**The All-Caps Rule.** Every string in this interface is uppercase. No exceptions. If it renders as mixed case, it is either a bug or user-input data (email addresses) that cannot be controlled.

**The Tracking Rule.** Cinzel is never set without letter-spacing. Minimum 2px at title scale; 5–6px at display and headline scale. Cinzel without tracking reads cramped. Cinzel with tracking reads monumental.

---

## 4. Elevation: Tonal Stacking and Ember Glow

This system uses no structural grey shadows. There are no drop shadows that simulate physical lift. Depth is communicated through two mechanisms: tonal stacking and ember glow.

**Tonal stacking** operates in three layers: The Entity's Void (`#0a0a0a`) is the ground. Cold Ash (`#111111`) is the raised surface — cards, modals, picker backgrounds. The difference is subtle (luminance delta ~4%), but it is enough to read as a foreground layer without importing any notion of physical elevation.

**Ember glow** is the depth signal for interactive and active states. It does not simulate a light source; it simulates heat. A card at rest carries a faint ambient glow (`0 0 10px rgba(232, 151, 58, 0.35), 0 0 30px rgba(232, 151, 58, 0.1)`). Hover intensifies it (`0 0 18px rgba(232, 151, 58, 0.6), 0 0 50px rgba(232, 151, 58, 0.2)`). Modals carry a diffuse haze (`0 0 40px rgba(232, 151, 58, 0.15)`) — less focused, more atmospheric. Active tab labels and app titles carry text shadows in the same family.

The modal overlay uses `backdrop-filter: blur(2px)` at `rgba(0, 0, 0, 0.75)` to signal that the modal is a separate layer. This is the only blur in the system.

### Shadow Vocabulary
- **Ember Rest** (`0 0 10px rgba(232, 151, 58, 0.35), 0 0 30px rgba(232, 151, 58, 0.1)`): Default card state. Always present; never extinguished.
- **Ember Intensified** (`0 0 18px rgba(232, 151, 58, 0.6), 0 0 50px rgba(232, 151, 58, 0.2)`): Card hover. The fire responds to attention.
- **Modal Haze** (`0 0 40px rgba(232, 151, 58, 0.15)`): Diffuse glow around modal surfaces. Atmospheric, not structural.
- **Title Glow** (`text-shadow: 0 0 30px rgba(232, 151, 58, 0.4)`): App title and active tab text only. Ember as inscription, not illumination.

### Named Rules
**The No Grey Shadow Rule.** If a shadow value contains `rgba(0, 0, 0, ...)` or any greyed neutral, it does not belong in this system. Every shadow is amber. Structural grey drop shadows are forbidden; they import a physical metaphor that contradicts the tonal-plus-glow vocabulary.

**The Glow-State Rule.** Ember glows appear in response to state (hover, active, focus), never as decorative appliqué. A glow without a state trigger is ornament; ornament is prohibited.

---

## 5. Components

### Buttons

**Ghost Button** (the default control): Almost invisible at rest. Minimal border in Smoldering Ash, text in Faded Parchment. Interaction reveals Ember Flame in both border and text color simultaneously. No fill on hover. Shape: gently squared edges (4px radius), tight padding (6px 14px). The Cinzel letterform at 0.6–0.7rem with 2px tracking reads as a stamped label rather than a call to action.

- **Shape:** Squared corners (4px radius)
- **Rest:** `border: 1px solid #6b4318`, `color: #a8957e`, transparent background
- **Hover / Focus:** `border-color: #e8973a`, `color: #e8973a`, background stays transparent
- **Primary (submit) variant:** Solid ember fill (`background: #e8973a`), void text (`color: #0a0a0a`), same radius and font. Used only for form submission (AuthModal). Hover darkens to `#d4873a`.
- **Destructive variant:** Ghost button, but hover state uses Dried Blood (`#8b1a1a`) for border and text. Used on the Clear Build button.

### Grade Buttons

The A–F tier rater is the product's primary interaction. Six 32px (desktop) / 28px (mobile) square buttons. Cinzel 600 at 0.75rem, letter-spacing 1px. Outlined at rest in Smoldering Ash, Faded Parchment text. Active: solid ember fill, void text. Hover of inactive: ember border and text color.

- **Rest:** `border: 1px solid #6b4318`, `color: #a8957e`, transparent background, `border-radius: 4px`
- **Active:** `background: #e8973a`, `color: #0a0a0a`, `border-color: #e8973a`
- **Active hover (deselect signal):** `background: #6b4318`, `border-color: #6b4318`, `color: #d4c5a9`

### The Perk Octagon (Signature Component)

The system's identity mark. An 8-point polygon clip-path applied to both the background container and the image inside it:

```
polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)
```

The container carries a 3px inset used as the "border" — the container background color bleeds around the clipped image edge. Default border color is Ember Flame (`#e8973a`); when a perk has a category, the first category's color replaces it via `--category-color` CSS custom property.

Used at three sizes: 64px (BuildMaker picker), 80px (PerkCard), 100px (PerkModal), 110px (BuildMaker slot). The 4px padding variant used at 110px slot sizes.

### Cards

PerkCard is a horizontal flex container: octagon (80px) + body (perk name, character, description, grade buttons). Cold Ash background, Smoldering Ash border, 6px radius, 16px padding, 16px gap. Ember Rest glow at all times. Hover lifts `translateY(-3px)` with Ember Intensified glow and Ember Flame border.

- **Background:** `#111111`
- **Border:** `1px solid #6b4318` at rest, `#e8973a` on hover
- **Radius:** 6px
- **Padding:** 16px (12px on mobile)
- **Hover:** `transform: translateY(-3px)`, border upgrades to ember, glow intensifies
- **Cursor:** pointer (opens PerkModal on click)

### Inputs / Search Fields

Background Cold Ash, Smoldering Ash border, 4px radius. Worn Parchment text. Focus shifts border to Ember Flame — no glow, no box shadow; the border change alone signals focus. Placeholder at 60% opacity of Faded Parchment. Oswald 0.9rem, letter-spacing 1px.

- **Background:** `#111111`
- **Border:** `1px solid #6b4318` at rest
- **Focus:** `border-color: #e8973a` — border only, no glow
- **Text:** `#d4c5a9`
- **Placeholder:** `#a8957e` at 60% opacity

### Navigation Tabs

Two-tier tab system. Primary tabs (Perks / Build): Cinzel 600, 1.1rem, letter-spacing 5px, uppercase. Underline indicator pattern: `border-bottom: 2px solid` in Ember Flame when active; transparent when inactive. Bottom border on the tab bar row in Smoldering Ash acts as the rail. Active tabs carry a faint text shadow. Secondary sub-tabs (Survivor / Killer): same pattern, smaller (0.75rem, letter-spacing 3px, 1px underline). No background changes on any tab state.

- **Active indicator:** `border-bottom: 2px solid #e8973a` (primary), `border-bottom: 1px solid #e8973a` (secondary)
- **Active text:** Ember Flame with text shadow
- **Inactive / hover text:** Faded Parchment at rest, Ember Flame on hover
- **Tab rail:** `1px solid #6b4318` at bottom of tab container

### Filter Pills (Category and Rating)

Category pills: each pill carries its category's color via `--cat-color` CSS custom property. Outlined at rest (border + text in category color, transparent background). Active: solid fill, void text. Hover of inactive: 20% tint of category color as background.

Rating pills use the same pattern with grade-specific colors (A: green → F: blood red). The "Unrated" pill uses Faded Parchment as its color role, styled in the lighter Oswald label style rather than Cinzel.

Both filter rows have a Clear button in the ghost button style (Faded Parchment, hover shifts to Worn Parchment).

### Modals

Cold Ash surface, Smoldering Ash border, 8px radius. Modal Haze glow. Blurred overlay backdrop (`rgba(0,0,0,0.75)` + `backdrop-filter: blur(2px)`). Fixed width with viewport constraints (`max-width: calc(100vw - 32px)`). Close button top-right, Faded Parchment at rest, Ember Flame on hover. Focus-trapped; Escape and click-outside close.

PerkModal: 520px wide, 36px/40px padding, scrollable body.
AuthModal: 360px wide, same padding. Uses tabbed sign-in / create-account pattern with the standard tab underline component.

---

## 6. Do's and Don'ts

### Do:
- **Do** use Ember Flame (`#e8973a`) exclusively for interactive signals: hover, active, focus, and the octagon border default. Its scarcity is its meaning.
- **Do** set all Cinzel with letter-spacing: minimum 2px at title scale, 5–6px at headline and display scale.
- **Do** use the octagon clip-path for every perk icon, at every size, consistently. It is the system's visual signature.
- **Do** apply category colors exclusively through the `--category-color` CSS custom property on perk components and filter pills. Never hardcode them into layout or chrome elements.
- **Do** use ember glows that are always amber: `rgba(232, 151, 58, ...)`. The glow vocabulary is a family; mixing in grey or blue breaks the system.
- **Do** keep all text uppercase. The All-Caps Rule is absolute.
- **Do** keep the tonal stacking strict: void → ash → modal. Don't introduce intermediate surfaces.
- **Do** use `backdrop-filter: blur(2px)` on modal overlays. It is the only blur in the system; use it only for modal layering.

### Don't:
- **Don't** use standard React component-library defaults (Material UI, Ant Design aesthetics). Every control should feel inscribed, not templated.
- **Don't** design with gamer-generic visual density: crowded grids, coloured sidebars, data tables with alternating row stripes, banner ads, prominent badges. The Grimoire is a reference object, not a stream overlay.
- **Don't** use heavy texture overlays, noise filters, or faux-grunge horror effects. They are oppressive for daily use and visually dated.
- **Don't** use gradient text (`background-clip: text` + gradient). Ember titles use a solid Ember Flame color; the text glow is a `text-shadow`, not a gradient.
- **Don't** use glassmorphism or decorative blur effects outside the modal overlay. The system has one blur; that is the budget.
- **Don't** use grey shadows (`rgba(0, 0, 0, ...)` drop shadows). All shadows are ember amber. Grey shadows belong to a different physical metaphor.
- **Don't** use `border-left` or `border-right` greater than 1px as a coloured stripe accent on cards or list items. The card border is full-perimeter.
- **Don't** add a second accent color or promote any category color to a UI role. The category palette is functional and data-bound; it cannot bleed into navigation, status indicators, or other chrome.
- **Don't** use mixed-case typography for UI text. User-entered data (email addresses) is exempt; everything else is uppercase.
- **Don't** soften the void. `#0a0a0a` is not `#1a1a2e` (dark navy), not `#1c1c1c` (charcoal), not a gradient-lightened dark mode. The ground is near-black and specific.
