<?php

namespace Database\Seeders;

use App\Models\Floor;
use Illuminate\Database\Seeder;

class FloorSeeder extends Seeder
{
    public function run(): void
    {
        $floors = [
            ['floor_number' => 1, 'floor_name' => 'Lantai 1', 'description' => 'Lobby, Restoran, dan Front Office'],
            ['floor_number' => 2, 'floor_name' => 'Lantai 2', 'description' => 'Kamar Standard dan Ballroom'],
            ['floor_number' => 3, 'floor_name' => 'Lantai 3', 'description' => 'Kamar Deluxe dan Meeting Room'],
            ['floor_number' => 4, 'floor_name' => 'Lantai 4', 'description' => 'Kamar Superior dan Executive Lounge'],
            ['floor_number' => 5, 'floor_name' => 'Lantai 5', 'description' => 'Kamar Suite dan Rooftop Pool'],
        ];

        foreach ($floors as $floor) {
            Floor::updateOrCreate(
                ['floor_number' => $floor['floor_number']],
                $floor
            );
        }
    }
}
