# UI Component Refactoring Plan

## Overview

The codebase has many repeated Tailwind CSS patterns scattered across screens and components. This creates inconsistent UI (especially in dark mode) and violates the DRY principle. This plan introduces reusable base components and better organizes the `components` folder.

## Progress

- [ ] Phase 1: Button Variants
- [ ] Phase 2: LinkButton Component
- [ ] Phase 3: ContentCard Component
- [ ] Phase 4: ListContainer Component
- [ ] Phase 5: SearchInput Component
- [ ] Phase 6: ModalButtons Component
- [ ] Phase 7: SegmentedControl Component
- [ ] Phase 8: PageTitle Component
- [ ] Phase 9: EmptyState Component
- [ ] Phase 10: Components Folder Reorganization

As you complete each phase, check it off above to mark it as done.

---

## Phase 1: Button Variants

**Goal:** Extend the existing `Button` component to support multiple visual variants (primary, secondary, outline, danger) instead of having hardcoded button styles scattered throughout the codebase.

**Problem:** The current `Button` component only supports one style (primary blue). Many places use inline button styles:

- `ConfirmModal.tsx`: Cancel (outline) and Delete (danger) buttons with inline styles
- `InputModal.tsx`: Cancel (outline) and Save (primary) buttons with inline styles
- `VisibilityModal.tsx`: Cancel (outline) and Save (primary) buttons with inline styles
- `DeckPreviewScreen.tsx` / `CoursePreviewScreen.tsx`: "Log In" (primary) and "Sign Up" (outline) link buttons
- `DeckStatsScreen.tsx` / `AttemptHistoryScreen.tsx`: "View attempt history" / "Back to stats" outline buttons with dark mode issues

**Tasks:**

1. Add `variant` prop to `Button.tsx` with options: `'primary' | 'secondary' | 'outline' | 'danger'`
2. Add proper dark mode support to all variants
3. Update all modals to use the new `Button` variants
4. Add `size` prop: `'sm' | 'md'` for different contexts

**Files to modify:**

- `apps/react/src/components/Button.tsx`
- `apps/react/src/components/modals/ConfirmModal.tsx`
- `apps/react/src/components/modals/InputModal.tsx`
- `apps/react/src/components/modals/VisibilityModal.tsx`

**Acceptance criteria:**

- `Button` supports `variant` prop with consistent styling
- All button variants have proper dark mode support
- Modal buttons use the `Button` component instead of inline styles
- Existing tests pass

---

## Phase 2: LinkButton Component

**Goal:** Create a `LinkButton` component that renders a React Router `Link` styled like a button.

**Problem:** Multiple places style `<Link>` elements as buttons with repeated inline Tailwind classes:

- `DeckStatsScreen.tsx`: "View attempt history" link (line 78)
- `AttemptHistoryScreen.tsx`: "Back to stats" link (line 156)
- `DeckPreviewScreen.tsx`: "Log In" and "Sign Up" links (lines 113-121)
- `CoursePreviewScreen.tsx`: "Log In" and "Sign Up" links (lines 102-110)

**Tasks:**

1. Create `LinkButton.tsx` that wraps `Link` with button styling
2. Support same variants as `Button` (`primary`, `secondary`, `outline`, `danger`)
3. Include proper dark mode support (fixes the current dark mode issue)
4. Replace inline styled `Link` elements with `LinkButton`

**Files to create:**

- `apps/react/src/components/LinkButton.tsx`

**Files to modify:**

- `apps/react/src/components/index.ts`
- `apps/react/src/screens/DeckStatsScreen/DeckStatsScreen.tsx`
- `apps/react/src/screens/AttemptHistoryScreen/AttemptHistoryScreen.tsx`
- `apps/react/src/screens/DeckPreviewScreen.tsx`
- `apps/react/src/screens/CoursePreviewScreen.tsx`

**Acceptance criteria:**

- `LinkButton` renders correctly with all variants
- Dark mode styling works correctly
- All inline styled `Link` buttons are replaced
- Existing tests pass

---

## Phase 3: ContentCard Component

**Goal:** Create a `ContentCard` component for the repeated white card pattern used throughout preview screens.

**Problem:** The pattern `bg-white rounded-lg shadow p-6 space-y-4` is repeated 8+ times:

- `DeckPreviewScreen.tsx`: 4 instances (lines 70, 81, 109, 129)
- `CoursePreviewScreen.tsx`: 4 instances (lines 57, 68, 90, 96)

**Tasks:**

1. Create `ContentCard.tsx` with props for spacing variants (`space-y-3`, `space-y-4`)
2. Support optional `centered` prop for text-center content
3. Add dark mode background support
4. Replace repeated patterns in preview screens

