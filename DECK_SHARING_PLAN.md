# Deck Sharing Feature Plan

## Progress

-   [x] Phase 1: Deck Schema Changes
-   [x] Phase 2: CommunityLeaderboard Model
-   [x] Phase 3: Visibility Change API
-   [ ] Phase 4: Deck Preview API
-   [ ] Phase 5: Community Search API
-   [ ] Phase 6: Leaderboard API
-   [ ] Phase 7: Deck Import API
-   [ ] Phase 8: Redux Actions & Types
-   [ ] Phase 9: VisibilityModal Component
-   [ ] Phase 10: DeckPreviewScreen
-   [ ] Phase 11: CommunityScreen
-   [ ] Phase 12: Navigation & Routing
-   [ ] Phase 13: Integration Testing

---

## Phase 1: Deck Schema Changes

**Goal:** Add visibility and import tracking fields to the Deck model.

**Tasks:**

1. Update `packages/MemoryFlashCore/src/types/Deck.ts` - add `visibility` and `importedFromDeckId` fields to the type
2. Update `apps/server/src/models/Deck.ts` - add fields to Mongoose schema with defaults
3. Create database migration or ensure backward compatibility (existing decks default to `private`)

**Files to modify:**

-   `packages/MemoryFlashCore/src/types/Deck.ts`
-   `apps/server/src/models/Deck.ts`

**Acceptance criteria:**

-   Deck type includes `visibility: 'private' | 'unlisted' | 'public'`
-   Deck type includes `importedFromDeckId?: string`
-   Schema defaults `visibility` to `'private'`
-   Existing tests pass

---

## Phase 2: CommunityLeaderboard Model

**Goal:** Create a cached leaderboard model that tracks top decks by attempt count.

**Tasks:**

1. Create `apps/server/src/models/CommunityLeaderboard.ts` with schema
2. Update `apps/server/src/models/Attempt.ts` post-save hook to update leaderboard
3. Add type definition if needed

**New files:**

-   `apps/server/src/models/CommunityLeaderboard.ts`

**Files to modify:**

-   `apps/server/src/models/Attempt.ts`

**Schema:**

```typescript
{
  entries: [{ deckId: ObjectId, attemptCount: number }], // sorted desc
  updatedAt: Date
}
```

**Acceptance criteria:**

-   CommunityLeaderboard model exists and can be queried
-   When an Attempt is saved, the leaderboard updates for that deck
-   Only public decks appear in leaderboard

---

## Phase 3: Visibility Change API

**Goal:** Allow deck owners to change their deck's visibility.

**Tasks:**

1. Create `PATCH /api/decks/:id/visibility` endpoint
2. Validate user owns the deck
3. Validate visibility value is valid enum

**Files to modify:**

-   `apps/server/src/routes/decks.ts` (or create new route file)

**Request:** `{ visibility: 'private' | 'unlisted' | 'public' }`

**Acceptance criteria:**

-   Only deck owner can change visibility
-   Returns 404 if not owner or deck not found
-   Successfully updates deck visibility

---

## Phase 4: Deck Preview API

**Goal:** Allow anyone to preview non-private decks.

**Tasks:**

