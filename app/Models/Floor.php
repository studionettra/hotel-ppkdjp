<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Floor extends Model
{
    protected $fillable = ['floor_number', 'floor_name', 'description'];

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}
