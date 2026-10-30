<?php

namespace App\Http\Requests\User;

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
        $userId = $this->route('id');

        return [
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'username' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('users', 'username')->ignore($userId)],
            'email' => ['sometimes', 'required', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:8'],
            'role_id' => ['sometimes', 'nullable', 'integer', 'exists:roles,id'],
            'department_id' => ['sometimes', 'nullable', 'integer', 'exists:departments,id'],
            'branch_id' => ['sometimes', 'nullable', 'integer', 'exists:branches,id'],
            'status' => ['sometimes', 'required', 'in:ACTIVE,INACTIVE'],
        ];
    }
}