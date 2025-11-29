# Deck & Course Sharing Feature Plan

## Progress

-   [x] Phase 1: Deck Schema Changes
-   [x] Phase 2: CommunityLeaderboard Model
-   [x] Phase 3: Deck Visibility Change API
-   [x] Phase 4: Deck Preview API
-   [x] Phase 5: Community Search API (Decks)
-   [ ] Phase 6: Course Schema Changes
-   [ ] Phase 7: Course Visibility & Preview APIs
-   [ ] Phase 8: Community Search API (Courses)
-   [ ] Phase 9: Leaderboard API
-   [ ] Phase 10: Deck Import API
-   [ ] Phase 11: Course Import API
-   [ ] Phase 12: Redux Actions & Types
-   [ ] Phase 13: VisibilityModal Component
-   [ ] Phase 14: DeckPreviewScreen
-   [ ] Phase 15: CoursePreviewScreen
-   [ ] Phase 16: CommunityScreen
-   [ ] Phase 17: Navigation & Routing
-   [ ] Phase 18: Integration Testing

---

## Phase 1: Deck Schema Changes ✅

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

## Phase 2: CommunityLeaderboard Model ✅

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
-   When an Attempt is saved, the leaderboard increments for that deck
-   Only public decks appear in leaderboard

---

## Phase 3: Deck Visibility Change API ✅

**Goal:** Allow deck owners to change their deck's visibility.

**Tasks:**

1. Create `PATCH /api/decks/:id/visibility` endpoint
2. Validate user owns the deck

**Files to modify:**

-   `apps/server/src/routes/decksRouter.ts`

**Request:** `{ visibility: 'private' | 'unlisted' | 'public' }`

**Acceptance criteria:**

-   Only deck owner can change visibility
-   Returns 404 if not owner or deck not found
-   Successfully updates deck visibility

---

## Phase 4: Deck Preview API ✅

**Goal:** Allow anyone to preview non-private decks.

**Tasks:**

