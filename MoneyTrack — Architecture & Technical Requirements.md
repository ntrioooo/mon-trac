# MoneyTrack — Personal Expense Tracker

## 1. Project Overview

**MoneyTrack** adalah aplikasi pencatatan pengeluaran pribadi berbasis web yang dirancang terutama untuk penggunaan melalui smartphone.

Tujuan utama aplikasi:

> Mencatat pengeluaran harian secepat mungkin dari HP tanpa membutuhkan database server.

Aplikasi harus memiliki:

- Google OAuth Login
- Dashboard pengeluaran
- Input pengeluaran yang sangat cepat
- Category management
- Transaction history
- Budget management
- Financial charts
- PWA
- Offline-first functionality
- Local data storage
- Export/import backup
- Responsive UI
- Gratis untuk di-deploy

Aplikasi ini ditujukan untuk **personal use**, bukan aplikasi multi-user atau aplikasi keuangan enterprise.

---

# 2. Core Architecture

Gunakan arsitektur **Local-First PWA**.

```text
                         ┌──────────────────┐
                         │      Google      │
                         │     OAuth 2.0    │
                         └────────┬─────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │      Next.js        │
                       │    App Router       │
                       │                     │
                       │     Auth.js         │
                       │     JWT Session     │
                       └─────────┬───────────┘
                                 │
                                 ▼
                       ┌─────────────────────┐
                       │   React Application │
                       │                     │
                       │    Zustand State    │
                       └─────────┬───────────┘
                                 │
                                 ▼
                       ┌─────────────────────┐
                       │      Dexie.js       │
                       │      IndexedDB      │
                       │                     │
                       │   Transactions      │
                       │   Categories        │
                       │   Settings          │
                       │   Budget            │
                       └─────────┬───────────┘
                                 │
                                 ▼
                       ┌─────────────────────┐
                       │    User Device      │
                       │                     │
                       │ Android / iPhone    │
                       └─────────────────────┘
```

### Important architectural principle

There is **NO server database**.

Do NOT introduce:

- PostgreSQL
- MySQL
- MongoDB
- Firebase
- Supabase database
- PlanetScale
- Prisma database
- Redis
- Any external database service

All application data must be stored locally using:

```text
IndexedDB
    ↓
Dexie.js
```

---

# 3. Authentication Architecture

Authentication uses:

```text
Google OAuth
      ↓
Auth.js
      ↓
JWT Session
```

Authentication exists only to control access to the application.

It does NOT store expense transactions.

### Authentication requirements

User must be able to:

- Login with Google
- See their Google profile
- Stay authenticated through JWT session
- Logout

Protected routes must require authentication.

### Important

Do not store OAuth tokens manually in:

- localStorage
- IndexedDB
- cookies created manually

Let Auth.js handle authentication/session management.

---

# 4. Technology Stack

Use the following stack.

| Layer | Technology |
|---|---|
| Framework | Next.js |
| Architecture | App Router |
| Language | TypeScript |
| UI | React |
| CSS | Tailwind CSS |
| Components | shadcn/ui |
| Icons | Lucide React |
| Authentication | Auth.js / NextAuth |
| OAuth Provider | Google |
| Session | JWT |
| Local Database | IndexedDB |
| IndexedDB Wrapper | Dexie.js |
| State Management | Zustand |
| Form | React Hook Form |
| Validation | Zod |
| Charts | Recharts |
| PWA | Web Manifest + Service Worker |
| Hosting | Vercel Free |
| Source Control | GitHub |

Use the latest stable versions compatible with each other.

---

# 5. Project Structure

Use a clean modular structure.

