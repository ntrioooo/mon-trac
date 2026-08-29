---
name: moneytrack-pastel-design
description: Complete design system, color palette, component specifications, and styling rules for MonTrac's Modern Pastel Lavender Light Fintech UI (Soft Light Minimalist). Use this skill whenever implementing, restyling, or designing light-mode pages, components, charts, wallets, and transaction forms.
---

# MonTrac — Modern Pastel Lavender Light Design System

This skill defines the visual identity, design tokens, component architecture, and implementation standards for the **MonTrac Modern Pastel Minimalist Fintech UI** (Lavender Aurora Light Mode).

---

## 1. Visual Identity & Design Philosophy

The MonTrac Pastel Lavender aesthetic is **approachable, airy, ultra-modern, and frictionless**:
- **Soft Aurora/Lavender mesh header background** for a premium first impression.
- **Pure white squircle cards (`rounded-2xl` / `rounded-3xl`)** with diffused soft lavender shadows.
- **Semantic color hierarchy**:
  - **Electric Violet (`#7C3AED`)**: Brand accent, primary buttons, wallet chips.
  - **Mint / Emerald Green (`#10B981` / `#4ADE80`)**: Incomes, surplus cash flow, positive budget states.
  - **Rose / Coral Red (`#EF4444` / `#F87171`)**: Expenses, warnings, over-budget indicators.
- **Floating bottom navigation bar** with dark navy floating action button (`+`).
- **Plus Jakarta Sans typography** with high contrast dark slate (`#0F172A`) for financial amounts.

---

## 2. Color Palette & Design Tokens

| Token | Hex Value | Role / Usage |
|---|---|---|
| **Canvas Background** | `#F8FAFC` | Main page background (soft slate-50) |
| **Aurora Gradient Top** | `linear-gradient(180deg, #DDD6FE 0%, #EDE9FE 45%, #F8FAFC 100%)` | Top header ambient lavender glow |
| **Card Surface** | `#FFFFFF` | Primary card background (floating squircle cards) |
| **Primary Brand (Violet)** | `#7C3AED` / `#8B5CF6` | Active navigation, default wallet badges, primary CTAs |
| **Income Accent (Mint)** | `#10B981` / `#4ADE80` | Income figures (`+Rp 2.500.000`), positive cash flow |
| **Expense Accent (Rose)** | `#EF4444` / `#F87171` | Expense figures (`-Rp 50.000`), delete actions |
| **Text Primary** | `#0F172A` | Main headers, transaction titles, bold amounts |
| **Text Secondary** | `#64748B` | Subtitles, dates, category labels |
| **Text Muted** | `#94A3B8` | Inactive icons, placeholder text |
| **FAB Background** | `#0F172A` | Floating center action button (dark navy circle) |
| **FAB Icon** | `#FFFFFF` | Plus icon on center button |

---

## 3. Tailwind CSS & Utility Classes

```css
/* Aurora Background */
.bg-aurora-header {
  background: linear-gradient(180deg, #DDD6FE 0%, #EDE9FE 45%, #F8FAFC 100%);
}

/* Soft Floating Card */
.pastel-card {
  background-color: #FFFFFF;
  border-radius: 1.25rem; /* 20px squircle */
  box-shadow: 0 4px 20px -2px rgba(139, 92, 246, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(241, 245, 249, 0.9);
}

/* Floating Bottom Navigation Bar */
.pastel-nav-bar {
  background: #FFFFFF;
  border-top-left-radius: 1.75rem;
  border-top-right-radius: 1.75rem;
  box-shadow: 0 -4px 25px rgba(139, 92, 246, 0.08);
  border-top: 1px solid rgba(241, 245, 249, 0.8);
}

/* Floating Dark Center FAB */
.pastel-fab {
  background-color: #0F172A;
  color: #FFFFFF;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.28);
  border-radius: 9999px;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.pastel-fab:active {
  transform: scale(0.92);
}
```

---

## 4. Component Blueprints

### A. Wallet Balance Carousel & Card
```tsx
<div className="pastel-card p-4 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="h-11 w-11 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
      <Building2 className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500">Bank Mandiri</p>
      <p className="text-base font-extrabold text-[#0F172A] tabular-nums">Rp 2.000.000</p>
    </div>
  </div>
  <button className="text-xs font-bold text-violet-600 hover:text-violet-700">
    Kelola
  </button>
</div>
```

### B. Direct Add/Edit Transaction Form Layout
- Always display **Type Switcher**, **Amount**, **Wallet Selector**, **Category Grid**, **Note Input**, and **Date Picker** immediately in the viewport without collapsible toggles.
- Form inputs have rounded-xl borders with clean slate focus states.

### C. Income vs. Expense Transaction Rows
- **Income Row**:
  ```tsx
  <span className="text-sm font-extrabold tabular-nums text-emerald-600">
    +{formatCurrency(t.amount)}
  </span>
  ```
- **Expense Row**:
  ```tsx
  <span className="text-sm font-extrabold tabular-nums text-rose-500">
    -{formatCurrency(t.amount)}
  </span>
  ```

---

## 5. Design Checklist & Guardrails

| ✅ DO | ❌ DON'T |
|---|---|
| Show Note and Date inputs directly in forms | Don't hide fields behind "Tambah catatan" accordions |
| Use Emerald `#10B981` for Income and Rose `#EF4444` for Expense | Don't use uniform gray or ambiguous colors for transaction amounts |
| Display Wallet icons and names clearly on each transaction | Don't omit account/wallet sources |
| Use `tabular-nums` for all financial figures | Don't use proportional numbers for financial tables/lists |
