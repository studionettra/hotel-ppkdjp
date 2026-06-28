<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HousekeepingControlSheet extends Model
{
    protected $fillable = [
        'room_id', 'attendant_id', 'date', 'time_in', 'time_out',
        'room_status', 'amenities_data', 'remarks'
    ];

    protected $casts = [
        'amenities_data' => 'array',
        'date' => 'date',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function attendant()
    {
        return $this->belongsTo(User::class, 'attendant_id');
    }
}
