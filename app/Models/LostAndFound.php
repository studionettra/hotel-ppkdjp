<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LostAndFound extends Model
{
    protected $fillable = [
        'room_id', 'found_date', 'found_time', 'item_description',
        'location_found', 'attendant_name', 'reported_by', 'status'
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }
}
