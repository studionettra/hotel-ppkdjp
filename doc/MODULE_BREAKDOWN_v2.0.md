# MODULE BREAKDOWN — PPKD Hotel Management System

**Development Roadmap & Module Breakdown**
**Version:** 2.0 (Final, Consolidated)
**Menggantikan:** MODULE_BREAKDOWN.md v3.0 secara penuh

**Stack:** Laravel 13, Inertia.js, React 18, Mazer Bootstrap 5, Spatie Permission, Spatie Activitylog, MySQL 8

---

# Development Strategy

```text
Foundation
    ↓
Master Data
    ↓
Reservation
    ↓
Guest Cycle (Check-In, Folio, Payment, Check-Out)
    ↓
Housekeeping (Tasks, Laundry, Pool Maintenance)
    ↓
F&B (Menu, POS, Room Service)
    ↓
Reports
    ↓
Settings
    ↓
Hardening (Audit Log, Security, Testing)
```

Setiap phase harus selesai dan lolos testing sebelum melanjutkan ke phase berikutnya.

---

# PHASE 1 — FOUNDATION

## Module 1.1 Authentication

**Deliverables:** Login Page, Logout, Session Authentication, Remember Me, Middleware Auth

**Database:** `users`

**Pages:** `Auth/Login.jsx`

**Controllers:** `AuthController`

**Routes:**
```php
GET  /login
POST /login
POST /logout
```

**Acceptance Criteria:**
- User dapat login dan logout
- Guest tidak bisa mengakses dashboard

---

## Module 1.2 RBAC (Spatie Permission)

**Roles:** Administrator, Front Office, Housekeeping, F&B Service

**Deliverables:**
- Permission Seeder (daftar lengkap permission granular — lihat PRD v4.0 Section 7.2)
- Role Seeder (mapping role → permission sesuai PRD v4.0 Section 7.2)
- Permission Middleware (`permission:module.action`)

> **Koreksi:** Tidak lagi menggunakan format permission kasar `manage-x`. Seluruh permission memakai format granular `module.action` agar konsisten dengan route di API_SPEC v2.0.

**Acceptance Criteria:**
- Menu sesuai permission user yang login
- Route ditolak (403) jika user tidak punya permission terkait

---

## Module 1.3 Mazer Layout

**Deliverables:**
- `AuthLayout.jsx` (untuk Login, Forgot Password)
- `AppLayout.jsx` — **satu file**, dipakai semua role, dengan sidebar dinamis berdasarkan permission user
- Navbar, Footer, Breadcrumb, Notifications (toast SweetAlert2)
- Responsive Layout

> **Koreksi:** PRD versi lama menyebut 4 layout terpisah (Admin/FO/HK/F&B). Final: hanya 2 file layout fisik (`AuthLayout`, `AppLayout`). Perbedaan antar role ditangani lewat rendering kondisional sidebar/dashboard widget di dalam `AppLayout`, bukan file terpisah.

**Pages:**
```text
Layouts/AuthLayout.jsx
Layouts/AppLayout.jsx
```

**Acceptance Criteria:**
- Seluruh halaman menggunakan `AppLayout` atau `AuthLayout`
- Tidak ada custom layout di luar Mazer
- Sidebar menu berbeda otomatis sesuai permission, tanpa duplikasi file

---

# PHASE 2 — MASTER DATA

## Module 2.1 User Management

**Permissions:** `user.view`, `user.create`, `user.update`, `user.delete`

**Pages:** `Users/Index.jsx`, `Users/Create.jsx`, `Users/Edit.jsx`

**Deliverables:** CRUD User, Assign Role

---

## Module 2.2 Floor Management (BARU)

> Sebelumnya tidak pernah dijadikan modul tersendiri, padahal `rooms.floor_id` adalah dependency wajib sebelum Room Management bisa dibuat.

**Database:** `floors`

**Permissions:** digabung dengan `room.*` (lihat API_SPEC v2.0 Section 6)

