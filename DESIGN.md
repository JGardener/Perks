---
name: The Bloodweb
description: Dead by Daylight perk rating and build crafting tool
colors:
  bg: "#0b0608"
  surface: "#15090c"
  surface-raised: "#1d0d11"
  accent: "#c92f2f"
  accent-bright: "#e25555"
  accent-deep: "#7a1f1f"
  text: "#e8e3d8"
  text-dim: "#9a8f85"
  border: "#3a181c"
  border-strong: "#6e3a3f"
  fill: "#7a1f1f"
  fill-hover: "#9c2828"
typography:
  display:
    fontFamily: "Cinzel, serif"
    fontSize: "clamp(2.2rem, 6vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "6px"
  headline:
    fontFamily: "Cinzel, serif"
    fontSize: "1.15rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "4px"
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
  none: "0"
  sm: "2px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "64px"
components:
  button-ghost:
    backgroundColor: "transparent"
    borderColor: "{colors.border-strong}"
    textColor: "{colors.text-dim}"
    rounded: "{rounded.sm}"
    padding: "6px 14px"
  button-ghost-hover:
    backgroundColor: "transparent"
    borderColor: "{colors.accent}"
    textColor: "{colors.accent-bright}"
    rounded: "{rounded.sm}"
    padding: "6px 14px"
  button-primary:
    backgroundColor: "{colors.fill}"
    borderColor: "{colors.accent}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "12px"
  button-primary-hover:
    backgroundColor: "{colors.fill-hover}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "12px"
  grade-button:
    backgroundColor: "transparent"
    borderColor: "{colors.border-strong}"
    textColor: "{colors.text-dim}"
    rounded: "4px"
    size: "32px"
  grade-button-active:
    backgroundColor: "{colors.fill}"
    borderColor: "{colors.accent}"
    textColor: "{colors.text}"
    rounded: "4px"
    size: "32px"
  input:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border-strong}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.none}"
    padding: "16px"
---

# Design System: The Bloodweb

## 1. Overview

**Creative North Star: "The Web Itself"**

The first system ("The Grimoire", ember amber on void) was a well-executed version of the obvious answer — CRITIQUE.md called amber-on-near-black "the first training-data answer" for a DBD tool. This system replaces it by leaning into the product's own name: the Bloodweb, the in-game progression web of nodes, veins, and arterial red. The interface is no longer a book about the game; it is a surface of the web — clotted blacks, dried-blood panels, red nodes that breathe.

The user opens this post-session, in a dim room. The ground is near-black with a red undertone (`#0b0608` — clotted, not neutral). Surfaces are dried blood (`#15090c`). The single accent is arterial red, used at two intensities: `#c92f2f` for fills, glows, and large marks; `#e25555` wherever red must carry small text (it holds ≥4.5:1 on the ground). Text is bone (`#e8e3d8`) and ash (`#9a8f85`).

The system explicitly rejects: gamer-generic density; heavy texture overlays and faux-grunge horror; component-library defaults; and the amber-gothic cliché it replaces.

**Key characteristics:**
- Near-black red-toned ground; no neutral charcoal, no navy
- One accent — arterial red — in two contrast-safe intensities; its scarcity is the point
- Sharp geometry: 0-radius panels, 2px chips, corner-cut (clip-path) feature panels; nothing pill-shaped
- The octagon clip-path remains the signature mark for every perk icon at every size
- The site is quietly alive: web nodes pulse, fog drifts, the primary CTA breathes — all transform/opacity, all killed by `prefers-reduced-motion`
- Category colours remain a functional, data-bound secondary palette (octagon borders + filter pills only)

## 2. Colors: The Bloodweb Palette

### Core
- **Clotted Black** (`#0b0608`): page ground. Never pure black, never neutral — the dark has blood in it.
- **Dried Blood** (`#15090c`): cards, panels, modals. One tonal step up.
- **Raised Clot** (`#1d0d11`): hover/raised surfaces, empty slots.
- **Arterial Red** (`#c92f2f`): the accent. Fills, glows, octagon edges, large marks. ~3.5:1 on ground — never used for small text.
- **Bright Vein** (`#e25555`): the accent's small-text form — titles, hover text, focus rings, links. ≥4.5:1 on ground and surface.
- **Deep Vein** (`#7a1f1f`): decorative web strokes; also the solid **fill** for primary buttons and active states (bone text on it reads ≈8:1).
- **Bone** (`#e8e3d8`): primary text (≈15:1).
- **Ash** (`#9a8f85`): secondary text (≈6:1).
- **Hairline** (`#3a181c`): decorative borders. **Strong border** (`#6e3a3f`): interactive component boundaries (≥3:1 non-text).

