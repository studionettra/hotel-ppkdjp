<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddChargeRequest;
use App\Http\Requests\AddPaymentRequest;
use App\Models\GuestFolio;
use App\Models\Payment;
use Inertia\Inertia;

class FolioController extends Controller
{
    public function show(GuestFolio $folio)
    {
        $folio->load(['guest', 'checkIn.reservation.roomType', 'checkIn.room', 'charges', 'payments']);

        return Inertia::render('Folios/Show', compact('folio'));
    }

    public function addCharge(AddChargeRequest $request, GuestFolio $folio)
    {
        $data = $request->validated();
        $data['amount']     = $data['quantity'] * $data['unit_price'];
        $data['charge_date'] = $data['charge_date'] ?? now()->toDateString();
        $data['created_by'] = auth()->id();

        $folio->charges()->create($data);
        $folio->recalculate();

        return back()->with('success', 'Charge berhasil ditambahkan.');
    }


    public function addPayment(AddPaymentRequest $request, GuestFolio $folio)
    {
        Payment::create([
            ...$request->validated(),
            'folio_id'       => $folio->id,
            'payment_number' => Payment::generateNumber(),
            'payment_date'   => now(),
            'created_by'     => auth()->id(),
        ]);

        return back()->with('success', 'Pembayaran berhasil dicatat.');
    }

    public function settle(GuestFolio $folio)
    {
        $folio->recalculate();

        if ($folio->balance > 0) {
            return back()->with('error', 'Folio belum lunas. Sisa tagihan: Rp ' . number_format($folio->balance, 0, ',', '.'));
        }

        $folio->update(['status' => 'settled']);

        return back()->with('success', 'Folio berhasil di-settle.');
    }
}
