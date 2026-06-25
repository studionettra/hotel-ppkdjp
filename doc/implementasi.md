TAHAP 0 — Setup Awal (Pra-Syarat Semua Phase)

Ini harus selesai sebelum fase apapun bisa berjalan.

0.1 Hapus Tailwind, Install Bootstrap + Mazer

# Hapus Tailwind

npm remove @tailwindcss/vite tailwindcss

# Install Inertia, React, dan Bootstrap ecosystem

npm install @inertiajs/react react-dom bootstrap
npm install -D @vitejs/plugin-react

# Install JS libraries Mazer

npm install sweetalert2 apexcharts react-apexcharts flatpickr tom-select axios

0.2 Install Composer Packages

composer require inertiajs/inertia-laravel
composer require spatie/laravel-permission
composer require spatie/laravel-activitylog
composer require tightenco/ziggy

0.3 Konfigurasi Vite

Ubah vite.config.js — hapus Tailwind plugin, tambahkan @vitejs/plugin-react, input entry point ke resources/js/app.jsx.

0.4 Setup Mazer Assets

Salin asset Mazer dari public/dist/assets/ ke public/mazer/ agar bisa diakses langsung dari blade tanpa Vite (CSS/JS vendor Mazer tidak perlu di-bundle ulang).

0.5 Setup Inertia Middleware & Root View

- Publish HandleInertiaRequests middleware
- Buat resources/views/app.blade.php (root template Inertia yang load Mazer CSS + Vite React bundle)
- Register middleware di bootstrap/app.php

    0.6 Publish Spatie Migrations & Config

php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"

0.7 Update users Migration

Tambahkan kolom: username, is_active, last_login_at sesuai DATABASE_DICTIONARY v2.0 §1.1.

---

PHASE 1 — Foundation

Module 1.1 — Authentication

Files yang dibuat:

- app/Http/Controllers/AuthController.php
- resources/js/Layouts/AuthLayout.jsx — wrapper login page pakai Mazer auth.css (referensi: public/dist/auth-login.html)
- resources/js/Pages/Auth/Login.jsx
- routes/auth.php (include dari web.php)

Routes:
GET /login → AuthController@create
POST /login → AuthController@store
POST /logout → AuthController@destroy

Catatan implementasi: Login menggunakan username bukan email. Update config/auth.php untuk menggunakan field username.

---

Module 1.2 — RBAC (Spatie Permission)

Files yang dibuat:

- database/seeders/PermissionSeeder.php — seed semua permission format module.action
- database/seeders/RoleSeeder.php — seed 4 role + assign permission sesuai PRD §7.2
- database/seeders/UserSeeder.php — seed 4 user default (admin/fo1/hk1/fnb1)
- database/seeders/DatabaseSeeder.php — panggil semua seeder di atas

Daftar permission penuh (40 permissions, sesuai PRD §7.2):
dashboard.view
user.view/create/update/delete
role.view/create/update/delete
room-type.view/create/update/delete
room.view/create/update/delete
room-board.view
guest.view/create/update/delete
reservation.view/create/update/cancel
checkin.create
checkout.create
folio.view/charge/payment/settle
housekeeping.view/update
laundry.view/create/update
pool-maintenance.view/create
menu.view/create/update/delete
fnb.view/create/update/close
report.view
settings.view/update

---

Module 1.3 — Mazer Layout

Files yang dibuat:

- resources/js/Layouts/AppLayout.jsx — layout utama semua halaman post-login
    - Sidebar dinamis: menu di-render berdasarkan permission user via usePage().props.auth.permissions
    - Navbar, Footer, Breadcrumb dari Mazer (referensi: public/dist/layout-default.html)
- resources/js/Components/Sidebar.jsx
- resources/js/Components/Navbar.jsx
- resources/js/Components/Breadcrumb.jsx
- app/Http/Middleware/HandleInertiaRequests.php — share auth.user + auth.permissions ke semua page

---

PHASE 2 — Master Data

Module 2.1 — User Management

Files: UserController, UserRequest, Users/Index.jsx, Users/Create.jsx, Users/Edit.jsx

Catatan: Form create/edit menyertakan dropdown role dari Spatie. Password hashed via bcrypt. Soft delete aktif.

---

Module 2.2 — Floor Management

Files: FloorController, StoreFloorRequest, Floors/Index.jsx, Floors/Form.jsx

Migration: create_floors_table — floor_number, floor_name, description

Harus selesai sebelum Module 2.4.

---

Module 2.3 — Room Type Management

Files: RoomTypeController, RoomTypeRequest, RoomTypes/Index.jsx, RoomTypes/Form.jsx

