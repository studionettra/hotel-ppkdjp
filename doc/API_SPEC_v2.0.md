# API & ROUTE SPECIFICATION — PPKD Hotel Management System

**Version:** 2.0 (Final, Consolidated)
**Menggantikan:** API_SPEC.md v3.0 secara penuh

**Stack:** Laravel 13, Inertia.js, React 18, Mazer Bootstrap 5, Spatie Permission, Spatie Activitylog, MySQL 8

---

# 1. Overview

Dokumen ini mendefinisikan seluruh route, controller action, permission, dan response contract.

Karena aplikasi menggunakan Inertia.js, mayoritas request mengembalikan **Inertia Page Response**, bukan REST JSON API.

JSON Endpoint hanya digunakan untuk: AJAX Search, Dashboard Widget, Calendar Availability, Select Option Lookup, Dynamic DataTable.

**Format permission:** Granular dot-notation (`module.action`) — lihat PRD v4.0 Section 7.2 untuk daftar lengkap dan mapping ke role.

---

# 2. Authentication Module

| Route | Method | Controller | Permission |
|---|---|---|---|
| `/login` | GET | `AuthController@create` | Public |
| `/login` | POST | `AuthController@store` | Public |
| `/logout` | POST | `AuthController@destroy` | Authenticated |

```php
// Login Page
Inertia::render('Auth/Login')

// Login Request
{ "username": "admin", "password": "password" }

// Success
redirect()->route('dashboard');

// Failure
back()->withErrors();
```

---

# 3. Dashboard Module

**Permission:** `dashboard.view`

| Route | Method | Controller |
|---|---|---|
| `/dashboard` | GET | `DashboardController@index` |
| `/dashboard/stats` | GET (AJAX) | `DashboardController@stats` |

```php
Inertia::render('Dashboard/Index', [
    'occupancyRate', 'todayArrivals', 'todayDepartures',
    'roomSummary', 'revenueToday'
]);
```

Response widget per role di-render kondisional sesuai role yang login (lihat PRD v4.0 Section 8.1).

```json
{ "occupancy": 78, "revenue": 5000000, "arrivals": 10, "departures": 8 }
```

---

# 4. User Management Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `user.view` | `/users` | GET | `UserController@index` |
| `user.create` | `/users/create` | GET | `UserController@create` |
| `user.create` | `/users` | POST | `UserController@store` |
| `user.update` | `/users/{user}/edit` | GET | `UserController@edit` |
| `user.update` | `/users/{user}` | PUT | `UserController@update` |
| `user.delete` | `/users/{user}` | DELETE | `UserController@destroy` |

Pages: `Users/Index.jsx`, `Users/Create.jsx`, `Users/Edit.jsx`

---

# 5. Role & Permission Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `role.view` | `/roles` | GET | `RoleController@index` |
| `role.create` | `/roles` | POST | `RoleController@store` |
| `role.update` | `/roles/{role}` | PUT | `RoleController@update` |
| `role.delete` | `/roles/{role}` | DELETE | `RoleController@destroy` |

---

# 6. Floor Module (BARU)

> Sebelumnya tidak ada route untuk floor sama sekali, padahal `rooms.floor_id` adalah FK wajib.

| Permission | Route | Method | Controller |
|---|---|---|---|
| `room.view` | `/floors` | GET | `FloorController@index` |
| `room.create` | `/floors` | POST | `FloorController@store` |
| `room.update` | `/floors/{floor}` | PUT | `FloorController@update` |
| `room.delete` | `/floors/{floor}` | DELETE | `FloorController@destroy` |

> Floor digabung permission-nya dengan `room.*` karena floor adalah sub-data dari room management, tidak perlu permission terpisah.

---

# 7. Room Type Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `room-type.view` | `/room-types` | GET | `RoomTypeController@index` |
| `room-type.create` | `/room-types` | POST | `RoomTypeController@store` |
| `room-type.update` | `/room-types/{roomType}` | PUT | `RoomTypeController@update` |
| `room-type.delete` | `/room-types/{roomType}` | DELETE | `RoomTypeController@destroy` |

