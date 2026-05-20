# ADR-0003: Tier List export lives in the Build tab ExportToolbar

## Status
Accepted

## Context
The Tier List export (a PNG of all rated perks grouped by grade) was originally a button in the Perks tab controls area, right-aligned above the perk grid and only visible once at least one perk was rated. It was easy to miss and visually disconnected from the rest of the export story.

The Build tab has an ExportToolbar with build-specific actions: Share URL, Copy Text, and Download Build Image.

## Decision
Move the Tier List export button into the ExportToolbar in the Build tab, renaming it "Export Tier List". A visual separator distinguishes the three build-scoped actions (Share URL, Copy Text, Download Build Image) from the library-scoped action (Export Tier List).

## Consequences
- All export actions live in one place, making the ExportToolbar the canonical export destination.
- The Perks tab controls area is simpler — one fewer conditional element.
- Users who never visit the Build tab will not discover the Tier List export. This is an acceptable trade-off: the Tier List is a deliberate, intentional action, not a passive discovery. Users engaged enough to rate perks are likely to explore the Build tab.
- The separator between build-scoped and library-scoped exports signals the difference in scope. This grouping is provisional and may be revisited if four buttons in one toolbar proves crowded.
