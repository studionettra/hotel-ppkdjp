<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\CheckIn;
use App\Models\Guest;
use App\Models\GuestFolio;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function checkinForm(Request $request)
    {
        // Expecting an array of room selections from Availability
        $request->validate([
            'rooms' => 'required|array|min:1|max:5',
            'rooms.*.id' => 'required|exists:rooms,id',
            'rooms.*.extrabed' => 'boolean',
            'rooms.*.breakfast' => 'boolean',
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
        ]);

        $roomsData = $request->rooms;
        $roomIds = collect($roomsData)->pluck('id');
        $rooms = Room::with('roomType', 'floor')->whereIn('id', $roomIds)->get();
        $guests = Guest::orderBy('full_name')->get();

        // Pass this to Checkout page
        return Inertia::render('Bookings/Checkin', [
            'rooms' => $rooms,
            'roomConfigs' => collect($roomsData)->keyBy('id'),
            'checkIn' => $request->check_in,
            'checkOut' => $request->check_out,
            'guests' => $guests,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
            'payment_method' => 'required|string',
            'rooms' => 'required|array|min:1|max:5',
            'rooms.*.room_id' => 'required|exists:rooms,id',
            'rooms.*.extrabed' => 'boolean',
            'rooms.*.breakfast' => 'boolean',
            'rooms.*.guest.id_type' => 'required|string|in:KTP,Passport,Kitas',
            'rooms.*.guest.id_number' => 'required|string',
            'rooms.*.guest.full_name' => 'required|string',
            'rooms.*.guest.gender' => 'nullable|string|in:male,female',
            'rooms.*.guest.phone' => 'nullable|string',
            'rooms.*.guest.email' => 'nullable|email',
            'rooms.*.guest.profession' => 'nullable|string',
            'rooms.*.guest.company' => 'nullable|string',
            'rooms.*.guest.nationality' => 'nullable|string',
            'rooms.*.guest.date_of_birth' => 'nullable|date',
            'rooms.*.guest.member_card_no' => 'nullable|string',
            'rooms.*.guest.address' => 'nullable|string',
            'rooms.*.pax' => 'required|integer|min:1',
            'rooms.*.notes' => 'nullable|string',
        ]);

        $booking = DB::transaction(function () use ($data) {
            $nights = \Carbon\Carbon::parse($data['check_in'])->diffInDays(\Carbon\Carbon::parse($data['check_out']));
            $totalBookingAmount = 0;

            // Create Master Booking
            $booking = Booking::create([
                'booking_code' => Booking::generateCode(),
                'created_by' => auth()->id(),
                'payment_method' => $data['payment_method'],
                'payment_status' => 'paid', // Assuming checkout implies paid
                'total_amount' => 0,
            ]);

            $masterFolio = null;
            $mainGuestId = null;

            foreach ($data['rooms'] as $index => $roomData) {
                $room = Room::with('roomType')->find($roomData['room_id']);

                // Process Guest
                $guestInput = $roomData['guest'];
                $guest = Guest::updateOrCreate(
                    ['id_number' => $guestInput['id_number']],
                    $guestInput
                );

                if ($index === 0) {
                    $mainGuestId = $guest->id;
                }

                // Check if breakfast is included in room type facilities or name
                $hasBreakfast = collect($room->roomType->facilities ?? [])->contains(function ($f) {
                    return str_contains(strtolower($f), 'breakfast') || str_contains(strtolower($f), 'sarapan');
                }) || str_contains(strtolower($room->roomType->name), 'breakfast');

                // Calculate room total
                $subTotal = $nights * $room->roomType->base_price;
                if ($roomData['extrabed']) {
                    $subTotal += (200000 * $nights);
                }
                if ($roomData['breakfast'] && !$hasBreakfast) {
                    $subTotal += (150000 * $nights);
                }
                
                $serviceCharge = $subTotal * 0.10;
                $tax = $subTotal * 0.11;
                $roomGrandTotal = $subTotal + $serviceCharge + $tax;
                $totalBookingAmount += $roomGrandTotal;

                // Create Reservation
                $reservation = Reservation::create([
                    'reservation_code' => Reservation::generateCode(),
                    'booking_id' => $booking->id,
                    'guest_id' => $guest->id,
                    'room_type_id' => $room->room_type_id,
                    'room_id' => $room->id,
                    'check_in_date' => $data['check_in'],
                    'check_out_date' => $data['check_out'],
                    'adults' => $roomData['pax'],
                    'children' => 0,
                    'channel' => 'walk_in',
                    'status' => 'checked_in',
                    'special_request' => $roomData['notes'] ?? null,
                    'total_amount' => $roomGrandTotal,
                    'created_by' => auth()->id(),
                ]);

                // Update Room Status
                $room->update(['status' => 'oc']);

                // Create CheckIn
                $checkIn = CheckIn::create([
                    'reservation_id' => $reservation->id,
                    'room_id' => $room->id,
                    'check_in_time' => now(),
                    'deposit_amount' => 0,
                    'processed_by' => auth()->id(),
                ]);

                // Create Master Folio on first room
                if ($index === 0) {
                    $masterFolio = GuestFolio::create([
                        'folio_number' => GuestFolio::generateNumber(),
                        'guest_id' => $mainGuestId,
                        'check_in_id' => $checkIn->id, // Linked to the first room's check-in
                        'status' => 'open',
                        'total_charges' => 0,
                        'total_payments' => 0,
                        'balance' => 0,
                    ]);
                }

                // Insert Charges to Master Folio
                $masterFolio->charges()->create([
                    'charge_type' => 'room',
                    'description' => "Room charge: {$room->roomType->name} ({$room->room_number}) × {$nights} malam",
                    'quantity' => $nights,
                    'unit_price' => $room->roomType->base_price,
                    'amount' => $nights * $room->roomType->base_price,
                    'charge_date' => now()->toDateString(),
                    'reference_type' => Reservation::class,
                    'reference_id' => $reservation->id,
                    'created_by' => auth()->id(),
                ]);

                if ($roomData['extrabed']) {
                    $masterFolio->charges()->create([
                        'charge_type' => 'extra_bed',
                        'description' => "Extra Bed ({$room->room_number}) × {$nights} malam",
                        'quantity' => $nights,
                        'unit_price' => 200000,
                        'amount' => $nights * 200000,
                        'charge_date' => now()->toDateString(),
                        'created_by' => auth()->id(),
                    ]);
                    \App\Models\HousekeepingTask::create([
                        'room_id' => $room->id,
                        'task_type' => 'extrabed',
                        'priority' => 'high',
                        'status' => 'pending',
                        'created_by' => auth()->id(),
                        'notes' => 'Permintaan Extrabed otomatis dari FO (Checkout).',
                    ]);
                }

                if ($roomData['breakfast'] && !$hasBreakfast) {
                    $masterFolio->charges()->create([
                        'charge_type' => 'fnb',
                        'description' => "Breakfast ({$room->room_number}) × {$nights} hari",
                        'quantity' => $nights,
                        'unit_price' => 150000,
                        'amount' => $nights * 150000,
                        'charge_date' => now()->toDateString(),
                        'created_by' => auth()->id(),
                    ]);
                }

                // Insert Tax and Service
                $masterFolio->charges()->create([
                    'charge_type' => 'other',
                    'description' => "Service Charge (10%) - Kamar {$room->room_number}",
                    'quantity' => 1,
                    'unit_price' => $serviceCharge,
                    'amount' => $serviceCharge,
                    'charge_date' => now()->toDateString(),
                    'created_by' => auth()->id(),
                ]);
                $masterFolio->charges()->create([
                    'charge_type' => 'other',
                    'description' => "Tax (11%) - Kamar {$room->room_number}",
                    'quantity' => 1,
                    'unit_price' => $tax,
                    'amount' => $tax,
                    'charge_date' => now()->toDateString(),
                    'created_by' => auth()->id(),
                ]);
            }

            // Insert single Payment fully settling the Master Folio
            Payment::create([
                'folio_id' => $masterFolio->id,
                'payment_number' => Payment::generateNumber(),
                'payment_type' => 'payment',
                'payment_method' => $data['payment_method'],
                'amount' => $totalBookingAmount,
                'payment_date' => now(),
                'notes' => 'Pembayaran lunas via Master Booking: ' . $booking->booking_code,
                'created_by' => auth()->id(),
            ]);
            
            $masterFolio->recalculate();
            $booking->update(['total_amount' => $totalBookingAmount]);

            return $booking;
        });

        return redirect()->route('bookings.confirmed', $booking->id)->with('success', 'Pembayaran berhasil dan kamar telah di Check-In.');
    }

    public function confirmed(Booking $booking)
    {
        $booking->load(['reservations.room', 'reservations.guest', 'reservations.roomType', 'reservations.checkIn.guestFolio.charges']);
        return Inertia::render('Bookings/Confirmed', compact('booking'));
    }
}
