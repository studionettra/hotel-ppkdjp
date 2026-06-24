<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\RoomType;

class ReservationService
{
    /**
     * Cek kuota room_type masih tersedia untuk rentang tanggal.
     * Digunakan saat membuat/update reservasi (room belum ditentukan).
     */
    public function checkTypeAvailability(
        int $roomTypeId,
        string $checkIn,
        string $checkOut,
        ?int $excludeReservationId = null
    ): bool {
        $totalRooms = RoomType::findOrFail($roomTypeId)->rooms()->count();

        $query = Reservation::where('room_type_id', $roomTypeId)
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->where('check_in_date', '<', $checkOut)
            ->where('check_out_date', '>', $checkIn);

        if ($excludeReservationId) {
            $query->where('id', '!=', $excludeReservationId);
        }

        return ($totalRooms - $query->count()) > 0;
    }

    /**
     * Cek room_id tertentu tidak overlap dengan reservasi aktif lain.
     * Digunakan saat assign kamar fisik (check-in atau assignment manual).
     */
    public function checkRoomAvailability(
        int $roomId,
        string $checkIn,
        string $checkOut,
        ?int $excludeReservationId = null
    ): bool {
        $query = Reservation::where('room_id', $roomId)
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->where('check_in_date', '<', $checkOut)
            ->where('check_out_date', '>', $checkIn);

        if ($excludeReservationId) {
            $query->where('id', '!=', $excludeReservationId);
        }

        return $query->doesntExist();
    }

    public function calculateTotal(int $roomTypeId, string $checkIn, string $checkOut): float
    {
        $nights    = now()->parse($checkIn)->diffInDays($checkOut);
        $basePrice = RoomType::findOrFail($roomTypeId)->base_price;

        return $nights * $basePrice;
    }
}
