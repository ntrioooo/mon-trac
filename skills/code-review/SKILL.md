---
name: code-review
description: Comprehensive code review guide, architectural invariants, and quality audit standards for MoneyTrack. Use this skill whenever reviewing pull requests, inspecting code diffs, auditing security and privacy, checking type safety, verifying integer currency math, or enforcing Next.js 16 and mobile-first UI conventions.
---

# MoneyTrack Code Review & Quality Audit Skill

This skill provides a structured methodology and checklist for conducting high-standard code reviews on MoneyTrack.

---

## 1. Code Review Triage & Summary Tables

### Executive Audit Summary Table

| Kategori Audit | Invarian yang Diperiksa | Indikator Pelanggaran (Red Flag) |
|---|---|---|
| **Invarian Finansial** | • Semua uang wajib integer IDR<br>• Pembagian wajib dibulatkan (`Math.round`) | ❌ Penggunaan desimal pecahan seperti `10.50`<br>❌ Pembagian tanpa penanganan pembagi nol (`0`) |
| **Arsitektur Local-First** | • Akses database wajib lewat Repository Layer<br>• Data pengguna 100% tersimpan lokal | ❌ Komponen UI memanggil `db.transactions.*` langsung<br>❌ Mengirim data pengeluaran ke analitik eksternal |
| **Standar Next.js 16** | • Routing auth diatur di `src/proxy.ts`<br>• `"use client"` hanya pada komponen interaktif | ❌ Menggunakan `middleware.ts` usang<br>❌ Rute `/api/auth/*` terblokir redirect loop |
| **Desain Dark Fintech** | • Font: **Plus Jakarta Sans**<br>• Angka moneter: `tabular-nums`<br>• Surface: `#0D0D12` & `#181820`<br>• FAB: Golden Amber glow | ❌ Font kembali ke default browser / Inter<br>❌ Angka bergeser lebar saat nilainya berubah (*jittering*)<br>❌ Target sentuh tombol lebih kecil dari 44x44px |

### Severity Tags Reference Table

| Tag | Tingkat Keparahan | Contoh Kasus |
|---|---|---|
| 🔴 **`[BLOCKER]`** | Kritis (Wajib diperbaiki sebelum merge) | Bug perhitungan uang, kebocoran data, loop redirect pada auth |
| 🟡 **`[WARNING]`** | Penting (Potensi masalah / performa) | Angka belum `tabular-nums`, query tidak efisien, handling error kosong |
| 🔵 **`[SUGGESTION]`** | Saran (Penyempurnaan non-kritis) | Penambahan animasi sentuh `active:scale-95`, refaktor kode lebih ringkas |
| 🟢 **`[PRAISE]`** | Apresiasi | Solusi arsitektur yang sangat rapi dan efisien |

### Review Priority Order

```text
1. Correctness & Financial Math  (Zero tolerance for calculation/data loss bugs)
2. Privacy & Local-First Hygiene (No unencrypted leaks, Dexie encapsulation)
3. Architecture & Next.js 16     (Server/Client boundaries, Proxy convention)
4. Mobile UX & Design System     (Plus Jakarta Sans, Dark Fintech tokens, Touch targets)
5. Cleanliness & Type Safety     (No `any`, Zod schemas, DRY where appropriate)
```

---

## 2. The Core Invariants Checklist

### A. Financial Integrity & Currency Arithmetic
- [ ] **Integer IDR Only**: Are all transaction amounts stored and computed as integers? (No floating-point `0.50` IDR).
- [ ] **No Unsafe Floating Math**: Are divisions (like percentages or averages) explicitly rounded using `Math.round()` or `Math.floor()`?
- [ ] **Empty State Safety**: Do calculations handle empty transaction arrays without returning `NaN`, `Infinity`, or throwing errors?
- [ ] **Negative Values**: Are expenses formatted with explicit negative signs (`-Rp 50.000`) and income with positive signs (`+Rp 100.000`)?

### B. Local-First Data Layer (Dexie.js)
- [ ] **Repository Encapsulation**: Are UI components and Zustand stores calling the Repository layer (`src/lib/repositories/*`), rather than accessing `db.*` directly?
- [ ] **Database Initialization**: Is `initializeDatabase()` called before fetching default categories or settings?
- [ ] **Optimistic UI Updates**: Do store actions update local Zustand state immediately for snappy user feedback?
- [ ] **Zero Unnecessary Network Calls**: Is user financial data kept 100% local on device? (No external tracking or remote database syncing without explicit user setup).

### C. Next.js 16 & Auth.js Conventions
- [ ] **Proxy Convention (`src/proxy.ts`)**: Is routing protection handled in `proxy.ts` (Next.js 16 standard), NOT deprecated `middleware.ts`?
- [ ] **Public Route Bypasses**: Are `/api/auth/*`, `/login`, `/manifest.webmanifest`, `/sw.js`, and `/icons` explicitly exempted from redirect loops?
- [ ] **Client vs. Server Boundaries**: Is `"use client"` placed only where interactive browser APIs (Dexie, hooks, forms, chart rendering) are required?
- [ ] **Session Handling**: Is `SessionProvider` wrapping the root tree and `useSession` / `signIn` / `signOut` imported from `next-auth/react`?

### D. Mobile UX & Design System Compliance
- [ ] **Typography**: Is **Plus Jakarta Sans** used consistently for all text and numbers?
- [ ] **Tabular Figures**: Are all monetary figures rendered with `tabular-nums` class to prevent jitter?
- [ ] **Color Tokens**: Are surfaces styled using the dark luxury tokens (`#0D0D12` canvas, `#181820` card surface, `#22222E` raised/badges)?
- [ ] **Signature FAB**: Does the center Add button feature the golden amber gradient (`from-amber-400 to-amber-600`) with glow?
- [ ] **Touch Target Size**: Are interactive elements (buttons, category tiles, icons) at least 44x44px for thumb tap ergonomics?
- [ ] **Safe Area Inset**: Is `safe-bottom` or `env(safe-area-inset-bottom)` applied to fixed bottom elements?

---

## 3. Review Comment Templates

When providing review feedback, classify findings with standard severity tags:

### 🔴 `[BLOCKER]` (Must fix before merge)
*Calculation bug, data loss risk, auth redirect loop, breaking TypeScript error, or security issue.*
> **Example:**
> `[BLOCKER] src/lib/calculations/transaction-calculations.ts:18`
> Floating point division `total / count` can return `NaN` when `count === 0`. Add fallback: `count === 0 ? 0 : Math.round(total / count)`.

### 🟡 `[WARNING]` (Important improvement)
*Performance bottleneck, missing error boundary, incorrect color token, or accessibility gap.*
> **Example:**
> `[WARNING] src/components/dashboard/quick-stats.tsx:24`
> Amount is missing `tabular-nums` class. When the amount changes, the card layout will jitter.

### 🔵 `[SUGGESTION]` (Non-blocking polish)
*Code readability, minor simplification, or micro-interaction enhancement.*
> **Example:**
> `[SUGGESTION] src/components/expense/category-picker.tsx:42`
> Consider adding `active:scale-95 transition-transform` for better tactile feedback on tap.

### 🟢 `[PRAISE]` (Recognizing good design or clean solution)
> **Example:**
> `[PRAISE] src/lib/repositories/transaction-repository.ts`
> Clean migration to Dexie with deterministic IDs and proper date indexing.

---

## 4. Quick Review Command Run-through

Run these quick checks during review:

```bash
# 1. Type check & production build
npm run build

# 2. Check for any leftover deprecated/forbidden imports
# (e.g. searching for unintentional Supabase or float calculations)
# ripgrep or grep search
```