**Deliverables:** CRUD Floor (nomor lantai, nama lantai, deskripsi)

**Pages:** `Floors/Index.jsx`, `Floors/Form.jsx`

> **Harus selesai sebelum Module 2.4 (Room Management)**, karena `rooms.floor_id` adalah foreign key wajib.

---

## Module 2.3 Room Type Management

**Database:** `room_types`

**Deliverables:** CRUD Room Type, Pricing, Capacity (`max_capacity`)

**Pages:** `RoomTypes/Index.jsx`, `RoomTypes/Form.jsx`

---

## Module 2.4 Room Management

**Database:** `rooms`

**Deliverables:** CRUD Room, Room Status, **Floor Assignment via dropdown `floor_id`** (bukan input integer manual)

**Pages:** `Rooms/Index.jsx`, `Rooms/Form.jsx`

**Dependency:** Module 2.2 (Floor) dan Module 2.3 (Room Type) harus selesai dulu.

---

# PHASE 3 — RESERVATION MANAGEMENT

## Module 3.1 Guest Management

**Database:** `guests`

**Deliverables:** CRUD Guest, Guest History

**Pages:** `Guests/Index.jsx`, `Guests/Show.jsx`

---

## Module 3.2 Reservation Management

**Database:** `reservations`

**Deliverables:**
- Create Reservation (validasi kuota `room_type` + validasi kapasitas tamu)
- Edit Reservation
- Cancel Reservation
- Reservation Detail

**Pages:** `Reservations/Index.jsx`, `Reservations/Create.jsx`, `Reservations/Edit.jsx`, `Reservations/Show.jsx`

**Business Rules (implementasi wajib di Form Request):**
1. `adults + children` ≤ `room_types.max_capacity`
2. Validasi kuota: hitung kamar tersedia per `room_type_id` pada rentang tanggal yang dipilih — tolak jika kuota habis

---

## Module 3.3 Availability Calendar

**Deliverables:** Calendar View, Occupancy View, Availability Check (berbasis kuota room_type, bukan room_id langsung — karena room_id baru ditentukan saat check-in)

**Pages:** `Reservations/Calendar.jsx`

---

# PHASE 4 — FRONT OFFICE (GUEST CYCLE)

## Module 4.1 Check-In

**Database:** `check_ins`

**Deliverables:**
- Check-In Wizard
- Room Assignment (validasi `room_id` tidak overlap dengan reservasi lain yang aktif)
- Deposit Entry → membuat baris baru di `payments` (`payment_type = deposit`)
- Registration Card

**Pages:** `CheckIns/Create.jsx`

**Business Rules:**
- Room → status `oc` (occupied clean)
- Reservation → status `checked_in`
- Create `guest_folio` baru

---

## Module 4.2 Guest Folio & Payment

**Database:** `guest_folios`, `folio_charges`, **`payments`**

> **Koreksi penting:** Nama tabel database resmi adalah **`payments`**, bukan `folio_payments` seperti yang tertulis di versi sebelumnya. Pastikan migration, model, dan controller konsisten memakai nama `Payment` / `payments`.

**Deliverables:**
- Running Bill (tampilan total charges + total payments + balance real-time)
- Charge Management (`folio.charge`)
- Payment Management (`folio.payment`) — mendukung multi-transaksi (deposit, partial payment, refund)

**Pages:** `Folios/Show.jsx`

---

## Module 4.3 Check-Out

**Database:** `check_outs`

**Deliverables:**
- Settlement (membuat `Payment` baru, `payment_type = payment`)
- Invoice (PDF)
- Feedback (rating + notes)

**Pages:** `CheckOuts/Create.jsx`

**Business Rules:**
- Room → status `vd` (vacant dirty)
- Auto-create `housekeeping_task` baru (`task_type = room_cleaning`, `status = pending`)
- Reservation → status `checked_out`
- `check_outs.total_paid` dihitung otomatis via Observer dari total `payments` terkait — **bukan input manual di form checkout**