---

# 8. Room Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `room.view` | `/rooms` | GET | `RoomController@index` |
| `room.create` | `/rooms` | POST | `RoomController@store` |
| `room.update` | `/rooms/{room}` | PUT | `RoomController@update` |
| `room.delete` | `/rooms/{room}` | DELETE | `RoomController@destroy` |

Page: `Rooms/Index.jsx`. Form room wajib pakai dropdown `floor_id` (dari `/floors`), bukan input integer manual.

---

# 9. Room Board Module

**Permission:** `room-board.view`

| Route | Method | Controller |
|---|---|---|
| `/room-board` | GET | `RoomBoardController@index` |

Page: `Housekeeping/RoomBoard.jsx`

```php
[ 'floors', 'rooms', 'statuses' ]
```

Board mendukung filter per `floor_id` dan per `status`.

---

# 10. Guest Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `guest.view` | `/guests` | GET | `GuestController@index` |
| `guest.create` | `/guests` | POST | `GuestController@store` |
| `guest.update` | `/guests/{guest}` | PUT | `GuestController@update` |
| `guest.delete` | `/guests/{guest}` | DELETE | `GuestController@destroy` |

---

# 11. Reservation Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `reservation.view` | `/reservations` | GET | `ReservationController@index` |
| `reservation.create` | `/reservations/create` | GET | `ReservationController@create` |
| `reservation.create` | `/reservations` | POST | `ReservationController@store` |
| `reservation.update` | `/reservations/{reservation}` | PUT | `ReservationController@update` |
| `reservation.cancel` | `/reservations/{reservation}/cancel` | PATCH | `ReservationController@cancel` |

Page: `Reservations/Index.jsx`

**Validasi wajib di `store`/`update` (Form Request):**
1. `adults + children` ≤ `room_types.max_capacity`
2. Cek kuota `room_type_id` tidak overlap tanggal (lihat Business Rule di DATABASE_DICTIONARY v2.0 Section 4.1)

---

# 12. Availability Calendar

| Permission | Route | Method | Controller |
|---|---|---|---|
| `reservation.view` | `/availability` | GET | `AvailabilityController@index` |
| `reservation.view` | `/availability/search` | GET (AJAX) | `AvailabilityController@search` |

Page: `Reservations/Calendar.jsx`

```json
{ "rooms": [] }
```

---

# 13. Check-In Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `checkin.create` | `/checkins/create/{reservation}` | GET | `CheckInController@create` |
| `checkin.create` | `/checkins` | POST | `CheckInController@store` |

**Business Rules:**
- Reservation status → `checked_in`
- Room status → `occupied` (oc)
- Create `guest_folio`
- Jika ada deposit, create `Payment` (`payment_type = deposit`) — **bukan** hanya kolom `deposit_amount` di `check_ins`

---

# 14. Check-Out Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `checkout.create` | `/checkouts/create/{checkin}` | GET | `CheckOutController@create` |
| `checkout.create` | `/checkouts` | POST | `CheckOutController@store` |

**Business Rules:**
- Reservation → `checked_out`
- Room → `vd` (vacant dirty)
- Generate `housekeeping_task` baru (`task_type = room_cleaning`, `status = pending`)
- Settlement payment dicatat sebagai `Payment` (`payment_type = payment`), bukan field langsung di `check_outs`
- `check_outs.total_paid` di-update otomatis via Observer setiap kali `Payment` baru dibuat

---

# 15. Guest Folio & Payment Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `folio.view` | `/folios/{folio}` | GET | `FolioController@show` |
| `folio.charge` | `/folios/{folio}/charges` | POST | `FolioController@addCharge` |
| `folio.payment` | `/folios/{folio}/payments` | POST | `FolioController@addPayment` |
| `folio.settle` | `/folios/{folio}/settle` | POST | `FolioController@settle` |

```php
// addPayment request
{
  "payment_type": "deposit|payment|refund",
  "payment_method": "cash|debit_card|credit_card|transfer|city_ledger",
  "amount": 500000,
  "notes": "..."
}
```

