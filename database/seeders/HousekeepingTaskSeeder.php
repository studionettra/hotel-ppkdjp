<?php

namespace Database\Seeders;

use App\Models\HousekeepingTask;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class HousekeepingTaskSeeder extends Seeder
{
    public function run(): void
    {
        $rooms     = Room::pluck('id', 'room_number');
        $hkUser    = User::where('username', 'hk1')->value('id');
        $adminUser = User::where('username', 'admin')->value('id');
        $createdBy = $hkUser ?? $adminUser;

        $now   = Carbon::now();
        $today = Carbon::today();

        $tasks = [
            // Completed tasks (past)
            [
                'room_number'  => '203',
                'task_type'    => 'cleaning',
                'status'       => 'completed',
                'priority'     => 'high',
                'due_at'       => $today->copy()->subDays(2)->setHour(10)->toDateTimeString(),
                'started_at'   => $today->copy()->subDays(2)->setHour(10)->setMinute(15)->toDateTimeString(),
                'completed_at' => $today->copy()->subDays(2)->setHour(11)->toDateTimeString(),
                'notes'        => 'Pembersihan setelah check-out tamu Ahmad Hidayat',
                'assigned_to'  => $hkUser,
            ],
            [
                'room_number'  => '201',
                'task_type'    => 'inspection',
                'status'       => 'completed',
                'priority'     => 'normal',
                'due_at'       => $today->copy()->subDay()->setHour(9)->toDateTimeString(),
                'started_at'   => $today->copy()->subDay()->setHour(9)->setMinute(5)->toDateTimeString(),
                'completed_at' => $today->copy()->subDay()->setHour(9)->setMinute(30)->toDateTimeString(),
                'notes'        => 'Inspeksi rutin kamar — semua baik',
                'assigned_to'  => $hkUser,
            ],

            // In-progress tasks (today)
            [
                'room_number'  => '304',
                'task_type'    => 'cleaning',
                'status'       => 'in_progress',
                'priority'     => 'normal',
                'due_at'       => $today->copy()->setHour(11)->toDateTimeString(),
                'started_at'   => $now->copy()->subMinutes(30)->toDateTimeString(),
                'completed_at' => null,
                'notes'        => 'Pembersihan rutin kamar VD',
                'assigned_to'  => $hkUser,
            ],

            // Pending tasks (today)
            [
                'room_number'  => '402',
                'task_type'    => 'cleaning',
                'status'       => 'pending',
                'priority'     => 'high',
                'due_at'       => $today->copy()->setHour(14)->toDateTimeString(),
                'started_at'   => null,
                'completed_at' => null,
                'notes'        => 'Kamar Occupied Dirty — perlu segera dibersihkan',
                'assigned_to'  => $hkUser,
            ],
            [
                'room_number'  => '501',
                'task_type'    => 'deep_clean',
                'status'       => 'pending',
                'priority'     => 'normal',
                'due_at'       => $today->copy()->addDay()->setHour(9)->toDateTimeString(),
                'started_at'   => null,
                'completed_at' => null,
                'notes'        => 'Deep cleaning suite bulanan',
                'assigned_to'  => null,
            ],
            [
                'room_number'  => '205',
                'task_type'    => 'cleaning',
                'status'       => 'pending',
                'priority'     => 'normal',
                'due_at'       => $today->copy()->setHour(15)->toDateTimeString(),
                'started_at'   => null,
                'completed_at' => null,
                'notes'        => 'Persiapan kamar untuk tamu besok',
                'assigned_to'  => $hkUser,
            ],

            // Maintenance task
            [
                'room_number'  => '503',
                'task_type'    => 'maintenance',
                'status'       => 'pending',
                'priority'     => 'urgent',
                'due_at'       => $today->copy()->setHour(10)->toDateTimeString(),
                'started_at'   => null,
                'completed_at' => null,
                'notes'        => 'AC unit tidak berfungsi — kamar Out of Order',
                'assigned_to'  => null,
            ],

            // Cancelled task
            [
                'room_number'  => '207',
                'task_type'    => 'inspection',
                'status'       => 'cancelled',
                'priority'     => 'low',
                'due_at'       => $today->copy()->subDays(3)->setHour(16)->toDateTimeString(),
                'started_at'   => null,
                'completed_at' => null,
                'notes'        => 'Inspeksi dibatalkan — kamar sudah diinspeksi pagi',
                'assigned_to'  => $hkUser,
            ],
        ];

        foreach ($tasks as $task) {
            $roomId = $rooms[$task['room_number']] ?? null;
            if (!$roomId) continue;

            HousekeepingTask::create([
                'room_id'      => $roomId,
                'task_type'    => $task['task_type'],
                'status'       => $task['status'],
                'priority'     => $task['priority'],
                'due_at'       => $task['due_at'],
                'started_at'   => $task['started_at'],
                'completed_at' => $task['completed_at'],
                'notes'        => $task['notes'],
                'assigned_to'  => $task['assigned_to'],
                'created_by'   => $createdBy,
            ]);
        }
    }
}
