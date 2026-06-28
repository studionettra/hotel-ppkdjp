<?php

namespace App\Http\Controllers;

use App\Models\GuestLoan;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuestLoanController extends Controller
{
    public function index(Request $request)
    {
        $query = GuestLoan::with(['room', 'reservation.guest'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Housekeeping/GuestLoans/Index', [
            'loans' => $query->paginate(15)->withQueryString(),
            'rooms' => Room::orderBy('room_number')->get(['id', 'room_number']),
            'filters' => $request->only('status'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'item_type' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $validated['loan_date'] = now();
        $validated['created_by'] = auth()->id();
        $validated['status'] = 'borrowed';
        $validated['price'] = $validated['price'] ?? 0;

        GuestLoan::create($validated);

        return redirect()->back()->with('success', 'Peminjaman berhasil dicatat.');
    }

    public function update(Request $request, GuestLoan $guestLoan)
    {
        $validated = $request->validate([
            'status' => 'required|in:borrowed,returned',
        ]);

        if ($validated['status'] === 'returned') {
            $validated['return_date'] = now();
        }

        $guestLoan->update($validated);

        return redirect()->back()->with('success', 'Status peminjaman berhasil diperbarui.');
    }
}
