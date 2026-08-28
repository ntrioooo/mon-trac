---
name: app-testing
description: Comprehensive testing strategy, unit test patterns, Dexie IndexedDB integration tests, and QA verification workflows for MoneyTrack. Use this skill whenever writing tests, running test suites, verifying calculations, testing repositories, debugging regressions, or executing manual and automated quality assurance for the MoneyTrack app.
---

# MoneyTrack Application Testing Skill

This skill defines the testing philosophy, unit test patterns, data-layer integration testing, and verification checklists for MoneyTrack.

---

## 1. Testing Architecture & Summary Table

### Executive Summary Table

| Tier / Kategori | Area Pengujian | Yang Diverifikasi |
|---|---|---|
| **Tier 1: Kalkulasi Finansial** | `src/lib/calculations/*` | • Semua nominal berupa **integer IDR** (bebas error *floating-point*)<br>• Status budget: Normal (`<80%`), Warning (`80–100%`), Exceeded (`>100%`)<br>• Penanganan array kosong (kembali ke `0`, tidak `NaN`/`undefined`) |
| **Tier 2: Repository & Dexie** | `src/lib/repositories/*` | • Operasi CRUD pada IndexedDB lokal berfungsi normal<br>• Inisialisasi awal database (`initializeDatabase`) berjalan sukses<br>• Query berdasarkan rentang tanggal & kategori akurat |
| **Tier 3: Form & Validasi** | `src/schemas/*`, Komponen Input | • Skema Zod menolak nominal `0` atau kategori kosong<br>• Format input otomatis ribuan (`50000` ➔ `50.000`) |
| **Tier 4: Manual QA & PWA** | Alur Aplikasi & Mobile UX | • **Fast Entry**: Input transaksi selesai di bawah 5 detik<br>• **Offline Mode**: Tetap bisa input transaksi saat tanpa internet<br>• **PWA Manifest & SW**: Mode *standalone*, icon resolusi tinggi |
| **Tier 5: Backup & Restore** | Export / Import | • File JSON backup valid & memuat versi skema<br>• File CSV dapat dibuka rapi di spreadsheet |

### Test Priority Pyramid

```text
┌──────────────────────────────────────────────────────────┐
│  Tier 1: Pure Financial Calculations (Highest Priority)  │
│  - Total spending, budget remaining, percentages         │
│  - Integer IDR arithmetic, date grouping                 │
├──────────────────────────────────────────────────────────┤
│  Tier 2: Zod Schemas & Validation                        │
│  - Transaction form schema, category schema, backups     │
├──────────────────────────────────────────────────────────┤
│  Tier 3: Repository & IndexedDB (Dexie) Operations       │
│  - CRUD, bulk operations, initial database seeding       │
├──────────────────────────────────────────────────────────┤
│  Tier 4: Component & Form Interactions                   │
│  - Fast expense sheet, amount input parsing, category    │
├──────────────────────────────────────────────────────────┤
│  Tier 5: PWA & Offline Verification                      │
│  - Service worker caching, manifest, mobile layout       │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Unit Testing: Financial Calculations

Financial calculations (`src/lib/calculations/`) must be **100% deterministic, pure, and free of floating-point errors**.

### Key Test Cases Checklist:

1. **Integer Money Calculations**:
   - Zero amount (`0 IDR`)
   - Large amounts (`Rp 1.000.000.000`)
   - Empty transaction list handling (returns `0`, not `NaN` or `undefined`)
2. **Budget Status Logic**:
   - Safe (`< 80%` of budget) -> `"normal"`
   - Warning (`>= 80%` and `<= 100%`) -> `"warning"`
   - Exceeded (`> 100%`) -> `"exceeded"`
   - No budget set (`undefined` or `0`) -> handles gracefully without divide-by-zero
3. **Date Grouping**:
   - Multiple transactions on the same date sorted by timestamp
   - Transactions spanning multiple months
   - Relative date labels (`"Hari ini"`, `"Kemarin"`, `"dd MMM yyyy"`)

### Example Vitest Spec: `tests/unit/calculations.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import {
  calculateTotalSpending,
  calculateCategorySpending,
  groupTransactionsByDate,
} from "@/lib/calculations/transaction-calculations";
import {
  calculateBudgetRemaining,
  calculateBudgetPercentage,
  getBudgetStatus,
} from "@/lib/calculations/budget-calculations";
import type { Transaction } from "@/types/transaction";
import type { Category } from "@/types/category";

