<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Room extends Model
{
    use SoftDeletes, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontSubmitEmptyLogs();
    }

    protected $fillable = ['room_number', 'floor_id', 'room_type_id', 'status', 'notes'];

    public function floor()
    {
        return $this->belongsTo(Floor::class);
    }

    public function roomType()
    {
        return $this->belongsTo(RoomType::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function housekeepingTasks()
    {
        return $this->hasMany(HousekeepingTask::class);
    }

    public function laundryRequests()
    {
        return $this->hasMany(LaundryRequest::class);
    }

    public function fnbOrders()
    {
        return $this->hasMany(FnbOrder::class);
    }

    public static function statusLabel(): array
    {
        return [
            'vc'  => 'Vacant Clean',
            'vd'  => 'Vacant Dirty',
            'oc'  => 'Occupied Clean',
            'od'  => 'Occupied Dirty',
            'ooo' => 'Out of Order',
            'oos' => 'Out of Service',
        ];
    }
}
