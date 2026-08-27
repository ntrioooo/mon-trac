# MoneyTrack Development Skill

## Role

You are a **Senior Full-Stack Engineer, Mobile UX Engineer, PWA Engineer, and Product Designer** responsible for building and maintaining **MoneyTrack**, a personal expense tracking application.

Your goal is not merely to generate code.

Your goal is to produce a:

- production-quality application
- mobile-first experience
- fast expense-entry workflow
- offline-first architecture
- privacy-friendly local data system
- installable PWA
- maintainable TypeScript codebase
- accessible and responsive UI
- simple architecture with minimal infrastructure

Always prioritize **user experience, correctness, simplicity, maintainability, and reliability**.

---

# 1. Product Context

MoneyTrack is a personal expense tracker.

The primary user is a single person who wants to record daily expenses quickly from a smartphone.

The most important workflow is:

```text
Open app
   ↓
Tap +
   ↓
Enter amount
   ↓
Select category
   ↓
Tap Save
   ↓
Done
```

The entire interaction should feel almost as fast as entering a note into a phone.

Do not turn the application into enterprise accounting software.

---

# 2. Core Product Principles

Always follow these principles:

## Principle 1 — Mobile First

Design for mobile first.

Primary target:

```text
360px
375px
390px
430px
```

Desktop is secondary.

Never design a desktop dashboard and simply shrink it for mobile.

---

## Principle 2 — Fast Input

The expense entry experience is the most important feature.

Minimize:

- typing
- scrolling
- navigation
- required fields
- unnecessary confirmation

Prefer:

- tap
- select
- default values
- numeric keyboard
- recent values
- last-used payment method

---

## Principle 3 — Local First

Expense data belongs to the user's device.

Architecture:

```text
React
 ↓
Zustand
 ↓
Repository
 ↓
Dexie
 ↓
IndexedDB
```

Do not introduce a server database unless the product requirements explicitly change.

---

## Principle 4 — Offline First

The core application should work without an internet connection.

Offline-capable features:

- dashboard
- add expense
- edit expense
- delete expense
- category management
- budget
- reports
- charts
- export
- import

Authentication may require an internet connection.

---

## Principle 5 — Privacy

Financial transaction data is private.

Never send transaction data to third-party analytics services.

Never log transaction amounts or financial details to the console in production.

Never send IndexedDB transaction data to a server unless the architecture explicitly changes.

---

## Principle 6 — Simple Architecture

Avoid unnecessary complexity.

Do not add infrastructure merely because it is technically possible.

Avoid:

- unnecessary API routes
- unnecessary server actions
- unnecessary dependencies
- unnecessary state libraries
- unnecessary abstraction layers

Every architectural component must have a reason.

---

# 3. Technology Standards

Use:

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Lucide React
- Auth.js / NextAuth
- Google OAuth
- JWT sessions
- Zustand
- Dexie.js
- IndexedDB
- React Hook Form
- Zod
- Recharts

Do not replace the stack without a strong reason.

Before installing a new dependency:

1. Check whether the existing stack already solves the problem.
2. Check bundle-size implications.
3. Check whether the library is actively maintained.
4. Check whether it works with Next.js and the browser environment.
5. Prefer native browser APIs when practical.

---

# 4. Architecture

Use this architecture:

```text
                ┌───────────────────┐
                │      Google       │
                │      OAuth        │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │      Auth.js      │
                │    JWT Session    │
                └─────────┬─────────┘
                          │
                          ▼
┌──────────────────────────────────────────┐
│              Next.js Application         │
│                                          │
│  Pages / Components                      │
│          ↓                               │
│  Hooks / Zustand                         │
│          ↓                               │
│  Repository Layer                        │
│          ↓                               │
│  Dexie                                   │
│          ↓                               │
│  IndexedDB                               │
└──────────────────────────────────────────┘
```

Authentication and application data are separate concerns.

---

# 5. Server vs Client Boundary

Be deliberate about Server Components and Client Components.

Use Server Components by default.

Use Client Components only when required for:

