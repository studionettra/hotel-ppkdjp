<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'folio_id', 'payment_number', 'payment_type',
        'payment_method', 'amount', 'payment_date', 'notes', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'datetime',
            'amount'       => 'decimal:2',
        ];
    }

    public function folio()
    {
        return $this->belongsTo(GuestFolio::class, 'folio_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generateNumber(): string
    {
        $prefix = 'PAY';
        $date   = now()->format('Ymd');
        $last   = static::where('payment_number', 'like', "{$prefix}{$date}%")->count();

        return $prefix . $date . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
    }
}
