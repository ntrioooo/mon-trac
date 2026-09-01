---
name: jagajajan-design
description: Complete visual design system, component patterns, color tokens, typography, and UX standards for JagaJajan — a playful personal finance app. Use this skill whenever implementing UI, restyling components, or making design decisions for JagaJajan.
---

# JagaJajan — Design System

This skill is the source of truth for the **JagaJajan visual identity** and design system.

---

## 1. Brand Identity

**Name:** JagaJajan
**Tagline:** Kelola jajan harianmu dengan gaya
**Character:** Playful Modern Mobile — soft-retro sticker influence, friendly, expressive, trustworthy

---

## 2. Color Palette (MASTER-PROMPT spec)

| Token | Hex | Role |
|---|---|---|
| **Canvas Cream** | `#FFF9ED` | Page background |
| **Ink Navy** | `#172A63` | Primary text, outlines, FAB, nav active, headings |
| **Soft Blue** | `#B9D7F5` | Logo "Jaga" accent, baby blue surfaces, nav pill |
| **Playful Pink** | `#F4A8C7` | Logo "Jajan" accent, secondary accent |
| **Soft Yellow** | `#FFD66B` | Wallet highlight, warning, today's spending |
| **Soft Mint** | `#B8E6B1` | Income surface |
| **Income Mint (text)** | `#56B88A` | Income amounts, income labels, positive flow |
| **Lilac** | `#D8C4F1` | Tags, secondary chip accent, sheet handle |
| **Expense Coral** | `#F26A6A` | Expense amounts, warnings, delete actions |
| **White** | `#FFFFFF` | Card surfaces |

### Derived surfaces:
- Expense surface: `#FFF0F0` (coral at 10%)
- Income surface: `#EDFBEA` (mint at 15%)
- Blue surface: `#E8F4FD`
- Pink surface: `#FDE8F4`
- Yellow surface: `#FFF6DC`
- Lilac surface: `#F2EDFC`

### Secondary text colors:
- Secondary: `#4A5A8A` (ink navy at 70%)
- Muted: `#8A9AC0` (slate-ish, for labels, placeholders)
- Border: `rgba(185, 215, 245, 0.55)` (soft blue border)

---

## 3. Typography

**Primary Font:** Plus Jakarta Sans (Google Fonts)
```css
font-family: var(--font-jakarta), "Plus Jakarta Sans", system-ui, sans-serif;
letter-spacing: -0.01em;
```

**Weight usage:**
- `font-extrabold` (800): Headings, amounts, hero text, card titles
- `font-bold` (700): Buttons, labels, section titles
- `font-semibold` (600): Subtitles, descriptions
- `font-medium` (500): Body, captions

**Numbers:** Always `tabular-nums` for financial amounts.

**NO:** Inter, Roboto, Arial, Nunito, system default as primary design font.

---

## 4. Shape Language

- Main cards: `border-radius: 1.25rem` (20px) — `var(--radius)`
- Sheet headers: `border-radius: 1.75rem` (28px) — `var(--radius-lg)`
- Hero/large: `border-radius: 2.25rem` (36px) — `var(--radius-xl)`
- Inner elements (chips, badges): `border-radius: 0.875rem` (14px) — `var(--radius-inner)`
- Pills / tags: `border-radius: 9999px` — `var(--radius-pill)`

---

## 5. Icons (MASTER-PROMPT spec)

Use **Lucide React** exclusively for all interface icons.

| Context | Icon |
|---|---|
| Home / Dashboard | `House` |
| Activity / Transactions | `Receipt` or `ClipboardList` |
| Analytics | `BarChart3` or `ChartNoAxesCombined` |
| Settings / Account | `Settings` |
| Add | `Plus` |
| Filter | `SlidersHorizontal` |
| Search | `Search` |
| Wallet | `WalletCards` |
| Income | `ArrowDownLeft` or `TrendingUp` |
| Expense | `ArrowUpRight` or `TrendingDown` |
| Transfer | `ArrowLeftRight` |
| Budget | `Target` |
| Calendar | `Calendar` |
| Note | `FileText` |
| Category | `Tag` |
| Delete | `Trash2` |
| Logout | `LogOut` |
| Sync | `RefreshCw` |