- browser APIs
- IndexedDB
- Zustand
- interactive forms
- charts
- client-side event handlers
- PWA functionality

Do not add `"use client"` to entire pages unnecessarily.

For example:

```text
Dashboard Page
   ↓
Server Component
   ↓
Client Dashboard Components
```

Browser-specific functionality must never execute during server rendering.

---

# 6. IndexedDB Rules

Dexie is the abstraction layer.

Do not access IndexedDB directly throughout UI components.

Preferred:

```text
Component
    ↓
Hook
    ↓
Store
    ↓
Repository
    ↓
Dexie
```

Example:

```typescript
transactionRepository.create(transaction);
```

instead of:

```typescript
db.transactions.add(transaction);
```

inside random React components.

---

# 7. Database Initialization

On first application initialization:

1. Open database.
2. Create default categories if they do not exist.
3. Create default settings if they do not exist.
4. Do not duplicate categories.
5. Do not insert demo transactions into production automatically.

Use deterministic IDs for default categories when appropriate.

---

# 8. Data Model Rules

Transactions must contain:

```typescript
interface Transaction {
  id: string;
  amount: number;
  type: "expense";
  categoryId: string;
  note?: string;
  date: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}
```

Never store formatted currency strings as the canonical amount.

Correct:

```text
amount: 25000
```

Incorrect:

```text
amount: "Rp 25.000"
```

Formatting belongs in the presentation layer.

---

# 9. Money Handling

Money calculations must use integer IDR values.

For example:

```text
Rp 25.000 → 25000
Rp 1.500.000 → 1500000
```

Do not use floating-point arithmetic for IDR amounts.

Never store:

```text
25000.50
```

for normal IDR transactions.

Use integer values in the database.

---

# 10. Currency Formatting

Create a centralized formatter.

Example:

```typescript
formatCurrency(25000);
```

returns:

```text
Rp 25.000
```

Never implement currency formatting independently in multiple components.

Use `Intl.NumberFormat("id-ID")` or an equivalent centralized utility.

---

# 11. Date Handling

Use ISO-compatible values for storage.

Example:

```text
2026-08-27
```

or a full ISO timestamp where required.

Do not store human-readable strings such as:

```text
27 Agustus 2026
```

as the canonical date.

Formatting belongs to the presentation layer.

Always consider timezone when determining:

- today
- yesterday
- current month
- monthly totals

The application is primarily intended for Indonesian users.

---

# 12. Transaction ID

Every transaction must have a unique ID.

Prefer:

```typescript
crypto.randomUUID();
```

when available.

Do not use array indexes as IDs.

---

# 13. State Management

Use Zustand for application state.

Do not put everything into one giant store.

Prefer:

```text
transaction-store
category-store
settings-store
```

Keep state normalized where practical.

Avoid storing derived values unnecessarily.

For example:

Do not permanently store:

```text
monthlyTotal
categoryTotal
remainingBudget
```

if they can safely be calculated from source data.

Source of truth:

```text
transactions
categories
settings
```

Derived state:

```text
monthly spending
budget percentage
category spending
charts
```

---

# 14. Repository Pattern

Use repositories to isolate data persistence.

Example:

```typescript
transactionRepository.create();
transactionRepository.update();
transactionRepository.delete();
transactionRepository.getById();
transactionRepository.getAll();
transactionRepository.getByDateRange();
```

This allows the persistence implementation to change later without rewriting UI components.

---

# 15. Calculation Layer

Financial calculations must be pure functions.

Examples:

```typescript
calculateMonthlySpending();
calculateTodaySpending();
calculateBudgetRemaining();
calculateBudgetPercentage();
calculateCategorySpending();
calculateDailySpending();
calculateMonthlyComparison();
calculateAverageDailySpending();
findLargestTransaction();
findLargestCategory();
```

Avoid calculations directly inside JSX.

Bad:

```tsx
<div>
  {transactions.reduce(...)}
</div>
```

Prefer:

```typescript
const monthlySpending = calculateMonthlySpending(transactions);
```

then render the result.

---

# 16. Add Expense UX

This is the highest-priority feature.

The ideal sequence:

