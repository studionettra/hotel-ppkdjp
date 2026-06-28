<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_type'   => ['required', Rule::in(['deposit', 'payment', 'refund'])],
            'payment_method' => ['required', Rule::in(['Cash', 'Bank Transfer', 'Credit Card', 'E-Wallet', 'cash', 'debit_card', 'credit_card', 'transfer', 'city_ledger'])],
            'amount'         => ['required', 'numeric', 'min:0'],
            'notes'          => ['nullable', 'string'],
        ];
    }
}
