# PRD — PPKD Hotel Management System

**Version:** 4.0 (Final, Consolidated)
**Status:** Approved for Development
**Architecture:** Laravel Monolith + Inertia.js
**Last Updated:** June 2026
**Menggantikan:** PRD v3.0 dan PRD_V3_UPDATE.md (v3.1) secara penuh

---

# 1. Executive Summary

## Product Name
PPKD Hotel Management System

## Project Goal
Membangun aplikasi administrasi hotel berbasis web yang mengelola seluruh operasional hotel mulai dari reservasi, check-in, masa inap, housekeeping, laundry, pool maintenance, F&B, billing, hingga check-out dalam satu sistem terintegrasi.

Aplikasi ditujukan untuk penggunaan internal hotel dengan dashboard berbeda berdasarkan departemen, namun dengan satu layout aplikasi yang konsisten.

---

# 2. Architecture Decision

## Chosen Architecture: Laravel Full Stack Monolith

```text
Laravel 13
│
├── Routes (web.php)
├── Controllers
├── Services
├── Models
├── Spatie Permission
├── Spatie Activitylog
│
└── Inertia.js
      │
      └── React Pages
             │
             └── Mazer Bootstrap 5 UI
```

## Why This Architecture?

**Advantages:**
- Tidak perlu REST API terpisah
- Tidak perlu React Router
- Tidak perlu token authentication
- Development lebih cepat, maintenance lebih mudah
- Cocok untuk aplikasi internal hotel
- Semua authorization dikelola Laravel
- SEO tidak menjadi concern karena aplikasi internal

---

# 3. Official Technology Stack

## Backend

| Component | Technology |
|---|---|
| Framework | Laravel 13 |
| PHP | PHP 8.3+ |
| Database | MySQL 8 |
| Authentication | Laravel Session |
| Authorization | Spatie Permission (`spatie/laravel-permission`) |
| Audit Trail | Spatie Activitylog (`spatie/laravel-activitylog`) |
| ORM | Eloquent |
| Validation | Form Request |
| Queue | Database Queue |
| Cache | File / Redis |

## Frontend

| Component | Technology |
|---|---|
| UI Framework | React 18 |
| Bridge | Inertia.js |
| Build Tool | Vite |
| Styling | Bootstrap 5 |
| Admin Template | Mazer |
| Icons | Bootstrap Icons |
| Forms | Inertia `useForm` |
| Alerts | SweetAlert2 |
| Charts | ApexCharts |
| Date Picker | Flatpickr |
| Select Box | Tom Select |

---

# 4. UI Framework Standard

**Mandatory Rule:**

Seluruh halaman **WAJIB** menggunakan layout dan komponen bawaan Mazer.

Dilarang:
- Membuat design system baru
- Menggunakan TailwindCSS
- Menggunakan Material UI
- Menggunakan Ant Design

---

# 5. Mazer Layout Structure

```text
+------------------------------------------------+
| Top Navbar                                     |
+------------------------------------------------+
| Sidebar | Main Content Area                    |
|          |                                     |
|          |                                     |
+------------------------------------------------+
| Footer                                         |
+------------------------------------------------+
```

---

# 6. Layout Hierarchy (FINAL)

> **Koreksi dari PRD v3:** Versi sebelumnya menyebut 4 layout terpisah (Admin/Front Office/Housekeeping/F&B Layout) yang membingungkan saat implementasi (MODULE_BREAKDOWN hanya membuat 2 file fisik). Versi final di bawah ini yang berlaku.

```text
GuestLayout (file: AuthLayout.jsx)
│
├── Login Page
└── Forgot Password

AppLayout.jsx  (SATU file, dipakai SEMUA role setelah login)
│
├── Sidebar dinamis — menu di-render berdasarkan
│   permission user yang login (bukan 4 file berbeda)
├── Navbar
├── Footer
└── Breadcrumb
```

**Alasan keputusan:** Sidebar dinamis berdasarkan permission lebih maintainable dibanding 4 file layout fisik yang isinya 90% duplikat (navbar, footer, breadcrumb sama). Perbedaan antar role hanya di item menu sidebar dan widget dashboard, keduanya bisa di-render kondisional di dalam 1 layout.

Semua halaman mewarisi dari `AppLayout.jsx`:
- Mazer Sidebar (dinamis)
- Mazer Navbar
- Mazer Footer
- Mazer Breadcrumb

