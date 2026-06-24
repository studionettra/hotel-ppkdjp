# DATABASE DICTIONARY — PPKD Hotel Management System

**Version:** 2.0 (Final, Consolidated)
**Menggantikan:** DATABASE_DICTIONARY.md v1.0 dan skema database di PRD_V3_UPDATE.md secara penuh

**Stack:** Laravel 13, MySQL 8, Inertia.js, React, Mazer Bootstrap 5, Spatie Permission, Spatie Activitylog

---

# Database Standards

## Primary Key

```sql
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
```

## Timestamps

```php
$table->timestamps(); // created_at, updated_at
```

## Soft Delete

Digunakan pada: `users`, `guests`, `reservations`, `rooms`, `room_types`

```php
$table->softDeletes();
```

## Audit Fields

Untuk transaksi penting:

```sql
created_by BIGINT UNSIGNED NULL
updated_by BIGINT UNSIGNED NULL
```

---

# 1. AUTHENTICATION

## 1.1 `users`

Menyimpan data seluruh staff hotel.

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| name | varchar(255) | No | | Nama lengkap |
| username | varchar(100) | No | UNIQUE | |
| email | varchar(255) | No | UNIQUE | |
| password | varchar(255) | No | | Bcrypt hash |
| is_active | boolean | No | | |
| last_login_at | datetime | Yes | | |
| remember_token | varchar(100) | Yes | | Laravel default |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |
| deleted_at | timestamp | | | Soft delete |

```php
User::hasMany(Reservation::class, 'created_by');
User::hasMany(CheckIn::class, 'processed_by');
User::hasMany(CheckOut::class, 'processed_by');
User::hasMany(HousekeepingTask::class, 'assigned_to');
User::hasMany(LaundryRequest::class, 'assigned_to');
User::hasMany(PoolMaintenanceLog::class, 'checked_by');
User::hasMany(Payment::class, 'created_by');
User::hasMany(FnbOrder::class, 'created_by');
```

### Authorization Tables (Spatie Permission — auto-generated, jangan dibuat manual)

```text
roles
permissions
model_has_roles
model_has_permissions
role_has_permissions
```

### Audit Table (Spatie Activitylog — auto-generated)

```bash
composer require spatie/laravel-activitylog
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"
```

Tabel `activity_log` dihasilkan otomatis dengan kolom: `log_name`, `description`, `subject_type`, `subject_id`, `causer_type`, `causer_id`, `properties` (JSON), `created_at`, `updated_at`.

---

# 2. MASTER DATA

## 2.1 `floors`

