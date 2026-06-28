<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FolioCharge extends Model
{
    protected $fillable = [
        'folio_id', 'charge_type', 'description', 'quantity',
        'unit_price', 'amount', 'charge_date',
        'reference_type', 'reference_id', 'created_by',
    ];

    protected function casts(): array
    {
        return ['charge_date' => 'date'];
    }

    public function folio()
    {
        return $this->belongsTo(GuestFolio::class, 'folio_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
