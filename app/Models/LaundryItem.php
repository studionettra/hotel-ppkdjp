<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LaundryItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'guest_id', 'room_id', 'item_name', 'item_type', 'quantity',
        'service_type', 'unit_price', 'total_price', 'status',
        'received_at', 'estimated_ready_at', 'delivered_at',
        'notes', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'received_at'       => 'datetime',
            'estimated_ready_at'=> 'datetime',
            'delivered_at'      => 'datetime',
        ];
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
