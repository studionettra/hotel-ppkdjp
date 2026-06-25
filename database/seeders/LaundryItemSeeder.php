<?php

namespace Database\Seeders;

use App\Models\Guest;
use App\Models\LaundryItem;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LaundryItemSeeder extends Seeder
{
    public function run(): void
    {
        $guests    = Guest::pluck('id', 'full_name');
        $rooms     = Room::pluck('id', 'room_number');
        $hkUser    = User::where('username', 'hk1')->value('id');
        $adminUser = User::where('username', 'admin')->value('id');
        $createdBy = $hkUser ?? $adminUser;

        $now   = Carbon::now();
        $today = Carbon::today();

        $items = [
            // Delivered (completed)
            [
                'guest_name'        => 'Budi Santoso',
                'room_number'       => '206',
                'item_name'         => 'Kemeja Putih',
                'item_type'         => 'clothes',
                'quantity'          => 3,
                'service_type'      => 'regular',
                'unit_price'        => 15000.00,
                'total_price'       => 45000.00,
                'status'            => 'delivered',
                'received_at'       => $today->copy()->subDays(1)->setHour(8)->toDateTimeString(),
                'estimated_ready_at'=> $today->copy()->subDays(1)->setHour(17)->toDateTimeString(),
                'delivered_at'      => $today->copy()->subDays(1)->setHour(18)->toDateTimeString(),
                'notes'             => null,
            ],
            [
                'guest_name'        => 'John Smith',
                'room_number'       => '302',
                'item_name'         => 'Suit Jacket',
                'item_type'         => 'clothes',
                'quantity'          => 1,
                'service_type'      => 'dry_clean',
                'unit_price'        => 75000.00,
                'total_price'       => 75000.00,
                'status'            => 'delivered',
                'received_at'       => $today->copy()->subDays(2)->setHour(9)->toDateTimeString(),
                'estimated_ready_at'=> $today->copy()->subDay()->setHour(14)->toDateTimeString(),
                'delivered_at'      => $today->copy()->subDay()->setHour(15)->toDateTimeString(),
                'notes'             => 'Handle with care — premium fabric',
            ],

            // Processing
            [
                'guest_name'        => 'Hendra Wijaya',
                'room_number'       => '406',
                'item_name'         => 'Celana Panjang',
                'item_type'         => 'clothes',
                'quantity'          => 2,
                'service_type'      => 'express',
                'unit_price'        => 25000.00,
                'total_price'       => 50000.00,
                'status'            => 'processing',
                'received_at'       => $now->copy()->subHours(3)->toDateTimeString(),
                'estimated_ready_at'=> $now->copy()->addHours(2)->toDateTimeString(),
                'delivered_at'      => null,
                'notes'             => 'Express — tamu butuh sebelum makan malam',
            ],
            [
                'guest_name'        => 'Budi Santoso',
                'room_number'       => '206',
                'item_name'         => 'Handuk Bath',
                'item_type'         => 'towel',
                'quantity'          => 4,
                'service_type'      => 'regular',
                'unit_price'        => 10000.00,
                'total_price'       => 40000.00,
                'status'            => 'processing',
                'received_at'       => $now->copy()->subHours(2)->toDateTimeString(),
                'estimated_ready_at'=> $now->copy()->addHours(4)->toDateTimeString(),
                'delivered_at'      => null,
                'notes'             => null,
            ],

            // Ready for delivery
            [
                'guest_name'        => 'John Smith',
                'room_number'       => '302',
                'item_name'         => 'Dress Shirt',
                'item_type'         => 'clothes',
                'quantity'          => 2,
                'service_type'      => 'regular',
                'unit_price'        => 15000.00,
                'total_price'       => 30000.00,
                'status'            => 'ready',
                'received_at'       => $today->copy()->setHour(7)->toDateTimeString(),
                'estimated_ready_at'=> $today->copy()->setHour(15)->toDateTimeString(),
                'delivered_at'      => null,
                'notes'             => 'Starch requested',
            ],

            // Received (new)
            [
                'guest_name'        => 'Hendra Wijaya',
                'room_number'       => '406',
                'item_name'         => 'Bed Linen Set',
                'item_type'         => 'linen',
                'quantity'          => 1,
                'service_type'      => 'regular',
                'unit_price'        => 35000.00,
                'total_price'       => 35000.00,
                'status'            => 'received',
                'received_at'       => $now->copy()->subMinutes(30)->toDateTimeString(),
                'estimated_ready_at'=> $now->copy()->addHours(6)->toDateTimeString(),
                'delivered_at'      => null,
                'notes'             => 'Tamu minta ganti linen karena ada noda',
            ],

            // Cancelled
            [
                'guest_name'        => 'Budi Santoso',
                'room_number'       => '206',
                'item_name'         => 'Jaket Kulit',
                'item_type'         => 'clothes',
                'quantity'          => 1,
                'service_type'      => 'dry_clean',
                'unit_price'        => 100000.00,
                'total_price'       => 100000.00,
                'status'            => 'cancelled',
                'received_at'       => $today->copy()->subDays(1)->setHour(10)->toDateTimeString(),
                'estimated_ready_at'=> null,
                'delivered_at'      => null,
                'notes'             => 'Tamu membatalkan — ingin di-dry clean di luar',
            ],
        ];

        foreach ($items as $item) {
            $guestId = $guests[$item['guest_name']] ?? null;
            $roomId  = $rooms[$item['room_number']] ?? null;

            if (!$guestId || !$roomId) continue;

            LaundryItem::create([
                'guest_id'          => $guestId,
                'room_id'           => $roomId,
                'item_name'         => $item['item_name'],
                'item_type'         => $item['item_type'],
                'quantity'          => $item['quantity'],
                'service_type'      => $item['service_type'],
                'unit_price'        => $item['unit_price'],
                'total_price'       => $item['total_price'],
                'status'            => $item['status'],
                'received_at'       => $item['received_at'],
                'estimated_ready_at'=> $item['estimated_ready_at'],
                'delivered_at'      => $item['delivered_at'],
                'notes'             => $item['notes'],
                'created_by'        => $createdBy,
            ]);
        }
    }
}