1. Create `GET /api/decks/:id/preview` endpoint
2. No auth required for public/unlisted decks
3. Return 404 for private decks (don't leak existence)
4. Populate course name and card count

**Files to modify:**

-   `apps/server/src/routes/decksRouter.ts`

**Response:**

```typescript
{
  deck: { _id, name, visibility, cardCount },
  course: { _id, name }
}
```

**Acceptance criteria:**

-   Public and unlisted decks return preview data
-   Private decks return 404
-   Card count is accurate
-   Course info is populated

---

## Phase 5: Community Search API (Decks) ✅

**Goal:** Allow searching public decks by name.

**Tasks:**

1. Create `GET /api/community/decks?q=<search>` endpoint
2. Search only public decks (not unlisted)
3. Case-insensitive substring match on deck name
4. Paginate results

**New files:**

-   `apps/server/src/routes/communityRouter.ts`

**Acceptance criteria:**

-   Only public decks appear in search results
-   Search is case-insensitive
-   Returns deck info with course name
-   Pagination works correctly

---

## Phase 6: Course Schema Changes

**Goal:** Add visibility and import tracking fields to the Course model.

**Tasks:**

1. Update `packages/MemoryFlashCore/src/types/Course.ts` - add `visibility` and `importedFromCourseId` fields
2. Update `apps/server/src/models/Course.ts` - add fields to Mongoose schema with defaults

**Files to modify:**

-   `packages/MemoryFlashCore/src/types/Course.ts`
-   `apps/server/src/models/Course.ts`

**Acceptance criteria:**

-   Course type includes `visibility?: 'private' | 'unlisted' | 'public'`
-   Course type includes `importedFromCourseId?: string`
-   Schema defaults `visibility` to `'private'`
-   Existing tests pass

---

## Phase 7: Course Visibility & Preview APIs

**Goal:** Allow course owners to change visibility and anyone to preview non-private courses.

**Tasks:**

1. Create `PATCH /api/courses/:id/visibility` endpoint
2. Create `GET /api/courses/:id/preview` endpoint (no auth for public/unlisted)
3. Return deck count and total card count in preview

**Files to modify:**

-   `apps/server/src/routes/coursesRouter.ts`
-   `apps/server/src/services/courseService.ts` (if exists, or create)

**Preview Response:**

```typescript
{
  course: { _id, name, visibility, deckCount, totalCardCount },
  decks: [{ _id, name, cardCount }]
}
```

**Acceptance criteria:**

-   Only course owner can change visibility
-   Public and unlisted courses return preview data with deck list
-   Private courses return 404

---

## Phase 8: Community Search API (Courses)

**Goal:** Allow searching public courses by name.

**Tasks:**

1. Add `GET /api/community/courses?q=<search>` endpoint
2. Search only public courses (not unlisted)
3. Return course info with deck count

**Files to modify:**

-   `apps/server/src/routes/communityRouter.ts`

**Acceptance criteria:**

-   Only public courses appear in search results
-   Returns course info with deck count
-   Pagination works correctly

---

## Phase 9: Leaderboard API

**Goal:** Return top decks by attempt count.

**Tasks:**

1. Create `GET /api/community/leaderboard` endpoint
2. Read from CommunityLeaderboard cache
3. Populate deck and course details
4. Limit to top N entries (e.g., 20)

**Files to modify:**

-   `apps/server/src/routes/communityRouter.ts`

**Acceptance criteria:**

-   Returns cached leaderboard data
-   Deck and course details are populated
-   Results are sorted by attempt count descending

---

## Phase 10: Deck Import API

**Goal:** Allow users to copy a shared deck to their library.

**Tasks:**

1. Create `POST /api/decks/:id/import` endpoint
2. Requires authentication
3. Copy deck and all cards to user's library
4. Create or reuse "Imported Decks" course for the user
5. Set `importedFromDeckId` on new deck

**Files to modify:**

-   `apps/server/src/routes/decksRouter.ts`
-   `apps/server/src/services/deckService.ts`

**Acceptance criteria:**

-   Auth required (401 if not logged in)
-   Cannot import private decks (404)
-   Creates new deck with all cards copied
-   Sets `importedFromDeckId` correctly
-   Creates/reuses "Imported Decks" course
-   Unit test for `importDeck` service function

---

## Phase 11: Course Import API

**Goal:** Allow users to copy an entire shared course to their library.

**Tasks:**

1. Create `POST /api/courses/:id/import` endpoint
2. Requires authentication
3. Copy course, all decks, and all cards to user's library
4. Set `importedFromCourseId` on new course
5. Set `importedFromDeckId` on each new deck

**Files to modify:**

-   `apps/server/src/routes/coursesRouter.ts`
-   `apps/server/src/services/courseService.ts`

**Acceptance criteria:**

-   Auth required (401 if not logged in)
-   Cannot import private courses (404)
-   Creates new course with all decks and cards copied
-   Sets import tracking fields correctly
-   Unit test for `importCourse` service function

---

## Phase 12: Redux Actions & Types

**Goal:** Add frontend state management for new features.

**Tasks:**

1. Add API functions for all new endpoints
2. Add Redux actions/thunks for:
    - Changing deck/course visibility
    - Fetching deck/course preview
    - Searching community decks/courses
    - Fetching leaderboard
    - Importing a deck/course
3. Add relevant state slices if needed

**Files to modify:**

-   `apps/react/src/utils/api.ts` (or similar)
-   Redux slice files

**Acceptance criteria:**

-   All new API endpoints have corresponding frontend functions
-   Loading/error states handled appropriately

---

## Phase 13: VisibilityModal Component

**Goal:** UI for changing deck or course visibility.

**Tasks:**

1. Create `VisibilityModal` component (reusable for both deck and course)
2. Radio buttons for Private / Unlisted / Public
3. Explanation text for each option
4. Save button calls appropriate visibility API
5. Integrate into deck and course options menus

**New files:**

-   `apps/react/src/components/VisibilityModal.tsx`

**Files to modify:**

-   Deck options menu component
-   Course options menu component (if exists)

**Acceptance criteria:**

-   Modal displays current visibility
-   User can select new visibility
-   Save updates deck/course and closes modal
-   Loading state while saving

---

## Phase 14: DeckPreviewScreen

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

## Phase 15: CoursePreviewScreen

**Goal:** Shareable page showing course details with import option.

**Tasks:**

1. Create `CoursePreviewScreen` component
2. Display course name, deck list with card counts
3. "Import Entire Course" button
4. Handle logged-out state (prompt to login)
5. Handle course not found state

**New files:**

-   `apps/react/src/screens/CoursePreviewScreen.tsx`

**Acceptance criteria:**

-   Shows course details and deck list for valid preview URL
-   Import button works for logged-in users
-   Prompts login for logged-out users
-   Shows error for invalid/private courses

---

## Phase 16: CommunityScreen

**Goal:** Browse and search public decks and courses.

**Tasks:**

1. Create `CommunityScreen` component
2. Tabs or toggle for Decks vs Courses
3. Search input with debounced search
4. Leaderboard section showing top decks
5. Search results list
6. Click item to go to preview

**New files:**

-   `apps/react/src/screens/CommunityScreen.tsx`

**Acceptance criteria:**

-   Can switch between deck and course search
-   Search input filters public items
-   Leaderboard displays on page load
-   Clicking an item navigates to preview
-   Empty states for no results

---

## Phase 17: Navigation & Routing

**Goal:** Wire up new screens to the app.

**Tasks:**

1. Add `/community` route to App.tsx
2. Add `/deck/:deckId/preview` route to App.tsx
3. Add `/course/:courseId/preview` route to App.tsx
4. Add "Community" link to main navigation
5. Ensure routes work for logged-out users

**Files to modify:**

-   `apps/react/src/App.tsx`
-   Navigation component(s)

**Acceptance criteria:**

-   All new routes accessible
-   Community link visible in nav
-   Preview pages work without auth
-   Deep linking works correctly

---

## Phase 18: Integration Testing

**Goal:** End-to-end verification of the complete feature.

**Tasks:**

1. Test full deck flow: create deck → make public → search → preview → import
2. Test full course flow: create course → make public → search → preview → import
3. Test visibility rules (private/unlisted/public)
4. Test leaderboard updates
5. Test edge cases (unauthorized, not found, etc.)
6. Run `yarn test:codex` to ensure all tests pass

**Acceptance criteria:**

-   All visibility rules enforced correctly for both decks and courses
-   Import creates proper copies with tracking
-   Leaderboard updates on new attempts
-   All existing tests still pass

---

## Reference: Visibility Rules

| Visibility | Appears in Search | Accessible via Link | Can Import |
| ---------- | ----------------- | ------------------- | ---------- |
| `private`  | ❌                | ❌                  | ❌         |
| `unlisted` | ❌                | ✅                  | ✅         |
| `public`   | ✅                | ✅                  | ✅         |

## Reference: Shareable Link Formats

**Deck:**

```
https://memoryflash.app/deck/<deckId>/preview
```

**Course:**

```
https://memoryflash.app/course/<courseId>/preview
```

Works for `unlisted` and `public` items. User can copy this link to share with others (e.g., via email).
