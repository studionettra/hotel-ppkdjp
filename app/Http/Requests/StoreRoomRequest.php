<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'room_number'  => ['required', 'string', 'max:20'],
            'floor_id'     => ['required', 'exists:floors,id'],
            'room_type_id' => ['required', 'exists:room_types,id'],
            'status'       => ['required', Rule::in(['vc', 'vd', 'oc', 'od', 'ooo', 'oos'])],
            'notes'        => ['nullable', 'string'],
        ];
    }
}
