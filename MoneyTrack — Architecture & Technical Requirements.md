# MonTrac — Personal Finance & Multi-Wallet Expense/Income Tracker
## Architecture & Technical Requirements Specification

---

## 1. Project Overview & Brand Identity

**MonTrac** (sebelumnya MoneyTrack) adalah aplikasi pencatatan keuangan pribadi modern berbasis web (PWA - Progressive Web App) yang dirancang khusus untuk penggunaan smartphone dengan pendekatan *Local-First*, *Mobile-First*, dan *Zero-Friction Fast Input*.

### Tujuan Utama Aplikasi
> Memberikan pengalaman pencatatan keuangan (Pemasukan, Pengeluaran, dan Saldo Antar-Dompet/Rekening) tercepat, terindah, dan paling privat langsung dari HP tanpa mewajibkan koneksi internet atau server database yang rumit.

### Fitur Utama
- **Multi-Wallet / Category Wallet (Dompet & Rekening)**: Mengelola saldo di berbagai kantong/rekening (contoh: Bank Mandiri Rp 2.000.000, Tunai Rp 500.000, GoPay Rp 350.000, BCA Rp 5.000.000).
- **Dual Flow: Expense & Income**: Pencatatan Pemasukan (Gaji, Bonus, Freelance, dll.) dan Pengeluaran harian.
- **Fast Input with Direct Open Fields**: Form penambahan/pengubahan langsung memunculkan input Catatan, Tanggal, dan Dompet tanpa klik akordeon tambahan.
- **Full Activity Management (Edit & Hapus Transaksi)**: Mengubah detail transaksi lama atau menghapusnya dengan aman dan cepat.
- **Local-First & Offline-First**: Semua data tersimpan aman di IndexedDB (Dexie.js) perangkat pengguna.
- **Hybrid Cloud Sync**: Opsi sinkronisasi backup cloud end-to-end terenkripsi menggunakan Supabase.
- **Modern Pastel Light Design System**: Tampilan minimalis lavender aurora, kartu squircle lembut, kontras tinggi, dan visualisasi warna semantik yang jelas (Hijau Mint untuk Income, Merah Rose untuk Expense, Ungu Elektrik untuk Brand/Wallet).
- **Installable PWA**: Berjalan sebagai aplikasi native di Android & iOS dengan Web Manifest dan Service Worker.
- **Analisis & Laporan Lengkap**: Grafik pengeluaran harian, donat kategori, perbandingan bulanan, dan arus kas (*cash flow*).

---

## 2. Core Architecture (Local-First + Hybrid Sync)

MonTrac beroperasi dengan prinsip **Local-First as the Single Source of Truth**:

```text
┌─────────────────────────────────────────────────────────────┐
│                      User Interface (PWA)                   │
│       React 19 + Next.js App Router + Tailwind CSS 4        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Zustand State Stores                     │
│  wallet-store • transaction-store • category-store • etc.   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Repository Layer                       │
│ wallet-repo • transaction-repo • category-repo • settings-repo
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Local Storage: Dexie.js                     │
│                       IndexedDB                             │
│      [wallets]  [transactions]  [categories]  [settings]    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Background Sync)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Sync Engine & Supabase                    │
│            Encrypted Cloud Backup & Multi-device            │
└─────────────────────────────────────────────────────────────┘
```

### Prinsip Arsitektur:
1. **Zero Latency**: Semua operasi CRUD (tambah/edit/hapus dompet & transaksi) langsung dieksekusi di IndexedDB lokal dan Zustand store secara instan (< 10ms).
2. **Offline Immunity**: Aplikasi dapat berjalan 100% tanpa internet. Saat online, sync engine melakukan push/pull perubahan secara cerdas di latar belakang.
3. **Data Privacy**: Data keuangan tetap berada di perangkat pengguna secara default.

---

## 3. Data Model & Database Schema

### 3.1. Entity: Wallet (`wallets`)
Menyimpan data dompet / rekening / kantong keuangan pengguna.

```typescript
export type WalletType = "bank" | "cash" | "ewallet" | "credit" | "savings" | "other";

export interface Wallet {
  id: string;
  name: string;             // Contoh: "Bank Mandiri", "BCA", "Dompet Tunai", "GoPay"
  type: WalletType;         // Tipe dompet
  initialBalance: number;   // Saldo awal dalam IDR integer (contoh: 2000000)
  color: string;            // Warna hex untuk identitas visual (contoh: "#7C3AED")
  icon: string;             // Nama icon Lucide (contoh: "Building2", "Wallet", "Smartphone")
  isDefault?: boolean;      // Dompet default untuk transaksi cepat
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
}
```

