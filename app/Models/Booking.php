<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_code', 'created_by', 'total_amount', 'payment_method', 'payment_status'
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public static function generateCode()
    {
        $prefix = 'BK-' . date('Ymd') . '-';
        $last = self::where('booking_code', 'like', $prefix . '%')->orderBy('id', 'desc')->first();
        if (! $last) {
            return $prefix . '001';
        }
        $lastCode = (int) substr($last->booking_code, -3);
        return $prefix . str_pad($lastCode + 1, 3, '0', STR_PAD_LEFT);
    }
}
