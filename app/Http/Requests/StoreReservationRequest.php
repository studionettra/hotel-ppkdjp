<?php

namespace App\Http\Requests;

use App\Services\ReservationService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'guest_id'        => ['nullable', 'exists:guests,id'],
            'guest'           => ['required_without:guest_id', 'array'],
            'guest.full_name' => ['required_without:guest_id', 'string', 'max:255'],
            'guest.id_type'   => ['required_without:guest_id', 'in:ktp,passport,sim'],
            'guest.id_number' => ['required_without:guest_id', 'string', 'max:100'],
            'guest.phone'     => ['nullable', 'string', 'max:30'],
            'guest.email'     => ['nullable', 'email'],
            'guest.address'   => ['nullable', 'string'],
            'guest.nationality' => ['nullable', 'string', 'max:100'],
            'guest.date_of_birth' => ['nullable', 'date'],
            'guest.gender'    => ['nullable', 'in:male,female'],
            'guest.profession' => ['nullable', 'string'],
            'guest.company'    => ['nullable', 'string'],
            'guest.member_card_no' => ['nullable', 'string'],
            
            'room_type_id'    => ['required', 'exists:room_types,id'],
            'check_in_date'   => ['required', 'date', 'after_or_equal:today'],
            'check_out_date'  => ['required', 'date', 'after:check_in_date'],
            'adults'          => ['required', 'integer', 'min:1'],
            'children'        => ['required', 'integer', 'min:0'],
            'channel'         => ['required', Rule::in(['walk_in', 'phone', 'website', 'ota', 'email'])],
            'special_request' => ['nullable', 'string'],
            
            'arrival_time'    => ['nullable', 'date_format:H:i'],
            'payment_method'  => ['nullable', 'string'],
            'deposit_box_number' => ['nullable', 'string'],
            'deposit_box_issued_by' => ['nullable', 'string'],
            'deposit_box_date' => ['nullable', 'date'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $data = $this->validated();

            // Validasi kapasitas tamu
            $roomType = \App\Models\RoomType::find($data['room_type_id'] ?? null);
            if ($roomType) {
                $total = ($data['adults'] ?? 0) + ($data['children'] ?? 0);
                if ($total > $roomType->max_capacity) {
                    $validator->errors()->add('adults', "Jumlah tamu ({$total}) melebihi kapasitas maksimum kamar ({$roomType->max_capacity} orang).");
                }
            }

            // Validasi ketersediaan kuota room_type
            if ($roomType && isset($data['check_in_date'], $data['check_out_date'])) {
                $service   = app(ReservationService::class);
                $available = $service->checkTypeAvailability(
                    $data['room_type_id'],
                    $data['check_in_date'],
                    $data['check_out_date']
                );
                if (! $available) {
                    $validator->errors()->add('room_type_id', "Tidak ada kamar {$roomType->name} yang tersedia untuk tanggal yang dipilih.");
                }
            }
        });
    }
}