`addPayment` membuat baris baru di tabel `payments` (tidak menimpa data lama) — mendukung multi-transaksi (partial payment).

---

# 16. Housekeeping Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `housekeeping.view` | `/housekeeping/tasks` | GET | `HousekeepingController@index` |
| `housekeeping.update` | `/housekeeping/tasks/{task}` | PATCH | `HousekeepingController@update` |

**Task Status:** `pending`, `assigned`, `in_progress`, `completed`, `cancelled`

> **Koreksi:** Status `assigned` resmi masuk ke enum database — sebelumnya ada di spek route tapi tidak ada di skema.

---

# 17. Laundry Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `laundry.view` | `/laundry` | GET | `LaundryController@index` |
| `laundry.create` | `/laundry` | POST | `LaundryController@store` |
| `laundry.update` | `/laundry/{laundry}` | PATCH | `LaundryController@update` |

**Business Rules:**
- Status → `delivered`: auto create `folio_charges` (`charge_type = laundry`)

---

# 18. Pool Maintenance Module (BARU)

> Sebelumnya modul ini ada di PRD dan MODULE_BREAKDOWN tapi tidak ada satupun route di API_SPEC.

| Permission | Route | Method | Controller |
|---|---|---|---|
| `pool-maintenance.view` | `/pool-maintenance` | GET | `PoolMaintenanceController@index` |
| `pool-maintenance.create` | `/pool-maintenance` | POST | `PoolMaintenanceController@store` |

Page: `Housekeeping/PoolMaintenance.jsx`

```php
// store request
{
  "check_date": "2026-06-23",
  "water_quality": "good|fair|poor",
  "ph_level": 7.2,
  "chlorine_level": 1.5,
  "cleaning_status": "pending|done",
  "equipment_status": "ok|needs_attention|broken",
  "notes": "..."
}
```

---

# 19. Menu Management Module (BARU)

> Sebelumnya disebut sebagai deliverable di MODULE_BREAKDOWN Module 6.1, tapi tidak ada route di API_SPEC.

| Permission | Route | Method | Controller |
|---|---|---|---|
| `menu.view` | `/menu/categories` | GET | `MenuCategoryController@index` |
| `menu.create` | `/menu/categories` | POST | `MenuCategoryController@store` |
| `menu.update` | `/menu/categories/{category}` | PUT | `MenuCategoryController@update` |
| `menu.delete` | `/menu/categories/{category}` | DELETE | `MenuCategoryController@destroy` |
| `menu.view` | `/menu/items` | GET | `MenuItemController@index` |
| `menu.create` | `/menu/items` | POST | `MenuItemController@store` |
| `menu.update` | `/menu/items/{item}` | PUT | `MenuItemController@update` |
| `menu.delete` | `/menu/items/{item}` | DELETE | `MenuItemController@destroy` |

Pages: `Fnb/MenuCategories.jsx`, `Fnb/MenuItems.jsx`

---

# 20. F&B Order Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `fnb.view` | `/fnb/orders` | GET | `FnbOrderController@index` |
| `fnb.create` | `/fnb/orders` | POST | `FnbOrderController@store` |
| `fnb.update` | `/fnb/orders/{order}` | PATCH | `FnbOrderController@update` |
| `fnb.close` | `/fnb/orders/{order}/close` | PATCH | `FnbOrderController@close` |

```php
// store request — item dipilih dari katalog, bukan input nama bebas
{
  "outlet": "resto|lounge|room_service",
  "guest_id": null,
  "room_id": null,
  "charge_to": "room|cash|card",
  "items": [
    { "menu_item_id": 5, "quantity": 2, "notes": "no ice" }
  ]
}
```

Saat `store`, sistem mengambil `name` dan `price` dari `menu_items` lalu menyimpannya sebagai `item_name_snapshot` dan `unit_price` di `fnb_order_items` (lihat DATABASE_DICTIONARY v2.0 Section 8.4).

