<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoomTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('roomType')?->id;

        return [
            'code'         => ['required', 'string', 'max:10', Rule::unique('room_types', 'code')->ignore($id)->whereNull('deleted_at')],
            'name'         => ['required', 'string', 'max:100'],
            'description'  => ['nullable', 'string'],
            'facilities'   => ['nullable', 'array'],
            'facilities.*' => ['string', 'max:100'],
            'max_capacity' => ['required', 'integer', 'min:1'],
            'base_price'   => ['required', 'numeric', 'min:0'],
        ];
    }
}
