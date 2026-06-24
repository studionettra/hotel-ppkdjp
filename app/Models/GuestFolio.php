<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuestFolio extends Model
{
    protected $fillable = [
        'folio_number', 'guest_id', 'check_in_id',
        'status', 'total_charges', 'total_payments', 'balance',
    ];

    protected function casts(): array
    {
        return [
            'total_charges'  => 'decimal:2',
            'total_payments' => 'decimal:2',
            'balance'        => 'decimal:2',
        ];
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function checkIn()
    {
        return $this->belongsTo(CheckIn::class);
    }

    public function charges()
    {
        return $this->hasMany(FolioCharge::class, 'folio_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'folio_id');
    }

    public function recalculate(): void
    {
        $totalCharges  = $this->charges()->sum('amount');
        $totalPayments = $this->payments()->whereIn('payment_type', ['deposit', 'payment'])->sum('amount')
                       - $this->payments()->where('payment_type', 'refund')->sum('amount');

        $this->update([
            'total_charges'  => $totalCharges,
            'total_payments' => $totalPayments,
            'balance'        => $totalCharges - $totalPayments,
        ]);
    }

    public static function generateNumber(): string
    {
        $prefix = 'FOL';
        $date   = now()->format('Ymd');
        $last   = static::where('folio_number', 'like', "{$prefix}{$date}%")->count();

        return $prefix . $date . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
    }
}