### 3.2. Entity: Transaction (`transactions`)
Mendukung pengeluaran (*expense*), pemasukan (*income*), dan transfer antar dompet (*transfer*).

```typescript
export type TransactionType = "expense" | "income" | "transfer";
export type PaymentMethod = "cash" | "bank" | "debit" | "credit" | "ewallet";

export interface Transaction {
  id: string;
  amount: number;             // IDR Integer positif (contoh: 25000)
  type: TransactionType;      // "expense" | "income" | "transfer"
  categoryId: string;         // Referensi ke Category.id
  walletId: string;           // Referensi ke Wallet.id (sumber dana atau penerima pemasukan)
  toWalletId?: string;        // Khusus transfer: Dompet tujuan
  note?: string;              // Catatan transaksi (contoh: "Makan siang", "Gaji bulanan")
  date: string;               // ISO date string: YYYY-MM-DD
  paymentMethod?: PaymentMethod; // Opsional/kompatibilitas
  createdAt: string;          // ISO timestamp
  updatedAt: string;          // ISO timestamp
}
```

### 3.3. Entity: Category (`categories`)
Kategori pengeluaran dan pemasukan dengan tipe masing-masing.

```typescript
export type CategoryType = "expense" | "income" | "both";

export interface Category {
  id: string;
  name: string;             // Contoh: "Makanan", "Gaji", "Transportasi"
  type: CategoryType;       // "expense" | "income" | "both"
  icon: string;             // Lucide icon name atau Emoji
  color: string;            // Warna hex kategori
  isDefault: boolean;       // Kategori bawaan sistem
  createdAt: string;
  updatedAt?: string;
}
```

### 3.4. Entity: Settings (`settings`)
Pengaturan preferensi pengguna.

```typescript
export interface Settings {
  id: string;
  currency: "IDR";
  monthlyBudget?: number;
  defaultWalletId?: string;
  defaultPaymentMethod?: PaymentMethod;
  appName?: string;
  theme?: "pastel-light" | "system";
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Default Seed & Master Data

### 4.1. Default Wallets (Inisialisasi Pertama)
1. **Tunai**: `name: "Dompet Tunai"`, `type: "cash"`, `initialBalance: 0`, `icon: "Wallet"`, `color: "#10B981"`, `isDefault: true`
2. **Bank Utama**: `name: "Rekening Bank"`, `type: "bank"`, `initialBalance: 0`, `icon: "Building2"`, `color: "#7C3AED"`
3. **E-Wallet**: `name: "E-Wallet"`, `type: "ewallet"`, `initialBalance: 0`, `icon: "Smartphone"`, `color: "#06B6D4"`

### 4.2. Default Expense Categories
| Kategori | Icon | Warna |
|---|---|---|
| Makanan | `Utensils` / 🍜 | `#F59E0B` |
| Minuman & Kafe | `Coffee` / ☕ | `#D97706` |
| Transportasi | `Car` / 🚗 | `#3B82F6` |
| Belanja | `ShoppingBag` / 🛒 | `#EC4899` |
| Tagihan & Utilitas | `Receipt` / 🧾 | `#6366F1` |
| Hiburan | `Gamepad2` / 🎮 | `#8B5CF6` |
| Kesehatan | `HeartPulse` / 💊 | `#EF4444` |
| Pendidikan | `GraduationCap` / 📚 | `#10B981` |
| Rumah & Tempat Tinggal | `Home` / 🏠 | `#14B8A6` |
| Lainnya | `Package` / 📦 | `#64748B` |

### 4.3. Default Income Categories
| Kategori | Icon | Warna |
|---|---|---|
| Gaji Pokok | `Briefcase` / 💼 | `#10B981` |
| Bonus & Tunjangan | `Gift` / 🎁 | `#059669` |
| Freelance & Projek | `Laptop` / 💻 | `#0D9488` |
| Investasi & Dividen | `TrendingUp` / 📈 | `#6366F1` |
| Penjualan | `Tag` / 🏷️ | `#F59E0B` |
| Hadiah | `Sparkles` / ✨ | `#EC4899` |
| Pemasukan Lainnya | `CircleDollarSign` / 💰 | `#3B82F6` |