**Emoji usage:** Only as brand illustration/accent — never as replacement for UI function icons.

Allowed emoji accent uses:
- Mood indicators on summary cards (😄 😅 😱)
- Empty state illustrations (🌱)
- Brand personality moments

---

## 6. Component Patterns

### Cards

```tsx
// Standard card
<div className="fun-card p-4">...</div>
// = white bg, 1.25rem radius, navy-tinted shadow, soft-blue border

// Pastel surface card
<div className="fun-card p-4" style={{ backgroundColor: "#E8F4FD" }}>...</div>
```

### Hero Card (Ink Navy)
```tsx
<div className="hero-navy rounded-[var(--radius)] p-5 text-white relative overflow-hidden">
  {/* Decorative circles — logo palette */}
  <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-[#B9D7F5] opacity-12" />
  <div className="absolute right-10 -bottom-8 h-20 w-20 rounded-full bg-[#F4A8C7] opacity-12" />
  ...
</div>
```

### Transaction Row (Pastel Color Blocking)

Rotate through this palette for expense rows:
1. Pink: `bg: #FDE8F4`, icon: `#F4A8C7`, text: `#B83870`
2. Yellow: `bg: #FFF6DC`, icon: `#FFD66B`, text: `#8A6010`
3. Soft Blue: `bg: #E8F4FD`, icon: `#B9D7F5`, text: `#1E6AAA`
4. Lilac: `bg: #F2EDFC`, icon: `#D8C4F1`, text: `#5A3A9A`

For income rows always use:
- bg: `#EDFBEA`, icon: `#B8E6B1`, text: `#56B88A`

### Amount Display

```tsx
// Income amount
<span style={{ color: "#56B88A" }} className="font-extrabold tabular-nums">
  +{formatCurrency(amount)}
</span>

// Expense amount
<span style={{ color: "#F26A6A" }} className="font-extrabold tabular-nums">
  -{formatCurrency(amount)}
</span>
```

### Type Switcher (Transaction Sheet)

```tsx
// Expense active: Ink Navy bg, white text
// Income active: Income Mint bg, white text
// Inactive: muted #8A9AC0 text
```

---

## 7. Animation

Use **Framer Motion** for interactive tactile feedback:
- Bottom sheet enter/exit: spring config `{ damping: 30, stiffness: 300 }`
- FAB press: scale 0.91 on tap
- Category tile: scale 1.04 on select
- Budget bar: `transition: width 0.6s ease`

Use CSS animations for passive/ambient:
- `.animate-float` (logo on login)
- `.animate-slide-up` (CSS fallback)

Always respect `prefers-reduced-motion`.

---

## 8. Mobile Requirements

Design for:
- 360px (minimum)
- 375px
- 390px (iPhone 14)
- 430px (iPhone 14 Plus)

- All touch targets: minimum 44×44px
- Bottom nav: `env(safe-area-inset-bottom)` padding
- Sheets: `max-h-[96dvh]` with `overflow-y-auto`
- No horizontal overflow

---

## 9. Financial UX Rules

1. All amounts use `tabular-nums` + `font-extrabold`
2. Income = mint green (`#56B88A`) — never ambiguous
3. Expense = coral red (`#F26A6A`) — never ambiguous
4. Transaction entry sheet: all fields directly visible — no accordions
5. Type switcher always at the top of the sheet
6. Category grid: 5 columns, pastel backgrounds

---

## 10. Anti-patterns (Do NOT)

- ❌ Nunito or Inter as primary font
- ❌ Emoji as UI function icons (nav, buttons, labels)
- ❌ Plain gray amounts — always use semantic color
- ❌ Purple fintech gradient
- ❌ Excessive glassmorphism or blobs
- ❌ Generic card grid with no hierarchy
- ❌ Old coral (#FF6B6B) palette — use spec coral #F26A6A
- ❌ Old navy (#1A2B6B) — use spec #172A63
- ❌ Old cream (#F5F0E8) — use spec #FFF9ED