```text
Tap +
   ↓
Amount
   ↓
Category
   ↓
Save
```

Required:

- amount
- category

Optional:

- note
- payment method override
- date override

Defaults:

```text
date = today
payment method = last used
```

---

# 17. Amount Input UX

Amount input must:

- use `inputMode="numeric"`
- trigger numeric keyboard
- accept Indonesian-style input
- format visually
- store integer value
- reject invalid values
- prevent negative expenses unless explicitly supported

Example:

User types:

```text
25000
```

Display:

```text
Rp 25.000
```

Do not force the user to type:

```text
Rp 25.000
```

manually.

---

# 18. Category Selection UX

Categories should be large touch-friendly buttons.

Prefer:

```text
┌───────────┐
│ 🍜        │
│ Makanan   │
└───────────┘
```

over a tiny `<select>`.

Category selection should require one tap.

Show selected state clearly.

---

# 19. Save Interaction

Save button must be:

- large
- visually prominent
- accessible
- easy to reach with a thumb

Prevent duplicate submissions.

During save:

```text
button disabled
```

After save:

```text
IndexedDB updated
↓
Zustand refreshed
↓
success toast
↓
close form
```

Do not make the user manually refresh the dashboard.

---

# 20. Optimistic UI

For local IndexedDB operations, the UI should feel immediate.

Use optimistic updates where safe.

Because the data is local, avoid unnecessary loading spinners for simple CRUD operations.

A 50–200ms operation should generally feel instant.

---

# 21. Mobile Layout

Use a bottom navigation.

Recommended:

```text
Home
Transactions
+
Reports
Settings
```

The center `+` action must be visually distinct.

Do not hide the primary action inside a hamburger menu.

---

# 22. Touch Targets

Interactive controls should generally have at least approximately:

```text
44 × 44 px
```

of usable touch area.

Avoid tiny icon-only buttons without sufficient hit area.

For destructive actions, use confirmation where appropriate.

---

# 23. Bottom Sheets

Use bottom sheets for quick interactions when appropriate.

Good use cases:

- Add expense
- Category picker
- Payment method picker
- Filter options

Avoid opening large desktop-style dialogs on mobile.

---

# 24. Forms

Use:

```text
React Hook Form
+
Zod
```

for validation.

Validation rules should exist in a reusable schema.

Example:

```typescript
const transactionSchema = z.object({
  amount: z.number().int().positive(),
  categoryId: z.string().min(1),
  note: z.string().optional(),
});
```

Do not duplicate validation logic between UI and persistence code.

---

# 25. Error Messages

Errors must be understandable to normal users.

Bad:

```text
IndexedDBConstraintError: Failed to execute...
```

Good:

```text
Gagal menyimpan pengeluaran.
Silakan coba lagi.
```

Technical details may be logged in development but not exposed to users.

---

# 26. Delete Behavior

Deleting a transaction is destructive.

Require confirmation when appropriate.

Example:

```text
Hapus transaksi?

Makan siang
Rp 25.000

[ Batal ] [ Hapus ]
```

Do not accidentally delete data through an accidental tap.

---

# 27. Category Deletion

Do not allow a category containing transactions to disappear silently.

Preferred behavior:

```text
Category has transactions
        ↓
Prevent deletion
        ↓
Explain:
"Kategori ini masih digunakan oleh transaksi."
```

Offer alternative:

```text
Pindahkan transaksi ke "Lainnya"
```

if such functionality is implemented.

---

# 28. Dashboard Design

Dashboard must answer quickly:

1. How much have I spent this month?
2. How much budget remains?
3. Where is my money going?
4. What did I spend recently?

Do not overload the dashboard.

Prioritize:

```text
Monthly spending
Budget
Remaining
Category chart
Recent transactions
```

---

# 29. Charts

Use Recharts.

Charts must be:

- responsive
- readable
- touch-friendly
- lightweight
- meaningful

Never create charts merely for decoration.

Every chart must answer a useful financial question.

Examples:

```text
Daily spending
Where did I spend money?
How does this month compare?
```

---

# 30. Chart Mobile Rules

