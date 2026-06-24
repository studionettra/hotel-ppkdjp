<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddChargeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'charge_type'  => ['required', Rule::in(['room', 'fnb', 'laundry', 'extra_bed', 'minibar', 'other'])],
            'description'  => ['required', 'string', 'max:255'],
            'quantity'     => ['required', 'integer', 'min:1'],
            'unit_price'   => ['required', 'numeric', 'min:0'],
            'charge_date'  => ['nullable', 'date'],
        ];
    }
}
