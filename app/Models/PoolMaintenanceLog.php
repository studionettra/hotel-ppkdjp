<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PoolMaintenanceLog extends Model
{
    protected $fillable = [
        'pool_area', 'maintenance_type', 'status',
        'ph_level', 'chlorine_level', 'temperature',
        'scheduled_at', 'started_at', 'completed_at',
        'findings', 'action_taken', 'assigned_to', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at'  => 'datetime',
            'started_at'    => 'datetime',
            'completed_at'  => 'datetime',
            'ph_level'      => 'float',
            'chlorine_level'=> 'float',
            'temperature'   => 'float',
        ];
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