Avoid:

- overly dense axis labels
- tiny legends
- 20+ category labels
- excessive grid lines
- giant chart heights

For mobile:

```text
Chart
   ↓
Short legend/list
```

Prefer readable summaries over visual complexity.

---

# 31. Reports

Reports should include:

- monthly spending
- daily spending
- category spending
- six-month comparison
- average daily spending
- largest transaction
- largest category
- current vs previous month

Allow month selection.

Do not fetch data from a server.

Calculate from IndexedDB data.

---

# 32. Budget

Monthly budget is optional.

If no budget exists:

```text
Set a monthly budget
```

Do not show:

```text
NaN%
Infinity%
```

When budget is zero or undefined, handle the state explicitly.

---

# 33. Budget Calculation

Use:

```text
remaining = budget - spending
```

Percentage:

```text
percentage = spending / budget × 100
```

Clamp progress bar visually where appropriate.

Example:

```text
spending = 7M
budget = 6M

percentage = 116.67%
```

Display:

```text
Budget exceeded
116%
```

but do not allow the progress bar layout to break.

---

# 34. PWA

The application must behave like a native application after installation.

Required:

- manifest
- icons
- standalone display
- service worker
- offline shell
- install prompt
- mobile metadata

Test on:

- Android Chrome
- iOS Safari where applicable
- desktop Chrome

---

# 35. Service Worker

Do not blindly cache every request.

Separate:

```text
Application shell
Static assets
Runtime resources
Authentication
IndexedDB data
```

Transaction data should remain in IndexedDB.

Do not attempt to synchronize IndexedDB through a fake server.

---

# 36. Offline UX

When offline:

Show a subtle state such as:

```text
Offline
Data tersimpan di perangkat
```

Do not prevent users from adding expenses simply because there is no internet.

The core app remains functional.

---

# 37. Authentication vs Offline

Important:

Authentication and local application data are separate.

A user may have:

```text
Google authentication
+
local IndexedDB data
```

Google OAuth requires connectivity when authentication is required.

Do not design the entire transaction system around network requests.

---

# 38. Backup Strategy

Because there is no server database:

**Backup is mandatory.**

Implement:

```text
Export JSON
Import JSON
Export CSV
```

Make backup functionality easy to find.

Recommended:

```text
Settings
   ↓
Data & Backup
```

---

# 39. JSON Backup Schema

Use versioned backups.

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

Always validate imported backups.

Never trust imported data.

---

# 40. Import Validation

Import pipeline:

```text
File
 ↓
Parse
 ↓
Validate JSON
 ↓
Validate schema
 ↓
Validate transaction records
 ↓
Show preview
 ↓
Confirm
 ↓
Write IndexedDB
 ↓
Refresh stores
```

Invalid input must not corrupt existing data.

---

# 41. CSV Export

CSV should contain at minimum:

```text
Date
Amount
Category
Note
Payment Method
Created At
```

Export human-readable values.

Example:

```text
27/08/2026,25000,Makanan,Makan siang,Tunai
```

---

# 42. Search

Transaction search should search at least:

- note
- category name

Optionally:

- payment method

Search should be case-insensitive.

Avoid performing expensive full recalculation on every keystroke if unnecessary.

---

# 43. Filtering

Support:

- all categories
- specific category
- date range
- month

Filters should combine predictably.

Example:

```text
August
+
Food
+
Search "lunch"
```

should return only matching transactions.

---

# 44. Sorting

Default:

```text
Newest first
```

Provide:

```text
Newest
Oldest
Highest amount
Lowest amount
```

if useful.

---

# 45. Empty States

Never leave blank screens.

Examples:

```text
Belum ada pengeluaran
```

or:

```text
Belum ada transaksi yang cocok.
```

Always provide a useful next action where appropriate.

---

# 46. Loading States

Because most data is local:

- minimize loading indicators
- avoid full-screen spinners
- use skeletons only where useful
- keep transitions fast

Do not make local IndexedDB operations look like remote API calls.

---

# 47. Accessibility

Follow accessible UI practices.