**Files to create:**

- `apps/react/src/components/ContentCard.tsx`

**Files to modify:**

- `apps/react/src/components/index.ts`
- `apps/react/src/screens/DeckPreviewScreen.tsx`
- `apps/react/src/screens/CoursePreviewScreen.tsx`

**Acceptance criteria:**

- `ContentCard` replaces all `bg-white rounded-lg shadow p-6` patterns
- Dark mode styling works
- Preview screens are simplified
- Existing tests pass

---

## Phase 4: ListContainer Component

**Goal:** Create a `ListContainer` component for divided list layouts.

**Problem:** The pattern `bg-white rounded-lg shadow divide-y divide-gray-100` is repeated:

- `CommunityScreen.tsx`: 3 instances (lines 65, 150, 177) for top decks, deck results, and course results

**Tasks:**

1. Create `ListContainer.tsx` that wraps children with the divided list styling
2. Support both clickable items (with hover) and static items
3. Add dark mode support

**Files to create:**

- `apps/react/src/components/ListContainer.tsx`

**Files to modify:**

- `apps/react/src/components/index.ts`
- `apps/react/src/screens/CommunityScreen.tsx`

**Acceptance criteria:**

- `ListContainer` replaces repeated patterns
- Hover states work correctly
- Dark mode styling works
- Existing tests pass

---

## Phase 5: SearchInput Component

**Goal:** Create a reusable search input component.

**Problem:** The search input in `CommunityScreen.tsx` (line 117-122) uses a long inline style that could be reused and doesn't match the existing `BaseInput` styling.

**Tasks:**

1. Create `SearchInput.tsx` that extends `BaseInput` with search-specific styling
2. Include optional search icon
3. Ensure consistent styling with other inputs

**Files to create:**

- `apps/react/src/components/inputs/SearchInput.tsx`

**Files to modify:**

- `apps/react/src/components/inputs/index.ts`
- `apps/react/src/screens/CommunityScreen.tsx`

**Acceptance criteria:**

- `SearchInput` is used in `CommunityScreen`
- Styling is consistent with other form inputs
- Dark mode works
- Existing tests pass

---

## Phase 6: ModalButtons Component

**Goal:** Extract the modal footer button layout into a reusable component.

**Problem:** All modals (`ConfirmModal`, `InputModal`, `VisibilityModal`) repeat the same footer pattern:

```tsx
<div className="mt-8 sm:flex sm:pl-4 gap-3 justify-end bg-gray-50 px-6 pt-3 pb-4 border-t border-gray-100">
```

**Tasks:**

1. Create `ModalButtons.tsx` component that handles the footer layout
2. Accept `onCancel`, `onConfirm`, `confirmText`, `cancelText`, `confirmVariant` props
3. Use `Button` component internally with appropriate variants
4. Update all modals to use `ModalButtons`

**Files to create:**

- `apps/react/src/components/modals/ModalButtons.tsx`

**Files to modify:**

- `apps/react/src/components/modals/ConfirmModal.tsx`
- `apps/react/src/components/modals/InputModal.tsx`
- `apps/react/src/components/modals/VisibilityModal.tsx`

**Acceptance criteria:**

- `ModalButtons` reduces code duplication in modals
- All three modals use the new component
- Button variants (danger for delete, primary for save) are correct
- Existing tests pass

---

## Phase 7: SegmentedControl Component

**Goal:** Create a proper segmented control wrapper component.

**Problem:** The `SegmentButton` component exists but the container styling is inline:

- `CommunityScreen.tsx`: `<div className="flex gap-2 p-1 bg-gray-100 rounded-lg">` (line 103)
- `AttemptHistoryScreen.tsx`: Toggle between "Text" and "Sheet music" views uses different inline styles (line 129)

**Tasks:**

1. Create `SegmentedControl.tsx` wrapper that handles the container styling
2. Update `SegmentButton` to work seamlessly within `SegmentedControl`
3. Support dark mode with proper background colors
4. Replace inline implementations

**Files to create:**

- `apps/react/src/components/SegmentedControl.tsx`

**Files to modify:**

- `apps/react/src/components/index.ts`
- `apps/react/src/screens/CommunityScreen.tsx`
- `apps/react/src/screens/AttemptHistoryScreen/AttemptHistoryScreen.tsx`

**Acceptance criteria:**

- `SegmentedControl` wraps `SegmentButton` children
- Consistent styling across all usages
- Dark mode support
- Existing tests pass

---

## Phase 8: PageTitle Component

**Goal:** Create a consistent page title component.

**Problem:** Page titles have inconsistent styling:

- `AttemptHistoryScreen.tsx`: `<h1 className="text-xl font-semibold">` (line 127)
- `DeckPreviewScreen.tsx`: `<h2 className="text-xl font-semibold text-gray-900">` (line 71)
- `CoursePreviewScreen.tsx`: `<h2 className="text-xl font-semibold text-gray-900">` (line 58)

**Tasks:**

1. Create `PageTitle.tsx` with `h1`, `h2`, `h3` variants
2. Include consistent text color with dark mode support
3. Replace inline title styles

**Files to create:**

- `apps/react/src/components/PageTitle.tsx`

**Files to modify:**

- `apps/react/src/components/index.ts`
- `apps/react/src/screens/AttemptHistoryScreen/AttemptHistoryScreen.tsx`
- `apps/react/src/screens/DeckPreviewScreen.tsx`
- `apps/react/src/screens/CoursePreviewScreen.tsx`

**Acceptance criteria:**

- `PageTitle` provides consistent heading styles
- Dark mode text colors are correct
- Preview screens and attempt history use the component
- Existing tests pass

---

## Phase 9: EmptyState Component

**Goal:** Create a consistent empty state message component.

**Problem:** Empty state messages are styled inconsistently:

- `CommunityScreen.tsx`: `<p className="text-center text-gray-500 py-8">No decks found</p>` (lines 146, 173)
- `AttemptHistoryScreen.tsx`: `<div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">No attempts yet.</div>` (line 72)
- `StudyScreenEmptyState.tsx`: Uses different styling altogether

**Tasks:**

1. Create `EmptyState.tsx` component with consistent styling
2. Support optional icon and action button
3. Include dark mode support
4. Replace inline empty state messages

**Files to create:**

- `apps/react/src/components/EmptyState.tsx`

**Files to modify:**

- `apps/react/src/components/index.ts`
- `apps/react/src/screens/CommunityScreen.tsx`
- `apps/react/src/screens/AttemptHistoryScreen/AttemptHistoryScreen.tsx`

**Acceptance criteria:**

- `EmptyState` provides consistent empty state UI
- Dark mode works correctly
- All simple empty state messages use the component
- Existing tests pass

---

## Phase 10: Components Folder Reorganization

**Goal:** Organize the `components` folder into logical subfolders for better discoverability.

**Problem:** The `components` folder is flat with 40+ files, making it hard to find related components.

**Tasks:**

1. Create subfolder structure:
    - `components/ui/` - Base UI components (Button, LinkButton, Pill, Card, ContentCard, etc.)
    - `components/forms/` - Rename `inputs/` for clarity, add SearchInput
    - `components/layout/` - Layout, SectionCard, SectionData, SectionHeader, etc.
    - `components/feedback/` - Spinner, Toast, ErrorCard, EmptyState
    - Keep existing subfolders: `modals/`, `navigation/`, `notation/`, `FlashCards/`
2. Update `index.ts` exports
3. Update imports throughout the codebase

**Folder structure:**

```
components/
  ui/
    Button.tsx
    LinkButton.tsx
    Card.tsx
    ContentCard.tsx
    ListContainer.tsx
    Pill.tsx
    CircleHover.tsx
    SegmentButton.tsx
    SegmentedControl.tsx
    PageTitle.tsx
  forms/         (renamed from inputs/)
    BaseInput.tsx
    InputField.tsx
    EmailInput.tsx
    PasswordInput.tsx
    SearchInput.tsx
    Select.tsx
    Checkbox.tsx
    NumberInput.tsx
    DurationSelect.tsx
  layout/
    Layout.tsx
    SectionCard.tsx
    SectionData.tsx
    SectionHeader.tsx
    SegmentHeader.tsx
  feedback/
    Spinner.tsx
    Toast.tsx
    ErrorCard.tsx
    EmptyState.tsx
  modals/        (existing)
  navigation/    (existing)
  notation/      (existing)
  FlashCards/    (existing)
  index.ts
```

**Files to modify:**

- Multiple component files (move to new locations)
- `apps/react/src/components/index.ts`
- All files importing from components

**Acceptance criteria:**

- Components are organized into logical subfolders
- All imports still work correctly
- `index.ts` exports maintain backward compatibility
- Existing tests pass

---

## Summary of Benefits

1. **Consistency**: All buttons, cards, and UI elements will have consistent styling
2. **Dark Mode**: Proper dark mode support throughout the app
3. **Maintainability**: Style changes only need to happen in one place
4. **Discoverability**: Organized folder structure makes finding components easier
5. **DRY Code**: Eliminates ~200+ lines of repeated Tailwind classes
6. **Type Safety**: All components properly typed with full prop documentation