---

# 7. Role Based Access Control

Menggunakan package: `spatie/laravel-permission`

## 7.1 Roles

| Role | Deskripsi |
|---|---|
| **Administrator** | Akses penuh seluruh sistem |
| **Front Office** | Reservasi, Check-in, Check-out, Billing, Guest Folio |
| **Housekeeping** | Room Status, Cleaning Tasks, Laundry, Pool Maintenance |
| **F&B Service** | Restaurant Orders, Lounge Orders, Room Service, Menu Management (view) |

## 7.2 Permission Structure (FINAL — Granular)

> **Koreksi dari PRD v3:** Versi sebelumnya pakai format kasar 1 permission per modul (`manage-reservations`, dst). Format ini diganti dengan **granular dot-notation** (`module.action`) agar sesuai dengan kebutuhan implementasi route per-action di API_SPEC, dan agar role bisa diberi kombinasi hak akses (misal: view tanpa create).

### Daftar Permission Lengkap

```text
dashboard.view

user.view  user.create  user.update  user.delete
role.view  role.create  role.update  role.delete

room-type.view  room-type.create  room-type.update  room-type.delete
room.view       room.create       room.update       room.delete
room-board.view

guest.view  guest.create  guest.update  guest.delete

reservation.view  reservation.create  reservation.update  reservation.cancel

checkin.create
checkout.create

folio.view  folio.charge  folio.payment  folio.settle

housekeeping.view  housekeeping.update

laundry.view  laundry.create  laundry.update

pool-maintenance.view  pool-maintenance.create

menu.view  menu.create  menu.update  menu.delete

fnb.view  fnb.create  fnb.update  fnb.close

report.view

settings.view  settings.update
```

### Role → Permission Mapping

| Role | Permission Set |
|---|---|
| **Administrator** | Seluruh permission di atas |
| **Front Office** | `dashboard.view`, `guest.*`, `reservation.*`, `checkin.create`, `checkout.create`, `folio.*`, `room-board.view`, `fnb.create` (untuk input room service) |
| **Housekeeping** | `dashboard.view`, `room-board.view`, `housekeeping.*`, `laundry.*`, `pool-maintenance.*` |
| **F&B Service** | `dashboard.view`, `fnb.*`, `menu.view` |

Permission Seeder generate dari daftar di atas, lalu di-assign ke role via:

```php
$role->givePermissionTo([...]);
```

---

# 8. Core Modules

## 8.1 Dashboard

### Administrator Dashboard
Widgets: Occupancy Rate, Revenue Today, Active Guests, Available Rooms, New Reservations, OOO Rooms
Charts: Occupancy Trend, Revenue Trend

### Front Office Dashboard
Widgets: Today's Arrivals, Today's Departures, Available Rooms, Active Reservations
Quick Actions: New Reservation, Walk-In Check-In

### Housekeeping Dashboard
Widgets: Vacant Dirty, Occupied Dirty, Pending Laundry, Cleaning Tasks, Pool Maintenance Due

### F&B Dashboard
Widgets: Active Orders, Room Service Orders, Restaurant Orders, Revenue Today

---

## 8.2 Front Office Module

### Reservations
- Reservation List
- Reservation Form
- Reservation Calendar
- Availability Checker (lihat Section 12.1 untuk logika validasi)
- Cancel Reservation

### Check-In
- Expected Arrival
- Walk-In Guest
- Room Assignment
- Deposit Entry (tercatat sebagai `payments` dengan `payment_type = deposit`)
- Registration Card

### Check-Out
- Expected Departure
- Folio Review
- Payment Settlement (tercatat sebagai `payments` dengan `payment_type = payment`)
- Invoice Printing

### Guest Management
- Guest List
- Guest Profile
- Stay History

### Billing & Folio
- Room Charges
- F&B Charges
- Laundry Charges
- Extra Charges
- Payment & Deposit (multi-transaksi, lihat Section 12.4)
- Balance

---

## 8.3 Housekeeping Module

### Room Status Board

| Status | Kode | Warna |
|---|---|---|
| Vacant Clean | VC | Hijau |
| Vacant Dirty | VD | Kuning |
| Occupied Clean | OC | Biru |
| Occupied Dirty | OD | Oranye |
| Out of Order | OOO | Merah |
| Out of Service | OOS | Abu-abu |