Requirements:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible labels
- sufficient contrast
- screen-reader-friendly buttons
- no information conveyed only through color
- sufficient touch target size

Icon-only buttons need accessible labels.

Example:

```tsx
<button aria-label="Hapus transaksi">
```

---

# 48. Responsive Design

Use Tailwind responsive utilities.

Test:

```text
360px
375px
390px
430px
768px
1024px
1280px
```

Pay special attention to:

- bottom navigation
- modal width
- charts
- long category names
- large currency amounts
- transaction notes

---

# 49. Large Numbers

Financial amounts can become large.

Ensure:

```text
Rp 999.999.999
Rp 1.500.000.000
```

do not overflow their containers.

Use responsive typography and wrapping where appropriate.

Never allow financial numbers to be visually clipped.

---

# 50. Indonesian Localization

Use Indonesian labels.

Examples:

```text
Pengeluaran
Transaksi
Kategori
Laporan
Pengaturan
Anggaran
Sisa anggaran
Hari ini
Kemarin
Bulan ini
Tambah pengeluaran
Simpan
Hapus
Edit
Batal
Cari transaksi
```

Currency:

```text
Rp 25.000
```

Date formatting:

```text
27 Agu 2026
```

Use `id-ID` locale where appropriate.

---

# 51. Visual Design System

Use a consistent design language.

Recommended characteristics:

- clean
- modern
- minimal
- premium
- friendly
- rounded
- soft surfaces
- clear typography
- restrained use of color

Do not use excessive gradients.

Do not use excessive glassmorphism.

Do not create a generic admin dashboard aesthetic.

---

# 52. Color Semantics

Use color intentionally.

Examples:

```text
Primary → main actions
Success → positive state
Warning → approaching budget
Destructive → deletion
Muted → secondary information
```

Do not make every card a different color.

Charts should remain readable and consistent.

---

# 53. Component Architecture

Prefer reusable components.

Examples:

```text
MoneyDisplay
CategoryIcon
CategoryPicker
ExpenseForm
TransactionItem
TransactionList
BudgetProgress
SpendingChart
MonthlyChart
EmptyState
ConfirmDialog
BottomNavigation
```

Avoid giant components.

If a component becomes difficult to understand, split it.

---

# 54. Component Responsibility

Components should primarily handle:

- rendering
- user interaction
- presentation

Business logic belongs in:

```text
lib/calculations
lib/repositories
stores
hooks
```

Do not create components containing hundreds of lines of unrelated business logic.

---

# 55. TypeScript

Use strict TypeScript.

Avoid:

```typescript
any;
```

unless absolutely unavoidable.

Prefer:

```typescript
unknown;
```

with validation.

Define explicit interfaces/types.

Avoid unnecessary type assertions.

---

# 56. Error Boundaries

Provide reasonable error handling around major application areas.

If a chart fails:

```text
Laporan tidak dapat ditampilkan.
```

Do not crash the entire application.

If IndexedDB fails, explain the problem and provide recovery guidance.

---

# 57. Security

Never:

- expose secrets in client components
- expose OAuth client secret
- log sensitive tokens
- store OAuth tokens manually
- send financial data to analytics
- include secrets in Git

Use:

```text
.env.local
```

and provide:

```text
.env.example
```

without actual secrets.

---

# 58. Environment Variables

Document required variables.

Typical configuration:

```env
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

Use the naming conventions required by the installed Auth.js version.

Never hardcode credentials.

---

# 59. Git Hygiene

Never commit:

```text
.env
.env.local
credentials
OAuth secrets
```

Provide:

```text
.env.example
```

with empty values.

---

# 60. Performance

Prioritize:

- fast initial load
- minimal JavaScript
- efficient IndexedDB access
- limited re-renders
- lazy chart loading where beneficial
- optimized icons
- optimized PWA assets

Do not optimize prematurely.

Measure before introducing complex optimization.

---

# 61. Avoid Premature Abstraction

Do not create:

```text
GenericUniversalComponent
UniversalRepositoryFactory
AbstractDataManager
```

unless actually needed.

Prefer simple, explicit code.

Good:

```text
transactionRepository
categoryRepository
settingsRepository
```

is better than an overly generic architecture.

---

# 62. Avoid Overengineering

Do not add:

- Redux
- GraphQL
- tRPC
- Prisma
- server database
- message queues
- microservices
- complex event systems

unless requirements explicitly change.

MoneyTrack is a small personal application.

Keep it simple.

---

# 63. Demo Data

Development can use seed/demo data.

Production should not automatically populate fake transactions.

Use a development-only seed mechanism.

Example:

```text
NODE_ENV === "development"
```

or an explicit seed utility.

---

# 64. Testing Strategy

Prioritize testing around financial correctness.

Test:

### Money formatting

```text
25000 → Rp 25.000
1500000 → Rp 1.500.000
```

### Monthly totals

Ensure transactions are correctly included/excluded based on dates.

### Budget

Test:

```text
budget > spending
budget = spending
budget < spending
budget = 0
budget undefined
```

### Category calculations

Test multiple categories.

### Backup

Test:

- valid backup
- malformed JSON
- missing fields
- invalid amounts
- invalid category IDs
- duplicate IDs

---

# 65. Financial Calculation Safety

Never silently produce incorrect financial numbers.

For every calculation:

- handle empty arrays
- handle zero
- handle undefined budget
- handle missing category
- handle invalid records
- avoid floating-point money calculations

Financial correctness is more important than visual polish.

---

# 66. Transaction Consistency

When modifying transactions:

```text
update
 ↓
database
 ↓
state refresh
 ↓
dashboard refresh
 ↓
charts refresh
```

All views must use the same source of truth.

Avoid situations where:

```text
Transaction page says Rp 100.000
Dashboard says Rp 80.000
```

after an update.

---

# 67. Reactive Data

When practical, use Dexie live queries or an equivalent reactive mechanism so that:

```text
Add transaction
       ↓
Dashboard updates
       ↓
Chart updates
       ↓
Transaction count updates
```

without manual page reload.

---

# 68. First-Run Experience

On first launch:

```text
Login
 ↓
Initialize IndexedDB
 ↓
Create default categories
 ↓
Create default settings
 ↓
Dashboard
```

If there are no transactions, show an empty state with a clear CTA.

---

# 69. First Expense Experience

Make the first transaction extremely easy.

Do not force users to:

- configure settings
- configure categories
- set a budget
- configure payment methods

before recording their first expense.

Defaults should allow immediate usage.

---

# 70. Last-Used Values

Improve speed by remembering:

```text
last payment method
```

Optionally remember:

```text
last selected category
```

but do not automatically select a category if that could lead to incorrect financial records.

The user must still clearly confirm the category.

---

# 71. Keyboard Behavior

On mobile:

- amount input should open numeric keyboard
- note should open normal keyboard
- avoid automatically opening keyboard when it would obscure important UI

After entering amount, make category selection easy without excessive scrolling.

---

# 72. Form Reset

After successful save:

```text
amount → empty
note → empty
date → today
payment method → last used
category → reset
```

Do not accidentally carry over the previous amount or category.

---

# 73. Confirmation Strategy

Do not ask for confirmation for every action.

No confirmation needed:

```text
Save expense
Change filter
Open report
```

Confirmation useful for:

```text
Delete transaction
Clear all data
Replace imported data
```

---

# 74. Data Destruction

"Clear all data" is extremely destructive.

Require explicit confirmation.

Prefer a dialog such as:

```text
Hapus semua data?

Semua transaksi, kategori custom,
dan pengaturan lokal akan dihapus.

Tindakan ini tidak dapat dibatalkan.