```text
moneytrack/
│
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── page.tsx
│   │   │
│   │   ├── transactions/
│   │   │   └── page.tsx
│   │   │
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   │
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   │
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── api/
│   │   └── auth/
│   │
│   ├── layout.tsx
│   ├── manifest.ts
│   └── globals.css
│
├── components/
│   ├── dashboard/
│   ├── transactions/
│   ├── reports/
│   ├── categories/
│   ├── settings/
│   ├── expense/
│   ├── pwa/
│   └── ui/
│
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── repositories/
│   │   ├── transaction-repository.ts
│   │   ├── category-repository.ts
│   │   └── settings-repository.ts
│   │
│   ├── calculations/
│   │   ├── transaction-calculations.ts
│   │   ├── budget-calculations.ts
│   │   └── report-calculations.ts
│   │
│   ├── export/
│   │   ├── json.ts
│   │   └── csv.ts
│   │
│   └── utils.ts
│
├── stores/
│   ├── transaction-store.ts
│   ├── category-store.ts
│   └── settings-store.ts
│
├── hooks/
│   ├── use-transactions.ts
│   ├── use-categories.ts
│   └── use-settings.ts
│
├── types/
│   ├── transaction.ts
│   ├── category.ts
│   └── settings.ts
│
├── schemas/
│   ├── transaction-schema.ts
│   ├── category-schema.ts
│   └── import-schema.ts
│
├── public/
│   ├── icons/
│   └── screenshots/
│
├── middleware.ts
├── next.config.ts
├── package.json
└── README.md
```

Do not put all business logic inside page components.

---

# 6. Data Model

## Transaction

```typescript
interface Transaction {
  id: string
  amount: number
  type: "expense"
  categoryId: string
  note?: string
  date: string
  paymentMethod: PaymentMethod
  createdAt: string
  updatedAt: string
}
```

## Payment Method

```typescript
type PaymentMethod =
  | "cash"
  | "bank"
  | "debit"
  | "credit"
  | "ewallet"
```

Display labels in Indonesian:

```text
cash     → Tunai
bank     → Bank
debit    → Debit
credit   → Credit Card
ewallet  → E-Wallet
```

## Category

```typescript
interface Category {
  id: string
  name: string
  icon: string
  color: string
  isDefault: boolean
  createdAt: string
}
```

## Settings

```typescript
interface Settings {
  id: string
  currency: "IDR"
  monthlyBudget?: number
  defaultPaymentMethod: PaymentMethod
  createdAt: string
  updatedAt: string
}
```

---

# 7. IndexedDB Architecture

Create a Dexie database:

```text
MoneyTrackDB
```

Tables:

```text
transactions
categories
settings
```

Example:

```typescript
class MoneyTrackDB extends Dexie {
  transactions!: Table<Transaction, string>
  categories!: Table<Category, string>
  settings!: Table<Settings, string>
}
```

Database access must be centralized.

Prefer:

```text
React Component
      ↓
Zustand Store / Hook
      ↓
Repository
      ↓
Dexie
      ↓
IndexedDB
```

Avoid accessing Dexie directly from every component.

---

# 8. Dashboard Requirements

Dashboard is the primary screen.

Mobile layout:

```text
┌──────────────────────────────┐
│ Good morning 👋              │
│ August 2026                  │
│                              │
│ ┌──────────────────────────┐ │
│ │ Pengeluaran bulan ini    │ │
│ │                          │ │
│ │ Rp 4.250.000             │ │
│ │                          │ │
│ │ Budget                   │ │
│ │ Rp 6.000.000             │ │
│ │                          │ │
│ │ ██████████████░░ 71%     │ │
│ │                          │ │
│ │ Sisa Rp 1.750.000        │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────┐ ┌────────────┐  │
│ │ Hari ini │ │ Transaksi  │  │
│ │125.000   │ │     42     │  │
│ └──────────┘ └────────────┘  │
│                              │
│ Pengeluaran berdasarkan      │
│ kategori                     │
│                              │
│        DONUT CHART            │
│                              │
│ Transaksi terbaru            │
│                              │
│ 🍜 Makan         -Rp 25.000  │
│ ☕ Kopi          -Rp 18.000  │
│ 🚗 Transport     -Rp 15.000  │
│                              │
│              +               │
│ Home Transaction Reports     │
└──────────────────────────────┘
```

Dashboard must display:

### Monthly spending

Total spending for current month.

### Monthly budget

Total configured monthly budget.

### Remaining budget

```text
budget - spending
```

### Budget percentage

```text
(spending / budget) * 100
```

Prevent division by zero.

### Today's spending

Total expenses for current date.