---

# PHASE 5 — HOUSEKEEPING

## Module 5.1 Room Status Board

**Deliverables:** Visual Room Board, Status Color, Filter per Floor (`floor_id`), Filter per Status

**Pages:** `Housekeeping/RoomBoard.jsx`

---

## Module 5.2 Housekeeping Tasks

**Database:** `housekeeping_tasks`

**Deliverables:** Task Assignment, Task Progress, Completion Tracking

**Status workflow:** `pending → assigned → in_progress → completed` (atau `cancelled` dari status manapun sebelum completed)

**Pages:** `Housekeeping/Tasks.jsx`

---

## Module 5.3 Laundry

**Database:** `laundry_requests`

**Deliverables:** Laundry Request, Laundry Status, Folio Integration (auto-charge saat status `delivered`)

**Pages:** `Housekeeping/Laundry.jsx`

---

## Module 5.4 Pool Maintenance

**Database:** `pool_maintenance_logs`

> **Koreksi:** Skema database modul ini sebelumnya tidak pernah didefinisikan. Skema lengkap ada di DATABASE_DICTIONARY v2.0 Section 7.3.

**Deliverables:** Checklist Harian (water quality, pH, chlorine, cleaning status, equipment status), Daily Inspection Log, Maintenance History

**Pages:** `Housekeeping/PoolMaintenance.jsx`

---

# PHASE 6 — F&B MANAGEMENT

## Module 6.1 Menu Management

**Database:** `menu_categories`, `menu_items`

> **Koreksi:** Skema lengkap kedua tabel ini sebelumnya tidak ada di Database Dictionary manapun. Sudah didefinisikan di DATABASE_DICTIONARY v2.0 Section 8.1–8.2.

**Deliverables:** Category Management, Menu Item Management (nama, harga, outlet, status aktif)

**Pages:** `Fnb/MenuCategories.jsx`, `Fnb/MenuItems.jsx`

> **Harus selesai sebelum Module 6.2 (POS Order)**, karena order item kini dipilih dari katalog menu, bukan input nama bebas.

---

## Module 6.2 POS Order

**Database:** `fnb_orders`, `fnb_order_items`

**Deliverables:**
- Create Order — item dipilih dari dropdown `menu_items` (AJAX `/ajax/menu-items`)
- Update Order
- Close Order

> **Koreksi:** `fnb_order_items` sekarang menyimpan `menu_item_id` (FK) + `item_name_snapshot` + `unit_price` (snapshot harga saat order dibuat), bukan field `item_name` bebas seperti versi sebelumnya.

**Pages:** `Fnb/Orders.jsx`

**Dependency:** Module 6.1 harus selesai dulu.

---

## Module 6.3 Room Service

**Deliverables:** Charge To Room, Folio Integration

**Business Rules:** `outlet = room_service` + `charge_to = room` → otomatis membuat `folio_charges` baru (`charge_type = fnb`)

---

# PHASE 7 — REPORTING

## Module 7.1 Occupancy Report
**Deliverables:** Daily Occupancy, Monthly Occupancy, Occupancy Trend
**Pages:** `Reports/Occupancy.jsx`

## Module 7.2 Revenue Report
**Deliverables:** Revenue Summary, Revenue By Department, Revenue Trend
**Pages:** `Reports/Revenue.jsx`

## Module 7.3 Housekeeping Report
**Deliverables:** Task Completion, Laundry Report, Cleaning Performance
**Pages:** `Reports/Housekeeping.jsx`

## Module 7.4 F&B Report
**Deliverables:** Sales Summary, Top Selling Items, Outlet Revenue
**Pages:** `Reports/Fnb.jsx`

---

# PHASE 8 — SETTINGS

## Module 8.1 Application Settings

**Database:** `app_settings`