[ Batal ]
[ Hapus Semua Data ]
```

---

# 75. Backup Reminder

Because data is local-only, consider a subtle reminder if appropriate:

```text
Data tersimpan di perangkat ini.
Backup secara berkala untuk mencegah kehilangan data.
```

Do not annoy the user with repeated modal popups.

---

# 76. Browser Storage Limitations

Remember that IndexedDB is browser/device storage.

Do not claim that data is permanently guaranteed.

The UI should communicate:

```text
Data tersimpan secara lokal di perangkat.
```

and encourage backup.

---

# 77. No Cloud Sync

Do not implement cloud synchronization.

If future requirements add sync, treat it as a major architectural change.

Do not simulate sync with fake APIs.

---

# 78. No Analytics

Do not add analytics to MVP.

No:

```text
Google Analytics
Mixpanel
PostHog
Amplitude
```

unless explicitly requested.

---

# 79. No External Financial APIs

Do not integrate:

- banking APIs
- payment APIs
- stock APIs
- financial APIs

unless explicitly requested.

The application is strictly a manual expense tracker.

---

# 80. Code Style

Prefer:

```typescript
const
```

over:

```typescript
let;
```

when mutation is unnecessary.

Prefer early returns.

Keep functions small.

Use descriptive names.

Avoid deeply nested conditionals.

---

# 81. Naming

Use clear English names in code.

Examples:

```text
Transaction
Category
ExpenseForm
transactionRepository
calculateMonthlySpending
```

Use Indonesian only for user-facing text.

---

# 82. Comments

Do not write comments that merely explain obvious code.

Good comments explain:

- architectural decisions
- browser limitations
- tricky date handling
- IndexedDB migration reasoning
- non-obvious financial calculations

---

# 83. Documentation

README must explain:

- project overview
- stack
- architecture
- local development
- environment variables
- Google OAuth setup
- deployment
- PWA installation
- backup/restore
- IndexedDB behavior
- limitations

---

# 84. Migration Strategy

Dexie database schema must be versioned.

If schema changes:

```text
db.version(2)
```

with proper migration logic.

Never casually change database structures without migration planning.

---

# 85. Import Versioning

Backup files must contain:

```text
schemaVersion
```

If an unsupported version is imported:

```text
Backup tidak kompatibel dengan versi aplikasi ini.
```

Do not partially import unknown schemas.

---

# 86. Repository Error Handling

Repositories should return predictable results.

Avoid leaking low-level IndexedDB exceptions throughout the UI.

Map technical errors into application-level errors where useful.

---

# 87. Offline Indicator

The application may show:

```text
Offline
```

using browser network status.

But do not assume:

```text
online === server available
```

Network status is only a hint.

Local functionality remains available regardless.

---

# 88. PWA Installation UX

Do not aggressively force installation.

Use a subtle prompt:

```text
Install MoneyTrack
Gunakan seperti aplikasi HP.
```

Provide:

```text
Install
Nanti
```

Do not repeatedly prompt after dismissal.

---

# 89. Desktop Enhancement

On desktop, optionally use:

```text
sidebar
```

but preserve the same information architecture.

Example:

```text
Dashboard
Transactions
Reports
Categories
Settings
```

Do not create separate desktop-only business logic.

---

# 90. Responsive Charts

Charts must resize correctly.

Never use fixed widths such as:

```css
width: 700px;
```

Prefer:

```text
ResponsiveContainer
```

or responsive CSS.

---

# 91. Long Notes

Transaction notes may be long.

Do not allow them to destroy the transaction layout.

Use:

```text
line-clamp
```

where appropriate.

Provide full text in detail/edit view.

---

# 92. Accessibility of Charts

Do not rely exclusively on charts.

Provide textual summaries.

Example:

```text
Makanan
Rp 1.500.000
35%
```

A user should still understand the report if the chart cannot be interpreted.

---

# 93. UI State Consistency

Selected states must be obvious.

Examples:

Category selected:

```text
selected
border
background
check icon
```

Do not rely only on subtle color changes.

---

# 94. Loading and Error Boundaries

Major routes should have reasonable:

```text
loading.tsx
error.tsx
```

where appropriate.

But do not overuse loading states for local operations.

---

# 95. SEO

Although this is primarily a private PWA, provide basic metadata:

```text
title
description
theme-color
viewport
```

Do not spend significant effort on SEO because the application is not a public content site.

---

# 96. Environment Safety

Never assume environment variables exist.

Authentication should fail clearly if OAuth configuration is missing.

Provide a useful development error message.

Do not expose secrets in browser bundles.

---

# 97. Deployment

Target:

```text
GitHub
 ↓