### Transaction count

Number of transactions in current month.

### Category summary

Show top categories by spending.

### Recent transactions

Show latest 5 transactions.

---

# 9. Add Expense Requirements

This is the **MOST IMPORTANT FEATURE**.

The expense form must be optimized for one-handed mobile use.

The user should be able to record an expense in approximately:

> 2–5 seconds

### Preferred interaction

```text
Tap +
   ↓
Amount
   ↓
Tap Category
   ↓
Tap Save
```

Everything else should be optional/defaulted.

---

## Add Expense UI

```text
┌──────────────────────────────┐
│ Tambah Pengeluaran       ×   │
│                              │
│          Rp 25.000           │
│                              │
│ ┌──────────┐ ┌──────────┐    │
│ │ 🍜       │ │ ☕       │    │
│ │ Makanan  │ │ Minuman  │    │
│ └──────────┘ └──────────┘    │
│                              │
│ ┌──────────┐ ┌──────────┐    │
│ │ 🚗       │ │ 🛒       │    │
│ │ Transport│ │ Belanja  │    │
│ └──────────┘ └──────────┘    │
│                              │
│ Catatan (optional)           │
│ ┌──────────────────────────┐ │
│ │ Makan siang              │ │
│ └──────────────────────────┘ │
│                              │
│ 📅 Hari ini                  │
│ 💳 Cash                      │
│                              │
│ ┌──────────────────────────┐ │
│ │       SIMPAN              │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### Requirements

Amount:

- required
- numeric input
- automatically trigger numeric keyboard on mobile
- automatically format IDR
- user enters `25000`
- UI displays `Rp 25.000`

Do not make user type:

```text
Rp
.
,
```

Category:

- required
- selected by tapping
- no manual typing
- large touch targets

Date:

- default today
- allow changing date

Payment method:

- default to last used method
- allow changing

Note:

- optional
- do not require typing

Save:

- large button
- sticky near bottom if necessary
- easy to tap using thumb

After successful save:

- show success toast
- reset form
- return to previous screen
- refresh dashboard

---

# 10. Default Categories

Create these default categories during first application initialization:

| Category | Icon |
|---|---|
| Makanan | 🍜 |
| Minuman | ☕ |
| Transportasi | 🚗 |
| Belanja | 🛒 |
| Tagihan | 🧾 |
| Hiburan | 🎮 |
| Kesehatan | 💊 |
| Pendidikan | 📚 |
| Rumah | 🏠 |
| Lainnya | 📦 |

Users can create custom categories.

Category management supports:

- Create
- Edit
- Delete
- Icon selection
- Color selection

Do not allow deletion of a category if transactions reference it without handling the relationship.

Possible solution:

- prevent deletion
- or move transactions to "Lainnya"

Prefer preventing destructive deletion and explain why.

---

# 11. Transaction History

Create a mobile-friendly transaction list.

```text
┌──────────────────────────────┐
│ Transaksi                    │
│                              │
│ 🔍 Cari transaksi            │
│                              │
│ [Semua] [Makanan] [Belanja]  │
│                              │
│ HARI INI                     │
│                              │
│ 🍜 Makan siang               │
│ Makanan • 12:30              │
│                 -Rp 25.000   │
│                              │
│ ☕ Kopi                       │
│ Minuman • 09:15              │
│                 -Rp 18.000   │
│                              │
│ KEMARIN                      │
│                              │
│ 🛒 Groceries                 │
│ Belanja                      │
│                 -Rp 185.000  │
└──────────────────────────────┘
```

Requirements:

- Search
- Category filter
- Date filter
- Sort newest/oldest
- Edit transaction
- Delete transaction
- Group by date
- Show daily subtotal where useful

For mobile, consider swipe actions:

```text
Swipe left → Delete
Swipe right → Edit
```

But ensure there are accessible alternatives for users who do not use swipe gestures.

---

# 12. Reports & Charts

Create a dedicated Reports page.

Use Recharts.

Charts must be responsive.

## Chart 1 — Daily Spending

Display spending by day for the selected month.

Example:

```text
Pengeluaran Harian

