<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\UpdateReservationRequest;
use App\Models\Guest;
use App\Models\Reservation;
use App\Models\RoomType;
use App\Services\ReservationService;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function __construct(private ReservationService $service) {}

    public function index()
    {
        $reservations = Reservation::with(['guest', 'roomType', 'room'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Reservations/Index', compact('reservations'));
    }



    public function show(Reservation $reservation)
    {
        $reservation->load(['guest', 'roomType', 'room', 'createdBy', 'checkIn']);
        $menuItems = \App\Models\MenuItem::with('category')->where('is_available', true)->orderBy('name')->get();

        return Inertia::render('Reservations/Show', compact('reservation', 'menuItems'));
    }

    public function edit(Reservation $reservation)
    {
        $reservation->load('guest');
        $guests    = Guest::orderBy('full_name')->get();
        $roomTypes = RoomType::orderBy('name')->get(['id', 'name', 'code', 'max_capacity', 'base_price']);

        return Inertia::render('Reservations/Edit', compact('reservation', 'guests', 'roomTypes'));
    }

    public function update(UpdateReservationRequest $request, Reservation $reservation)
    {
        $data = $request->validated();
        
        if (empty($data['guest_id'])) {
            $guest = Guest::updateOrCreate(
                ['id_number' => $data['guest']['id_number']],
                $data['guest']
            );
            $data['guest_id'] = $guest->id;
        } elseif (!empty($data['guest'])) {
            $guest = Guest::find($data['guest_id']);
            if ($guest) {
                $guest->update($data['guest']);
            }
        }
        unset($data['guest']);

        $data['total_amount'] = $this->service->calculateTotal(
            $data['room_type_id'],
            $data['check_in_date'],
            $data['check_out_date']
        );

        $reservation->update($data);

        return redirect()->route('reservations.index')->with('success', 'Reservasi berhasil diperbarui.');
    }

    public function cancel(Reservation $reservation)
    {
        if (! in_array($reservation->status, ['pending', 'confirmed'])) {
            return back()->with('error', 'Reservasi tidak dapat dibatalkan.');
        }

        $reservation->update(['status' => 'cancelled']);

        return back()->with('success', 'Reservasi berhasil dibatalkan.');
    }
}