Migration: create_room_types_table — code (UNIQUE), name, description, max_capacity, base_price, soft delete.

---

Module 2.4 — Room Management

Files: RoomController, RoomRequest, Rooms/Index.jsx, Rooms/Form.jsx

Migration: create_rooms_table — room_number, floor_id (FK), room_type_id (FK), status enum(vc,vd,oc,od,ooo,oos), notes, soft delete.

Catatan: Form pakai dropdown floor_id (bukan input integer). Load floors via props dari controller.

---

PHASE 3 — Reservation Management

Module 3.1 — Guest Management

Files: GuestController, GuestRequest, Guests/Index.jsx, Guests/Show.jsx

Migration: create_guests_table — full_name, id_type enum, id_number, phone, email, address, nationality, date_of_birth, gender enum, soft delete.

---

Module 3.2 — Reservation Management

Files: ReservationController, StoreReservationRequest, UpdateReservationRequest, Reservations/Index.jsx, Reservations/Create.jsx, Reservations/Edit.jsx, Reservations/Show.jsx

Migration: create_reservations_table — semua field sesuai DATABASE_DICTIONARY §4.1, room_id NULLABLE.

Service: ReservationService@checkAvailability($roomTypeId, $checkIn, $checkOut, $excludeId) — validasi kuota per room_type.

Form Request wajib validasi:

1. adults + children ≤ room_types.max_capacity
2. Kuota tersedia: total rooms tipe tersebut - count(reservasi overlap dengan status confirmed/checked_in) > 0

---

Module 3.3 — Availability Calendar

Files: AvailabilityController, Reservations/Calendar.jsx

AJAX endpoint: GET /availability/search — return JSON kuota per room_type per tanggal untuk calendar rendering via ApexCharts atau custom grid.

---

PHASE 4 — Front Office (Guest Cycle)

Module 4.1 — Check-In

Files: CheckInController, StoreCheckInRequest, CheckIns/Create.jsx

Migration: create_check_ins_table

Business rules (implementasi di controller/service):

1. Validasi reservation status = confirmed
2. Validasi room_id tidak overlap (cek reservasi aktif lain)
3. Update rooms.status → oc
4. Update reservations.status → checked_in
5. Create guest_folios baru
6. Jika ada deposit: create payments record (payment_type = deposit)

---

Module 4.2 — Guest Folio & Payment

Files: FolioController, Folios/Show.jsx

Migration: create_guest_folios_table, create_folio_charges_table, create_payments_table

Catatan penting: Nama tabel resmi payments (bukan folio_payments). addPayment selalu insert baris baru — tidak update existing.

Observer: PaymentObserver — setiap kali payment created/updated/deleted, recalculate guest_folios.total_payments, balance, dan check_outs.total_paid.

---

Module 4.3 — Check-Out

Files: CheckOutController, StoreCheckOutRequest, CheckOuts/Create.jsx

Migration: create_check_outs_table — tanpa kolom payment_method (ada di payments). total_paid adalah computed cache.

Business rules:

1. Update rooms.status → vd
2. Update reservations.status → checked_out
3. Create housekeeping_tasks baru (task_type = room_cleaning, status = pending)
4. Settlement: create payments baru (payment_type = payment)
5. check_outs.total_paid diisi otomatis via Observer — bukan input form

---

PHASE 5 — Housekeeping

Module 5.1 — Room Status Board

Files: RoomBoardController, Housekeeping/RoomBoard.jsx

Grid visual kamar dengan warna per status (VC=hijau, VD=kuning, OC=biru, OD=oranye, OOO=merah, OOS=abu). Filter per floor dan per status.

---

Module 5.2 — Housekeeping Tasks

Files: HousekeepingController, Housekeeping/Tasks.jsx

Migration: create_housekeeping_tasks_table — status enum: pending, assigned, in_progress, completed, cancelled.

---

Module 5.3 — Laundry

Files: LaundryController, StorelaundryRequest, Housekeeping/Laundry.jsx

Migration: create_laundry_requests_table

Observer/Event: Saat status → delivered, auto-create folio_charges (charge_type = laundry).

---

Module 5.4 — Pool Maintenance

Files: PoolMaintenanceController, StorePoolMaintenanceRequest, Housekeeping/PoolMaintenance.jsx

Migration: create_pool_maintenance_logs_table — sesuai DATABASE_DICTIONARY §7.3.

---

PHASE 6 — F&B Management

Module 6.1 — Menu Management

Files: MenuCategoryController, MenuItemController, Fnb/MenuCategories.jsx, Fnb/MenuItems.jsx

