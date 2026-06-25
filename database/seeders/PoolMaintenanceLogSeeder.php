<?php

namespace Database\Seeders;

use App\Models\PoolMaintenanceLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PoolMaintenanceLogSeeder extends Seeder
{
    public function run(): void
    {
        $hkUser    = User::where('username', 'hk1')->value('id');
        $adminUser = User::where('username', 'admin')->value('id');
        $createdBy = $hkUser ?? $adminUser;

        $now   = Carbon::now();
        $today = Carbon::today();

        $logs = [
            // Completed — chemical check (yesterday)
            [
                'pool_area'        => 'main',
                'maintenance_type' => 'chemical_check',
                'status'           => 'completed',
                'ph_level'         => 7.20,
                'chlorine_level'   => 1.50,
                'temperature'      => 28.50,
                'scheduled_at'     => $today->copy()->subDay()->setHour(7)->toDateTimeString(),
                'started_at'       => $today->copy()->subDay()->setHour(7)->setMinute(10)->toDateTimeString(),
                'completed_at'     => $today->copy()->subDay()->setHour(7)->setMinute(45)->toDateTimeString(),
                'findings'         => 'pH dan chlorine dalam batas normal. Air jernih.',
                'action_taken'     => 'Penambahan chlorine tablet 2 pcs sebagai maintenance rutin.',
                'assigned_to'      => $hkUser,
            ],

            // Completed — cleaning (yesterday)
            [
                'pool_area'        => 'main',
                'maintenance_type' => 'cleaning',
                'status'           => 'completed',
                'ph_level'         => null,
                'chlorine_level'   => null,
                'temperature'      => null,
                'scheduled_at'     => $today->copy()->subDay()->setHour(6)->toDateTimeString(),
                'started_at'       => $today->copy()->subDay()->setHour(6)->setMinute(5)->toDateTimeString(),
                'completed_at'     => $today->copy()->subDay()->setHour(6)->setMinute(50)->toDateTimeString(),
                'findings'         => 'Daun-daun dan debris di permukaan pool.',
                'action_taken'     => 'Skimming permukaan, vakum dasar kolam, pembersihan filter.',
                'assigned_to'      => $hkUser,
            ],

            // Completed — kids pool check (2 days ago)
            [
                'pool_area'        => 'kids',
                'maintenance_type' => 'chemical_check',
                'status'           => 'completed',
                'ph_level'         => 7.40,
                'chlorine_level'   => 1.20,
                'temperature'      => 30.00,
                'scheduled_at'     => $today->copy()->subDays(2)->setHour(8)->toDateTimeString(),
                'started_at'       => $today->copy()->subDays(2)->setHour(8)->toDateTimeString(),
                'completed_at'     => $today->copy()->subDays(2)->setHour(8)->setMinute(30)->toDateTimeString(),
                'findings'         => 'Chlorine sedikit rendah, pH normal.',
                'action_taken'     => 'Penambahan chlorine granular 500gr.',
                'assigned_to'      => $hkUser,
            ],

            // In-progress — morning cleaning (today)
            [
                'pool_area'        => 'main',
                'maintenance_type' => 'cleaning',
                'status'           => 'in_progress',
                'ph_level'         => null,
                'chlorine_level'   => null,
                'temperature'      => null,
                'scheduled_at'     => $today->copy()->setHour(6)->toDateTimeString(),
                'started_at'       => $now->copy()->subMinutes(45)->toDateTimeString(),
                'completed_at'     => null,
                'findings'         => null,
                'action_taken'     => null,
                'assigned_to'      => $hkUser,
            ],

            // Scheduled — chemical check (today afternoon)
            [
                'pool_area'        => 'main',
                'maintenance_type' => 'chemical_check',
                'status'           => 'scheduled',
                'ph_level'         => null,
                'chlorine_level'   => null,
                'temperature'      => null,
                'scheduled_at'     => $today->copy()->setHour(14)->toDateTimeString(),
                'started_at'       => null,
                'completed_at'     => null,
                'findings'         => null,
                'action_taken'     => null,
                'assigned_to'      => $hkUser,
            ],

            // Scheduled — kids pool cleaning (tomorrow)
            [
                'pool_area'        => 'kids',
                'maintenance_type' => 'cleaning',
                'status'           => 'scheduled',
                'ph_level'         => null,
                'chlorine_level'   => null,
                'temperature'      => null,
                'scheduled_at'     => $today->copy()->addDay()->setHour(6)->toDateTimeString(),
                'started_at'       => null,
                'completed_at'     => null,
                'findings'         => null,
                'action_taken'     => null,
                'assigned_to'      => null,
            ],

            // Scheduled — equipment check (tomorrow)
            [
                'pool_area'        => 'main',
                'maintenance_type' => 'equipment_check',
                'status'           => 'scheduled',
                'ph_level'         => null,
                'chlorine_level'   => null,
                'temperature'      => null,
                'scheduled_at'     => $today->copy()->addDay()->setHour(10)->toDateTimeString(),
                'started_at'       => null,
                'completed_at'     => null,
                'findings'         => null,
                'action_taken'     => null,
                'assigned_to'      => null,
            ],

            // Completed — repair (3 days ago)
            [
                'pool_area'        => 'jacuzzi',
                'maintenance_type' => 'repair',
                'status'           => 'completed',
                'ph_level'         => null,
                'chlorine_level'   => null,
                'temperature'      => 38.00,
                'scheduled_at'     => $today->copy()->subDays(3)->setHour(9)->toDateTimeString(),
                'started_at'       => $today->copy()->subDays(3)->setHour(9)->setMinute(30)->toDateTimeString(),
                'completed_at'     => $today->copy()->subDays(3)->setHour(12)->toDateTimeString(),
                'findings'         => 'Jet nozzle #3 tersumbat, pompa sirkulasi bersuara kasar.',
                'action_taken'     => 'Pembersihan nozzle, penggantian bearing pompa sirkulasi.',
                'assigned_to'      => $hkUser,
            ],

            // Cancelled
            [
                'pool_area'        => 'indoor',
                'maintenance_type' => 'inspection',
                'status'           => 'cancelled',
                'ph_level'         => null,
                'chlorine_level'   => null,
                'temperature'      => null,
                'scheduled_at'     => $today->copy()->subDays(1)->setHour(15)->toDateTimeString(),
                'started_at'       => null,
                'completed_at'     => null,
                'findings'         => null,
                'action_taken'     => 'Dibatalkan — kolam indoor sedang renovasi.',
                'assigned_to'      => null,
            ],
        ];

        foreach ($logs as $log) {
            PoolMaintenanceLog::create(array_merge($log, [
                'created_by' => $createdBy,
            ]));
        }
    }
}