Rp500k │       █
Rp400k │   █   █
Rp300k │ █ █ █ █
Rp200k │ █ █ █ █ █
Rp100k │ █ █ █ █ █ █
       └────────────
         1 5 10 15 20 25
```

Use either:

- BarChart
- LineChart

Choose whichever gives better mobile readability.

---

## Chart 2 — Spending by Category

Use a donut/pie chart.

Example:

```text
        DONUT

     Makanan 35%
     Transport 20%
     Belanja 18%
     Tagihan 15%
     Lainnya 12%
```

Show legend/list beneath chart.

---

## Chart 3 — Monthly Comparison

Show last 6 months.

```text
Pengeluaran 6 Bulan

Jan  ███████
Feb  █████████
Mar  ██████
Apr  ███████████
May  ████████
Jun  ██████████
```

---

## Report statistics

Display:

- Total spending
- Average daily spending
- Largest transaction
- Largest category
- Current month vs previous month

Example:

```text
Total
Rp 4.250.000

Rata-rata / hari
Rp 141.666

Kategori terbesar
Makanan

Transaksi terbesar
Rp 750.000
```

---

# 13. Budget Requirements

Support monthly budgeting.

Example:

```text
August 2026

Budget
Rp 6.000.000

Spent
Rp 4.250.000

Remaining
Rp 1.750.000

Usage
71%
```

Optional category budgets:

```text
Makanan

Budget
Rp 1.500.000

Spent
Rp 950.000

Remaining
Rp 550.000

63%
```

If spending exceeds budget:

```text
Budget exceeded
-Rp 250.000
```

Use a clear warning state.

---

# 14. PWA & Mobile Requirements

MoneyTrack must be a real installable PWA.

Requirements:

- Web App Manifest
- Service Worker
- Offline support
- Standalone display
- App icons
- Theme color
- Apple mobile web app metadata
- Install prompt
- Application shell caching
- Offline transaction entry

After installation, user should be able to open:

```text
📱 Home Screen

┌─────────┐
│   💰    │
│ MoneyTrack│
└─────────┘
```

without typing a URL.

---

# 15. Offline-First Behavior

The application must work without internet after initial loading/install.

The following must work offline:

- Dashboard
- Add expense
- Edit expense
- Delete expense
- Categories
- Transaction history
- Reports
- Budget
- Settings
- Export data

Google OAuth obviously requires internet when the user needs to authenticate again.

Do not make every transaction depend on a server request.

---

# 16. Backup & Restore

Because there is no server database, backup is mandatory.

Create:

## Export JSON

Export all application data.

Example:

```json
{
  "schemaVersion": 1,
  "application": "MoneyTrack",
  "exportedAt": "2026-08-27T10:00:00.000Z",
  "categories": [],
  "transactions": [],
  "settings": {}
}
```

Filename:

```text
moneytrack-backup-YYYY-MM-DD.json
```

---

## Import JSON

Requirements:

1. Select JSON file
2. Validate JSON
3. Validate schema
4. Validate required fields
5. Show preview/confirmation
6. Import to IndexedDB
7. Refresh application state
8. Show success message

Do not blindly insert unvalidated JSON.

Provide options:

```text
Replace existing data
Merge with existing data
Cancel
```

If merge is implemented, use transaction IDs to avoid duplicate records.

---

## Export CSV

Allow transactions to be exported to CSV.

Columns:

```text
Date
Amount
Category
Note
Payment Method
Created At
```

The CSV should open correctly in Microsoft Excel.

---

# 17. Settings

Settings screen:

```text
Pengaturan

ACCOUNT
──────────────
Profile
Email
Logout

PREFERENCES
──────────────
Currency
Default payment method
Monthly budget

CATEGORIES
──────────────
Manage categories