Room Board bisa difilter per **floor** (menggunakan tabel `floors`, bukan integer hardcoded).

### Cleaning Tasks — Workflow

```text
Pending → Assigned → In Progress → Completed
                                  ↘ Cancelled (dari status manapun sebelum Completed)
```

> **Koreksi:** Status `Assigned` ditambahkan karena sebelumnya disebut di spesifikasi route tapi tidak ada di enum database manapun.

### Laundry — Workflow

```text
Received → Processing → Done → Delivered
```

Business Rule: status `Delivered` otomatis membuat `folio_charges` baru pada folio tamu terkait.

### Pool Maintenance

Checklist harian, dicatat per pemeriksaan:
- Water Quality (good/fair/poor)
- pH Level & Chlorine Level
- Cleaning Status
- Equipment Status
- Petugas pemeriksa & catatan

---

## 8.4 F&B Module

### Menu Management (BARU — sebelumnya disebut di MODULE_BREAKDOWN tapi tidak ada skema)
- Menu Categories (CRUD)
- Menu Items (CRUD, dengan harga & outlet: resto/lounge/room_service/all)

### Restaurant Orders — Workflow

```text
Pending → Preparing → Served → Closed
                              ↘ Cancelled
```

### Lounge Orders
Workflow sama dengan Restaurant Orders.

### Room Service
- Order item dipilih dari katalog `menu_items` (bukan input nama bebas)
- Order langsung terhubung ke Guest Folio jika `charge_to = room`
- Business Rule: `room_service` + `charge_to = room` → otomatis membuat `folio_charges`

---

# 9. Room Management

## 9.1 Room Types

| Tipe | Max Occupancy |
|---|---|
| Standard Room | 2 |
| Deluxe Room | 3 |
| Suite Room | 5 |

## 9.2 Room Status Lifecycle

```text
VC
↓ Check-In
Occupied (OC/OD)
↓ Checkout
VD
↓ Housekeeping Selesai
VC
```

Kamar juga bisa masuk status `OOO` (maintenance) atau `OOS` (renovasi) dari `VC`, dan kembali ke `VD` setelah selesai diperbaiki/direnovasi (lalu menunggu housekeeping untuk jadi `VC`).

## 9.3 Floor Management

Setiap kamar terhubung ke tabel master `floors` (bukan kolom integer bebas), agar mendukung multi-building/multi-tower dan filter Room Board per lantai.

---

# 10. Reporting Module

**Akses: Administrator Only** (`report.view`)

Reports:
- Occupancy Report
- Revenue Report
- Reservation Report
- F&B Report
- Housekeeping Report
- Laundry Report

Export: PDF, Excel

---

# 11. UI Standards (Mazer)

| Komponen | Class/Library |
|---|---|
| Cards (statistik dashboard) | `.card` |
| Tables | `.table .table-striped .table-hover` |
| Forms | `.form-control .form-select` (Bootstrap 5) |
| Modals | `.modal` (Bootstrap Modal) |
| Alerts | `.alert` (Bootstrap Alert) |
| Toast Notifications | SweetAlert2 Toast |
| Charts | ApexCharts |

**Breadcrumb:** Semua halaman wajib memiliki breadcrumb. Contoh:

```text
Dashboard > Front Office > Reservations
```

---

# 12. Business Rules (Klarifikasi Penting)

## 12.1 Validasi Bentrok Tanggal Reservasi

Karena `reservations.room_id` nullable (kamar fisik baru ditentukan saat check-in), validasi dilakukan 2 level:

1. **Saat membuat reservasi baru** (kamar belum ditentukan): cek kuota tersedia per `room_type` — yaitu `total rooms dari tipe tersebut` dikurangi `jumlah reservasi confirmed/checked_in yang overlap tanggal pada tipe yang sama`. Jika hasil ≤ 0, reservasi baru ditolak.
2. **Saat assign kamar fisik** (saat check-in atau assignment manual): cek apakah `room_id` yang dipilih sudah dipakai reservasi lain yang overlap tanggal dan berstatus confirmed/checked_in. Jika ya, tolak dan minta pilih kamar lain.

## 12.2 Validasi Kapasitas Tamu

Saat membuat/edit reservasi, `adults + children` **harus ≤** `room_types.max_capacity` dari tipe kamar yang dipilih. Divalidasi di Form Request.

