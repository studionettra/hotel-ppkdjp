<?php

namespace Database\Seeders;

use App\Models\FnbOrder;
use App\Models\FnbOrderItem;
use App\Models\Guest;
use App\Models\MenuItem;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class FnbOrderSeeder extends Seeder
{
    public function run(): void
    {
        $guests    = Guest::pluck('id', 'full_name');
        $rooms     = Room::pluck('id', 'room_number');
        $menuItems = MenuItem::pluck('id', 'code');
        $menuPrices = MenuItem::pluck('price', 'code');
        $fnbUser   = User::where('username', 'fnb1')->value('id');
        $adminUser = User::where('username', 'admin')->value('id');
        $createdBy = $fnbUser ?? $adminUser;

        $now   = Carbon::now();
        $today = Carbon::today();

        $taxRate = 0.11; // 11% PPN

        $orders = [
            // Completed dine-in order
            [
                'order_number'   => 'FNB-' . $today->format('Ymd') . '-001',
                'order_type'     => 'dine_in',
                'guest_name'     => null,
                'room_number'    => null,
                'table_number'   => 'T-05',
                'status'         => 'completed',
                'payment_method' => 'cash',
                'paid_at'        => $today->copy()->subDay()->setHour(13)->toDateTimeString(),
                'notes'          => null,
                'items'          => [
                    ['code' => 'MNC-001', 'qty' => 2],  // Nasi Goreng x2
                    ['code' => 'BVR-001', 'qty' => 2],  // Es Teh x2
                    ['code' => 'DST-001', 'qty' => 1],  // Es Cendol
                ],
            ],
            // Completed room service
            [
                'order_number'   => 'FNB-' . $today->format('Ymd') . '-002',
                'order_type'     => 'room_service',
                'guest_name'     => 'Budi Santoso',
                'room_number'    => '206',
                'table_number'   => null,
                'status'         => 'completed',
                'payment_method' => 'room_charge',
                'paid_at'        => $today->copy()->subDay()->setHour(20)->toDateTimeString(),
                'notes'          => 'Mohon antarkan ke kamar 206',
                'items'          => [
                    ['code' => 'RSS-001', 'qty' => 1],  // Club Sandwich
                    ['code' => 'BVR-004', 'qty' => 1],  // Cappuccino
                ],
            ],
            // Served (still at table)
            [
                'order_number'   => 'FNB-' . $today->format('Ymd') . '-003',
                'order_type'     => 'dine_in',
                'guest_name'     => 'John Smith',
                'room_number'    => null,
                'table_number'   => 'T-01',
                'status'         => 'served',
                'payment_method' => null,
                'paid_at'        => null,
                'notes'          => 'VIP guest — extra attention',
                'items'          => [
                    ['code' => 'APT-003', 'qty' => 1],  // Caesar Salad
                    ['code' => 'MNC-003', 'qty' => 1],  // Grilled Sirloin
                    ['code' => 'BVR-003', 'qty' => 1],  // Orange Juice
                    ['code' => 'DST-002', 'qty' => 1],  // Chocolate Lava Cake
                ],
            ],
            // Preparing
            [
                'order_number'   => 'FNB-' . $today->format('Ymd') . '-004',
                'order_type'     => 'room_service',
                'guest_name'     => 'Hendra Wijaya',
                'room_number'    => '406',
                'table_number'   => null,
                'status'         => 'preparing',
                'payment_method' => null,
                'paid_at'        => null,
                'notes'          => 'Tamu request extra sambal',
                'items'          => [
                    ['code' => 'RSS-003', 'qty' => 1],  // Nasi Goreng Kampung
                    ['code' => 'MNC-002', 'qty' => 1],  // Ayam Bakar Taliwang
                    ['code' => 'BVR-005', 'qty' => 2],  // Jus Alpukat x2
                ],
            ],
            // Pending (just ordered)
            [
                'order_number'   => 'FNB-' . $today->format('Ymd') . '-005',
                'order_type'     => 'dine_in',
                'guest_name'     => null,
                'room_number'    => null,
                'table_number'   => 'T-08',
                'status'         => 'pending',
                'payment_method' => null,
                'paid_at'        => null,
                'notes'          => null,
                'items'          => [
                    ['code' => 'APT-001', 'qty' => 2],  // Lumpia x2
                    ['code' => 'APT-004', 'qty' => 1],  // Mushroom Soup
                    ['code' => 'MNC-006', 'qty' => 2],  // Rendang x2
                    ['code' => 'MNC-004', 'qty' => 1],  // Carbonara
                    ['code' => 'BVR-002', 'qty' => 3],  // Kopi Tubruk x3
                ],
            ],
            // Completed takeaway
            [
                'order_number'   => 'FNB-' . $today->format('Ymd') . '-006',
                'order_type'     => 'takeaway',
                'guest_name'     => 'Dewi Lestari',
                'room_number'    => null,
                'table_number'   => null,
                'status'         => 'completed',
                'payment_method' => 'debit_card',
                'paid_at'        => $today->copy()->subDays(2)->setHour(18)->toDateTimeString(),
                'notes'          => 'Bungkus untuk dibawa',
                'items'          => [
                    ['code' => 'MNC-005', 'qty' => 1],  // Ikan Bakar
                    ['code' => 'MNC-001', 'qty' => 1],  // Nasi Goreng
                    ['code' => 'DST-003', 'qty' => 2],  // Pisang Goreng Keju x2
                    ['code' => 'BVR-006', 'qty' => 2],  // Air Mineral x2
                ],
            ],
            // Cancelled
            [
                'order_number'   => 'FNB-' . $today->format('Ymd') . '-007',
                'order_type'     => 'dine_in',
                'guest_name'     => null,
                'room_number'    => null,
                'table_number'   => 'T-12',
                'status'         => 'cancelled',
                'payment_method' => null,
                'paid_at'        => null,
                'notes'          => 'Tamu membatalkan pesanan',
                'items'          => [
                    ['code' => 'MNC-003', 'qty' => 2],  // Steak x2
                    ['code' => 'BVR-004', 'qty' => 2],  // Cappuccino x2
                ],
            ],
            // Room service breakfast (today morning)
            [
                'order_number'   => 'FNB-' . $today->format('Ymd') . '-008',
                'order_type'     => 'room_service',
                'guest_name'     => 'John Smith',
                'room_number'    => '302',
                'table_number'   => null,
                'status'         => 'completed',
                'payment_method' => 'room_charge',
                'paid_at'        => $today->copy()->setHour(8)->toDateTimeString(),
                'notes'          => 'Breakfast delivery to room 302',
                'items'          => [
                    ['code' => 'RSS-004', 'qty' => 1],  // American Breakfast
                    ['code' => 'BVR-004', 'qty' => 1],  // Cappuccino
                    ['code' => 'BVR-003', 'qty' => 1],  // Orange Juice
                ],
            ],
        ];

        foreach ($orders as $orderData) {
            $guestId = $orderData['guest_name'] ? ($guests[$orderData['guest_name']] ?? null) : null;
            $roomId  = $orderData['room_number'] ? ($rooms[$orderData['room_number']] ?? null) : null;

            // Calculate totals
            $subtotal = 0;
            foreach ($orderData['items'] as $item) {
                $price = $menuPrices[$item['code']] ?? 0;
                $subtotal += $price * $item['qty'];
            }
            $tax   = round($subtotal * $taxRate, 2);
            $total = $subtotal + $tax;

            $order = FnbOrder::updateOrCreate(
                ['order_number'   => $orderData['order_number']],
                [
                    'order_type'     => $orderData['order_type'],
                    'guest_id'       => $guestId,
                    'room_id'        => $roomId,
                    'table_number'   => $orderData['table_number'],
                    'status'         => $orderData['status'],
                    'subtotal'       => $subtotal,
                    'tax'            => $tax,
                    'total'          => $total,
                    'payment_method' => $orderData['payment_method'],
                    'paid_at'        => $orderData['paid_at'],
                    'notes'          => $orderData['notes'],
                    'created_by'     => $createdBy,
                ]
            );

            // Clean up old items if re-seeding
            FnbOrderItem::where('order_id', $order->id)->delete();

            // Create order items
            foreach ($orderData['items'] as $item) {
                $menuItemId = $menuItems[$item['code']] ?? null;
                $unitPrice  = $menuPrices[$item['code']] ?? 0;

                if (!$menuItemId) continue;

                FnbOrderItem::create([
                    'order_id'     => $order->id,
                    'menu_item_id' => $menuItemId,
                    'quantity'     => $item['qty'],
                    'unit_price'   => $unitPrice,
                    'subtotal'     => $unitPrice * $item['qty'],
                ]);
            }
        }
    }
}