DATA
──────────────
Export JSON
Import JSON
Export CSV
Clear all data
```

Before:

```text
Clear all data
```

show a confirmation dialog.

---

# 18. Mobile Navigation

Use bottom navigation.

```text
┌──────────────────────────────┐
│                              │
│         CONTENT              │
│                              │
│                              │
├──────────────────────────────┤
│ Home  Transactions  + Reports│
│                         Settings
└──────────────────────────────┘
```

Recommended:

```text
Home
Transactions
+
Reports
Settings
```

The center `+` button should be visually prominent.

---

# 19. Indonesian Localization

The primary language is Indonesian.

Use:

```text
Pengeluaran
Transaksi
Kategori
Laporan
Pengaturan
Anggaran
Sisa
Hari ini
Kemarin
Bulan ini
Simpan
Hapus
Edit
Batal
Cari transaksi
Tambah pengeluaran
```

Currency:

```text
IDR
```

Format:

```text
Rp 25.000
Rp 125.000
Rp 1.250.000
Rp 10.000.000
```

Use Indonesian date formatting.

---

# 20. Mobile UX Principles

This is a mobile-first application.

Primary target widths:

```text
360px
375px
390px
430px
```

The design must work comfortably on these widths.

Use:

- large buttons
- large tap targets
- rounded cards
- bottom sheets
- sticky actions
- bottom navigation
- numeric keyboard
- short forms
- minimal typing
- readable charts
- good spacing

Avoid:

- desktop-first dashboards
- huge tables
- tiny controls
- complicated sidebars
- excessive animations
- excessive gradients
- unnecessary decoration
- long forms

---

# 21. Desktop Behavior

Desktop is secondary.

On larger screens:

- center the application shell
- optionally use a sidebar
- increase content width
- preserve mobile-friendly interactions

Do not redesign the application into an enterprise accounting system.

The mobile experience remains the primary target.

---

# 22. Empty States

Create friendly empty states.

No transactions:

```text
Belum ada pengeluaran

Catat pengeluaran pertamamu
untuk mulai melihat laporan keuangan.

[ + Tambah Pengeluaran ]
```

No search results:

```text
Transaksi tidak ditemukan
```

No categories:

```text
Belum ada kategori
```

---

# 23. Error Handling

Handle:

- Invalid amount
- Empty required fields
- IndexedDB errors
- Import errors
- Invalid JSON
- Invalid schema
- Duplicate transactions
- Storage errors
- Authentication errors

Do not expose technical errors directly.

Instead show messages such as:

```text
Gagal menyimpan transaksi.
Silakan coba lagi.
```

---

# 24. Data Calculation Layer

Do not duplicate financial calculation logic in React components.

Create reusable functions.

Examples:

```typescript
calculateMonthlySpending()
calculateTodaySpending()
calculateRemainingBudget()
calculateBudgetPercentage()
calculateCategorySpending()
calculateMonthlyComparison()
calculateAverageDailySpending()
findLargestTransaction()
findLargestCategory()
```

These functions should be pure and testable.

---

# 25. Performance Requirements

The application should feel instant.

Optimize:

- IndexedDB queries
- React rendering
- Zustand subscriptions
- chart rendering
- bundle size
- PWA assets

Charts can be lazy-loaded if useful.

Do not add unnecessary dependencies.

Avoid unnecessary client components.

---

# 26. Security Requirements

Authentication data and expense data must be separated.

Do not:

- store OAuth tokens in IndexedDB
- manually store authentication tokens in localStorage
- send transactions to a third-party analytics service
- create unnecessary external APIs

Transaction data should remain local to the device.

---

# 27. Privacy

The application is designed for personal financial data.

By default:

```text
Transaction
    ↓
IndexedDB
    ↓
User's device
```

Do not send transaction data to any third-party service.

No advertising.

No analytics required for MVP.

No financial data tracking.

---

# 28. Deployment

The application should be deployable using:

```text
GitHub
   ↓
Vercel
   ↓
Next.js Application
```

Target:

```text
Vercel Free
```

No paid infrastructure should be required.

Required environment variables should be documented in `.env.example`.

Example:

```env
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

Use the correct environment variable naming required by the chosen Auth.js implementation.

---

# 29. README Requirements

Create a complete README containing:

## Setup

```bash
npm install
npm run dev
```

## Environment variables

Explain:

- Auth secret
- Google OAuth Client ID
- Google OAuth Client Secret

## Google OAuth setup

Explain:

1. Create Google OAuth credentials
2. Configure authorized origins
3. Configure callback URL
4. Add credentials to `.env.local`

