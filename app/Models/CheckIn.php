<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckIn extends Model
{
    protected $fillable = [
        'reservation_id', 'room_id', 'check_in_time',
        'deposit_amount', 'deposit_method', 'processed_by', 'notes',
    ];

    protected function casts(): array
    {
        return ['check_in_time' => 'datetime'];
    }

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function guestFolio()
    {
        return $this->hasOne(GuestFolio::class);
    }

    public function checkOut()
    {
        return $this->hasOne(CheckOut::class);
    }
}