---

## 5. Calculation Logic & Financial Math

Semua perhitungan keuangan menggunakan fungsi murni (*pure functions*) yang terpusat di `src/lib/calculations/`:

### 5.1. Perhitungan Saldo Dompet (Wallet Balance Calculation)
$$\text{Wallet Balance}(W) = \text{InitialBalance}(W) + \sum_{t \in \text{Income}(W)} t.\text{amount} - \sum_{t \in \text{Expense}(W)} t.\text{amount} + \sum_{t \in \text{TransferTo}(W)} t.\text{amount} - \sum_{t \in \text{TransferFrom}(W)} t.\text{amount}$$

$$\text{Total Net Worth} = \sum_{W \in \text{Wallets}} \text{Wallet Balance}(W)$$

### 5.2. Perhitungan Arus Kas Bulanan (Monthly Cash Flow)
- **Total Income**: $\sum t.\text{amount}$ untuk $t.\text{type} = \text{"income"}$ pada bulan berjalan.
- **Total Expense**: $\sum t.\text{amount}$ untuk $t.\text{type} = \text{"expense"}$ pada bulan berjalan.
- **Net Cash Flow (Surplus/Defisit)**: $\text{Total Income} - \text{Total Expense}$
- **Budget Remaining**: $\text{MonthlyBudget} - \text{Total Expense}$
- **Budget Usage Percentage**: $\min\left(\frac{\text{Total Expense}}{\text{MonthlyBudget}} \times 100, 100\right)$

---

## 6. User Experience & UI Specifications

### 6.1. Add & Edit Transaction UX (Direct Open Fields)
Ketika tombol `+` ditekan atau transaksi ditekan untuk diedit:
1. **Segmented Type Switcher**:
   - `[ Pengeluaran ]` (Warna Rose) | `[ Pemasukan ]` (Warna Mint)
2. **Numeric Amount Input**:
   - `inputMode="numeric"`, otomatis memformat ke `Rp XX.XXX.XXX`.
3. **Wallet Selector**:
   - Pilihan dompet/rekening sumber atau tujuan dengan badge saldo aktif.
4. **Category Grid**:
   - Menampilkan kategori sesuai tipe yang dipilih (Expense/Income) dalam bentuk tombol tap besar.
5. **Catatan (Note) — Langsung Muncul**:
   - Field input catatan langsung terbuka di layar tanpa perlu klik dropdown tambahan.
6. **Tanggal & Detail Tambahan — Langsung Muncul**:
   - Pemilih tanggal (default hari ini) siap digunakan langsung.
7. **Tombol Aksi**:
   - `Simpan` / `Perbarui Transaksi` berukuran besar, mantap disentuh dengan jempol satu tangan.

```text
┌───────────────────────────────────────────┐
│ Tambah Transaksi                       ×  │
│                                           │
│ ┌───────────────────┬───────────────────┐ │
│ │  (-) Pengeluaran  │  (+) Pemasukan    │ │
│ └───────────────────┴───────────────────┘ │
│                                           │
│                 Rp 50.000                 │
│                                           │
│ DOMPET / REKENING                         │
│ [🏦 Bank Mandiri] [💳 GoPay] [💵 Tunai]   │
│                                           │
│ KATEGORI                                  │
│ ┌────────────┐ ┌────────────┐ ┌─────────┐ │
│ │ 🍜 Makanan │ │ ☕ Minuman │ │ 🚗 Mobil│ │
│ └────────────┘ └────────────┘ └─────────┘ │
│                                           │
│ CATATAN                                   │
│ ┌───────────────────────────────────────┐ │
│ │ Makan siang bersama tim               │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ TANGGAL                                   │
│ ┌───────────────────────────────────────┐ │
│ │ 📅 28 Agustus 2026                    │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ ┌───────────────────────────────────────┐ │
│ │                SIMPAN                 │ │
│ └───────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```

### 6.2. Activity / Transaction Management (Edit & Hapus Aktivitas)
- **Halaman Aktivitas (`/transactions`)**:
  - Filter berdasarkan Kategori, Dompet, dan Tipe (Semua / Pengeluaran / Pemasukan).
  - Kolom pencarian instan berdasarkan catatan & kategori.
  - Setiap item transaksi memiliki penanda warna jelas:
    - **Pemasukan**: Hijau Mint (`+Rp 2.000.000`)
    - **Pengeluaran**: Merah Rose (`-Rp 25.000`)
  - Klik transaksi $\rightarrow$ Buka **Edit Transaction Bottom Sheet** dengan data terisi lengkap untuk diubah atau dihapus.

