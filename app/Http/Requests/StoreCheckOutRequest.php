<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckOutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'check_in_id'     => ['required', 'exists:check_ins,id'],
            'payment_amount'  => ['nullable', 'numeric', 'min:0'],
            'payment_method'  => ['required_if:payment_amount,>0', Rule::in(['cash', 'debit_card', 'credit_card', 'transfer', 'city_ledger'])],
            'feedback_rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'feedback_notes'  => ['nullable', 'string'],
            'notes'           => ['nullable', 'string'],
        ];
    }
}
