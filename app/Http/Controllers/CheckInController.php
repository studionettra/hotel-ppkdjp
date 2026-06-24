<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCheckInRequest;
use App\Models\CheckIn;
use App\Models\GuestFolio;
use App\Models\HousekeepingTask;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use App\Services\ReservationService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckInController extends Controller
{
    public function __construct(private ReservationService $service) {}

    public function create(Reservation $reservation)
    {
        abort_if($reservation->status !== 'confirmed', 422, 'Reservasi tidak dalam status confirmed.');

        $reservation->load(['guest', 'roomType']);

        $availableRooms = Room::where('room_type_id', $reservation->room_type_id)
            ->where('status', 'vc')
            ->with(['floor', 'roomType'])
            ->get();

        return Inertia::render('CheckIns/Create', compact('reservation', 'availableRooms'));
    }

    public function store(StoreCheckInRequest $request)
    {
        $data        = $request->validated();
        $reservation = Reservation::findOrFail($data['reservation_id']);

        abort_if($reservation->status !== 'confirmed', 422, 'Reservasi tidak dalam status confirmed.');

        // Validasi room tidak overlap
        $available = $this->service->checkRoomAvailability(
            $data['room_id'],
            $reservation->check_in_date,
            $reservation->check_out_date,
            $reservation->id
        );
        abort_if(! $available, 422, 'Kamar sudah dipakai reservasi lain pada tanggal tersebut.');

        DB::transaction(function () use ($data, $reservation) {
            // Assign room ke reservasi
            $reservation->update([
                'room_id' => $data['room_id'],
                'status'  => 'checked_in',
            ]);

            // Update room status → oc
            Room::find($data['room_id'])->update(['status' => 'oc']);

            // Buat check_in record
            $checkIn = CheckIn::create([
                'reservation_id'  => $reservation->id,
                'room_id'         => $data['room_id'],
                'check_in_time'   => now(),
                'deposit_amount'  => $data['deposit_amount'] ?? 0,
                'deposit_method'  => $data['deposit_method'] ?? null,
                'processed_by'    => auth()->id(),
                'notes'           => $data['notes'] ?? null,
            ]);

            // Buat guest folio
            $folio = GuestFolio::create([
                'folio_number'   => GuestFolio::generateNumber(),
                'guest_id'       => $reservation->guest_id,
                'check_in_id'    => $checkIn->id,
                'status'         => 'open',
                'total_charges'  => 0,
                'total_payments' => 0,
                'balance'        => 0,
            ]);

            // Catat room charge (harga kamar x jumlah malam)
            $nights = $reservation->check_in_date->diffInDays($reservation->check_out_date);
            $folio->charges()->create([
                'charge_type'  => 'room',
                'description'  => "Room charge: {$reservation->roomType->name} × {$nights} malam",
                'quantity'     => $nights,
                'unit_price'   => $reservation->roomType->base_price,
                'amount'       => $nights * $reservation->roomType->base_price,
                'charge_date'  => now()->toDateString(),
                'reference_type' => Reservation::class,
                'reference_id'   => $reservation->id,
                'created_by'   => auth()->id(),
            ]);

            // Jika ada deposit, catat ke payments
            if (! empty($data['deposit_amount']) && $data['deposit_amount'] > 0) {
                Payment::create([
                    'folio_id'       => $folio->id,
                    'payment_number' => Payment::generateNumber(),
                    'payment_type'   => 'deposit',
                    'payment_method' => $data['deposit_method'],
                    'amount'         => $data['deposit_amount'],
                    'payment_date'   => now(),
                    'notes'          => 'Deposit saat check-in',
                    'created_by'     => auth()->id(),
                ]);
            }
        });

        return redirect()->route('reservations.index')->with('success', 'Check-In berhasil diproses.');
    }
}