### 6.3. Category Wallet Management Page / Sheet
- Pengguna dapat:
  - Melihat daftar semua dompet & total saldo masing-masing.
  - Menambah dompet baru (Nama, Tipe, Saldo Awal, Warna, Icon).
  - Mengubah saldo awal atau nama dompet.
  - Menghapus dompet (dengan validasi transaksi terkait).

---

## 7. Modern Pastel Lavender Light Design Tokens

| Token | Hex Value | Peruntukan |
|---|---|---|
| **Canvas Background** | `#F8FAFC` | Latar belakang halaman utama |
| **Aurora Gradient Top** | `linear-gradient(180deg, #DDD6FE 0%, #EDE9FE 45%, #F8FAFC 100%)` | Header ambient glow lavender |
| **Card Surface** | `#FFFFFF` | Permukaan kartu squircle lembut |
| **Brand Accent (Purple)** | `#7C3AED` / `#8B5CF6` | Brand utama, dompet bank, tombol aktif |
| **Income Accent (Mint)** | `#10B981` / `#4ADE80` | Indikator pemasukan, surplus, badge cash flow positif |
| **Expense Accent (Rose)** | `#EF4444` / `#F87171` | Indikator pengeluaran, peringatan over-budget, hapus |
| **Text Primary** | `#0F172A` | Teks judul, nominal uang kontras tinggi |
| **Text Secondary** | `#64748B` | Label kategori, tanggal, catatan kecil |
| **Border Normal** | `rgba(226, 232, 240, 0.8)` | Garis batas pemisah halus |
| **Floating FAB** | `#0F172A` | Tombol `+` tengah melayang kontras tinggi |

---

## 8. Prioritized Implementation Roadmap

Berikut urutan prioritas pengerjaan task:

```text
┌─────────────────────────────────────────────────────────────┐
│ [PRIORITAS 1] Multi-Wallet / Category Wallet                │
│ - Wallet Entity, Types, Dexie Schema v3, Wallet Repository  │
│ - Wallet Store (Zustand) & Balance Calculation Engine       │
│ - Wallet Management UI (Add/Edit Wallet Sheet, Wallet Card) │
├─────────────────────────────────────────────────────────────┤
│ [PRIORITAS 2] Income Support                                │
│ - Update Transaction Type ("expense" | "income")            │
│ - Income Categories & Default Seed                          │
│ - Cash Flow Calculations (Total Income, Expense, Surplus)   │
│ - Dashboard Cash Flow Hero & Metric Updates                 │
├─────────────────────────────────────────────────────────────┤
│ [PRIORITAS 3] Direct Add/Edit Form Experience               │
│ - Direct display of Note, Date, and Wallet in Sheet         │
│ - Segmented Toggle: Pengeluaran vs Pemasukan                │
│ - Responsive single-screen thumb-friendly layout            │
├─────────────────────────────────────────────────────────────┤
│ [PRIORITAS 4] Full Activity Editing & Actions               │
│ - Edit Transaction Sheet with populated state               │
│ - Update & Delete handlers in Zustand & Repositories        │
│ - Filter by Wallet & Transaction Type in Activity Page      │
├─────────────────────────────────────────────────────────────┤
│ [PRIORITAS 5] Branding, Logo, Icon & Visual Polish          │
│ - App Renaming to MonTrac                                   │
│ - Updated Modern App Icon (192, 512, apple-touch, SVG)      │
│ - Palette & Styling Consistency Check                       │
├─────────────────────────────────────────────────────────────┤
│ [PRIORITAS 6] Multi-Wallet Dashboard & Reports              │
│ - Wallet balance carousel/cards on Dashboard                │
│ - Income vs Expense comparison charts in Reports            │
├─────────────────────────────────────────────────────────────┤
│ [PRIORITAS 7] Verification, PWA & End-to-End Testing        │
│ - Offline testing, Import/Export with Wallet & Income       │
│ - Service Worker & PWA Manifest verification                │
└─────────────────────────────────────────────────────────────┘
```