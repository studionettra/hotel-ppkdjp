<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'dashboard.view',

            'user.view', 'user.create', 'user.update', 'user.delete',
            'role.view', 'role.create', 'role.update', 'role.delete',

            'room-type.view', 'room-type.create', 'room-type.update', 'room-type.delete',
            'room.view', 'room.create', 'room.update', 'room.delete',
            'room-board.view',

            'guest.view', 'guest.create', 'guest.update', 'guest.delete',

            'reservation.view', 'reservation.create', 'reservation.update', 'reservation.cancel',

            'checkin.create',
            'checkout.create',

            'folio.view', 'folio.charge', 'folio.payment', 'folio.settle',

            'housekeeping.view', 'housekeeping.create', 'housekeeping.update', 'housekeeping.delete',

            'laundry.view', 'laundry.create', 'laundry.update', 'laundry.delete',

            'pool.view', 'pool.create', 'pool.update', 'pool.delete',

            'menu.view', 'menu.create', 'menu.update', 'menu.delete',

            'fnb.view', 'fnb.create', 'fnb.update', 'fnb.close',

            'report.view',

            'settings.view', 'settings.update',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }
    }
}
