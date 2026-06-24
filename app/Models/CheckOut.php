<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckOut extends Model
{
    protected $fillable = [
        'check_in_id', 'check_out_time', 'total_bill',
        'total_paid', 'feedback_rating', 'feedback_notes', 'processed_by',
    ];

    protected function casts(): array
    {
        return ['check_out_time' => 'datetime'];
    }

    public function checkIn()
    {
        return $this->belongsTo(CheckIn::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
