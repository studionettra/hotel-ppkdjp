<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGuestRequest;
use App\Models\Guest;
use Inertia\Inertia;

class GuestController extends Controller
{
    public function index()
    {
        $guests = Guest::withCount('reservations')
            ->orderBy('full_name')
            ->get();

        return Inertia::render('Guests/Index', compact('guests'));
    }

    public function show(Guest $guest)
    {
        $guest->load(['reservations.roomType', 'reservations.room']);

        return Inertia::render('Guests/Show', compact('guest'));
    }

    public function store(StoreGuestRequest $request)
    {
        Guest::create($request->validated());

        return back()->with('success', 'Data tamu berhasil ditambahkan.');
    }

    public function update(StoreGuestRequest $request, Guest $guest)
    {
        $guest->update($request->validated());

        return back()->with('success', 'Data tamu berhasil diperbarui.');
    }

    public function destroy(Guest $guest)
    {
        $guest->delete();

        return back()->with('success', 'Data tamu berhasil dihapus.');
    }
}
