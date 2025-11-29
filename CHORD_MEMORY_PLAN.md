# Chord Memory Card Type Implementation Plan

## Overview

This feature adds a new card type called "Chord Memory" to the NotationInputScreen. Unlike the existing card types that require exact voicings, Chord Memory cards accept **any valid voicing** of a chord as correct—as long as the user plays all required chord tones (with configurable optional tones).

**Use Case:** Memorizing songs by chord progression. Users create cards for verse/chorus sections, and any voicing that contains the correct chord tones is accepted.

## Progress

-   [x] Phase 1: Core Type Definitions
-   [ ] Phase 2: Chord Tone Extraction Utility
-   [ ] Phase 3: Chord Memory Answer Validator
-   [ ] Phase 4: Update Card Type Dropdown
-   [ ] Phase 5: Chord Memory Settings UI
-   [ ] Phase 6: Optional Chord Tones UI
-   [ ] Phase 7: NotationInputScreen Integration
-   [ ] Phase 8: Presentation Mode Support
-   [ ] Phase 9: End-to-End Testing

---

## Phase 1: Core Type Definitions

**Goal:** Add types to support Chord Memory cards with optional chord tones per chord.

**Tasks:**

1. Add `ChordMemory` to `AnswerType` enum
2. Create `ChordMemoryAnswer` type that tracks required/optional tones per chord position
3. Update `Answer` union type to include `ChordMemoryAnswer`

**Files to modify:**

-   `packages/MemoryFlashCore/src/types/Cards.ts`

**New Types:**

-   Add `ChordMemory` to the `AnswerType` enum
-   Create `ChordMemoryChord` type with `chordName` (string), `requiredTones` (array of pitch class strings like 'C', 'E', 'G'), and `optionalTones` (array of pitch classes that can be omitted)
-   Create `ChordMemoryAnswer` type extending `BaseAnswer` with type `ChordMemory` and an array of `ChordMemoryChord` objects

**Acceptance criteria:**

-   Types compile without errors
-   Existing tests pass

---

## Phase 2: Chord Tone Extraction Utility

**Goal:** Create utility to extract chord tones from a chord name using tonal library.

**Tasks:**

1. Create `getChordTones(chordName: string): string[]` function
2. Handle chord names like "Cmaj7", "Dm7", "G7", etc.
3. Return pitch classes (e.g., ['C', 'E', 'G', 'B'] for Cmaj7)

**Files to create:**

-   `packages/MemoryFlashCore/src/lib/chordTones.ts`

**Implementation:**

-   Create `getChordTones(chordName: string)` function that uses `Chord.get()` from tonal library to extract pitch class notes from a chord name
-   Create `getDefaultChordMemoryChord(chordName: string)` helper that returns a `ChordMemoryChord` with all tones set as required and none optional

**Acceptance criteria:**

-   `getChordTones('Cmaj7')` returns `['C', 'E', 'G', 'B']`
-   `getChordTones('Dm7')` returns `['D', 'F', 'A', 'C']`
-   Unit test for chord tone extraction

---

## Phase 3: Chord Memory Answer Validator

**Goal:** Create validator that accepts any voicing containing required chord tones.

**Tasks:**

1. Create `ChordMemoryAnswerValidator` component
2. For each beat/chord, validate that played notes contain all required pitch classes
3. Allow any octave for chord tones
4. Accept extra notes if they're valid chord tones (including optional)
5. Progress through chord progression as user plays correctly

**Files to create:**

-   `apps/react/src/components/answer-validators/ChordMemoryAnswerValidator.tsx`

**Validation Logic:**

For each chord in the progression:

