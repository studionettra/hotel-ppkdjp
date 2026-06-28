<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name'    => ['required', 'string', 'max:255'],
            'id_type'      => ['required', Rule::in(['ktp', 'passport', 'sim'])],
            'id_number'    => ['required', 'string', 'max:100'],
            'phone'        => ['nullable', 'string', 'max:30'],
            'email'        => ['nullable', 'email'],
            'address'      => ['nullable', 'string'],
            'nationality'  => ['nullable', 'string', 'max:100'],
            'date_of_birth'=> ['nullable', 'date'],
            'gender'       => ['nullable', Rule::in(['male', 'female'])],
            'profession'   => ['nullable', 'string'],
            'company'      => ['nullable', 'string'],
            'member_card_no'=> ['nullable', 'string'],
        ];
    }
}
