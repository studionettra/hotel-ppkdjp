<?php

namespace Database\Seeders;

use App\Models\Guest;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ReservationSeeder extends Seeder
{
    public function run(): void
    {
        $guests    = Guest::pluck('id', 'full_name');
        $roomTypes = RoomType::pluck('id', 'code');
        $rooms     = Room::pluck('id', 'room_number');
        $createdBy = User::where('username', 'fo1')->value('id')
                     ?? User::where('username', 'admin')->value('id');

        $today = Carbon::today();

        $reservations = [
            // Active check-in (currently staying)
            [
                'reservation_code' => 'RSV-' . $today->format('Ymd') . '-001',
                'guest_name'       => 'Budi Santoso',
                'room_type_code'   => 'STD',
                'room_number'      => '206',
                'check_in_date'    => $today->copy()->subDays(2)->toDateString(),
                'check_out_date'   => $today->copy()->addDays(1)->toDateString(),
                'adults'           => 2,
                'children'         => 0,
                'channel'          => 'walk_in',
                'status'           => 'checked_in',
                'special_request'  => 'Kamar non-smoking, lantai tinggi',
                'total_amount'     => 1350000.00,
            ],
            // Active check-in (currently staying)
            [
                'reservation_code' => 'RSV-' . $today->format('Ymd') . '-002',
                'guest_name'       => 'John Smith',
                'room_type_code'   => 'DLX',
                'room_number'      => '302',
                'check_in_date'    => $today->copy()->subDay()->toDateString(),
                'check_out_date'   => $today->copy()->addDays(3)->toDateString(),
                'adults'           => 1,
                'children'         => 0,
                'channel'          => 'website',
                'status'           => 'checked_in',
                'special_request'  => 'Extra pillow, late check-out requested',
                'total_amount'     => 3400000.00,
            ],
            // Active check-in (Executive)
            [
                'reservation_code' => 'RSV-' . $today->format('Ymd') . '-003',
                'guest_name'       => 'Hendra Wijaya',
                'room_type_code'   => 'EXC',
                'room_number'      => '406',
                'check_in_date'    => $today->copy()->subDays(1)->toDateString(),
                'check_out_date'   => $today->copy()->addDays(2)->toDateString(),
                'adults'           => 2,
                'children'         => 1,
                'channel'          => 'phone',
                'status'           => 'checked_in',
                'special_request'  => 'Extra bed untuk anak',
                'total_amount'     => 3600000.00,
            ],
            // Confirmed (arriving tomorrow)
            [
                'reservation_code' => 'RSV-' . $today->format('Ymd') . '-004',
                'guest_name'       => 'Siti Rahayu',
                'room_type_code'   => 'SUP',
                'room_number'      => null,
                'check_in_date'    => $today->copy()->addDay()->toDateString(),
                'check_out_date'   => $today->copy()->addDays(4)->toDateString(),
                'adults'           => 1,
                'children'         => 0,
                'channel'          => 'ota',
                'status'           => 'confirmed',
                'special_request'  => 'Vegetarian breakfast',
                'total_amount'     => 1950000.00,
            ],
            // Confirmed (arriving in 3 days)
            [
                'reservation_code' => 'RSV-' . $today->format('Ymd') . '-005',
                'guest_name'       => 'Tanaka Yuki',
                'room_type_code'   => 'SUI',
                'room_number'      => null,
                'check_in_date'    => $today->copy()->addDays(3)->toDateString(),
                'check_out_date'   => $today->copy()->addDays(7)->toDateString(),
                'adults'           => 2,
                'children'         => 0,
                'channel'          => 'website',
                'status'           => 'confirmed',
                'special_request'  => 'Japanese newspaper, green tea in room',
                'total_amount'     => 10000000.00,
            ],
            // Pending reservation
            [
                'reservation_code' => 'RSV-' . $today->format('Ymd') . '-006',
                'guest_name'       => 'Dewi Lestari',
                'room_type_code'   => 'DLX',
                'room_number'      => null,
                'check_in_date'    => $today->copy()->addDays(5)->toDateString(),
                'check_out_date'   => $today->copy()->addDays(7)->toDateString(),
                'adults'           => 2,
                'children'         => 1,
                'channel'          => 'phone',
                'status'           => 'pending',
                'special_request'  => null,
                'total_amount'     => 1700000.00,
            ],
            // Checked-out (past)
            [
                'reservation_code' => 'RSV-' . $today->format('Ymd') . '-007',
                'guest_name'       => 'Ahmad Hidayat',
                'room_type_code'   => 'STD',
                'room_number'      => '203',
                'check_in_date'    => $today->copy()->subDays(5)->toDateString(),
                'check_out_date'   => $today->copy()->subDays(2)->toDateString(),
                'adults'           => 1,
                'children'         => 0,
                'channel'          => 'walk_in',
                'status'           => 'checked_out',
                'special_request'  => null,
                'total_amount'     => 1350000.00,
            ],
            // Cancelled
            [
                'reservation_code' => 'RSV-' . $today->format('Ymd') . '-008',
                'guest_name'       => 'Maria Garcia',
                'room_type_code'   => 'EXC',
                'room_number'      => null,
                'check_in_date'    => $today->copy()->addDays(10)->toDateString(),
                'check_out_date'   => $today->copy()->addDays(14)->toDateString(),
                'adults'           => 2,
                'children'         => 0,
                'channel'          => 'email',
                'status'           => 'cancelled',
                'special_request'  => 'Airport pickup',
                'total_amount'     => 4800000.00,
            ],
            // Confirmed (next week)
            [
                'reservation_code' => 'RSV-' . $today->format('Ymd') . '-009',
                'guest_name'       => 'Rizky Pratama',
                'room_type_code'   => 'SUP',
                'room_number'      => null,
                'check_in_date'    => $today->copy()->addDays(7)->toDateString(),
                'check_out_date'   => $today->copy()->addDays(9)->toDateString(),
                'adults'           => 2,
                'children'         => 0,
                'channel'          => 'walk_in',
                'status'           => 'confirmed',
                'special_request'  => 'Early check-in jika memungkinkan',
                'total_amount'     => 1300000.00,
            ],
            // No-show
            [
                'reservation_code' => 'RSV-' . $today->format('Ymd') . '-010',
                'guest_name'       => 'Nur Aisyah',
                'room_type_code'   => 'STD',
                'room_number'      => null,
                'check_in_date'    => $today->copy()->subDays(1)->toDateString(),
                'check_out_date'   => $today->copy()->addDays(1)->toDateString(),
                'adults'           => 1,
                'children'         => 0,
                'channel'          => 'ota',
                'status'           => 'no_show',
                'special_request'  => null,
                'total_amount'     => 900000.00,
            ],
        ];

        foreach ($reservations as $data) {
            $guestId   = $guests[$data['guest_name']] ?? null;
            $roomTypeId = $roomTypes[$data['room_type_code']] ?? null;
            $roomId    = $data['room_number'] ? ($rooms[$data['room_number']] ?? null) : null;

            if (!$guestId || !$roomTypeId) {
                continue;
            }

            Reservation::updateOrCreate(
                ['reservation_code' => $data['reservation_code']],
                [
                    'guest_id'        => $guestId,
                    'room_type_id'    => $roomTypeId,
                    'room_id'         => $roomId,
                    'check_in_date'   => $data['check_in_date'],
                    'check_out_date'  => $data['check_out_date'],
                    'adults'          => $data['adults'],
                    'children'        => $data['children'],
                    'channel'         => $data['channel'],
                    'status'          => $data['status'],
                    'special_request' => $data['special_request'],
                    'total_amount'    => $data['total_amount'],
                    'created_by'      => $createdBy,
                ]
            );
        }
    }
}
