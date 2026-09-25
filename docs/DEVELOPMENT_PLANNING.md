# Development Planning & Engineering Roadmap
# Trading Journal Pro — MVP v1.0

---

## 1. Project Overview & Architecture Strategy

- **Project Goal**: Membangun web aplikasi jurnal trading profesional bergaya modern (*Linear / Discord feel*) untuk trader XAUUSD/Forex, dengan fokus awal pada MVP fungsional yang stabil sebelum ekspansi ke integrasi MetaTrader 5 dan AI Trading Coach.
- **Repository Structure**: Decoupled Monorepo
  ```
  portofolio/
  ├── docs/
  │   ├── PRD_Trading_Journal_Pro_v1.0.md
  │   ├── PRD_Trading_Journal_Pro_v1.0.pdf
  │   └── DEVELOPMENT_PLANNING.md
  ├── backend/          # Laravel 11 REST API
  │   ├── app/
  │   ├── database/
  │   └── routes/api.php
  └── frontend/         # React 19 + Vite + Tailwind CSS + Lucide Icons
      ├── src/
      │   ├── components/
      │   ├── pages/
      │   └── services/
      └── package.json
  ```

---

## 2. Sprint Roadmap (3–4 Minggu Target Selesai)

| Sprint | Fokus Utama | Deliverables Kunci | Estimasi Waktu |
| :--- | :--- | :--- | :--- |
| **Sprint 0** | **Design & Foundation** | PRD v1.0, ERD schema, API contracts, Design tokens | 2–3 Hari |
| **Sprint 1** | **Backend Core & Auth** | Laravel 11 setup, Sanctum, Migrations, Trade CRUD API | 3–4 Hari |
| **Sprint 2** | **Frontend Core & Form** | Vite React setup, Dark theme, Auth UI, Add Trade Modal | 3–4 Hari |
| **Sprint 3** | **Live Feed & Timeline** | Discord-style Feed cards, Sub-timeline, Quick updates | 3–4 Hari |
| **Sprint 4** | **Dashboard & Calendar** | Stat widgets, Equity Chart, Heatmap calendar, Breakdown | 3–4 Hari |
| **Sprint 5** | **Polish & Future Bridge** | MT5 webhook architecture, AI Coach prompt flow, Deploy | 3–4 Hari |

---

## 3. Detail Pekerjaan Tiap Sprint

### Sprint 0 — Foundation & Design System
- **Objective**: Memastikan seluruh spesifikasi arsitektur, database, dan token desain selesai sebelum menulis baris kode pertama.
- **Tasks**:
  1. Penulisan PRD v1.0 dan ekspor ke PDF (`PRD_Trading_Journal_Pro_v1.0.pdf`).
  2. Perancangan skema database MySQL (tabel `users`, `trades`, `trade_updates`).
  3. Penentuan palet warna (`#0B0B0B`, `#161616`, Gold `#F5B942`, Green `#22C55E`, Red `#EF4444`).

### Sprint 1 — Backend API Engine (Laravel 11)
- **Objective**: Sistem autentikasi dan API CRUD trade berfungsi penuh dengan validasi ketat.
- **Tasks**:
  1. Inisialisasi Laravel 11 API di folder `backend/`.
  2. Setup koneksi database MySQL (`trading_journal`).
  3. Konfigurasi Laravel Sanctum untuk Bearer Token Auth.
  4. Pembuatan database migrations & models:
     - `User` model & profile management
     - `Trade` model dengan kalkulasi otomatis (RR, PnL point, PnL USD)
     - `TradeUpdate` model untuk event log perjalanan trade
  5. Pengujian API via Postman / HTTP client.

### Sprint 2 — Frontend Foundation & Log Trade (React + Tailwind)
- **Objective**: Antarmuka pengguna responsif dengan form input trade yang cepat (< 30 detik).
- **Tasks**:
  1. Inisialisasi Vite + React di folder `frontend/`.
  2. Konfigurasi Tailwind CSS dengan custom design tokens dark mode.
  3. Setup Axios client dengan request/response interceptors (auth token storage).
  4. Halaman Login & Register dengan UI elegan.
  5. Form `+ New Trade` modal:
     - Input Pair (XAUUSD, EURUSD, dsb)
     - Toggle Side (BUY / SELL) dengan visual color shift
     - Real-time kalkulator jarak SL & TP dalam point serta rasio Risk:Reward
     - Drag & drop screenshot upload

### Sprint 3 — Live Trade Feed (The Discord / X Style Experience)
- **Objective**: Pengalaman jurnal trading interaktif di mana trade berjalan memiliki timeline live.
- **Tasks**:
  1. Komponen `TradeCard`:
     - Badge Pair, Side, Lot, Entry, SL, TP, RR
     - Reason / Analisis trading (SMC tags: BOS, Sweep, OB)
     - Thumbnail screenshot dengan lightbox preview
  2. Komponen `TradeTimeline`:
     - Sub-event: Posisi dibuka -> Update running pip -> SL geser ke BE -> TP/SL hit
  3. Modal `Add Update`:
     - Form ringkas untuk trader memasukkan milestone harga berjalan (+100 point, +$50)
  4. Modal `Close Trade`:
     - Menghitung realized profit secara otomatis

### Sprint 4 — Dashboard, Analytics & Calendar Heatmap
- **Objective**: Evaluasi performa kuantitatif untuk menemukan kebiasaan trading yang menguntungkan.
- **Tasks**:
  1. KPI Widgets: Total Trade, Win Rate %, Net PnL, Profit Factor, Avg RR.
  2. Equity Curve Chart: Visualisasi pertumbuhan modal berbasis waktu (Recharts).
  3. Trading Calendar: Tampilan kalender bulanan dengan badge hijau (hari profit) dan merah (hari loss); klik tanggal untuk melihat riwayat trade di hari tersebut.
  4. Performance Breakdown: Analisis Win Rate berdasarkan jam entry, sesi pasar (London/NY), dan timeframe (M5/M15).

### Sprint 5 — Hardening & Future Architecture (MT5 + AI)
- **Objective**: Memastikan stabilitas platform dan menyiapkan fondasi integrasi fase berikutnya.
- **Tasks**:
  1. Desain webhook listener `/api/v1/integrations/mt5` untuk otomatisasi MT5 EA.
  2. Template prompt dan pipeline LLM untuk AI Trading Coach.
  3. Optimasi query database (indexing pada `user_id`, `status`, `opened_at`).
  4. Dokumentasi cara menjalankan dan men-deploy web application.

---

## 4. Immediate Next Step
Klik tombol **Proceed** pada plan untuk memulai eksekusi Sprint 1 (Backend setup) & Sprint 2 (Frontend setup) secara bertahap!
