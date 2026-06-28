<?php

namespace App\Http\Controllers;

use App\Models\CheckIn;
use App\Models\FolioCharge;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HousekeepingChargeController extends Controller
{
    public function index(Request $request)
    {
        // Get charges of type minibar or other (often used for damage)
        $query = FolioCharge::with(['folio.guest', 'folio.checkIn.room', 'createdBy'])
            ->whereIn('charge_type', ['minibar', 'other'])
            ->latest('charge_date')
            ->latest('id');

        // Only show active rooms (rooms that have a guest currently checked in)
        $activeRooms = Room::whereHas('checkIns', function ($q) {
            $q->whereDoesntHave('checkOut');
        })->orderBy('room_number')->get(['id', 'room_number']);

        return Inertia::render('Housekeeping/Charges/Index', [
            'charges' => $query->paginate(15),
            'activeRooms' => $activeRooms,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id'     => ['required', 'exists:rooms,id'],
            'charge_type' => ['required', 'in:minibar,other'],
            'description' => ['required', 'string', 'max:255'],
            'quantity'    => ['required', 'integer', 'min:1'],
            'unit_price'  => ['required', 'numeric', 'min:0'],
            'notes'       => ['nullable', 'string'],
        ]);

        // Find active checkin for this room
        $checkIn = CheckIn::with('guestFolio')
            ->where('room_id', $validated['room_id'])
            ->whereDoesntHave('checkOut')
            ->first();

        if (!$checkIn || !$checkIn->guestFolio) {
            return back()->with('error', 'Kamar ini tidak memiliki tamu yang sedang aktif (Check-In).');
        }

        DB::transaction(function () use ($validated, $checkIn) {
            $total_price = $validated['quantity'] * $validated['unit_price'];

            // Tambahkan charge ke folio
            $checkIn->guestFolio->charges()->create([
                'charge_type' => $validated['charge_type'],
                'description' => $validated['description'] . ($validated['notes'] ? ' - ' . $validated['notes'] : ''),
                'quantity'    => $validated['quantity'],
                'unit_price'  => $validated['unit_price'],
                'amount'      => $total_price,
                'charge_date' => now()->toDateString(),
                'created_by'  => auth()->id(),
            ]);

            $checkIn->guestFolio->recalculate();
        });

        return back()->with('success', 'Tagihan berhasil ditambahkan ke Folio tamu.');
    }
}
