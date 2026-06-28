<?php

namespace App\Http\Controllers;

use App\Models\HousekeepingControlSheet;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HousekeepingControlSheetController extends Controller
{
    public function index(Request $request)
    {
        $query = HousekeepingControlSheet::with(['room', 'attendant'])->latest('date')->latest('time_in');

        return Inertia::render('Housekeeping/ControlSheets/Index', [
            'sheets' => $query->paginate(15),
            'rooms' => Room::orderBy('room_number')->get(['id', 'room_number']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'date' => 'required|date',
            'time_in' => 'nullable|date_format:H:i',
            'time_out' => 'nullable|date_format:H:i',
            'room_status' => 'nullable|string',
            'amenities_data' => 'nullable|array',
            'remarks' => 'nullable|string',
        ]);

        $validated['attendant_id'] = auth()->id();
        HousekeepingControlSheet::create($validated);

        // Jika ada status baru, kita juga bisa otomatis update status kamar
        if (!empty($validated['room_status'])) {
            Room::where('id', $validated['room_id'])->update(['status' => $validated['room_status']]);
        }

        return redirect()->back()->with('success', 'Laporan Control Sheet berhasil disimpan.');
    }
}
