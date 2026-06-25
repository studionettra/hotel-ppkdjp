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

    public function create()
    {
        $guests    = Guest::orderBy('full_name')->get(['id', 'full_name', 'id_number']);
        $roomTypes = RoomType::orderBy('name')->get(['id', 'name', 'code', 'max_capacity', 'base_price']);

        return Inertia::render('Reservations/Create', compact('guests', 'roomTypes'));
    }

    public function store(StoreReservationRequest $request)
    {
        $data = $request->validated();
        $data['reservation_code'] = Reservation::generateCode();
        $data['created_by']       = auth()->id();
        $data['total_amount']     = $this->service->calculateTotal(
            $data['room_type_id'],
            $data['check_in_date'],
            $data['check_out_date']
        );
        $data['status'] = 'confirmed';

        Reservation::create($data);

        return redirect()->route('reservations.index')->with('success', 'Reservasi berhasil dibuat.');
    }

    public function show(Reservation $reservation)
    {
        $reservation->load(['guest', 'roomType', 'room', 'createdBy', 'checkIn']);

        return Inertia::render('Reservations/Show', compact('reservation'));
    }

    public function edit(Reservation $reservation)
    {
        $guests    = Guest::orderBy('full_name')->get(['id', 'full_name', 'id_number']);
        $roomTypes = RoomType::orderBy('name')->get(['id', 'name', 'code', 'max_capacity', 'base_price']);

        return Inertia::render('Reservations/Edit', compact('reservation', 'guests', 'roomTypes'));
    }

    public function update(UpdateReservationRequest $request, Reservation $reservation)
    {
        $data = $request->validated();
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
