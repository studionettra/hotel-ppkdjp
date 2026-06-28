<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuestLoan extends Model
{
    protected $fillable = [
        'reservation_id', 'room_id', 'item_type', 'price',
        'loan_date', 'return_date', 'status', 'notes', 'created_by'
    ];

    protected $casts = [
        'loan_date' => 'datetime',
        'return_date' => 'datetime',
        'price' => 'decimal:2',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
