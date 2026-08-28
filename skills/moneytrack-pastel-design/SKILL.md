---
name: moneytrack-pastel-design
description: Complete design system, color palette, component specifications, and styling rules for the Modern Pastel Lavender Light Fintech UI (Soft Light Minimalist). Use this skill whenever implementing, restyling, or designing light-mode pages, components, charts, and navigation based on the lavender pastel aesthetic.
---

# MoneyTrack — Modern Pastel Lavender Light Design System

This skill defines the visual identity, design tokens, component architecture, and implementation standards for the **Modern Pastel Minimalist Fintech UI** (Lavender Aurora Light Mode).

---

## 1. Visual Identity & Design Philosophy

The Pastel Lavender aesthetic is designed to feel **approachable, airy, playful, and ultra-modern** while maintaining clean financial clarity.

```text
┌──────────────────────────────────────────────────────────┐
│  Key Aesthetics:                                         │
│  - Soft Aurora/Lavender mesh header background           │
│  - Pure white squircle cards with diffused soft shadows  │
│  - Dual-tone vibrant accents: Electric Purple + Mint Lime│
│  - Floating white bottom bar with center concave cutout  │
│  - Dark navy floating FAB (+) with high contrast         │
│  - Plus Jakarta Sans / Modern geometric typography       │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Color Palette & Design Tokens

### Core Colors (Light Pastel Theme)

| Token | Hex Value | Role / Usage |
|---|---|---|
| **Canvas Background** | `#F8FAFC` | Main page background (soft off-white/slate-50) |
| **Aurora Gradient Top** | `linear-gradient(180deg, #DDD6FE 0%, #EDE9FE 45%, #F8FAFC 100%)` | Top header ambient lavender glow |
| **Card Surface** | `#FFFFFF` | Primary card background (floating squircle cards) |
| **Primary Accent (Purple)** | `#7C3AED` / `#8B5CF6` | Active tabs, donut primary segment, monthly hero bars |
| **Secondary Accent (Lime)** | `#4ADE80` / `#22C55E` | Income indicators, budget positive progress, secondary chart bars |
| **Danger / Expense** | `#EF4444` / `#F87171` | Negative expense values (`-$4.99`), delete actions |
| **Text Primary** | `#0F172A` / `#1E1B4B` | Main headers, transaction titles, bold amounts |
| **Text Secondary** | `#64748B` | Subtitles, dates, category labels |
| **Text Muted** | `#94A3B8` | Inactive icons, placeholder text |
| **FAB Button Background** | `#0F172A` | Floating center action button (dark navy circle) |
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
  border-radius: 1.25rem; /* 20px - 24px squircle */
  box-shadow: 0 4px 20px -2px rgba(139, 92, 246, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(241, 245, 249, 0.8);
}

/* Floating Bottom Navigation Bar */
.pastel-nav-bar {
  background: #FFFFFF;
  border-top-left-radius: 1.5rem;
  border-top-right-radius: 1.5rem;
  box-shadow: 0 -4px 25px rgba(139, 92, 246, 0.08);
}

/* Dark Floating Center FAB */
.pastel-fab {
  background-color: #0F172A;
  color: #FFFFFF;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.25);
  border-radius: 9999px;
}
```

---

## 4. Component Blueprints

### A. Header & Monthly Spend Hero
* **Top Bar**: Circular white/frosted action buttons (Settings gear on left, Notification bell on right) with date pill (`Fri, 21 Jul`) in the center.
* **Hero Spend**:
  * Label: `This Month Spend` (`text-xs font-medium text-slate-600`)
  * Amount: `text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight tabular-nums`
  * Trend Badge: Subtle green/violet pill with trend arrow (`↘ 67% below last month`).

```tsx
<div className="bg-aurora-header px-5 pt-12 pb-6">
  <div className="flex items-center justify-between mb-6">
    <button className="h-10 w-10 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-slate-700">
      <Settings className="h-4 w-4" />
    </button>
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur text-xs font-semibold text-slate-700">
      <Calendar className="h-3.5 w-3.5" />
      <span>Jumat, 28 Agu</span>
    </div>
    <button className="h-10 w-10 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-slate-700">
      <Bell className="h-4 w-4" />
    </button>
  </div>

  <div className="text-center">
    <p className="text-xs font-medium text-slate-600">Pengeluaran Bulan Ini</p>
    <h1 className="text-4xl font-extrabold text-[#0F172A] tracking-tight tabular-nums mt-1">
      Rp 3.500.000
    </h1>
  </div>
</div>
```

---

### B. Floating Wallet / Summary Card
* White rounded container with icon on left (`Spending Wallet`), balance on right, and chevron.

```tsx
<div className="pastel-card p-4 mx-4 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
      <Wallet className="h-5 w-5" />
    </div>
    <span className="text-sm font-semibold text-[#0F172A]">Dompet Utama</span>
  </div>
  <div className="flex items-center gap-2">
    <span className="text-sm font-bold tabular-nums text-[#0F172A]">Rp 15.630.000</span>
    <ChevronRight className="h-4 w-4 text-slate-400" />
  </div>
</div>
```

---

### C. Recent Transactions List
* White card group with individual transaction rows.
* Category icon badge has pastel background matching category color.
* Amount formatted in bold coral (`-Rp 50.000`).

```tsx
<div className="pastel-card p-4 mx-4 space-y-3">
  <div className="flex items-center justify-between mb-2">
    <h2 className="text-sm font-bold text-[#0F172A]">Transaksi Terbaru</h2>
    <Link href="/transactions" className="text-xs font-semibold text-violet-600">Lihat Semua</Link>
  </div>

  {transactions.map((t) => (
    <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
          <CategoryIcon icon={t.categoryId} className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">{t.note || "Pengeluaran"}</p>
          <p className="text-xs text-slate-400">{t.date}</p>
        </div>
      </div>
      <span className="text-sm font-bold tabular-nums text-rose-500">
        -{formatCurrency(t.amount)}
      </span>
    </div>
  ))}
</div>
```

---

### D. Analytics & Charts (Dual-Tone Purple + Lime)
* **Donut Chart**: Thick donut radius with Violet (`#7C3AED`) as main expense and Lime (`#4ADE80`) as secondary.
* **Bar Chart**: Dual comparison bars (Income in Violet `#7C3AED`, Expense in Lime `#4ADE80` or vice versa) with rounded bar tops (`radius={[6, 6, 0, 0]}`).

---

### E. Floating Bottom Navigation with Curved Notch
* Bottom bar is pure white (`#FFFFFF`).
* Center FAB is elevated dark navy circle with white plus icon.
* Active tab icon is colored `#7C3AED` with a subtle purple dot or colored text.

---

## 5. Do's & Don'ts Checklist

| ✅ DO | ❌ DON'T |
|---|---|
| Use subtle lavender gradient on top headers | Don't use harsh dark borders on white cards |
| Use large border radii (`rounded-2xl` / `rounded-3xl`) | Don't use sharp 90-degree square corners |
| Use high contrast text (`#0F172A`) for amounts | Don't use low-contrast gray text for money figures |
| Keep category badges tinted with light pastel backgrounds | Don't use solid dark badges on white cards |
| Use vibrant Violet `#7C3AED` + Lime `#4ADE80` for charts | Don't use generic primary blue/red for data visualizer |
