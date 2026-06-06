# Wiki Log

Append-only record of all wiki operations. Never edit or delete past entries.

Format: `[YYYY-MM-DD] | [feature or source name] | [pages created/updated]`

---

[2026-06-05] | initial ingest | wiki.md created; index.md created; log.md created; architecture.md created; data-model.md created; hooks.md created; components.md created; styles.md created; edge-functions.md created; decisions.md created; features/perks.md created; features/build-maker.md created; features/stats.md created; features/auth.md created; features/saved-builds.md created
[2026-06-05] | constraints drawer UX (filter hint + live summary) | features/build-maker.md updated (constraints table + whitelist callout); components.md updated (ConstraintsDrawer description, GhostPillStrip corrected); features/stats.md updated (GhostPillStrip corrected, communityPerks.ts added to Sources); index.md updated (log.md entry added)
[2026-06-05] | security review | decisions.md updated (dangerouslySetInnerHTML entry corrected — XSS is mitigated by DOMPurify, not accepted); components.md updated (PerkCard entry notes DOMPurify allowlist)
