## Problem Statement

Users can compose builds in the Build tab, but there is no way to name, save, or reload them — closing the tab or navigating away loses the work. Authenticated users also have no visibility into how the broader community rates perks; the Stats tab shows only their own grade distribution.

## Solution

Surface the existing `useBuilds` hook in the Build tab with a save modal and a browsable "Your Builds" section. Surface the existing `useCommunityGrades` hook in the Stats tab as a "Community's top picks" perk icon row per role.

## User Stories

1. As an authenticated user, I want to save my current build with a name, so that I can return to it later without rebuilding from scratch.
2. As an authenticated user, I want to be warned when I try to save a build with empty slots, so that I don't accidentally save an incomplete build without realising it.
3. As an authenticated user, I want to save a build with fewer than 4 perks, so that I can record loadouts for challenges or limited-perk runs.
4. As an authenticated user, I want to see all my saved builds for the current role in one place, so that I can browse and manage my library.
5. As an authenticated user, I want to load a saved build into the composer, so that I can resume working on it or use it as a starting point.
6. As an authenticated user, I want to be asked to confirm before loading a saved build when my current build has perks in it, so that I don't accidentally lose work in progress.
7. As an authenticated user, I want to delete a saved build, so that I can keep my library tidy.
8. As an authenticated user, I want to confirm before deleting a saved build, so that I don't lose it by accident.
9. As an authenticated user switching roles, I want the "Your Builds" section to show only builds for the active role, so that survivor and killer libraries don't mix.
10. As an authenticated user with no saved builds for the active role, I want to see an empty state message, so that I understand the feature exists and how to use it.
11. As an unauthenticated user, I want to see the Save button, so that I know saving is possible.
12. As an unauthenticated user, I want clicking Save to prompt me to sign in, so that I understand why saving isn't available yet.
13. As an unauthenticated user, I want the "Your Builds" section to show a sign-in prompt, so that I know my saved builds are waiting for me behind authentication.
14. As an authenticated user, I want to see which perks the community rates most highly for each role, so that I can discover strong perks I may have overlooked.
15. As an authenticated user, I want community top picks to be shown per role (Survivor and Killer separately), so that I can compare community opinions in the context of each role.
16. As an unauthenticated user, I want the community top picks section to be hidden, so that I have a clear incentive to sign in.
17. As a keyboard user, I want to dismiss the save modal with Escape or a visible close button, so that I can exit without reaching for the mouse.
18. As a keyboard user, I want to dismiss the delete confirmation with Escape or a visible cancel button, so that I can safely back out of a destructive action.
19. As any user, I want the save modal to be inaccessible to screen readers when closed, so that modal content does not bleed into the page reading order.

## Implementation Decisions

### Hook instantiation
`useBuilds` and `useCommunityGrades` are instantiated in `PerkList` alongside the existing data hooks (`usePerks`, `useCharacters`, `useRatings`). `PerkList` calls `useAuth` to obtain `userId` and passes it to both hooks. `App` remains a layout shell.

### Partial builds permitted (ADR-0005)
A Build is 1-4 perks. The Save button is enabled when at least one slot contains a perk. The save modal displays a warning ("Some slots are empty") when any slot is null but does not prevent saving. All code reading saved builds must treat `perks[i]` as `string | null` — no assumption of non-null.

### Save modal
- Triggered by a Save button in the left panel of the Build tab, visible when at least one slot is filled
- Contains a name text input (no description field — schema has no description column)
- Dismissed via Escape key or a visible close button only — no click-outside dismissal
- Calls `saveBuild(name, role, slots, false)` — `isPublic` is always `false`, no toggle exposed
- On success, closes and the new build appears at the top of "Your Builds"

### Auth gating
- Save button is visible to unauthenticated users; clicking it calls `openAuthModal("Sign in to save builds")` via the existing `AuthModalContext`
- "Your Builds" section renders for unauthenticated users with a sign-in prompt in place of the build list

### "Your Builds" section
- Full-width section below the BuildMaker composer
- Filtered to the active role — switching the role toggle changes which builds are shown
- Empty state for authenticated users with no saved builds for the active role: "No saved builds yet. Build something and hit Save."
- Each saved build shows: name, perk icon strip (null slots shown as empty octagon placeholders), Load button, Delete button

