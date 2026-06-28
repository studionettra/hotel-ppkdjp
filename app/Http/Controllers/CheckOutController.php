<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCheckOutRequest;
use App\Models\CheckIn;
use App\Models\CheckOut;
use App\Models\HousekeepingTask;
use App\Models\Payment;
use App\Models\Room;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckOutController extends Controller
{
    public function create(CheckIn $checkin)
    {
        $checkin->load(['reservation.guest', 'reservation.roomType', 'room', 'room.housekeepingTasks', 'guestFolio.charges', 'guestFolio.payments']);

        abort_if(! $checkin->guestFolio, 404, 'Folio tidak ditemukan.');

        $checkin->guestFolio->recalculate();

        return Inertia::render('CheckOuts/Create', [
            'checkin' => $checkin,
            'folio'   => $checkin->guestFolio,
        ]);
    }

    public function store(StoreCheckOutRequest $request)
    {
        $data    = $request->validated();
        $checkIn = CheckIn::with(['reservation', 'guestFolio', 'room'])->findOrFail($data['check_in_id']);

        abort_if($checkIn->checkOut()->exists(), 422, 'Sudah pernah check-out.');

        $folio = $checkIn->guestFolio;
        $folio->recalculate();

        DB::transaction(function () use ($data, $checkIn, $folio) {
            // Catat settlement payment jika ada
            if (! empty($data['payment_amount']) && $data['payment_amount'] > 0) {
                Payment::create([
                    'folio_id'       => $folio->id,
                    'payment_number' => Payment::generateNumber(),
                    'payment_type'   => 'payment',
                    'payment_method' => $data['payment_method'],
                    'amount'         => $data['payment_amount'],
                    'payment_date'   => now(),
                    'notes'          => $data['notes'] ?? 'Settlement check-out',
                    'created_by'     => auth()->id(),
                ]);
                $folio->recalculate();
            }

            // Buat check_out record (total_paid dari folio)
            CheckOut::create([
                'check_in_id'      => $checkIn->id,
                'check_out_time'   => now(),
                'total_bill'       => $folio->total_charges,
                'total_paid'       => $folio->total_payments,
                'feedback_rating'  => $data['feedback_rating'] ?? null,
                'feedback_notes'   => $data['feedback_notes'] ?? null,
                'processed_by'     => auth()->id(),
            ]);

            // Update room → vd
            $checkIn->room->update(['status' => 'vd']);

            // Update reservation → checked_out
            $checkIn->reservation->update(['status' => 'checked_out']);

            // Settle folio
            $folio->update(['status' => 'settled']);

            // Auto-create housekeeping task
            HousekeepingTask::create([
                'room_id'     => $checkIn->room_id,
                'task_type'   => 'room_cleaning',
                'priority'    => 'high',
                'status'      => 'pending',
                'assigned_to' => null,
                'notes'       => "Auto-created setelah check-out kamar {$checkIn->room->room_number}",
                'created_by'  => auth()->id(),
            ]);
        });

        return redirect()->route('reservations.index')->with('success', 'Check-Out berhasil diproses.');
    }

    public function requestInspection(CheckIn $checkin)
    {
        $checkin->load('room');
        
        $task = HousekeepingTask::create([
            'room_id'     => $checkin->room_id,
            'task_type'   => 'inspection',
            'priority'    => 'high',
            'status'      => 'pending',
            'notes'       => "Mohon cek amenitas, minibar, atau kerusakan karena tamu kamar {$checkin->room->room_number} akan check-out.",
            'created_by'  => auth()->id(),
        ]);

        $users = \App\Models\User::permission('housekeeping.view')->get();
        \Illuminate\Support\Facades\Notification::send($users, new \App\Notifications\HousekeepingTaskRequested($task));

        return back()->with('success', 'Permintaan inspeksi kamar telah dikirim ke Housekeeping.');
    }
}
