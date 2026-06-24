<?php

namespace App\Http\Requests;

use App\Services\ReservationService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'guest_id'        => ['required', 'exists:guests,id'],
            'room_type_id'    => ['required', 'exists:room_types,id'],
            'check_in_date'   => ['required', 'date'],
            'check_out_date'  => ['required', 'date', 'after:check_in_date'],
            'adults'          => ['required', 'integer', 'min:1'],
            'children'        => ['required', 'integer', 'min:0'],
            'channel'         => ['required', Rule::in(['walk_in', 'phone', 'website', 'ota', 'email'])],
            'special_request' => ['nullable', 'string'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $data          = $this->validated();
            $reservation   = $this->route('reservation');
            $roomType      = \App\Models\RoomType::find($data['room_type_id'] ?? null);

            if ($roomType) {
                $total = ($data['adults'] ?? 0) + ($data['children'] ?? 0);
                if ($total > $roomType->max_capacity) {
                    $validator->errors()->add('adults', "Jumlah tamu ({$total}) melebihi kapasitas maksimum kamar ({$roomType->max_capacity} orang).");
                }
            }

            if ($roomType && isset($data['check_in_date'], $data['check_out_date'])) {
                $service   = app(ReservationService::class);
                $available = $service->checkTypeAvailability(
                    $data['room_type_id'],
                    $data['check_in_date'],
                    $data['check_out_date'],
                    $reservation?->id
                );
                if (! $available) {
                    $validator->errors()->add('room_type_id', "Tidak ada kamar {$roomType->name} yang tersedia untuk tanggal yang dipilih.");
                }
            }
        });
    }
}