**Business Rules:**
- Charge to `room` → create `folio_charges` (`charge_type = fnb`)
- Charge to `cash`/`card` → direct settlement, tidak masuk folio

---

# 21. Reports Module

**Permission:** `report.view`

| Route | Method | Controller |
|---|---|---|
| `/reports` | GET | `ReportController@index` |
| `/reports/occupancy` | GET | `ReportController@occupancy` |
| `/reports/revenue` | GET | `ReportController@revenue` |
| `/reports/housekeeping` | GET | `ReportController@housekeeping` |
| `/reports/fnb` | GET | `ReportController@fnb` |

Export: PDF, Excel (query param `?export=pdf` / `?export=excel`)

---

# 22. Settings Module

| Permission | Route | Method | Controller |
|---|---|---|---|
| `settings.view` | `/settings` | GET | `SettingController@index` |
| `settings.update` | `/settings` | PUT | `SettingController@update` |

```php
// update request — array key-value sesuai app_settings
{
  "hotel.name": "PPKD Hotel",
  "hotel.currency": "IDR",
  "tax.service_charge_percent": 10,
  "tax.ppn_percent": 11
}
```

---

# 23. AJAX Lookup Endpoints

Digunakan oleh Select2/Tom Select, search box, autocomplete.

| Route | Response |
|---|---|
| `GET /ajax/guests` | `[{ "id": 1, "text": "John Doe" }]` |
| `GET /ajax/rooms` | Daftar kamar (filter by status/floor) |
| `GET /ajax/reservations` | Daftar reservasi aktif |
| `GET /ajax/users` | Daftar staff |
| `GET /ajax/menu-items` | Daftar menu aktif (filter by outlet) |

---

# 24. Route Naming Convention

```php
dashboard.index

users.index users.create users.store users.edit users.update users.destroy
roles.index roles.store roles.update roles.destroy

floors.index floors.store floors.update floors.destroy
room-types.index room-types.store room-types.update room-types.destroy
rooms.index rooms.store rooms.update rooms.destroy
room-board.index

guests.index guests.store guests.update guests.destroy

reservations.index reservations.create reservations.store
reservations.update reservations.cancel
availability.index availability.search

checkins.create checkins.store
checkouts.create checkouts.store

folios.show folios.addCharge folios.addPayment folios.settle

housekeeping.index housekeeping.update
laundry.index laundry.store laundry.update
pool-maintenance.index pool-maintenance.store

menu-categories.index menu-categories.store menu-categories.update menu-categories.destroy
menu-items.index menu-items.store menu-items.update menu-items.destroy

fnb.index fnb.store fnb.update fnb.close

reports.index reports.occupancy reports.revenue reports.housekeeping reports.fnb

settings.index settings.update
```

---

# 25. Middleware Stack

```php
web
auth
verified

permission:user.view
permission:reservation.create
permission:folio.settle
permission:pool-maintenance.create
permission:menu.create
// dst, sesuai daftar permission di PRD v4.0 Section 7.2
```

> **Koreksi:** Middleware `role:administrator` (role-based) **tidak dipakai lagi** sebagai gate utama — semua route di-gate dengan `permission:` middleware granular, karena role hanyalah kumpulan permission (lihat PRD v4.0 Section 7.2). Ini membuat sistem fleksibel jika nanti ada role baru atau kombinasi permission khusus.

---

# 26. Security Requirements

- CSRF Protection
- Laravel Session Authentication
- Password Hashing (Bcrypt)
- Authorization via Spatie Permission (granular, lihat Section 25)
- Form Request Validation (termasuk validasi bentrok tanggal & kapasitas tamu)
- Audit Logging via `spatie/laravel-activitylog`
- Soft Deletes pada: `users`, `guests`, `reservations`, `rooms`, `room_types`

---

# 27. Future Extensions

- OTA Integration
- WhatsApp Notification
- QR Check-In
- E-Invoice
- Multi Hotel Support
- Mobile Housekeeping App
- Real-time Notification
- Group Booking (`reservation_groups`)
- Auto no-show scheduler