## Vercel deployment

Explain:

1. Push to GitHub
2. Import repository into Vercel
3. Configure environment variables
4. Deploy
5. Configure Google OAuth production callback URL

## PWA testing

Explain how to:

- install PWA
- test offline mode
- test IndexedDB
- test backup/restore

---

# 30. Testing Requirements

At minimum test:

### Authentication

- Login
- Logout
- Protected routes

### Transactions

- Add
- Edit
- Delete
- Search
- Filter
- Date filtering

### Categories

- Add
- Edit
- Delete
- Category selection

### Budget

- Set budget
- Calculate remaining
- Calculate percentage
- Budget exceeded state

### Reports

- Daily calculation
- Monthly calculation
- Category calculation
- 6-month comparison

### Backup

- JSON export
- JSON import
- Invalid JSON
- CSV export

### PWA

- Install
- Offline access
- Offline transaction creation

---

# 31. Initial Seed Data

For development/demo purposes, create realistic sample transactions.

Example:

```text
Makan siang
Rp 25.000

Kopi
Rp 18.000

Transport
Rp 22.000

Belanja groceries
Rp 185.000

Pulsa
Rp 50.000
```

However, production initialization should allow the user to start with empty data.

Do not permanently hardcode sample transactions into production.

---

# 32. UX Priority

Implement features according to this priority:

### P0 — Critical

1. Login
2. Dashboard
3. Add Expense
4. IndexedDB
5. Transaction history
6. PWA
7. Backup/restore

### P1 — Important

8. Categories
9. Budget
10. Reports
11. Charts

### P2 — Nice to have

12. Advanced filters
13. Swipe gestures
14. Category budgets
15. Advanced analytics

---

# 33. Important Product Decision

Do NOT over-engineer this project.

This is a:

> Personal expense tracker

It is NOT:

- accounting software
- ERP
- banking application
- financial planning platform
- multi-user SaaS
- investment platform

Keep the architecture simple.

The main value is:

```text
Fast input
+
Local data
+
Useful dashboard
+
Simple reports
+
Offline PWA
```

---

# 34. Final User Flow

The ideal daily flow is:

```text
Open MoneyTrack
       ↓
Dashboard
       ↓
Tap +
       ↓
Amount
       ↓
Tap Category
       ↓
Tap Save
       ↓
Success
       ↓
Dashboard updated
```

This flow should require minimal interaction.

---

# 35. Definition of Done

The application is considered complete when:

- [ ] Google OAuth login works
- [ ] JWT session works without a database
- [ ] Dashboard works
- [ ] Transactions are stored in IndexedDB
- [ ] Add expense works
- [ ] Edit expense works
- [ ] Delete expense works
- [ ] Category management works
- [ ] Monthly budget works
- [ ] Reports work
- [ ] Charts work
- [ ] Search works
- [ ] Filters work
- [ ] JSON export works
- [ ] JSON import works
- [ ] CSV export works
- [ ] Clear data works with confirmation
- [ ] PWA is installable
- [ ] Application works offline
- [ ] Mobile UI works at 360px–430px
- [ ] Desktop responsive layout works
- [ ] Indonesian currency formatting works
- [ ] README is complete
- [ ] `.env.example` exists
- [ ] Project can be deployed to Vercel Free
- [ ] No database is required
- [ ] No paid infrastructure is required

---

# 36. Implementation Instruction for Claude

Build this application incrementally.

Start with:

1. Project setup
2. Authentication
3. IndexedDB/Dexie architecture
4. Application shell
5. Mobile navigation
6. Dashboard
7. Add Expense
8. Transaction History
9. Categories
10. Budget
11. Reports/Charts
12. Backup/Restore
13. PWA
14. Testing
15. README

Before adding new libraries, check whether the existing stack can solve the requirement.

Do not introduce a server database.

Do not create unnecessary APIs.

Keep the application local-first.

Prioritize mobile UX over desktop UX.

The **Add Expense flow is the highest-priority interaction in the entire application**.

The final result should feel like a polished personal finance mobile app rather than a generic CRUD dashboard.