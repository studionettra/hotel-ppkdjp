<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FnbOrderItem extends Model
{
    protected $fillable = [
        'order_id', 'menu_item_id', 'item_name', 'quantity',
        'unit_price', 'subtotal', 'notes',
    ];

    protected static function booted(): void
    {
        static::saved(fn ($item) => $item->order->recalculate());
        static::deleted(fn ($item) => $item->order->recalculate());
    }

    public function order()
    {
        return $this->belongsTo(FnbOrder::class, 'order_id');
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}
