<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Guest extends Model
{
    use SoftDeletes, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'full_name', 'id_type', 'id_number', 'phone', 'email',
        'address', 'nationality', 'date_of_birth', 'gender',
        'profession', 'company', 'member_card_no',
    ];

    protected function casts(): array
    {
        return ['date_of_birth' => 'date'];
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function fnbOrders()
    {
        return $this->hasMany(FnbOrder::class);
    }

    public function laundryRequests()
    {
        return $this->hasMany(LaundryRequest::class);
    }
}
