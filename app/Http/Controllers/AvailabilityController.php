<?php

namespace App\Http\Controllers;

use App\Models\Floor;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AvailabilityController extends Controller
{
    public function index(Request $request)
    {
        $checkIn  = $request->input('check_in',  now()->toDateString());
        $checkOut = $request->input('check_out', now()->addDay()->toDateString());
        $sortBy   = $request->input('sort', 'floor');

        // Rooms occupied in the date range
        $occupiedRoomIds = Reservation::whereIn('status', ['confirmed', 'checked_in'])
            ->where('check_in_date', '<', $checkOut)
            ->where('check_out_date', '>', $checkIn)
            ->whereNotNull('room_id')
            ->pluck('room_id')
            ->toArray();

        $floors = Floor::with([
            'rooms' => function ($q) {
                $q->with(['roomType'])->orderBy('room_number');
            },
        ])->orderBy('floor_number')->get();

        // Enrich each room with availability info
        $floors = $floors->map(function ($floor) use ($occupiedRoomIds) {
            $floor->rooms = $floor->rooms->map(function ($room) use ($occupiedRoomIds) {
                $room->is_booked = in_array($room->id, $occupiedRoomIds);
                return $room;
            });
            return $floor;
        });

        return Inertia::render('Availability/Index', [
            'floors'   => $floors,
            'filters'  => compact('checkIn', 'checkOut', 'sortBy'),
            'summary'  => [
                'total'     => Room::count(),
                'available' => Room::whereNotIn('id', $occupiedRoomIds)
                                   ->whereNotIn('status', ['ooo', 'oos'])
                                   ->count(),
                'occupied'  => count($occupiedRoomIds),
                'ooo'       => Room::whereIn('status', ['ooo', 'oos'])->count(),
            ],
        ]);
    }
}
