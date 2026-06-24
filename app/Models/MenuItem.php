<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MenuItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'name', 'code', 'description',
        'price', 'unit', 'is_available',
    ];

    protected function casts(): array
    {
        return [
            'price'        => 'float',
            'is_available' => 'boolean',
        ];
    }

    public function category()
    {
        return $this->belongsTo(MenuCategory::class, 'category_id');
    }
}