```sql
CREATE TABLE floors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    floor_number INT NOT NULL,
    floor_name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

```php
Floor::hasMany(Room::class);
```

## 2.2 `room_types`

| Field | Type |
|---|---|
| id | bigint |
| code | varchar(10), UNIQUE |
| name | varchar(100) |
| description | text |
| max_capacity | integer |
| base_price | decimal(12,2) |
| created_at | timestamp |
| updated_at | timestamp |
| deleted_at | timestamp |

Contoh `code`: `STD`, `DLX`, `SUT`

```php
RoomType::hasMany(Room::class);
RoomType::hasMany(Reservation::class);
```

## 2.3 `rooms`

| Field | Type |
|---|---|
| id | bigint |
| room_number | varchar(20) |
| floor_id | bigint, FK → floors.id |
| room_type_id | bigint, FK → room_types.id |
| status | enum |
| notes | text |
| created_at | timestamp |
| updated_at | timestamp |
| deleted_at | timestamp |

```sql
status ENUM('vc','vd','oc','od','ooo','oos') NOT NULL DEFAULT 'vc'
```

> **Catatan penting:** Kolom adalah `floor_id` (FK), **bukan** `floor INT` bebas. Ini koreksi final dari versi sebelumnya yang sempat tidak konsisten antar dokumen.

```php
Room::belongsTo(Floor::class);
Room::belongsTo(RoomType::class);
Room::hasMany(Reservation::class);
Room::hasMany(HousekeepingTask::class);
Room::hasMany(LaundryRequest::class);
Room::hasMany(FnbOrder::class);
```

---

# 3. GUEST

## 3.1 `guests`

| Field | Type |
|---|---|
| id | bigint |
| full_name | varchar(255) |
| id_type | enum |
| id_number | varchar(100) |
| phone | varchar(30) |
| email | varchar(255) |
| address | text |
| nationality | varchar(100) |
| date_of_birth | date |
| gender | enum |
| created_at | timestamp |
| updated_at | timestamp |
| deleted_at | timestamp |

```sql
id_type ENUM('ktp','passport','sim')
gender ENUM('male','female')
```

```php
Guest::hasMany(Reservation::class);
Guest::hasMany(FnbOrder::class);
Guest::hasMany(LaundryRequest::class);
```

---

# 4. RESERVATION

## 4.1 `reservations`

| Field | Type |
|---|---|
| id | bigint |
| reservation_code | varchar(30), UNIQUE |
| guest_id | bigint, FK → guests.id |
| room_type_id | bigint, FK → room_types.id |
| room_id | bigint NULLABLE, FK → rooms.id |
| check_in_date | date |
| check_out_date | date |
| adults | integer |
| children | integer |
| channel | enum |
| status | enum |
| special_request | text |
| total_amount | decimal(12,2) |
| created_by | bigint, FK → users.id |
| created_at | timestamp |
| updated_at | timestamp |
| deleted_at | timestamp |

```sql
channel ENUM('walk_in','phone','website','ota','email')
status  ENUM('pending','confirmed','checked_in','checked_out','cancelled','no_show')
```

**Validation Rules (wajib di Form Request):**
- `adults + children` ≤ `room_types.max_capacity` dari `room_type_id` yang dipilih
- Tidak boleh ada reservasi lain dengan `room_type_id` sama yang overlap tanggal dan status `confirmed`/`checked_in`, jika kuota kamar tipe tersebut sudah penuh
- Saat `room_id` diisi (assignment): tidak boleh overlap dengan reservasi lain pada `room_id` yang sama dengan status `confirmed`/`checked_in`

```php
Reservation::belongsTo(Guest::class);
Reservation::belongsTo(Room::class);
Reservation::belongsTo(RoomType::class);
Reservation::belongsTo(User::class, 'created_by');
Reservation::hasOne(CheckIn::class);
```

---

# 5. CHECK-IN / CHECK-OUT

## 5.1 `check_ins`

| Field | Type |
|---|---|
| id | bigint |
| reservation_id | bigint, FK → reservations.id |
| room_id | bigint, FK → rooms.id |
| check_in_time | datetime |
| deposit_amount | decimal(12,2) |
| deposit_method | enum |
| processed_by | bigint, FK → users.id |
| notes | text |
| created_at | timestamp |
| updated_at | timestamp |

```sql
deposit_method ENUM('cash','debit','credit_card','transfer')
```

> Catatan: `deposit_amount` & `deposit_method` di sini dipertahankan sebagai ringkasan cepat saat proses check-in. Transaksi deposit yang sesungguhnya tetap dicatat sebagai baris baru di tabel `payments` (`payment_type = deposit`) agar konsisten dengan riwayat folio.

```php
CheckIn::belongsTo(Reservation::class);
CheckIn::belongsTo(Room::class);
CheckIn::belongsTo(User::class, 'processed_by');
CheckIn::hasOne(GuestFolio::class);
CheckIn::hasOne(CheckOut::class);
```

## 5.2 `check_outs`

| Field | Type | Keterangan |
|---|---|---|
| id | bigint | |
| check_in_id | bigint, FK → check_ins.id | |
| check_out_time | datetime | |
| total_bill | decimal(12,2) | |
| total_paid | decimal(12,2) | **Cached/computed** — diisi otomatis dari `SUM(payments)` terkait folio, bukan input manual |
| feedback_rating | tinyInteger | |
| feedback_notes | text | |
| processed_by | bigint, FK → users.id | |
| created_at | timestamp | |
| updated_at | timestamp | |

> **Koreksi penting:** Kolom `payment_method` **dihapus** dari tabel ini (ada di versi lama). Metode pembayaran sekarang tercatat per transaksi di `payments.payment_method`, karena 1 checkout bisa memiliki lebih dari satu metode pembayaran (misal split cash + transfer).

```php
CheckOut::belongsTo(CheckIn::class);
CheckOut::belongsTo(User::class, 'processed_by');
```

**Implementation note:** Gunakan Model Observer/Event pada `Payment` (created/updated/deleted) untuk recalculate dan update `check_outs.total_paid` secara otomatis.

---

# 6. BILLING & PAYMENT

## 6.1 `guest_folios`

| Field | Type |
|---|---|
| id | bigint |
| folio_number | varchar(30), UNIQUE |
| guest_id | bigint, FK → guests.id |
| check_in_id | bigint, FK → check_ins.id |
| status | enum |
| total_charges | decimal(12,2) |
| total_payments | decimal(12,2) |
| balance | decimal(12,2) |
| created_at | timestamp |
| updated_at | timestamp |

```sql
status ENUM('open','settled','void')
```

```php
GuestFolio::belongsTo(Guest::class);
GuestFolio::belongsTo(CheckIn::class);
GuestFolio::hasMany(FolioCharge::class);
GuestFolio::hasMany(Payment::class);
```

## 6.2 `folio_charges`

| Field | Type |
|---|---|
| id | bigint |
| folio_id | bigint, FK → guest_folios.id |
| charge_type | enum |
| description | varchar(255) |
| quantity | integer |
| unit_price | decimal(12,2) |
| amount | decimal(12,2) |
| charge_date | date |
| reference_type | varchar(100) |
| reference_id | bigint |
| created_by | bigint, FK → users.id |
| created_at | timestamp |
| updated_at | timestamp |

```sql
charge_type ENUM('room','fnb','laundry','extra_bed','minibar','other')
```

Polymorphic source (`reference_type` / `reference_id`): `LaundryRequest`, `FnbOrder`, `ManualCharge`

```php
FolioCharge::belongsTo(GuestFolio::class);
```

## 6.3 `payments` (FINAL — nama tabel resmi, bukan `folio_payments`)

| Field | Type |
|---|---|
| id | bigint |
| folio_id | bigint, FK → guest_folios.id |
| payment_number | varchar(30), UNIQUE |
| payment_type | enum |
| payment_method | enum |
| amount | decimal(12,2) |
| payment_date | datetime |
| notes | text |
| created_by | bigint, FK → users.id |
| created_at | timestamp |
| updated_at | timestamp |

```sql
payment_type   ENUM('deposit','payment','refund')
payment_method ENUM('cash','debit_card','credit_card','transfer','city_ledger')
```

```sql
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    folio_id BIGINT UNSIGNED NOT NULL,
    payment_number VARCHAR(30) UNIQUE NOT NULL,
    payment_type ENUM('deposit','payment','refund') NOT NULL,
    payment_method ENUM('cash','debit_card','credit_card','transfer','city_ledger') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATETIME NOT NULL,
    notes TEXT,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (folio_id) REFERENCES guest_folios(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Business Rules:**

```text
Deposit saat check-in   → Payment(payment_type = deposit)
Settlement saat checkout → Payment(payment_type = payment)
Refund deposit           → Payment(payment_type = refund)
```

```php
Payment::belongsTo(GuestFolio::class);
Payment::belongsTo(User::class, 'created_by');
```

---

# 7. HOUSEKEEPING

## 7.1 `housekeeping_tasks`

| Field | Type |
|---|---|
| id | bigint |
| room_id | bigint, FK → rooms.id |
| task_type | enum |
| priority | enum |
| status | enum |
| assigned_to | bigint, FK → users.id |
| notes | text |
| completed_at | datetime |
| created_at | timestamp |
| updated_at | timestamp |

```sql
task_type ENUM('room_cleaning','turndown','deep_clean','pool','public_area')
priority  ENUM('low','medium','high','urgent')
status    ENUM('pending','assigned','in_progress','completed','cancelled')
```

> **Koreksi:** Status `assigned` ditambahkan ke enum (sebelumnya disebut di spesifikasi route namun tidak ada di skema database).

```php
HousekeepingTask::belongsTo(Room::class);
HousekeepingTask::belongsTo(User::class, 'assigned_to');
```

## 7.2 `laundry_requests`

| Field | Type |
|---|---|
| id | bigint |
| guest_id | bigint, FK → guests.id |
| room_id | bigint, FK → rooms.id |
| item_count | integer |
| items_description | text |
| total_charge | decimal(12,2) |
| status | enum |
| assigned_to | bigint, FK → users.id |
| received_at | datetime |
| delivered_at | datetime |
| created_at | timestamp |
| updated_at | timestamp |

```sql
status ENUM('received','processing','done','delivered')
```

Business Rule: Status `delivered` → otomatis membuat `FolioCharge` (`charge_type = laundry`).

```php
LaundryRequest::belongsTo(Guest::class);
LaundryRequest::belongsTo(Room::class);
LaundryRequest::belongsTo(User::class, 'assigned_to');
```

## 7.3 `pool_maintenance_logs`

> **Tabel baru** — sebelumnya disebut sebagai deliverable Module 5.4 namun tidak pernah didefinisikan skemanya.

| Field | Type |
|---|---|
| id | bigint |
| check_date | date |
| water_quality | enum |
| ph_level | decimal(4,2), nullable |
| chlorine_level | decimal(4,2), nullable |
| cleaning_status | enum |
| equipment_status | enum |
| notes | text |
| checked_by | bigint, FK → users.id |
| created_at | timestamp |
| updated_at | timestamp |

```sql
CREATE TABLE pool_maintenance_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    check_date DATE NOT NULL,
    water_quality ENUM('good','fair','poor') NOT NULL,
    ph_level DECIMAL(4,2) NULL,
    chlorine_level DECIMAL(4,2) NULL,
    cleaning_status ENUM('pending','done') NOT NULL DEFAULT 'pending',
    equipment_status ENUM('ok','needs_attention','broken') NOT NULL DEFAULT 'ok',
    notes TEXT,
    checked_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (checked_by) REFERENCES users(id)
);
```

> Pool dianggap fasilitas tunggal (tidak terhubung ke `rooms`). Jika hotel memiliki lebih dari satu kolam, tambahkan tabel master `pools` di Phase 2.

```php
PoolMaintenanceLog::belongsTo(User::class, 'checked_by');
```

---

# 8. F&B

## 8.1 `menu_categories`

> **Tabel baru** — sebelumnya disebut sebagai deliverable Module 6.1 namun tidak pernah didefinisikan skemanya.

| Field | Type |
|---|---|
| id | bigint |
| name | varchar(100) |
| sort_order | integer |
| is_active | boolean |
| created_at | timestamp |
| updated_at | timestamp |

```php
MenuCategory::hasMany(MenuItem::class);
```

## 8.2 `menu_items`

| Field | Type |
|---|---|
| id | bigint |
| menu_category_id | bigint, FK → menu_categories.id |
| name | varchar(255) |
| description | text |
| price | decimal(12,2) |
| outlet | enum |
| is_active | boolean |
| created_at | timestamp |
| updated_at | timestamp |

```sql
outlet ENUM('resto','lounge','room_service','all')
```

```php
MenuItem::belongsTo(MenuCategory::class);
MenuItem::hasMany(FnbOrderItem::class);
```

## 8.3 `fnb_orders`

| Field | Type |
|---|---|
| id | bigint |
| order_number | varchar(30), UNIQUE |
| outlet | enum |
| guest_id | bigint NULLABLE, FK → guests.id |
| room_id | bigint NULLABLE, FK → rooms.id |
| charge_to | enum |
| status | enum |
| subtotal | decimal(12,2) |
| tax | decimal(12,2) |
| total | decimal(12,2) |
| notes | text |
| created_by | bigint, FK → users.id |
| created_at | timestamp |
| updated_at | timestamp |

```sql
outlet    ENUM('resto','lounge','room_service')
charge_to ENUM('room','cash','card')
status    ENUM('pending','preparing','served','closed','cancelled')
```

Business Rule: `outlet = room_service` AND `charge_to = room` → otomatis membuat `FolioCharge` (`charge_type = fnb`).

```php
FnbOrder::belongsTo(Guest::class);
FnbOrder::belongsTo(Room::class);
FnbOrder::belongsTo(User::class, 'created_by');
FnbOrder::hasMany(FnbOrderItem::class);
```

## 8.4 `fnb_order_items`

| Field | Type |
|---|---|
| id | bigint |
| order_id | bigint, FK → fnb_orders.id |
| menu_item_id | bigint, FK → menu_items.id |
| item_name_snapshot | varchar(255) |
| quantity | integer |
| unit_price | decimal(12,2) |
| subtotal | decimal(12,2) |
| notes | varchar(255) |
| created_at | timestamp |
| updated_at | timestamp |

```sql
CREATE TABLE fnb_order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    menu_item_id BIGINT UNSIGNED NOT NULL,
    item_name_snapshot VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES fnb_orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);
```

> **Koreksi penting:** Versi sebelumnya menyimpan `item_name` sebagai free text (tidak ada hubungan ke katalog menu). Versi final menggunakan FK ke `menu_items` **plus** kolom snapshot (`item_name_snapshot`, `unit_price`) yang di-copy dari menu pada saat order dibuat — supaya riwayat order/folio tidak ikut berubah jika menu diedit atau dihapus di kemudian hari.

```php
FnbOrderItem::belongsTo(FnbOrder::class);
FnbOrderItem::belongsTo(MenuItem::class);
```

---

# 9. SYSTEM

## 9.1 `app_settings`

> **Tabel baru** — sebelumnya route-nya sudah ada di API_SPEC (`GET/PUT /settings`) namun tidak ada skema database.

| Field | Type |
|---|---|
| id | bigint |
| group | varchar(50) |
| key | varchar(100) |
| value | text |
| type | enum |
| created_at | timestamp |
| updated_at | timestamp |

```sql
CREATE TABLE app_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `group` VARCHAR(50) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT,
    `type` ENUM('string','number','boolean','json') NOT NULL DEFAULT 'string',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uq_group_key (`group`, `key`)
);
```

Contoh isi:

```text
group=hotel,  key=name,                   value=PPKD Hotel
group=hotel,  key=currency,                value=IDR
group=system, key=date_format,             value=d-m-Y
group=tax,    key=service_charge_percent,  value=10
group=tax,    key=ppn_percent,             value=11
```

## 9.2 `activity_log` (Spatie Package — jangan dibuat manual)

> **Koreksi penting:** Versi sebelumnya (PRD_V3_UPDATE) mendefinisikan skema custom `activity_logs` SEKALIGUS merekomendasikan package `spatie/laravel-activitylog` — dua pendekatan yang saling kontradiksi. Keputusan final: **gunakan package**, hapus skema custom.

Tabel `activity_log` dihasilkan otomatis oleh package, kolom standar: `log_name`, `description`, `subject_type`, `subject_id`, `event`, `causer_type`, `causer_id`, `properties` (JSON), `created_at`, `updated_at`.

---

# 10. FUTURE TABLES (Phase 2+, Belum Masuk MVP)

```text
invoices
invoice_items
maintenance_requests       -- untuk maintenance di luar pool (AC, plumbing, dst)
inventory_items
inventory_transactions
notifications
reservation_groups          -- untuk fitur group booking multi-room
pools                        -- jika hotel punya >1 kolam renang
```

---

# 11. Estimated Database Size

## Business Tables (19)

```text
users
floors
room_types
rooms
guests
reservations
check_ins
check_outs
guest_folios
folio_charges
payments
housekeeping_tasks
laundry_requests
pool_maintenance_logs
menu_categories
menu_items
fnb_orders
fnb_order_items
app_settings
```

## Package Tables (6)

```text
roles
permissions
model_has_roles
model_has_permissions
role_has_permissions
activity_log
```

## Grand Total: **25 Tables**