1. Create `GET /api/decks/:id/preview` endpoint
2. No auth required for public/unlisted decks
3. Return 404 for private decks (don't leak existence)
4. Populate course name and card count

**Files to modify:**

-   `apps/server/src/routes/decks.ts`

**Response:**

```typescript
{
  deck: { id, name, visibility, cardCount },
  course: { id, name },
  canImport: boolean
}
```

**Acceptance criteria:**

-   Public and unlisted decks return preview data
-   Private decks return 404
-   Card count is accurate
-   Course info is populated

---

## Phase 5: Community Search API

**Goal:** Allow searching public decks by name.

**Tasks:**

1. Create `GET /api/community/decks?q=<search>` endpoint
2. Search only public decks (not unlisted)
3. Case-insensitive substring match on deck name
4. Paginate results

**New files:**

-   `apps/server/src/routes/community.ts`

**Acceptance criteria:**

-   Only public decks appear in search results
-   Search is case-insensitive
-   Returns deck info with course name
-   Pagination works correctly

---

## Phase 6: Leaderboard API

**Goal:** Return top decks by attempt count.

**Tasks:**

1. Create `GET /api/community/leaderboard` endpoint
2. Read from CommunityLeaderboard cache
3. Populate deck and course details
4. Limit to top N entries (e.g., 20)

**Files to modify:**

-   `apps/server/src/routes/community.ts`

**Acceptance criteria:**

-   Returns cached leaderboard data
-   Deck and course details are populated
-   Results are sorted by attempt count descending

---

## Phase 7: Deck Import API

**Goal:** Allow users to copy a shared deck to their library.

**Tasks:**

1. Create `POST /api/decks/:id/import` endpoint
2. Requires authentication
3. Copy deck and all cards to user's library
4. Create or reuse "Imported Decks" course
5. Set `importedFromDeckId` on new deck

**Files to modify:**

-   `apps/server/src/routes/decks.ts`

**Acceptance criteria:**

-   Auth required (401 if not logged in)
-   Cannot import private decks (404)
-   Creates new deck with all cards copied
-   Sets `importedFromDeckId` correctly
-   Creates/reuses "Imported Decks" course
-   Unit test for `importDeck` service function

---

## Phase 8: Redux Actions & Types

**Goal:** Add frontend state management for new features.

**Tasks:**

1. Add API functions for all new endpoints
2. Add Redux actions/thunks for:
    - Changing deck visibility
    - Fetching deck preview
    - Searching community decks
    - Fetching leaderboard
    - Importing a deck
3. Add relevant state slices if needed

**Files to modify:**

-   `apps/react/src/utils/api.ts` (or similar)
-   Redux slice files

**Acceptance criteria:**

-   All new API endpoints have corresponding frontend functions
-   Loading/error states handled appropriately

---

## Phase 9: VisibilityModal Component

**Goal:** UI for changing deck visibility.

**Tasks:**

1. Create `VisibilityModal` component
2. Radio buttons for Private / Unlisted / Public
3. Explanation text for each option
4. Save button calls visibility API
5. Integrate into deck options menu

**New files:**

-   `apps/react/src/components/VisibilityModal.tsx`

**Files to modify:**

-   Deck options menu component

**Acceptance criteria:**

-   Modal displays current visibility
-   User can select new visibility
-   Save updates deck and closes modal
-   Loading state while saving

---

## Phase 10: DeckPreviewScreen

**Goal:** Shareable page showing deck details with import option.

**Tasks:**

1. Create `DeckPreviewScreen` component
2. Display deck name, course, card count
3. "Import to My Library" button
4. Handle logged-out state (prompt to login)
5. Handle deck not found state

**New files:**

-   `apps/react/src/screens/DeckPreviewScreen.tsx`

**Acceptance criteria:**

-   Shows deck details for valid preview URL
-   Import button works for logged-in users
-   Prompts login for logged-out users
-   Shows error for invalid/private decks

---

## Phase 11: CommunityScreen

**Goal:** Browse and search public decks.

**Tasks:**

1. Create `CommunityScreen` component
2. Search input with debounced search
3. Leaderboard section showing top decks
4. Search results list
5. Click deck to go to preview

**New files:**

-   `apps/react/src/screens/CommunityScreen.tsx`

**Acceptance criteria:**

-   Search input filters public decks
-   Leaderboard displays on page load
-   Clicking a deck navigates to preview
-   Empty states for no results

---

## Phase 12: Navigation & Routing

**Goal:** Wire up new screens to the app.

**Tasks:**

1. Add `/community` route to App.tsx
2. Add `/deck/:deckId/preview` route to App.tsx
3. Add "Community" link to main navigation
4. Ensure routes work for logged-out users

**Files to modify:**

-   `apps/react/src/App.tsx`
-   Navigation component(s)

**Acceptance criteria:**

-   Both new routes accessible
-   Community link visible in nav
-   Preview page works without auth
-   Deep linking works correctly

---

## Phase 13: Integration Testing

**Goal:** End-to-end verification of the complete feature.

**Tasks:**

1. Test full flow: create deck → make public → search → preview → import
2. Test visibility rules (private/unlisted/public)
3. Test leaderboard updates
4. Test edge cases (unauthorized, not found, etc.)
5. Run `yarn test:codex` to ensure all tests pass

**Acceptance criteria:**

-   All visibility rules enforced correctly
-   Import creates proper copy with tracking
-   Leaderboard updates on new attempts
-   All existing tests still pass

---

## Reference: Visibility Rules

| Visibility | Appears in Search | Accessible via Link | Can Import |
| ---------- | ----------------- | ------------------- | ---------- |
| `private`  | ❌                | ❌                  | ❌         |
| `unlisted` | ❌                | ✅                  | ✅         |
| `public`   | ✅                | ✅                  | ✅         |

## Reference: Shareable Link Format

```
https://memoryflash.app/deck/<deckId>/preview
```

Works for `unlisted` and `public` decks. User can copy this link to share with others (e.g., via email).
