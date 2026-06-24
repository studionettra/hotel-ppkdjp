<?php

namespace App\Observers;

use App\Models\CheckOut;
use App\Models\Payment;

class PaymentObserver
{
    public function created(Payment $payment): void
    {
        $this->recalculate($payment);
    }

    public function updated(Payment $payment): void
    {
        $this->recalculate($payment);
    }

    public function deleted(Payment $payment): void
    {
        $this->recalculate($payment);
    }

    private function recalculate(Payment $payment): void
    {
        $folio = $payment->folio;
        if (! $folio) return;

        $folio->recalculate();

        // Sync total_paid ke check_outs jika sudah ada
        $checkOut = CheckOut::whereHas('checkIn', fn ($q) => $q->where('id', $folio->check_in_id))->first();
        if ($checkOut) {
            $checkOut->update(['total_paid' => $folio->total_payments]);
        }
    }
}
