<?php

namespace Database\Seeders;

use App\Models\Floor;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch floor & room_type IDs dynamically
        $floors    = Floor::pluck('id', 'floor_number');
        $roomTypes = RoomType::pluck('id', 'code');

        // Room definitions: [room_number, floor_number, room_type_code, status]
        $rooms = [
            // Lantai 1 — tidak ada kamar (lobby area)
            // Lantai 2 — 8 Standard rooms
            ['201', 2, 'STD', 'vc'],
            ['202', 2, 'STD', 'vc'],
            ['203', 2, 'STD', 'vd'],
            ['204', 2, 'STD', 'vc'],
            ['205', 2, 'STD', 'vc'],
            ['206', 2, 'STD', 'oc'],
            ['207', 2, 'STD', 'vc'],
            ['208', 2, 'STD', 'vc'],

            // Lantai 3 — 6 Deluxe + 2 Superior
            ['301', 3, 'DLX', 'vc'],
            ['302', 3, 'DLX', 'oc'],
            ['303', 3, 'DLX', 'vc'],
            ['304', 3, 'DLX', 'vd'],
            ['305', 3, 'DLX', 'vc'],
            ['306', 3, 'DLX', 'vc'],
            ['307', 3, 'SUP', 'vc'],
            ['308', 3, 'SUP', 'vc'],

            // Lantai 4 — 4 Superior + 4 Executive
            ['401', 4, 'SUP', 'vc'],
            ['402', 4, 'SUP', 'od'],
            ['403', 4, 'SUP', 'vc'],
            ['404', 4, 'SUP', 'vc'],
            ['405', 4, 'EXC', 'vc'],
            ['406', 4, 'EXC', 'oc'],
            ['407', 4, 'EXC', 'vc'],
            ['408', 4, 'EXC', 'vc'],

            // Lantai 5 — 4 Suite + 2 Executive
            ['501', 5, 'SUI', 'vc'],
            ['502', 5, 'SUI', 'vc'],
            ['503', 5, 'SUI', 'ooo'],
            ['504', 5, 'SUI', 'vc'],
            ['505', 5, 'EXC', 'vc'],
            ['506', 5, 'EXC', 'oos'],
        ];

        foreach ($rooms as [$number, $floorNum, $typeCode, $status]) {
            Room::updateOrCreate(
                ['room_number' => $number],
                [
                    'floor_id'     => $floors[$floorNum],
                    'room_type_id' => $roomTypes[$typeCode],
                    'status'       => $status,
                ]
            );
        }
    }
}