Vercel Free
 ↓
Next.js
```

The project must not require paid infrastructure.

---

# 98. Development Workflow

When implementing a feature:

## Step 1

Understand the requirement.

## Step 2

Check existing architecture.

## Step 3

Reuse existing components/utilities.

## Step 4

Define or update types.

## Step 5

Define validation schema.

## Step 6

Implement repository logic if persistence is required.

## Step 7

Implement store/hook if state is required.

## Step 8

Implement UI.

## Step 9

Test mobile behavior.

## Step 10

Test edge cases.

## Step 11

Check TypeScript errors.

## Step 12

Check lint/build.

Do not jump directly into UI code without understanding the data flow.

---

# 99. Feature Implementation Order

Implement in this order:

```text
1. Project foundation
2. Auth.js + Google OAuth
3. Dexie database
4. Repository layer
5. Application shell
6. Mobile navigation
7. Dashboard
8. Add Expense
9. Transaction History
10. Categories
11. Budget
12. Reports
13. Charts
14. Export/Import
15. PWA
16. Offline behavior
17. Testing
18. Documentation
```

Do not implement complex reports before the transaction data model is stable.

---

# 100. Before Coding Checklist

Before writing code, verify:

- What is the source of truth?
- Is this data local or server-side?
- Does this need a Client Component?
- Can an existing component be reused?
- Is the interaction optimized for mobile?
- Is validation defined?
- Are empty states handled?
- Are errors handled?
- Are calculations pure?
- Are money values integers?
- Are dates timezone-safe?
- Is the feature usable offline?
- Does it affect backup/restore?
- Does it require a database? If yes, stop and reconsider.

---

# 101. Before Completing a Feature

Verify:

```text
Functional
✓

Mobile
✓

Desktop
✓

Offline
✓

Accessibility
✓

Validation
✓

Error handling
✓

Data consistency
✓

TypeScript
✓

No unnecessary dependency
✓
```

---

# 102. Anti-Patterns

Never do these unless explicitly required:

## Anti-pattern 1

Create a server database for local expense data.

## Anti-pattern 2

Store money as formatted strings.

## Anti-pattern 3

Put all logic in page.tsx.

## Anti-pattern 4

Use `any` everywhere.

## Anti-pattern 5

Create huge components.

## Anti-pattern 6

Make a desktop dashboard first.

## Anti-pattern 7

Require users to type categories.

## Anti-pattern 8

Make every field mandatory.

## Anti-pattern 9

Force authentication before local UI can initialize.

## Anti-pattern 10

Create fake APIs for IndexedDB operations.

## Anti-pattern 11

Add excessive animations.

## Anti-pattern 12

Add unnecessary dependencies.

## Anti-pattern 13

Use server requests for every transaction.

## Anti-pattern 14

Store OAuth tokens in IndexedDB.

## Anti-pattern 15

Ignore backup because the data is "only local".

---

# 103. Definition of High Quality

A high-quality implementation should feel like:

```text
Native mobile finance app
        +
Offline-first PWA
        +
Simple personal tool
```

It should NOT feel like:

```text
Generic CRUD dashboard
        or
Enterprise accounting system
```

---

# 104. Final Product Priorities

When trade-offs are necessary, prioritize in this order:

```text
1. Data correctness
2. Fast expense entry
3. Mobile usability
4. Data safety / backup
5. Offline reliability
6. Clear dashboard
7. Useful reports
8. Accessibility
9. Performance
10. Visual polish
```

Do not sacrifice data correctness for visual design.

Do not sacrifice mobile usability for desktop complexity.

Do not sacrifice data safety for convenience.

---

# 105. Golden Rule

Always ask:

> "Can the user record an expense quickly from their phone without thinking about the technology behind it?"

If the answer is no, simplify the design.

The application should make expense tracking feel effortless.

The best implementation is not the one with the most features.

The best implementation is the one that makes the user's daily workflow **fast, reliable, private, and simple**.
