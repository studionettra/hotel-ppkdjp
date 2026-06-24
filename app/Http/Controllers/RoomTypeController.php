<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomTypeRequest;
use App\Models\RoomType;
use Inertia\Inertia;

class RoomTypeController extends Controller
{
    public function index()
    {
        $roomTypes = RoomType::withCount('rooms')->orderBy('name')->get();

        return Inertia::render('RoomTypes/Index', compact('roomTypes'));
    }

    public function store(StoreRoomTypeRequest $request)
    {
        RoomType::create($request->validated());

        return back()->with('success', 'Tipe kamar berhasil ditambahkan.');
    }

    public function update(StoreRoomTypeRequest $request, RoomType $roomType)
    {
        $roomType->update($request->validated());

        return back()->with('success', 'Tipe kamar berhasil diperbarui.');
    }

    public function destroy(RoomType $roomType)
    {
        if ($roomType->rooms()->exists()) {
            return back()->with('error', 'Tipe kamar tidak dapat dihapus karena masih memiliki kamar.');
        }

        $roomType->delete();

        return back()->with('success', 'Tipe kamar berhasil dihapus.');
    }
}