Migrations: create_menu_categories_table, create_menu_items_table

Harus selesai sebelum Module 6.2.

---

Module 6.2 — POS Order

Files: FnbOrderController, StoreFnbOrderRequest, Fnb/Orders.jsx

Migrations: create_fnb_orders_table, create_fnb_order_items_table

Catatan: Saat store, sistem fetch name & price dari menu_items lalu simpan sebagai item_name_snapshot + unit_price di fnb_order_items (snapshot pattern — riwayat tidak berubah jika menu diedit).

AJAX: GET /ajax/menu-items?outlet=resto untuk Tom Select di form order.

---

Module 6.3 — Room Service

Bagian dari FnbOrderController. Business rule: outlet = room_service AND charge_to = room → auto-create folio_charges (charge_type = fnb).

---

PHASE 7 — Reporting

Files: ReportController, Reports/Occupancy.jsx, Reports/Revenue.jsx, Reports/Housekeeping.jsx, Reports/Fnb.jsx

Permission: report.view (Administrator only).

Export PDF via barryvdh/laravel-dompdf, Excel via maatwebsite/excel (install di fase ini).

---

PHASE 8 — Settings

Files: SettingController, Settings/Hotel.jsx, Settings/System.jsx

Migration: create_app_settings_table — group, key, value, type enum, UNIQUE(group,key).

Seeder: AppSettingSeeder — isi default (hotel name, currency, tax, dll).

---

PHASE 9 — Hardening

9.1 — Audit Log

Tambahkan trait LogsActivity pada model: Reservation, CheckIn, CheckOut, Payment, Room, User. Buat halaman viewer Activity Log (Administrator only).

9.2 — Security

- Policy per model (roomPolicy, ReservationPolicy, dll)
- Form Request validation lengkap semua edge case
- Rate limiting pada /login

    9.3 — Testing (Pest)

Coverage target 80%. Test wajib:

- Validasi bentrok tanggal (per room_type & per room_id)
- Validasi kapasitas tamu
- Auto-create folio_charge dari laundry/F&B room service
- Auto-update total_paid via Observer
- Permission gate per role (403 jika tidak punya permission)

---

Urutan Migrasi Database (Final)

[Default Laravel] users, cache, jobs
[Spatie Permission] roles, permissions, model_has_roles,
model_has_permissions, role_has_permissions
[Spatie Activitylog] activity_log
[Phase 1] alter_users_table (add username, is_active, dll)
[Phase 2] floors → room_types → rooms
[Phase 3] guests → reservations
[Phase 4] check_ins → guest_folios → folio_charges
→ payments → check_outs
[Phase 5] housekeeping_tasks → laundry_requests
→ pool_maintenance_logs
[Phase 6] menu_categories → menu_items → fnb_orders
→ fnb_order_items
[Phase 8] app_settings

---

Referensi Template Mazer

┌──────────────┬───────────────────────────────────────────────────┐
│ Kebutuhan │ File Referensi di public/dist/ │
├──────────────┼───────────────────────────────────────────────────┤
│ Login page │ auth-login.html │
├──────────────┼───────────────────────────────────────────────────┤
│ Layout utama │ layout-default.html │
├──────────────┼───────────────────────────────────────────────────┤
│ Sidebar │ sidebar-items.html │
├──────────────┼───────────────────────────────────────────────────┤
│ Tabel data │ table-datatable.html │
├──────────────┼───────────────────────────────────────────────────┤
│ Form input │ form-element-input.html, form-element-select.html │
├──────────────┼───────────────────────────────────────────────────┤
│ Modal │ component-modal.html │
├──────────────┼───────────────────────────────────────────────────┤
│ Charts │ ui-chart-apexcharts.html │
├──────────────┼───────────────────────────────────────────────────┤
│ SweetAlert2 │ extra-component-sweetalert.html │
├──────────────┼───────────────────────────────────────────────────┤
│ Card widget │ component-card.html │
└──────────────┴───────────────────────────────────────────────────┘

---

Checklist Definition of Done (per Module)

Setiap module dianggap selesai jika:

- [ ] Migration sesuai DATABASE_DICTIONARY v2.0 (nama tabel/kolom persis)
- [ ] Model dengan relasi lengkap dan trait yang diperlukan
- [ ] Seeder (untuk permission/role/data awal)
- [ ] Controller + Service (business logic di Service, bukan Controller)
- [ ] Form Request dengan semua validasi
- [ ] Permission middleware terpasang di route
- [ ] Inertia Page dengan UI Mazer (tidak ada Tailwind class)
- [ ] php artisan test lulus
- [ ] npm run build sukses tanpa error

---