describe("Financial Calculations", () => {
  const sampleTransactions: Transaction[] = [
    {
      id: "t1",
      amount: 50000,
      type: "expense",
      categoryId: "food",
      date: "2026-08-28",
      paymentMethod: "cash",
      createdAt: "2026-08-28T10:00:00Z",
      updatedAt: "2026-08-28T10:00:00Z",
    },
    {
      id: "t2",
      amount: 150000,
      type: "expense",
      categoryId: "food",
      date: "2026-08-28",
      paymentMethod: "gopay",
      createdAt: "2026-08-28T12:00:00Z",
      updatedAt: "2026-08-28T12:00:00Z",
    },
  ];

  it("calculates total spending accurately with integer IDR", () => {
    const total = calculateTotalSpending(sampleTransactions);
    expect(total).toBe(200000);
    expect(Number.isInteger(total)).toBe(true);
  });

  it("calculates budget status correctly", () => {
    const budget = 250000;
    const spending = 200000; // 80%
    expect(calculateBudgetRemaining(budget, spending)).toBe(50000);
    expect(calculateBudgetPercentage(budget, spending)).toBe(80);
    expect(getBudgetStatus(budget, spending)).toBe("warning");
  });

  it("handles exceeded budget without negative percentage errors", () => {
    const budget = 100000;
    const spending = 150000; // 150%
    expect(calculateBudgetRemaining(budget, spending)).toBe(-50000);
    expect(calculateBudgetPercentage(budget, spending)).toBe(150);
    expect(getBudgetStatus(budget, spending)).toBe("exceeded");
  });
});
```

---

## 3. Repository & Data Layer Testing (Dexie / IndexedDB)

Use `fake-indexeddb` to test Dexie repository operations in Node.js environments.

### Example Spec: `tests/integration/repository.test.ts`

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { db, initializeDatabase } from "@/lib/db";
import { transactionRepository } from "@/lib/repositories/transaction-repository";

describe("Transaction Repository with Dexie", () => {
  beforeEach(async () => {
    await db.transactions.clear();
    await db.categories.clear();
    await db.settings.clear();
    await initializeDatabase();
  });

  it("creates and retrieves a transaction", async () => {
    const txn = {
      id: "test-1",
      amount: 75000,
      type: "expense" as const,
      categoryId: "food",
      date: "2026-08-28",
      paymentMethod: "cash" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await transactionRepository.create(txn);
    const retrieved = await transactionRepository.getById("test-1");
    expect(retrieved).toBeDefined();
    expect(retrieved?.amount).toBe(75000);
  });

  it("deletes transaction properly", async () => {
    await transactionRepository.create({
      id: "test-delete",
      amount: 25000,
      type: "expense",
      categoryId: "transport",
      date: "2026-08-28",
      paymentMethod: "cash",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await transactionRepository.delete("test-delete");
    const retrieved = await transactionRepository.getById("test-delete");
    expect(retrieved).toBeUndefined();
  });
});
```

---

## 4. Manual QA Verification Checklist

Before releasing any changes or submitting features:

### A. Fast Entry Flow (< 5 Seconds)
- [ ] Tap the glowing amber FAB `(+)` -> Bottom sheet opens instantly (< 100ms).
- [ ] Keypad/amount input automatically focused with numeric keyboard on mobile.
- [ ] Typing digits formats thousand separators immediately (`50000` -> `50.000`).
- [ ] Category grid is touch-responsive with clear active indicator.
- [ ] Submitting closes sheet and shows success toast with updated figures on Dashboard.

### B. Dark UI & Typography Consistency
- [ ] Font is **Plus Jakarta Sans** across all text and numbers.
- [ ] Canvas background is deep charcoal `#0D0D12`, cards `#181820`.
- [ ] All financial numbers use `tabular-nums` so columns do not shift width.
- [ ] Navigation bar FAB has ambient golden amber glow.

### C. PWA & Offline Checks
- [ ] Manifest served at `/manifest.webmanifest` with `standalone` display.
- [ ] Service worker registered in console with scope `/`.
- [ ] App loads and allows adding expenses when network is offline in DevTools.
- [ ] Safe-area padding (`safe-bottom`) prevents content from being hidden behind iPhone home indicator.

### D. Export / Import Data Integrity
- [ ] JSON backup downloads valid `.json` with schema version.
- [ ] Importing valid backup populates categories and transactions without data corruption.
- [ ] CSV export produces clean spreadsheet with formatted Indonesian columns.
