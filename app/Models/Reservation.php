<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Reservation extends Model
{
    use SoftDeletes, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'reservation_code', 'booking_id', 'guest_id', 'room_type_id', 'room_id',
        'check_in_date', 'check_out_date', 'adults', 'children',
        'channel', 'status', 'special_request', 'total_amount', 'created_by',
        'arrival_time', 'payment_method', 'deposit_box_number', 'deposit_box_issued_by', 'deposit_box_date',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    protected function casts(): array
    {
        return [
            'check_in_date'  => 'date',
            'check_out_date' => 'date',
            'total_amount'   => 'decimal:2',
        ];
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function roomType()
    {
        return $this->belongsTo(RoomType::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function checkIn()
    {
        return $this->hasOne(CheckIn::class);
    }

    public static function generateCode(): string
    {
        $prefix = 'RES';
        $date   = now()->format('Ymd');
        $last   = static::where('reservation_code', 'like', "{$prefix}{$date}%")->count();

        return $prefix . $date . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
    }
}
