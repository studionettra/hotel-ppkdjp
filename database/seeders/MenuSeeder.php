<?php

namespace Database\Seeders;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'Appetizer',
                'description' => 'Hidangan pembuka pilihan chef',
                'is_active'   => true,
                'items'       => [
                    ['code' => 'APT-001', 'name' => 'Lumpia Goreng',          'description' => 'Lumpia isi sayuran segar dengan saus plum', 'price' => 35000, 'unit' => 'porsi'],
                    ['code' => 'APT-002', 'name' => 'Soto Ayam Mini',        'description' => 'Soto ayam dengan kuah kuning dan pelengkap', 'price' => 30000, 'unit' => 'porsi'],
                    ['code' => 'APT-003', 'name' => 'Caesar Salad',          'description' => 'Romaine lettuce, crouton, parmesan, caesar dressing', 'price' => 45000, 'unit' => 'porsi'],
                    ['code' => 'APT-004', 'name' => 'Cream of Mushroom Soup','description' => 'Sup krim jamur dengan garlic bread', 'price' => 40000, 'unit' => 'porsi'],
                ],
            ],
            [
                'name'        => 'Main Course',
                'description' => 'Hidangan utama khas Indonesia dan Western',
                'is_active'   => true,
                'items'       => [
                    ['code' => 'MNC-001', 'name' => 'Nasi Goreng Spesial',   'description' => 'Nasi goreng dengan telur, ayam, udang, dan kerupuk', 'price' => 55000, 'unit' => 'porsi'],
                    ['code' => 'MNC-002', 'name' => 'Ayam Bakar Taliwang',   'description' => 'Ayam bakar bumbu Lombok, sambal plecing', 'price' => 65000, 'unit' => 'porsi'],
                    ['code' => 'MNC-003', 'name' => 'Grilled Sirloin Steak', 'description' => '200gr sirloin dengan mushroom sauce & vegetables', 'price' => 125000, 'unit' => 'porsi'],
                    ['code' => 'MNC-004', 'name' => 'Spaghetti Carbonara',   'description' => 'Pasta carbonara dengan smoked beef dan parmesan', 'price' => 75000, 'unit' => 'porsi'],
                    ['code' => 'MNC-005', 'name' => 'Ikan Bakar Jimbaran',   'description' => 'Ikan kakap bakar bumbu Jimbaran, sambal matah', 'price' => 85000, 'unit' => 'porsi'],
                    ['code' => 'MNC-006', 'name' => 'Rendang Sapi',          'description' => 'Rendang sapi Padang dengan nasi putih hangat', 'price' => 70000, 'unit' => 'porsi'],
                ],
            ],
            [
                'name'        => 'Dessert',
                'description' => 'Pilihan pencuci mulut',
                'is_active'   => true,
                'items'       => [
                    ['code' => 'DST-001', 'name' => 'Es Cendol',             'description' => 'Cendol gula merah dengan santan segar', 'price' => 25000, 'unit' => 'porsi'],
                    ['code' => 'DST-002', 'name' => 'Chocolate Lava Cake',   'description' => 'Lava cake dengan ice cream vanilla', 'price' => 55000, 'unit' => 'porsi'],
                    ['code' => 'DST-003', 'name' => 'Pisang Goreng Keju',    'description' => 'Pisang goreng crispy dengan topping keju dan coklat', 'price' => 30000, 'unit' => 'porsi'],
                    ['code' => 'DST-004', 'name' => 'Fresh Fruit Platter',   'description' => 'Potongan buah segar musiman', 'price' => 45000, 'unit' => 'porsi'],
                ],
            ],
            [
                'name'        => 'Beverage',
                'description' => 'Minuman dingin dan panas',
                'is_active'   => true,
                'items'       => [
                    ['code' => 'BVR-001', 'name' => 'Es Teh Manis',         'description' => 'Teh manis dingin khas Indonesia', 'price' => 12000, 'unit' => 'gelas'],
                    ['code' => 'BVR-002', 'name' => 'Kopi Tubruk',          'description' => 'Kopi tubruk tradisional', 'price' => 18000, 'unit' => 'gelas'],
                    ['code' => 'BVR-003', 'name' => 'Fresh Orange Juice',   'description' => 'Jus jeruk segar tanpa gula tambahan', 'price' => 25000, 'unit' => 'gelas'],
                    ['code' => 'BVR-004', 'name' => 'Cappuccino',           'description' => 'Espresso dengan steamed milk foam', 'price' => 35000, 'unit' => 'gelas'],
                    ['code' => 'BVR-005', 'name' => 'Jus Alpukat',          'description' => 'Jus alpukat segar dengan susu coklat', 'price' => 28000, 'unit' => 'gelas'],
                    ['code' => 'BVR-006', 'name' => 'Mineral Water',        'description' => 'Air mineral botol 600ml', 'price' => 10000, 'unit' => 'botol'],
                ],
            ],
            [
                'name'        => 'Room Service Special',
                'description' => 'Menu khusus room service 24 jam',
                'is_active'   => true,
                'items'       => [
                    ['code' => 'RSS-001', 'name' => 'Club Sandwich',          'description' => 'Triple decker sandwich dengan kentang goreng', 'price' => 65000, 'unit' => 'porsi'],
                    ['code' => 'RSS-002', 'name' => 'Mie Goreng Seafood',     'description' => 'Mie goreng dengan udang, cumi, dan sayuran', 'price' => 55000, 'unit' => 'porsi'],
                    ['code' => 'RSS-003', 'name' => 'Nasi Goreng Kampung',    'description' => 'Nasi goreng kampung dengan teri dan petai', 'price' => 50000, 'unit' => 'porsi'],
                    ['code' => 'RSS-004', 'name' => 'American Breakfast Set', 'description' => 'Telur, bacon, sausage, toast, dan jus jeruk', 'price' => 85000, 'unit' => 'set'],
                ],
            ],
        ];

        foreach ($categories as $catData) {
            $items = $catData['items'];
            unset($catData['items']);

            $category = MenuCategory::updateOrCreate(
                ['name' => $catData['name']],
                $catData
            );

            foreach ($items as $item) {
                MenuItem::updateOrCreate(
                    ['code' => $item['code']],
                    array_merge($item, [
                        'category_id'  => $category->id,
                        'is_available' => true,
                    ])
                );
            }
        }
    }
}
