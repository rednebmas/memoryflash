# Styling Refresh Plan

Update MemoryFlash styling to match [Graphite](https://graphite.com/) while preserving dark mode.

---

## Phase 1: Color System

**Files**: `tailwind.config.js`, `index.css`

Add to `theme.extend.colors`:

```js
dark: {
  bg: '#0f0f11',
  surface: '#1e1e20',
  elevated: 'rgba(223, 223, 255, 0.09)',
  border: 'rgba(255, 255, 255, 0.1)',
  fg: '#fcfcfd',
  muted: 'rgba(255, 255, 255, 0.6)',
},
light: {
  bg: '#ffffff',
  surface: '#f9fafb',
  border: '#e5e7eb',
  fg: '#111827',
  muted: '#6b7280',
},
accent: {
  DEFAULT: '#2657d5',
  hover: '#1e4bb8',
}
```

- Remove conflicting `.dark` overrides in `index.css`
- Update base dark mode background to use new tokens

---

## Phase 2: Navbar Redesign

**Files**: `Layout.tsx` → extract to new `Navbar.tsx`

### Current State

- 3-column grid: back button | MFlash logo + subtitle | right icons (streak, account, community, midi)
- Logo centered

### Target Layout

```
[Logo] -------------------- [Actions: streak | community | account | midi]
```

### Container CSS

```css
height: 68px;
position: sticky;
top: 0;
z-index: 40;
background: transparent; /* or bg-dark-bg/80 backdrop-blur-sm */
```

### Inner Container CSS

```css
max-width: 1200px;
margin: 0 auto;
display: flex;
align-items: center;
justify-content: space-between;
padding: 0 24px;
height: 100%;
```

### Logo Section (left)

- Logo icon + "MFlash" text (no subtitle in navbar)
- Link to home `/`

### Actions Section (right)

```css
display: flex;
align-items: center;
gap: 8px;
```

### Navbar Button Styles

**Secondary button** (Account, text buttons):

```css
/* Dark */
background: rgba(255, 255, 255, 0.07);
color: #fcfcfd;
/* Light */
background: #f3f4f6;
color: #111827;
/* Shared */
font-size: 14px;
font-weight: 500;
padding: 8px 16px;
border-radius: 8px;
height: 36px;
```

**Primary button** (main CTA):

```css
/* Dark */
background: #e8e8ea;
color: #1a1a1a;
/* Light */
background: #2657d5;
color: #ffffff;
/* Shared */
font-size: 14px;
font-weight: 500;
padding: 8px 16px;
border-radius: 8px;
height: 36px;
```

**Icon buttons** (streak, community, midi):

```css
/* Dark */ hover:bg-dark-elevated
/* Light */ hover:bg-gray-100
width: 36px;
height: 36px;
border-radius: 9999px;
```

### Back Button

- Only show when `back` prop provided
- Position: absolute left, or part of logo section
- Icon-only, circular hover

---

## Phase 3: Button Component

**Files**: `Button.tsx`, `LinkButton.tsx`

### Primary Variant

```css
/* Dark */
background: #e8e8ea;
color: #1a1a1a;
hover:background: #d4d4d6;
/* Light */
background: #2657d5;
color: #ffffff;
hover:background: #1e4bb8;
/* Shared */
font-size: 14px;
font-weight: 500;
padding: 8px 16px;
border-radius: 6px;
transition: all 150ms;
```

### Secondary Variant

```css
/* Dark */
background: rgba(223, 223, 255, 0.09);
color: #fcfcfd;
hover:background: rgba(223, 223, 255, 0.15);
/* Light */
background: #f3f4f6;
color: #111827;
hover:background: #e5e7eb;
/* Shared */
border-radius: 6px;
```

### Outline/Ghost Variant

```css
background: transparent;
/* Dark */
color: rgba(255, 255, 255, 0.6);
hover:background: rgba(255, 255, 255, 0.05);
/* Light */
color: #6b7280;
hover:background: #f3f4f6;
/* Shared */
border-radius: 6px;
```

### Danger Variant

- Keep existing red styling

---

## Phase 4: Card Styling

**Files**: `Card.tsx`, `ContentCard.tsx`, `SectionCard.tsx`

```css
/* Dark */
background: #1e1e20;
border: 1px solid rgba(255, 255, 255, 0.1);
/* Light */
background: #ffffff;
border: 1px solid #e5e7eb;
/* or shadow-sm instead of border */
/* Shared */
border-radius: 12px;
```

- Remove heavy `shadow` class in dark mode
- Keep subtle `shadow-sm` in light mode if preferred

---

## Phase 5: Input Styling

**Files**: `BaseInput.tsx`, `SearchInput.tsx`, `Select.tsx`

```css
/* Dark */
background: #1e1e20;
border: 1px solid rgba(255, 255, 255, 0.1);
color: #fcfcfd;
placeholder-color: rgba(255, 255, 255, 0.4);
/* Light */
background: #ffffff;
border: 1px solid #e5e7eb;
color: #111827;
placeholder-color: #9ca3af;
/* Shared */
border-radius: 6px;
padding: 8px 12px;
font-size: 14px;
focus: ring-2 ring-accent/50 border-accent;
```

---

## Phase 6: Interactive States

**Files**: `CircleHover.tsx`, all interactive elements

```css
transition: all 150ms ease;

/* Hover backgrounds */
/* Dark */ hover:bg-dark-elevated (or rgba(255,255,255,0.05))
/* Light */ hover:bg-gray-100

/* Focus visible */
outline: 2px solid #2657d5;
outline-offset: 2px;
```

---

## Phase 7: Typography

**Files**: `tailwind.config.js`, component updates

### Font Size Ramp (Tailwind classes)

| Name   | Size | Line Height | Weight  | Tracking | Use Case                   |
| ------ | ---- | ----------- | ------- | -------- | -------------------------- |
| `xs`   | 12px | 16px        | 400     | normal   | Captions, hints            |
| `sm`   | 14px | 20px        | 400-500 | normal   | Body text, labels, buttons |
| `base` | 16px | 24px        | 400     | normal   | Default body               |
| `lg`   | 18px | 28px        | 500     | tight    | Subheadings                |
| `xl`   | 20px | 28px        | 600     | tight    | Section titles             |
| `2xl`  | 24px | 32px        | 600     | tight    | Page subtitles             |
| `3xl`  | 30px | 36px        | 600     | tight    | Page titles                |
| `4xl`  | 36px | 40px        | 600     | tighter  | Hero headings              |

### Text Colors

```css
/* Dark */
--fg: #fcfcfd;
--muted: rgba(255, 255, 255, 0.6);
--faint: rgba(255, 255, 255, 0.4);

/* Light */
--fg: #111827;
--muted: #6b7280;
--faint: #9ca3af;
```

### Heading Styles

```css
/* All headings */
font-weight: 600;
letter-spacing: -0.025em; /* tracking-tight */
/* Dark */
color: #fcfcfd;
/* Light */
color: #111827;
```

### Body/Label Styles

```css
font-size: 14px;
font-weight: 500;
/* Dark */
color: #fcfcfd;
/* Light */
color: #111827;
```

### Muted/Secondary Text

```css
font-size: 14px;
font-weight: 400;
/* Dark */
color: rgba(255, 255, 255, 0.6);
/* Light */
color: #6b7280;
```

### Tailwind Config Addition

```js
// theme.extend.letterSpacing
letterSpacing: {
  tighter: '-0.05em',
  tight: '-0.025em',
}
```

---

## Exclusions

- Login/Signup screens: keep as-is
- Dark mode toggle: preserve

---

## Testing

After each phase:

- [ ] `yarn test:codex`
- [ ] Light mode visual check
- [ ] Dark mode visual check
- [ ] Responsive check
