<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('user')->id;

        return [
            'name'      => ['required', 'string', 'max:255'],
            'username'  => ['required', 'string', 'max:100', Rule::unique('users', 'username')->ignore($id)],
            'email'     => ['required', 'email', Rule::unique('users', 'email')->ignore($id)],
            'password'  => ['nullable', 'string', 'min:6'],
            'role'      => ['required', 'string', 'exists:roles,name'],
            'is_active' => ['boolean'],
        ];
    }
}
