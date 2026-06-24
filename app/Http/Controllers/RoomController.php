<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequest;
use App\Models\Floor;
use App\Models\Room;
use App\Models\RoomType;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::with(['floor', 'roomType'])
            ->orderBy('room_number')
            ->get();

        $floors    = Floor::orderBy('floor_number')->get();
        $roomTypes = RoomType::orderBy('name')->get();

        return Inertia::render('Rooms/Index', compact('rooms', 'floors', 'roomTypes'));
    }

    public function store(StoreRoomRequest $request)
    {
        Room::create($request->validated());

        return back()->with('success', 'Kamar berhasil ditambahkan.');
    }

    public function update(StoreRoomRequest $request, Room $room)
    {
        $room->update($request->validated());

        return back()->with('success', 'Kamar berhasil diperbarui.');
    }

    public function destroy(Room $room)
    {
        $room->delete();

        return back()->with('success', 'Kamar berhasil dihapus.');
    }
}