### Named Rules
**The Two Reds Rule.** `accent` (#c92f2f) is for shapes; `accent-bright` (#e25555) is for words. If red text is under ~18px, it must be the bright form.

**The Bone-on-Fill Rule.** Solid buttons and active states fill with Deep Vein (`--bw-fill`) and carry Bone text — never dark text on bright red (it fails AA at UI sizes). Hover steps the fill to `#9c2828`.

**The Dead Colour Rule** (kept from the Grimoire): no dark value is neutral. Every black is the residue of something bled.

### Category palette
14 hues, one per perk category, applied only to perk octagon borders and filter pills via `--category-color`/`--cat-color`. Every value is tuned to hold ≥3:1 on surface as a border and ≥4.5:1 under near-black text as an active pill fill (see `src/utils/categoryColors.ts`). Grade colours (`src/utils/gradeColors.ts`) follow the same constraint; F is `#d75550`, not the old 2:1 dried blood.

## 3. Typography: Inscriptions (unchanged in spirit)

Cinzel (headings) + Oswald (labels/body). All UI text uppercase and tracked: Cinzel never without letter-spacing (2px at title scale, 4–6px display/headline). User data and perk descriptions are exempt from the All-Caps Rule.

Type scale tokens (`--text-xs` 0.7rem → `--text-display` clamp(2.2rem, 6vw, 4rem)) replace the old 18 ad-hoc sizes. Root font-size stays 106.25% (17px).

## 4. Shape & Elevation

**Sharp by design.** Panels and cards are 0-radius; chips and small buttons 2px. Feature panels (landing cards) use the corner-cut octagonal clip (`cut-panel` mixin in `src/styles/_mixins.scss`) — because `clip-path` clips borders and shadows, the mixin builds the border from stacked pseudo-layers and leaves glows on the unclipped host.

**No grey shadows.** Depth = tonal stacking (bg → surface → raised) + red glow. Glow tokens: `--glow-accent` (rest), `--glow-accent-hover`, `--glow-modal`. The modal overlay's `backdrop-filter: blur(2px)` remains the only chrome blur; the ambient fog layers (below) are the only other blur and are decorative.

**Z-index scale**: `--z-nav` 40 → `--z-drawer` 90/91 → `--z-modal` 100/101 → `--z-modal-top` 110 → `--z-flight` 120 → `--z-toast` 130. No raw z-index values.

## 5. Motion: The Web Is Alive

Vocabulary lives in `src/styles/motion.scss`; durations in tokens (`--motion-fast` 120ms, `--motion-base` 200ms, `--motion-slow` 400ms, `--motion-ambient` 75s). Easing is `--ease-out` (`cubic-bezier(0.22, 1, 0.36, 1)`) — **no overshoot/spring easings**.

- **Ambient** (the only decoration allowed to move at rest): `fog-drift` on two huge blurred radial layers, `node-pulse` on bloodweb SVG nodes (BloodwebBackdrop), `breath-glow` on exactly one primary CTA per page. Transform/opacity only.
- **Micro**: hover lifts (translateY −2/−3px), border/colour transitions at `--motion-fast`, staggered `rise-in` grid entrances (delay capped), `flicker-in` randomise reveal.
- **Reduced motion**: a global kill-switch in `global.scss` neutralises every CSS animation/transition. Web Animations API calls (FLIP fly, slot land) carry their own `matchMedia` guards — CSS can't reach them.

**The One Breath Rule.** At most one breathing/pulsing CTA per view. Ambience is an undertone, not a light show.

## 6. Accessibility Commitments

- AA minimum everywhere; AAA where feasible (PRODUCT.md).
- Global `:focus-visible` ring (`--focus-ring-color`, 2px, offset 2px) — no component opts out.
- Touch targets: `touch-target` mixin — 24px minimum always, 44px under `pointer: coarse`.
- Every page sets `document.title` (usePageTitle); AppShell has a skip link and moves focus to `<main>` on route change.
- Decorative layers (BloodwebBackdrop, ghost boards) are `aria-hidden` with `pointer-events: none`.
- Randomise results are announced via `aria-live`; status lines use `role="status"`.

## 7. Do's and Don'ts

### Do
- Use `--bw-*` tokens for every colour; raw hexes belong only in `variables.scss`, `gradeColors.ts`, `categoryColors.ts`, `exportCanvas.ts` (canvas mirrors the tokens — keep in sync).
- Keep the octagon clip-path for every perk icon at every size.
- Use `--bw-fill` + bone text for any solid/active control.
- Route all spacing through `--space-*`, sizes through `--text-*`, layers through `--z-*`.

### Don't
- Don't reintroduce amber (`#e8973a`-family) anywhere — the export canvas, grade C gold (`#d9b13b`), and category golds are the only warm values left, and they are data colours.
- Don't put dark text on `--bw-accent` fills, or `--bw-accent` small text on dark grounds.
- Don't add grey/black drop shadows, pill radii, gradient text, glassmorphism, or texture overlays.
- Don't animate anything ambient beyond the budget above, and never without the reduced-motion path.
- Don't promote a category or grade colour to a chrome role.