## 12.3 Reservasi Multi-Room (Group Booking)

**Di luar scope MVP.** 1 reservasi = 1 kamar. Jika tamu butuh beberapa kamar, sistem membuat beberapa record `reservations` terpisah dengan `guest_id` yang sama. Fitur grouping booking sebagai 1 transaksi (`reservation_groups`) masuk roadmap Phase 2.

## 12.4 Multi-Transaksi Pembayaran

Pembayaran TIDAK dicatat langsung di `check_outs`. Setiap transaksi (deposit saat check-in, partial payment selama menginap, settlement saat checkout, refund deposit) dicatat sebagai baris baru di tabel `payments`, terhubung ke `guest_folios`. Kolom `check_outs.total_paid` adalah nilai cache/agregat yang dihitung otomatis dari total `payments` terkait — bukan input manual.

## 12.5 Status `No Show`

Diubah **manual** oleh Front Office melalui aksi eksplisit (tidak ada auto-scheduler di MVP). Auto-update status `no_show` via scheduled job masuk roadmap Phase 2.

## 12.6 Audit Trail

Seluruh aktivitas penting (create/update/delete pada reservasi, check-in/out, payment, perubahan status kamar, dll) dicatat otomatis melalui `spatie/laravel-activitylog` — tidak ada tabel audit custom yang dibuat manual.

---

# 13. Project Structure

```text
app/
├── Http/
├── Models/
├── Services/
├── Policies/
├── Providers/

resources/
└── js/
    ├── Components/
    ├── Layouts/
    │   ├── AuthLayout.jsx
    │   └── AppLayout.jsx
    ├── Pages/
    ├── Hooks/
    ├── Utils/
    └── app.jsx

resources/views/
└── app.blade.php

routes/
├── web.php
└── auth.php
```

---

# 14. Authentication

**Method:** Laravel Session Authentication

```text
Login → Laravel Auth → Session Created → Redirect Dashboard
```

**Tidak menggunakan:** JWT, Sanctum Token, Passport.

---

# 15. Database Overview

Sistem menggunakan **19 business tables** + **6 package tables** (5 dari `spatie/laravel-permission`, 1 dari `spatie/laravel-activitylog`) = **25 tables total**.

Skema lengkap setiap tabel, field, tipe data, dan relasi — lihat dokumen **DATABASE_DICTIONARY v2.0**. Diagram relasi lengkap — lihat dokumen **ERD v2.0**.

`users.role` **tidak ada** sebagai kolom — role sepenuhnya dikelola oleh Spatie Permission.

---

# 16. Seed Data

| Role | Username | Password |
|---|---|---|
| Administrator | admin | admin123 |
| Front Office | fo1 | fo123 |
| Housekeeping | hk1 | hk123 |
| F&B Service | fnb1 | fnb123 |

---

# 17. Development Phases

| Phase | Deliverables |
|---|---|
| **Phase 1 (MVP)** | Authentication, Roles & Permissions, Dashboard, Room Management, Reservations, Check-In, Check-Out, Guest Folio, Payments |
| **Phase 2** | Housekeeping, Laundry, Pool Maintenance, Room Status Board |
| **Phase 3** | Menu Management, Restaurant POS, Lounge POS, Room Service |
| **Phase 4** | Reports, Analytics, Export PDF, Export Excel, Settings, Audit Log |

> Detail per-modul dan urutan implementasi step-by-step — lihat dokumen **MODULE_BREAKDOWN v2.0**.

---

# 18. Success Criteria

Sistem dianggap selesai apabila:

- Semua role dapat login
- Semua role hanya melihat menu yang sesuai dengan permission-nya
- Guest Cycle berjalan penuh (Reservasi → Check-in → Stay → Check-out)
- Billing terintegrasi antar departemen (Room, F&B, Laundry semua masuk 1 Folio)
- Housekeeping terhubung dengan Room Status
- F&B terhubung dengan Guest Folio
- Pool Maintenance tercatat harian
- Pembayaran tercatat sebagai transaksi terpisah (mendukung partial payment & refund)
- Seluruh UI menggunakan Mazer Bootstrap 5
- Tidak ada penggunaan React Router
- Tidak ada REST API internal (kecuali AJAX endpoint untuk lookup/search)
- Seluruh halaman menggunakan Laravel + Inertia.js
- Seluruh aktivitas penting tercatat di Activity Log
