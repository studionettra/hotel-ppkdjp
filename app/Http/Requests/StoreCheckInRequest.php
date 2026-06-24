<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reservation_id' => ['required', 'exists:reservations,id'],
            'room_id'        => ['required', 'exists:rooms,id'],
            'deposit_amount' => ['nullable', 'numeric', 'min:0'],
            'deposit_method' => ['required_if:deposit_amount,>0', Rule::in(['cash', 'debit', 'credit_card', 'transfer'])],
            'notes'          => ['nullable', 'string'],
        ];
    }
}
