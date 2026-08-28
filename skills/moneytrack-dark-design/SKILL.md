---
name: moneytrack-dark-design
description: Design system and UI guidelines for MoneyTrack dark luxury fintech interface (Sikka-inspired aesthetic). Use this skill whenever designing, modifying, or creating UI components, pages, charts, color palettes, or layouts for MoneyTrack. Enforces Plus Jakarta Sans typography, sleek dark surfaces (#0D0D12, #181820), golden amber glowing FAB, and high-density mobile-first fintech components.
---

# MoneyTrack Dark Fintech Design System (Sikka-Inspired)

This skill governs the visual identity, typography, color tokens, and layout patterns for MoneyTrack. The design is inspired by modern premium fintech apps (such as Sikka / Apple Wallet / Revolut Ultra), featuring a deep charcoal-black aesthetic, high-contrast typography in **Plus Jakarta Sans**, vibrant data visualizations, and an iconic glowing golden amber FAB.

---

## 1. Core Visual Principles

1. **Ultra-Deep Dark Theme**: Deep charcoal black (`#0D0D12`), not washed-out grey. Elevated card surfaces use `#181820` / `#1E1E28` with subtle 1px translucent borders (`rgba(255, 255, 255, 0.08)`).
2. **Plus Jakarta Sans Everywhere**: Modern, bold, geometric grotesque sans-serif with high readability for financial numbers and clear tabular alignment.
3. **High-Contrast Data & Hierarchy**: Large prominent numbers (`text-3xl` / `text-4xl`, `font-bold` or `font-extrabold`) paired with clean uppercase micro-labels (`text-[10px]` / `text-[11px]`, `tracking-wider`, `text-slate-400`).
4. **Signature Center FAB (+)**: Golden Amber gradient (`#F59E0B` to `#D97706`) with an ambient radial backlight glow (`box-shadow: 0 0 24px rgba(245, 158, 11, 0.45)`).
5. **Vibrant Semantic Color Accents**:
   - **Income / Safe Status**: Mint Emerald (`#10B981` / `#34D399`)
   - **Expense / Warning / Alert**: Coral Red (`#FF6B6B` / `#EF4444`)
   - **Highlight / Primary Action**: Golden Amber (`#F59E0B` / `#FBBF24`)
   - **Category Palette**: Indigo (`#6366F1`), Cyan (`#06B6D4`), Purple (`#A855F7`), Orange (`#FB923C`), Teal (`#14B8A6`), Pink (`#EC4899`).

---

## 2. Color Tokens & Theme Definition

```css
:root {
  /* Dark Canvas */
  --bg-canvas: #0D0D12;
  --bg-surface: #181820;
  --bg-surface-raised: #22222E;
  --bg-surface-active: #2A2A38;
  
  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-active: rgba(255, 255, 255, 0.18);
  
  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  
  /* Accents */
  --accent-gold: #F59E0B;
  --accent-gold-glow: rgba(245, 158, 11, 0.45);
  --accent-emerald: #10B981;
  --accent-rose: #FF6B6B;
  --accent-cyan: #06B6D4;
  --accent-purple: #A855F7;
  
  /* Radii */
  --radius-card: 1.25rem; /* 20px */
  --radius-inner: 0.875rem; /* 14px */
  --radius-pill: 9999px;
}
```

---

## 3. Typography Guide (Plus Jakarta Sans)

Configured via `next/font/google`:

```tsx
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});
```

### Type Scale & Hierarchy:

| Element | Class Name / Styling | Example Usage |
|---|---|---|
| **Display Hero Amount** | `text-3xl` or `text-4xl font-extrabold tabular-nums tracking-tight text-white` | `Rp 2.362.180` / `$2,362.18` |
| **Section Header** | `text-base font-bold text-white tracking-tight` | `Activity`, `Insights`, `Budgets` |
| **Card Title / Merchant** | `text-sm font-semibold text-white` | `Blue Bottle Coffee`, `Muni Transit` |
| **Micro-Label / Eyebrow** | `text-[10px] font-bold uppercase tracking-wider text-slate-400` | `NET CASH FLOW • JULY`, `TODAY` |
| **Subtext / Meta** | `text-xs text-slate-400` | `Dining • Tunai`, `14 Jul 2026` |
| **Badge / Pill Text** | `text-xs font-semibold` | `+9% vs June`, `ON TRACK` |

---

## 4. Key Component Patterns

### 4.1 Hero Net Cash Flow Card
- Deep charcoal background with subtle 1px border.
- Giant currency figure with mini percentage change pill (`+9% vs June` in emerald).
- Smooth glowing sparkline/line chart inside the card with interactive timeframe pills (`Week`, `Month`, `Year`).
- Two bottom metric blocks for `IN (July)` & `OUT (July)`.

### 4.2 Spent & Category Donut / Concentric Rings
- Concentric ring chart or donut with high-contrast colored arcs (`#F59E0B`, `#FF6B6B`, `#06B6D4`, `#10B981`).
- Center label inside the donut (`SPENT Rp 3.878.000`).
- Right-hand legend listing category dots, names, and percentage values (`Housing 48%`, `Dining 16%`).

### 4.3 Transaction List (Activity)
- Search bar with dark input background (`bg-[#181820]`), magnifying glass, and subtle border.
- Filter pill carousel (`All`, `Pengeluaran`, `Pemasukan`, `Berulang`).
- Grouped by date headers with uppercase micro-labels and daily subtotals (`TODAY  -Rp 60.150`).
- Transaction rows:
  - Square rounded icon badge (`w-10 h-10 rounded-xl bg-[#22222E] flex items-center justify-center text-lg`).
  - Left column: Title & category/payment method subtitle.
  - Right column: Bold red/green amount (`-Rp 25.000` / `+Rp 3.500.000`).

### 4.4 Fast Entry Screen (Keypad & Sheet)
- Segmented tab switch at the top: `Pengeluaran`, `Pemasukan`, `Transfer`.
- Huge `$0` / `Rp 0` hero amount in center.
- Horizontal category pill carousel with active glowing state.
- Meta row with Account, Date, Note quick-triggers.
- On-screen touch keypad (3x4 grid) with large tactile button numbers (1-9, ., 0, ⌫).
- Prominent full-width button at bottom (`Simpan Pengeluaran`).

### 4.5 Signature Bottom Navigation Bar
- Fixed bottom dock (`bg-[#121218]/90 backdrop-blur-md border-t border-white/10`).
- 5 items: **Home**, **Activity**, **FAB (+)**, **Insights**, **Settings**.
- Center FAB is 56x56px, circular with **Golden Amber Gradient** (`from-amber-400 to-amber-600`), elevated with an ambient glow (`box-shadow: 0 0 20px rgba(245, 158, 11, 0.5)`).

---

## 5. UI Implementation Checklist

When building or updating UI with this skill:
- [ ] Ensure font is set to `Plus_Jakarta_Sans` with `font-sans` or `font-["Plus_Jakarta_Sans"]`.
- [ ] Use dark surfaces (`#0D0D12` canvas, `#181820` cards, `#22222E` badges/active elements).
- [ ] Use `tabular-nums` for all amounts and currency figures.
- [ ] Apply rounded corners (`rounded-2xl` for cards, `rounded-xl` for item rows).
- [ ] Keep FAB center button golden amber glowing.
- [ ] Support safe-area padding for mobile navigation.