1. Get required pitch classes from the `ChordMemoryAnswer`
2. Map played MIDI notes to pitch classes using `Note.chroma` from tonal
3. Check that all required pitch classes are present in the played notes
4. Check that no "wrong" notes are played (notes outside the chord's required + optional tones)
5. If correct, advance to next chord in progression

**Acceptance criteria:**

-   Playing C4, E4, G4 for a "C" chord is correct
-   Playing C3, E5, G4 (different octaves) for "C" is also correct
-   Playing C, E, G, Bb for "C" is wrong (Bb not in chord)
-   Playing C, E only for "C" (if G is required) is incomplete
-   Playing C, E, G when G is optional also works

**Unit tests required:**

-   Create unit test file `packages/MemoryFlashCore/src/lib/__tests__/ChordMemoryValidator.test.ts`
-   Test correct chord with exact chord tones in same octave
-   Test correct chord with chord tones spread across different octaves
-   Test rejection when a non-chord-tone is played
-   Test incomplete chord (missing required tone) does not advance
-   Test chord with optional tone omitted still passes
-   Test chord with optional tone included still passes
-   Test playing optional tones does NOT mark the answer as incorrect (critical: optional tones are allowed to be played, just not required)
-   Test progression advances after correct chord played

---

## Phase 4: Update Card Type Dropdown

**Goal:** Add "Chord Memory" option to the card type dropdown.

**Tasks:**

1. Update `CardTypeDropdown` to include "Chord Memory" option
2. Update the dropdown's value type to include the new option

**Files to modify:**

-   `apps/react/src/components/CardTypeDropdown.tsx`
-   `apps/react/src/components/notation/CardTypeOptions.tsx`
-   `apps/react/src/components/notation/defaultSettings.ts`

**Type Update:**

Update the card type union from `'Sheet Music' | 'Text Prompt'` to include `'Chord Memory'` as a third option.

**Acceptance criteria:**

-   Dropdown shows three options
-   Selecting "Chord Memory" updates settings state

---

## Phase 5: Chord Memory Settings UI

**Goal:** Show chord input UI when "Chord Memory" is selected, allowing users to directly enter chord symbols.

**Tasks:**

1. Update `CardTypeOptions` to show chord input when "Chord Memory" selected
2. Provide a text input for entering chord progression (e.g., "Cm7 F7 Bbmaj7 Ebmaj7")
3. Parse the chord string into individual chord symbols
4. Display the parsed chords with their extracted chord tones below the input
5. Validate chord names using tonal library and show error for invalid chords

**Files to modify:**

-   `apps/react/src/components/notation/CardTypeOptions.tsx`

**UI Design:**

When "Chord Memory" is selected:

-   Show a text input labeled "Chord Progression" with placeholder "e.g., Cm7 F7 Bbmaj7"
-   Below the input, display each parsed chord with its chord tones
-   Invalid chord names should be highlighted with an error message
-   Each chord's tones are shown and can be toggled (Phase 6)

**Acceptance criteria:**

-   Text input appears when "Chord Memory" selected
-   Chord progression string is parsed into individual chords on space/comma
-   Each chord's tones are extracted and displayed
-   Invalid chord names show clear error feedback
-   UI updates in real-time as user types

---

## Phase 6: Optional Chord Tones UI

**Goal:** Allow users to mark specific chord tones as optional for each chord.

**Tasks:**

1. Create `ChordToneSelector` component
2. Display each chord tone as a toggleable chip
3. Clicking a tone toggles it between required/optional
4. Store optional tones in settings state

**Files to create:**

-   `apps/react/src/components/notation/ChordToneSelector.tsx`

**UI Design:**

Display each chord with its name and chord tones as toggleable chips. Example: for Cmaj7, show [C ✓] [E ✓] [G ✓] [B ○] where filled/checked tones are required and empty/unchecked tones are optional.

-   Filled/checked = required
-   Empty/unchecked = optional (can be omitted)
-   At least one tone must remain required

**Acceptance criteria:**

-   Can toggle any tone between required/optional
-   Cannot make all tones optional
-   Visual distinction between required and optional
-   Changes persist in settings state

---

## Phase 7: NotationInputScreen Integration

**Goal:** Wire up Chord Memory card creation in NotationInputScreen.

**Tasks:**

1. Update settings state to include chord memory configuration
2. When adding card, generate `ChordMemoryAnswer` from settings
3. Pass chord memory config to card creation action
4. Update `handleAdd` to build correct answer type

**Files to modify:**

-   `apps/react/src/screens/NotationInputScreen.tsx`
-   `apps/react/src/components/notation/defaultSettings.ts`
-   `packages/MemoryFlashCore/src/redux/actions/add-cards-to-deck.ts` (if needed)

**Settings State Addition:**

Add `chordMemoryConfig?: ChordMemoryChord[]` field to `NotationSettingsState` interface to store the configured required/optional tones for each chord.

**Card Creation:**

When `cardType === 'Chord Memory'`, create a `ChordMemoryAnswer` object with type `ChordMemory` and the chords array from `settings.chordMemoryConfig`.

**Acceptance criteria:**

-   "Chord Memory" cards created with correct answer type
-   Optional tones are preserved in card data
-   Card saves to database correctly

---

## Phase 8: Presentation Mode Support

**Goal:** Add presentation mode for Chord Memory cards during study.

**Tasks:**

1. Add "Chord Memory" to `PresentationModeIds` type
2. Update `AnswerValidator` to use `ChordMemoryAnswerValidator` for this type
3. Update `MultiSheetCardQuestion` to display appropriately
4. Update `RevealAnswerModal` to support Chord Memory cards - show the chord progression with clear visual distinction between required and optional tones
5. Update `FlashCardOptionsMenu` to show "Reveal answer" option for Chord Memory cards

**Files to modify:**

-   `packages/MemoryFlashCore/src/types/PresentationMode.ts`
-   `apps/react/src/components/answer-validators/AnswerValidator.tsx`
-   `apps/react/src/components/FlashCards/MultiSheetCardQuestion.tsx`
-   `apps/react/src/components/FlashCards/RevealAnswerModal.tsx`
-   `apps/react/src/components/FlashCardOptionsMenu.tsx`

**Display Options:**

For Chord Memory cards, the presentation could show:

-   Text prompt (like existing Text Prompt mode)
-   Chord symbols only (like existing Chords mode)
-   Sheet music without exact notes (optional)

**Acceptance criteria:**

-   Chord Memory cards display correctly during study
-   Validator correctly checks chord tones, not exact notes
-   Progress through chord progression works
-   "Reveal answer" button works for Chord Memory cards and shows the chord progression with required/optional tones clearly indicated

---

## Phase 9: End-to-End Testing

**Goal:** Verify the complete Chord Memory workflow with Playwright, including screenshot tests.

**Tasks:**

1. Test creating a Chord Memory card with screenshot verification
2. Test toggling optional chord tones with screenshot
3. Test studying with correct voicings (different inversions)
4. Test rejection of wrong notes
5. Test progression through multiple chords

**Files to create:**

-   `apps/react/tests/chord-memory-create.spec.ts`
-   `apps/react/tests/chord-memory-study.spec.ts`

**Test Scenarios with Screenshots:**

1. **Create Card UI Screenshot:**

    - Navigate to NotationInputScreen
    - Select "Chord Memory" card type
    - Enter chord progression "Cmaj7 Dm7 G7 C"
    - Screenshot: `chord-memory-input-screen.png` showing the chord input UI with parsed chords and tones

2. **Optional Tones UI Screenshot:**

    - Toggle the 7th of Cmaj7 to optional
    - Screenshot: `chord-memory-optional-tones.png` showing visual distinction between required/optional

3. **Study Screen Screenshot:**

    - Create and save the Chord Memory card
    - Navigate to study screen
    - Screenshot: `chord-memory-study-screen.png` showing the card presentation

4. **Study - Correct Voicing:**

    - Play C4-E4-G4-B4 (root position Cmaj7)
    - Verify progression advances
    - Play D3-F4-A4-C5 (Dm7 in different octaves)
    - Verify still accepted

5. **Study - Wrong Note:**

    - Play C-E-G-Bb for Cmaj7
    - Verify rejection (wrong note indicator)
    - Screenshot: `chord-memory-wrong-note.png`

6. **Study - Complete Progression:**

    - Play through all 4 chords correctly
    - Verify card completion
    - Screenshot: `chord-memory-complete.png`

7. **Reveal Answer:**

    - Create a Chord Memory card with some optional tones
    - During study, click the card options menu and select "Reveal answer"
    - Verify modal shows the chord progression with clear indication of required vs optional tones
    - Screenshot: `chord-memory-reveal-answer.png`

8. **Playing Optional Tones:**
    - For a Cmaj7 chord where B (7th) is optional
    - Play C-E-G-B (including the optional tone)
    - Verify this is accepted as correct (optional tones are allowed, just not required)
    - Verify no wrong note indicator appears

**Acceptance criteria:**

-   All screenshot tests pass and match expected visual output
-   Card creation flow works end-to-end with correct data saved
-   Study validation correctly accepts any valid voicing
-   Study validation correctly rejects non-chord tones
-   Progress through chord progression works correctly
-   Screenshots capture: input UI, optional tones UI, study screen, wrong note state, completion state

---

## Technical Notes

### Using Tonal Library

The `tonal` library is already installed and provides:

-   `Chord.get(name)` - Returns chord info including notes
-   `Note.chroma(name)` - Returns pitch class (0-11)
-   `Midi.midiToNoteName(midi)` - Converts MIDI to note name

### Chord Input

Users enter chord symbols directly as a space or comma-separated string (e.g., "Cmaj7 Dm7 G7 C"). The tonal library validates and parses these chord names. Invalid chord names should show clear error feedback.

### Validator Pattern

Follow the existing `ValidatorEngine` pattern but with pitch-class-based comparison instead of exact MIDI comparison. The `UnExactMultiAnswerValidator` already demonstrates octave-agnostic validation using `Note.chroma`.

### Migration

Existing cards are unaffected—this adds a new answer type without changing existing types.

---

## File Summary

**New Files:**

-   `packages/MemoryFlashCore/src/lib/chordTones.ts`
-   `apps/react/src/components/answer-validators/ChordMemoryAnswerValidator.tsx`
-   `apps/react/src/components/notation/ChordToneSelector.tsx`
-   `apps/react/tests/chord-memory-create.spec.ts`
-   `apps/react/tests/chord-memory-study.spec.ts`

**Modified Files:**

-   `packages/MemoryFlashCore/src/types/Cards.ts`
-   `packages/MemoryFlashCore/src/types/PresentationMode.ts`
-   `apps/react/src/components/CardTypeDropdown.tsx`
-   `apps/react/src/components/notation/CardTypeOptions.tsx`
-   `apps/react/src/components/notation/defaultSettings.ts`
-   `apps/react/src/screens/NotationInputScreen.tsx`
-   `apps/react/src/components/answer-validators/AnswerValidator.tsx`
-   `apps/react/src/components/FlashCards/MultiSheetCardQuestion.tsx`
