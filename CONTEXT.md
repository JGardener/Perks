# The Bloodweb — Glossary

## Role
**Survivor** or **Killer**. A top-level page concept that scopes both the Perks tab and the Build tab simultaneously. Not a user account role. The Stats tab is exempt from Role — it always shows both Roles side by side.

## Grade
The A–F value assigned to a single perk by the user. Not the same as the act of assigning it — see **Rating**.

## Rating
The act of assigning a **Grade** to a perk. A perk with no Grade assigned is *unrated*.

## Build
A composition of 1–4 perks selected for play, scoped to a single **Role**. A Build is not a **Tier List** — it represents one intended loadout, not an evaluation of all perks. Empty slots are permitted (a user may be running a challenge or limited loadout); the UI warns when slots are unfilled but does not block saving. An unsaved Build exists only as a URL query string; a **Saved Build** is persisted to the database.

## Saved Build
A **Build** that has been explicitly persisted to the database with a user-assigned name. Distinct from a URL-encoded build, which is ephemeral. A Saved Build belongs to one user and is private by default.

## Tier List
All rated perks for a **Role**, grouped and sorted by **Grade**. Distinct from a **Build**: a Tier List is a full evaluation of the perk library; a Build is a 4-perk selection for play.

## Perk Grid
The card layout in the Perks tab, showing all perks for the active **Role**. Not to be confused with the **Perk Picker**.

## Perk Card
A single item in the **Perk Grid**, showing the perk icon, name, character, a truncated description, and **Grade** buttons.

## Perk Modal
The full-detail dialog opened by clicking a **Perk Card**. Shows the full untruncated description and **Grade** buttons. Its scope is limited to displaying detail — it does not surface additional metadata beyond what the card shows.

## Perk Picker
The dense icon grid in the Build tab used to select perks for a **Build**. Distinct from the **Perk Grid** in the Perks tab — smaller icons, no descriptions, no Grade buttons.

## Build Summary
The description list of the currently selected perks, shown alongside the **Perk Picker** in the Build tab.

## Controls Area
The sort and filter controls above the **Perk Grid** in the Perks tab. Contains the sort bar (always visible) and the **Filters Panel** (collapsible).

## Filters Panel
The collapsible section within the **Controls Area** containing the category filter and rating filter. Hidden by default; shown by toggling a "Filters" button. Displays a count badge when any filter is active.

## Community Grade Distribution
The aggregate **Grade** breakdown for a perk across all users of the app, computed server-side. Distinct from a user's own **Tier List**, which reflects only their personal ratings. Visible to authenticated users only.

## ExportToolbar
The row of export actions in the Build tab. The canonical location for all export operations — build-specific exports (Share URL, Copy Text, Download Build Image) and library-wide exports (**Tier List** export) both live here.
