<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FnbOrder extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_number', 'order_type', 'guest_id', 'room_id',
        'table_number', 'status', 'subtotal', 'tax', 'total',
        'payment_method', 'paid_at', 'notes', 'created_by',
    ];

    protected function casts(): array
    {
        return ['paid_at' => 'datetime'];
    }

    public static function generateNumber(): string
    {
        $prefix = 'FNB-' . date('Ymd');
        $last   = static::where('order_number', 'like', $prefix . '%')->latest('id')->first();
        $seq    = $last ? (int) substr($last->order_number, -4) + 1 : 1;
        return $prefix . '-' . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function items()
    {
        return $this->hasMany(FnbOrderItem::class, 'order_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recalculate(): void
    {
        $subtotal      = $this->items()->sum('subtotal');
        $tax           = round($subtotal * 0.11, 2);
        $this->subtotal = $subtotal;
        $this->tax      = $tax;
        $this->total    = $subtotal + $tax;
        $this->saveQuietly();
    }
}
