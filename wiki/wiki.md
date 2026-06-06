# Wiki Reference — The Bloodweb

This document defines how to structure, write, and maintain the wiki for this project. It is the single source of truth for wiki conventions.

---

## Purpose

The wiki is a living reference for the project — its architecture, data model, feature areas, and decisions. It is intended to help anyone (including future Claude sessions) understand the project without reading all the source code.

The wiki is **not** a changelog, a task list, or a place for ephemeral notes. Those belong in git commits, `docs/superpowers/plans/`, and `docs/adr/` respectively.

The source of truth for the project is always the code and git history. The wiki is derived from them, not authoritative over them. When the wiki and the code disagree, trust the code and update the wiki.

---

## File Structure

All wiki files live under `wiki/`. Each major topic gets its own file. This file (`wiki.md`) is the conventions reference; `index.md` is the browsable table of contents.

```
wiki/
  wiki.md               ← this file (conventions + maintenance rules)
  index.md              ← browsable table of contents for all wiki pages
  log.md                ← append-only record of all wiki operations
  architecture.md       ← system overview, data flow, tech choices
  data-model.md         ← types, Supabase schema, API shape
  features/
    perks.md            ← perk list, rating, filtering, sorting
    build-maker.md      ← build composer, randomiser, constraints
    stats.md            ← stats view, charts, community grades
    auth.md             ← authentication, profiles, sign-in flow
    saved-builds.md     ← build persistence, CRUD, sharing
  hooks.md              ← all custom hooks, signatures, behaviour
  components.md         ← component catalogue, responsibilities
  styles.md             ← theme tokens, responsive breakpoints, fonts
  edge-functions.md     ← Supabase Edge Functions, validation logic
  decisions.md          ← lightweight log of design decisions not in ADRs
```

Add a new file when a topic is large enough to deserve its own page. Add it to `index.md` and append an entry to `log.md`.

---

## Page Format

Every wiki page (except `wiki.md`, `index.md`, and `log.md`) must follow this structure:

```markdown
# Page Title

**Summary**: One or two sentences describing what this page covers.

**Sources**: Files, ADRs, or other wiki pages this page draws from.

**Last updated**: YYYY-MM-DD

---

Main content. Use clear headings (`##`, `###`) and short paragraphs.

Link to related pages using [[wiki-links]] throughout the text.

## Related pages

- [[related-page-name]]
- [[another-page]]
```

### Page format rules

- **Summary** must be present and self-contained — someone skimming `index.md` should understand the page from it alone.
- **Sources** lists the specific files or ADRs the page was derived from (e.g. `src/hooks/useConstraints.ts`, `docs/adr/0006-pin-conflict-blocks-randomise.md`). If no source exists yet, write `[no source — inferred from code]`.
- **Last updated** must be an ISO date. Update it whenever the page content changes.
- **Related pages** section is mandatory. If a page genuinely has no relations, write `- none yet` rather than omitting the section.

---

## The Log

`wiki/log.md` is an append-only record of every operation performed on the wiki. Never edit or delete past entries.

Each entry follows this format:

```
[YYYY-MM-DD] | [feature or source name] | [pages created/updated]
```

Examples:

```
[2026-06-05] | initial wiki setup | wiki.md, index.md, log.md created
[2026-06-10] | useConstraints hook | hooks.md updated; features/build-maker.md updated
[2026-06-12] | ADR-0007 constraints persistence | decisions.md updated
```

Add a log entry at the end of every session in which you touch the wiki, even if the change is small.

---

## Ingest Workflow

When a feature ships or a file changes, follow these steps to keep the wiki current:

1. Identify which wiki pages are affected (use the index table and cross-references as a guide).
2. Read the relevant source files — do not write from memory.
3. Update or create the affected pages, following the page format above.
4. Update `[[wiki-links]]` in related pages to reflect any new pages.
5. Update `wiki/index.md` with new pages and revised one-line descriptions.
6. Append an entry to `wiki/log.md` with the date, feature name, and what changed.

If you are uncertain which page to update, update `decisions.md` and cross-link from there.

**Everything outside `wiki/` is immutable during ingest.** Read source files freely, but never modify them — not the code, not `CLAUDE.md`, not ADRs, not plans. All writes go to `wiki/` only.

---

## Internal Links

Use `[[page-name]]` (without the `.md` extension) to link between wiki pages:

```markdown
See [[hooks]] for the full `useConstraints` signature.
```

Use standard relative Markdown links only when linking **outside** the wiki (to ADRs, source files, or external URLs):

```markdown
Pinned slots block randomise — see [ADR-0006](../docs/adr/0006-pin-conflict-blocks-randomise.md).
```

A `[[link]]` that does not yet have a matching page is permitted — it marks a page that should be written, not an error.

---

## Writing Conventions

### Tone and length

- Write for a developer who knows React and TypeScript but is new to this codebase.
- Prefer short paragraphs and bullet lists over prose walls.
- One sentence per concept where possible.

### File naming

All wiki files must be lowercase with hyphens — no spaces, no camelCase:

```
features/build-maker.md   ✓
features/BuildMaker.md    ✗
features/build maker.md   ✗
```

### Headings

Use ATX headings (`#`, `##`, `###`). Do not skip levels. Keep headings short — they double as navigation anchors.

### Code blocks

Always specify the language for syntax highlighting:

````markdown
```tsx
const foo = () => <div />;
```
````

When referencing a specific file or symbol inline, include the path: `` `src/hooks/usePerks.ts` ``.

### Do not duplicate CLAUDE.md

`CLAUDE.md` is the authoritative machine-readable project summary used by Claude. The wiki goes deeper: explain *why*, show examples, describe edge cases. Do not copy-paste paragraphs between the two.

---

## What Belongs Where

| Information | Where it goes |
|-------------|--------------|
| Architecture overview, tech choices | `wiki/architecture.md` |
| TypeScript types, DB schema | `wiki/data-model.md` |
| How a feature works end-to-end | `wiki/features/<feature>.md` |
| Hook signature + behaviour | `wiki/hooks.md` |
| Component props + layout | `wiki/components.md` |
| Theme tokens, responsive rules | `wiki/styles.md` |
| Formal architecture decisions | `docs/adr/` (ADR format) |
| Informal design choices | `wiki/decisions.md` |
| Implementation plans | `docs/superpowers/plans/` |
| Ephemeral task tracking | Conversation context / git commits |
| Machine-readable project state | `CLAUDE.md` |

---

## Lint

When asked to lint or audit the wiki:

- Find orphan pages — wiki pages with no inbound `[[links]]` from other pages.
- Find dead links — `[[links]]` that reference a page that does not exist.
- Identify concepts mentioned in pages that lack their own page.
- Check that all pages follow the page format (Summary, Sources, Last updated, Related pages).
- Flag pages whose **Last updated** date predates the most recent relevant commit.
- Check that `index.md` has an entry for every file under `wiki/`.
- Report findings as a numbered list with suggested fixes.

---

## Maintenance Rules

1. **Log every change.** Append to `wiki/log.md` after every session that touches wiki files.
2. **No dead links.** If you rename or remove a file, update all `[[wiki-links]]` and the `index.md` entry.
3. **Dates are absolute.** Never write "recently" or "last week". Use ISO dates: `2026-05-24`.
4. **No TODOs in wiki files.** If a section is not ready, omit it. A missing section is honest; `TODO: write this` is noise.
5. **Index is the entry point.** Every file under `wiki/` must have a row in `wiki/index.md`.
6. **Code wins.** If the wiki contradicts the code, trust the code and fix the wiki — never the reverse.
