<?php

namespace Database\Seeders;

use App\Models\RoomType;
use Illuminate\Database\Seeder;

class RoomTypeSeeder extends Seeder
{
    public function run(): void
    {
        $roomTypes = [
            [
                'code'         => 'STD',
                'name'         => 'Standard',
                'description'  => 'Kamar standar dengan fasilitas dasar yang nyaman untuk tamu bisnis dan liburan singkat.',
                'facilities'   => ['AC', 'TV LED 32"', 'Wi-Fi', 'Kamar Mandi Dalam', 'Hot & Cold Water'],
                'max_capacity' => 2,
                'base_price'   => 450000.00,
            ],
            [
                'code'         => 'SUP',
                'name'         => 'Superior',
                'description'  => 'Kamar superior lebih luas dengan pemandangan taman dan fasilitas tambahan.',
                'facilities'   => ['AC', 'TV LED 40"', 'Wi-Fi', 'Kamar Mandi Dalam', 'Hot & Cold Water', 'Mini Bar', 'Safety Box', 'Balkon'],
                'max_capacity' => 2,
                'base_price'   => 650000.00,
            ],
            [
                'code'         => 'DLX',
                'name'         => 'Deluxe',
                'description'  => 'Kamar deluxe dengan desain modern, ruang duduk terpisah, dan pemandangan kota.',
                'facilities'   => ['AC', 'TV LED 43"', 'Wi-Fi', 'Kamar Mandi Dalam', 'Bathtub', 'Hot & Cold Water', 'Mini Bar', 'Safety Box', 'Sofa', 'Coffee Maker'],
                'max_capacity' => 3,
                'base_price'   => 850000.00,
            ],
            [
                'code'         => 'EXC',
                'name'         => 'Executive',
                'description'  => 'Kamar executive premium dengan akses ke executive lounge dan layanan butler.',
                'facilities'   => ['AC', 'TV LED 50"', 'Wi-Fi', 'Kamar Mandi Dalam', 'Bathtub & Shower', 'Hot & Cold Water', 'Mini Bar', 'Safety Box', 'Sofa Set', 'Coffee Maker', 'Working Desk', 'Executive Lounge Access'],
                'max_capacity' => 3,
                'base_price'   => 1200000.00,
            ],
            [
                'code'         => 'SUI',
                'name'         => 'Suite',
                'description'  => 'Suite mewah dengan ruang tamu terpisah, kamar tidur luas, dan pemandangan panorama.',
                'facilities'   => ['AC', 'TV LED 55"', 'Wi-Fi', 'Kamar Mandi Dalam', 'Jacuzzi', 'Bathtub & Shower', 'Hot & Cold Water', 'Mini Bar', 'Safety Box', 'Living Room', 'Dining Table', 'Coffee Maker', 'Working Desk', 'Executive Lounge Access', 'Butler Service'],
                'max_capacity' => 4,
                'base_price'   => 2500000.00,
            ],
        ];

        foreach ($roomTypes as $type) {
            RoomType::updateOrCreate(
                ['code' => $type['code']],
                $type
            );
        }
    }
}
