<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFloorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'floor_number' => ['required', 'integer'],
            'floor_name'   => ['nullable', 'string', 'max:100'],
            'description'  => ['nullable', 'string'],
        ];
    }
}