> **Koreksi:** Tabel ini sebelumnya tidak pernah didefinisikan walaupun route-nya sudah ada di API_SPEC versi lama. Skema lengkap: DATABASE_DICTIONARY v2.0 Section 9.1.

**Deliverables:**
- Hotel Profile (nama, currency, contact)
- System Settings (date format, number format)
- Tax Configuration (service charge %, PPN %)

**Pages:** `Settings/Hotel.jsx`, `Settings/System.jsx`

---

# PHASE 9 — HARDENING

## Module 9.1 Audit Log

**Package:** `spatie/laravel-activitylog`

> **Koreksi:** Versi sebelumnya merencanakan tabel custom `activity_logs` SEKALIGUS merekomendasikan package — dua pendekatan kontradiktif dalam dokumen yang sama. Final: **pakai package**, tidak ada migration manual untuk audit log.

**Deliverables:**
```bash
composer require spatie/laravel-activitylog
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"
php artisan migrate
```
- Tambahkan trait `LogsActivity` pada model: `Reservation`, `CheckIn`, `CheckOut`, `Payment`, `Room` (status change), `User`
- Halaman viewer Activity Log (Administrator only)

---

## Module 9.2 Security

**Deliverables:**
- Authorization Policy per model
- Validation Rules (Form Request) lengkap untuk semua business rule (bentrok tanggal, kapasitas tamu, dll)
- CSRF Protection (default Laravel)

---

## Module 9.3 Testing

**Deliverables:** Feature Test, Unit Test

**Coverage Target:** Minimum 80%

**Test wajib mencakup:**
- Validasi bentrok tanggal reservasi (per room_type & per room_id)
- Validasi kapasitas tamu
- Auto-create folio charge dari laundry/F&B
- Auto-update `check_outs.total_paid` saat payment baru dibuat
- Permission gate per role

---

# DEVELOPMENT ORDER (FINAL)

Claude Code / developer **HARUS** mengikuti urutan berikut:

```text
01 Authentication
02 RBAC (Permission Seeder + Role Seeder, format granular)
03 Mazer Layout (AuthLayout + AppLayout dinamis)

04 User Management
05 Floor Management        ← BARU, sebelum Room
06 Room Types
07 Rooms (pakai floor_id)

08 Guests
09 Reservations (dengan validasi kuota & kapasitas)
10 Availability Calendar

11 Check-In (dengan Payment deposit)
12 Guest Folio & Payment (tabel: payments, bukan folio_payments)
13 Check-Out (total_paid via Observer)

14 Room Status Board
15 Housekeeping Tasks (status: pending→assigned→in_progress→completed)
16 Laundry
17 Pool Maintenance        ← skema baru

18 Menu Categories          ← BARU, sebelum POS Order
19 Menu Items                ← BARU, sebelum POS Order
20 POS Orders (item dari katalog menu, bukan free text)
21 Room Service

22 Reports

23 Settings (tabel: app_settings)

24 Audit Log (package spatie/laravel-activitylog, bukan tabel manual)
25 Security
26 Testing
```

---

# Definition of Done (DoD)

Sebuah module dianggap selesai apabila:

- [ ] Migration selesai dan sesuai DATABASE_DICTIONARY v2.0 (nama tabel & kolom persis, termasuk `floor_id`, `payments`, status enum yang sudah dikoreksi)
- [ ] Model selesai, termasuk relasi yang benar
- [ ] Seeder selesai (termasuk Permission & Role Seeder format granular)
- [ ] Controller selesai
- [ ] Service selesai (terutama untuk business rule: validasi bentrok, auto-charge, auto-update cache)
- [ ] Form Request validation selesai
- [ ] Permission middleware terpasang sesuai PRD v4.0 Section 7.2
- [ ] Inertia Page selesai
- [ ] UI mengikuti standar Mazer (Section 11 PRD v4.0)
- [ ] Testing berhasil
- [ ] Tidak ada error pada build

```bash
php artisan test
npm run build
```

Harus sukses tanpa error sebelum lanjut ke module berikutnya.