### Load interaction
- If all slots are empty: loads immediately, no confirmation
- If any slot is occupied: shows a confirmation prompt ("Replace build in progress?") before loading

### Delete interaction
- Each saved build has a Delete button
- Clicking it opens a confirmation modal: "Delete [build name]?" with Confirm and Cancel
- On confirm, calls `deleteBuild(id)` and removes the card from the list

### Community top picks
- Rendered in the Stats tab as a "Community's top picks" perk icon row beneath each role's personal stats section
- Uses the existing `TopPerks` component
- Visible to authenticated users only; hidden for unauthenticated users
- Derived from `useCommunityGrades` data via a new pure utility function `getCommunityTopPerks(grades, perks, role)`:
  - Filters `CommunityGrade[]` to the given role's perks
  - For each perk, finds its A-vote count
  - Returns perks sorted by A-vote count descending, all perks with at least one A-vote included
  - No minimum vote threshold

### New components
- `SaveBuildModal` — save modal (name input, empty-slot warning, Escape/close to dismiss)
- `DeleteBuildModal` — delete confirmation dialog
- `SavedBuildCard` — single saved build row with load/delete affordances
- `SavedBuilds` — full-width section managing the build list, empty state, and anon prompt

### Modified components
- `BuildMaker` — gains Save button; wires `SaveBuildModal`; receives save callback and auth state
- `PerkList` — instantiates `useAuth`, `useBuilds`, `useCommunityGrades`; passes data to `BuildMaker` and `StatsView`
- `StatsView` — receives `communityGrades: CommunityGrade[]`; renders "Community's top picks" per role using `getCommunityTopPerks`

## Testing Decisions

Good tests assert external behavior — what the user sees and what functions return — not implementation details like internal state shape or which sub-functions were called.

### `getCommunityTopPerks` (pure utility function)
The highest-value test target: a pure function with no dependencies, clear inputs, and a deterministic output. Test cases should cover:
- Returns perks sorted by A-vote count descending
- Excludes perks with zero A-votes
- Filters correctly by role (no cross-role contamination)
- Handles empty `grades` input gracefully
- Handles a perk present in `perks` but absent from `grades`

Prior art: the existing `buildRoleStat` function in `StatsView` follows the same pure-function shape, though it is not currently tested in isolation.

### `SaveBuildModal` (component)
Test the interaction surface:
- Save button is disabled when the name input is empty
- Warning message is shown when slots contain nulls, hidden when all 4 are filled
- Escape key closes the modal
- Clicking the close button closes the modal
- Submitting a valid name calls the save callback with that name
- Clicking outside the modal does NOT close it

Prior art: `AuthModal.test.tsx` tests a modal's focus trap, Escape handling, and error/success states using `@testing-library/react` with `fireEvent` and `userEvent`.

### `PerkList` (existing test update)
The existing `PerkList.test.tsx` mocks `usePerks`, `useCharacters`, `useRatings`, and `useToast`. It will need to additionally mock `useAuth`, `useBuilds`, and `useCommunityGrades` to prevent unhandled Supabase calls in the test environment.

## Out of Scope

- Public builds and community build browsing — the `is_public` column exists in the schema but is always `false` from the UI; no public build discovery surface exists yet
- Build editing — saved builds are load-or-delete only; in-place rename or slot modification is not included
- Random build generator — mentioned in project next steps but is a separate feature
- Description field on builds — the schema has no description column; adding one would require a migration
- Vote thresholds for community top picks — no minimum vote count is enforced; this can be revisited when the user base grows

## Further Notes

- ADR-0005 (`docs/adr/0005-partial-builds-permitted.md`) documents the decision to allow 1-4 perk builds and the invariant that all consumers must treat perk slots as nullable.
- The `validate-build` Edge Function already accepts null slots — no server-side changes are required.
- The `perk_community_grades` view is auth-gated (no anon access) — `useCommunityGrades` already returns an empty array for unauthenticated users, so the Stats tab renders nothing for that section without special-casing.
