# Product

## Register

product

## Users

Casual Dead by Daylight players who open the app between sessions to rate perks they've used and look up builds. They know the game well enough to have opinions but aren't deep in spreadsheet-level optimisation. Context: post-session, probably on a laptop or desktop, wanting a quick and satisfying way to build a personal tier list they'll actually reference.

## Product Purpose

A web tool for rating all Dead by Daylight perks (A–F) and composing 4-perk builds. Success looks like a casual player finishing a session, opening The Bloodweb, updating a handful of ratings, maybe saving a build — and closing it feeling like that was worth doing.

## Brand Personality

Bold, expressive, editorial. The interface should have strong visual opinions and feel deliberately designed — not assembled from components. The game's atmosphere is a foundation, not a ceiling; the tool can push further than the game's own UI does.

## Anti-references

- Standard React component-library defaults (Material UI, Ant Design, generic SaaS dashboard aesthetics)
- Gamer-generic sites like Mobafire or LoLalytics (crowded, low craft, treat every pixel as monetisable)
- Heavy texture overlays and faux-grunge horror aesthetics — oppressive for repeated daily use

## Design Principles

1. **Faithful but opinionated** — DBD's visual language (amber, octagons, darkness) is the starting point. Push past it rather than copying it.
2. **Designed, not assembled** — every layout choice should feel deliberate. Strong opinions over safe defaults.
3. **Speed as craft** — a casual player should be able to rate 10 perks in under a minute. Friction is a design failure.
4. **Earned complexity** — BuildMaker and filters are secondary to the rating flow. Don't let advanced features pollute the primary surface.
5. **Accessible by default** — WCAG AAA where feasible. Colour contrast, keyboard nav, and screen-reader support are not afterthoughts.

## Accessibility & Inclusion

WCAG AAA target where feasible. Known priorities: colour contrast (especially parchment-on-ash combinations), full keyboard operability, screen-reader labels on all interactive elements. Reduced-motion support already in BuildMaker; apply consistently.
