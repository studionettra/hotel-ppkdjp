<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // Foundation — Auth & RBAC
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,

            // Master Data
            FloorSeeder::class,
            RoomTypeSeeder::class,
            RoomSeeder::class,

            // Front Office
            GuestSeeder::class,
            ReservationSeeder::class,

            // Housekeeping
            HousekeepingTaskSeeder::class,
            LaundryItemSeeder::class,
            PoolMaintenanceLogSeeder::class,

            // F&B
            MenuSeeder::class,
            FnbOrderSeeder::class,

            // Settings
            HotelSettingSeeder::class,
        ]);
    }
}
