<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\CheckInController;
use App\Http\Controllers\CheckOutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FloorController;
use App\Http\Controllers\FnbOrderController;
use App\Http\Controllers\FolioController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\HousekeepingTaskController;
use App\Http\Controllers\LaundryController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\PoolMaintenanceController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomTypeController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

require __DIR__.'/auth.php';

Route::middleware(['auth'])->group(function () {
    Route::get('/', fn () => redirect()->route('dashboard'));
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/notifications/{id}/read', function (string $id) {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        return redirect($notification->data['url'] ?? url('/'));
    })->name('notifications.read');

    // User Management
    Route::middleware('permission:user.view')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [UserController::class, 'create'])
            ->middleware('permission:user.create')->name('users.create');
        Route::post('/users', [UserController::class, 'store'])
            ->middleware('permission:user.create')->name('users.store');
        Route::get('/users/{user}/edit', [UserController::class, 'edit'])
            ->middleware('permission:user.update')->name('users.edit');
        Route::put('/users/{user}', [UserController::class, 'update'])
            ->middleware('permission:user.update')->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])
            ->middleware('permission:user.delete')->name('users.destroy');
    });

    // Floor Management
    Route::middleware('permission:room.view')->group(function () {
        Route::get('/floors', [FloorController::class, 'index'])->name('floors.index');
        Route::post('/floors', [FloorController::class, 'store'])
            ->middleware('permission:room.create')->name('floors.store');
        Route::put('/floors/{floor}', [FloorController::class, 'update'])
            ->middleware('permission:room.update')->name('floors.update');
        Route::delete('/floors/{floor}', [FloorController::class, 'destroy'])
            ->middleware('permission:room.delete')->name('floors.destroy');
    });

    // Room Type Management
    Route::middleware('permission:room-type.view')->group(function () {
        Route::get('/room-types', [RoomTypeController::class, 'index'])->name('room-types.index');
        Route::post('/room-types', [RoomTypeController::class, 'store'])
            ->middleware('permission:room-type.create')->name('room-types.store');
        Route::put('/room-types/{roomType}', [RoomTypeController::class, 'update'])
            ->middleware('permission:room-type.update')->name('room-types.update');
        Route::delete('/room-types/{roomType}', [RoomTypeController::class, 'destroy'])
            ->middleware('permission:room-type.delete')->name('room-types.destroy');
    });

    // Room Management
    Route::middleware('permission:room.view')->group(function () {
        Route::get('/rooms', [RoomController::class, 'index'])->name('rooms.index');
        Route::post('/rooms', [RoomController::class, 'store'])
            ->middleware('permission:room.create')->name('rooms.store');
        Route::put('/rooms/{room}', [RoomController::class, 'update'])
            ->middleware('permission:room.update')->name('rooms.update');
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy'])
            ->middleware('permission:room.delete')->name('rooms.destroy');
    });

    // Guest Management
    Route::middleware('permission:guest.view')->group(function () {
        Route::get('/guests', [GuestController::class, 'index'])->name('guests.index');
        Route::get('/guests/{guest}', [GuestController::class, 'show'])->name('guests.show');
        Route::post('/guests', [GuestController::class, 'store'])
            ->middleware('permission:guest.create')->name('guests.store');
        Route::put('/guests/{guest}', [GuestController::class, 'update'])
            ->middleware('permission:guest.update')->name('guests.update');
        Route::delete('/guests/{guest}', [GuestController::class, 'destroy'])
            ->middleware('permission:guest.delete')->name('guests.destroy');
    });

    // Booking / Check-in Management
    Route::middleware('permission:reservation.create')->group(function () {
        Route::get('/bookings/checkin', function() {
            return redirect()->route('availability.index')->with('error', 'Sesi registrasi tidak valid atau telah berakhir. Silakan pilih kamar kembali.');
        })->name('bookings.checkin.get');
        Route::post('/bookings/checkin', [\App\Http\Controllers\BookingController::class, 'checkinForm'])->name('bookings.checkin');
        Route::get('/bookings', function() {
            return redirect()->route('availability.index')->with('error', 'Sesi tidak valid.');
        })->name('bookings.fallback');
        Route::post('/bookings', [\App\Http\Controllers\BookingController::class, 'store'])->name('bookings.store');
        Route::get('/bookings/{booking}/confirmed', [\App\Http\Controllers\BookingController::class, 'confirmed'])->name('bookings.confirmed');
    });

    // Reservation Management
    Route::middleware('permission:reservation.view')->group(function () {
        Route::get('/reservations', [ReservationController::class, 'index'])->name('reservations.index');
        Route::get('/reservations/{reservation}', [ReservationController::class, 'show'])->name('reservations.show');
        Route::get('/reservations/{reservation}/edit', [ReservationController::class, 'edit'])
            ->middleware('permission:reservation.update')->name('reservations.edit');
        Route::put('/reservations/{reservation}', [ReservationController::class, 'update'])
            ->middleware('permission:reservation.update')->name('reservations.update');
        Route::patch('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel'])
            ->middleware('permission:reservation.cancel')->name('reservations.cancel');
    });

    // Front Office Services
    Route::middleware('permission:reservation.update')->group(function () {
        Route::post('/fo/services/extrabed/{reservation}', [\App\Http\Controllers\FrontOfficeServiceController::class, 'orderExtrabed'])->name('fo.services.extrabed');
        Route::post('/fo/services/fnb/{reservation}', [\App\Http\Controllers\FrontOfficeServiceController::class, 'orderFnb'])->name('fo.services.fnb');
        Route::post('/fo/services/laundry/{reservation}', [\App\Http\Controllers\FrontOfficeServiceController::class, 'orderLaundry'])->name('fo.services.laundry');
    });

    // Availability Calendar
    Route::middleware('permission:reservation.view')->group(function () {
        Route::get('/availability', [AvailabilityController::class, 'index'])->name('availability.index');
        Route::get('/availability/search', [AvailabilityController::class, 'search'])->name('availability.search');
    });

    // AJAX Lookup
    Route::get('/ajax/guests', function () {
        return \App\Models\Guest::orderBy('full_name')
            ->get(['id', 'full_name', 'id_number'])
            ->map(fn ($g) => ['id' => $g->id, 'text' => "{$g->full_name} ({$g->id_number})"]);
    })->name('ajax.guests');

    // Check-In
    Route::middleware('permission:checkin.create')->group(function () {
        Route::get('/checkins/create/{reservation}', [CheckInController::class, 'create'])->name('checkins.create');
        Route::post('/checkins', [CheckInController::class, 'store'])->name('checkins.store');
    });

    // Check-Out
    Route::middleware('permission:checkout.create')->group(function () {
        Route::get('/checkouts/create/{checkin}', [CheckOutController::class, 'create'])->name('checkouts.create');
        Route::post('/checkouts', [CheckOutController::class, 'store'])->name('checkouts.store');
        Route::post('/checkouts/{checkin}/request-inspection', [CheckOutController::class, 'requestInspection'])->name('checkouts.request-inspection');
    });

    // Guest Folio & Payment
    Route::middleware('permission:folio.view')->group(function () {
        Route::get('/folios/{folio}', [FolioController::class, 'show'])->name('folios.show');
        Route::post('/folios/{folio}/charges', [FolioController::class, 'addCharge'])
            ->middleware('permission:folio.charge')->name('folios.addCharge');
        Route::post('/folios/{folio}/payments', [FolioController::class, 'addPayment'])
            ->middleware('permission:folio.payment')->name('folios.addPayment');
        Route::post('/folios/{folio}/settle', [FolioController::class, 'settle'])
            ->middleware('permission:folio.settle')->name('folios.settle');
    });

    // Housekeeping Tasks
    Route::middleware('permission:housekeeping.view')->group(function () {
        // Room Status Update
        Route::put('/rooms/{room}/status', [\App\Http\Controllers\RoomStatusController::class, 'update'])->name('rooms.status.update');

        Route::get('/housekeeping/tasks', [HousekeepingTaskController::class, 'index'])->name('housekeeping.tasks.index');
        Route::post('/housekeeping/tasks', [HousekeepingTaskController::class, 'store'])
            ->middleware('permission:housekeeping.create')->name('housekeeping.tasks.store');
        Route::put('/housekeeping/tasks/{housekeepingTask}', [HousekeepingTaskController::class, 'update'])
            ->middleware('permission:housekeeping.update')->name('housekeeping.tasks.update');
        Route::delete('/housekeeping/tasks/{housekeepingTask}', [HousekeepingTaskController::class, 'destroy'])
            ->middleware('permission:housekeeping.delete')->name('housekeeping.tasks.destroy');

        // Lost and Found
        Route::get('/housekeeping/lost-and-found', [\App\Http\Controllers\LostAndFoundController::class, 'index'])->name('housekeeping.lost-and-found.index');
        Route::post('/housekeeping/lost-and-found', [\App\Http\Controllers\LostAndFoundController::class, 'store'])->name('housekeeping.lost-and-found.store');
        Route::put('/housekeeping/lost-and-found/{lostAndFound}', [\App\Http\Controllers\LostAndFoundController::class, 'update'])->name('housekeeping.lost-and-found.update');

        // Guest Loans
        Route::get('/housekeeping/guest-loans', [\App\Http\Controllers\GuestLoanController::class, 'index'])->name('housekeeping.guest-loans.index');
        Route::post('/housekeeping/guest-loans', [\App\Http\Controllers\GuestLoanController::class, 'store'])->name('housekeeping.guest-loans.store');
        Route::put('/housekeeping/guest-loans/{guestLoan}', [\App\Http\Controllers\GuestLoanController::class, 'update'])->name('housekeeping.guest-loans.update');

        // Control Sheets
        Route::get('/housekeeping/control-sheets', [\App\Http\Controllers\HousekeepingControlSheetController::class, 'index'])->name('housekeeping.control-sheets.index');
        Route::post('/housekeeping/control-sheets', [\App\Http\Controllers\HousekeepingControlSheetController::class, 'store'])->name('housekeeping.control-sheets.store');
        
        // Housekeeping Charges
        Route::get('/housekeeping/charges', [\App\Http\Controllers\HousekeepingChargeController::class, 'index'])->name('housekeeping.charges.index');
        Route::post('/housekeeping/charges', [\App\Http\Controllers\HousekeepingChargeController::class, 'store'])->name('housekeeping.charges.store');
    });

    // Laundry
    Route::middleware('permission:laundry.view')->group(function () {
        Route::get('/housekeeping/laundry', [LaundryController::class, 'index'])->name('laundry.index');
        Route::post('/housekeeping/laundry', [LaundryController::class, 'store'])
            ->middleware('permission:laundry.create')->name('laundry.store');
        Route::put('/housekeeping/laundry/{laundryItem}', [LaundryController::class, 'update'])
            ->middleware('permission:laundry.update')->name('laundry.update');
        Route::delete('/housekeeping/laundry/{laundryItem}', [LaundryController::class, 'destroy'])
            ->middleware('permission:laundry.delete')->name('laundry.destroy');
    });

    // Pool Maintenance
    Route::middleware('permission:pool.view')->group(function () {
        Route::get('/housekeeping/pool', [PoolMaintenanceController::class, 'index'])->name('pool.index');
        Route::post('/housekeeping/pool', [PoolMaintenanceController::class, 'store'])
            ->middleware('permission:pool.create')->name('pool.store');
        Route::put('/housekeeping/pool/{poolMaintenanceLog}', [PoolMaintenanceController::class, 'update'])
            ->middleware('permission:pool.update')->name('pool.update');
        Route::delete('/housekeeping/pool/{poolMaintenanceLog}', [PoolMaintenanceController::class, 'destroy'])
            ->middleware('permission:pool.delete')->name('pool.destroy');
    });

    // Menu Management
    Route::middleware('permission:menu.view')->group(function () {
        Route::get('/fnb/menu', [MenuController::class, 'index'])->name('menu.index');
        Route::post('/fnb/menu/categories', [MenuController::class, 'storeCategory'])
            ->middleware('permission:menu.create')->name('menu.categories.store');
        Route::put('/fnb/menu/categories/{menuCategory}', [MenuController::class, 'updateCategory'])
            ->middleware('permission:menu.update')->name('menu.categories.update');
        Route::delete('/fnb/menu/categories/{menuCategory}', [MenuController::class, 'destroyCategory'])
            ->middleware('permission:menu.delete')->name('menu.categories.destroy');
        Route::post('/fnb/menu/items', [MenuController::class, 'storeItem'])
            ->middleware('permission:menu.create')->name('menu.items.store');
        Route::put('/fnb/menu/items/{menuItem}', [MenuController::class, 'updateItem'])
            ->middleware('permission:menu.update')->name('menu.items.update');
        Route::delete('/fnb/menu/items/{menuItem}', [MenuController::class, 'destroyItem'])
            ->middleware('permission:menu.delete')->name('menu.items.destroy');
    });

    // F&B Orders
    Route::middleware('permission:fnb.view')->group(function () {
        Route::get('/fnb/orders', [FnbOrderController::class, 'index'])->name('fnb.orders.index');
        Route::get('/fnb/orders/create', [FnbOrderController::class, 'create'])
            ->middleware('permission:fnb.create')->name('fnb.orders.create');
        Route::post('/fnb/orders', [FnbOrderController::class, 'store'])
            ->middleware('permission:fnb.create')->name('fnb.orders.store');
        Route::get('/fnb/orders/{fnbOrder}', [FnbOrderController::class, 'show'])->name('fnb.orders.show');
        Route::put('/fnb/orders/{fnbOrder}', [FnbOrderController::class, 'update'])
            ->middleware('permission:fnb.update')->name('fnb.orders.update');
        Route::delete('/fnb/orders/{fnbOrder}', [FnbOrderController::class, 'destroy'])
            ->middleware('permission:fnb.close')->name('fnb.orders.destroy');
    });

    // Reports
    Route::middleware('permission:report.view')->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    });

    // Settings
    Route::middleware('permission:settings.view')->group(function () {
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SettingsController::class, 'update'])
            ->middleware('permission:settings.update')->name('settings.update');
    });

    // Activity Log
    Route::middleware('permission:user.view')->group(function () {
        Route::get('/activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');
    });
});
