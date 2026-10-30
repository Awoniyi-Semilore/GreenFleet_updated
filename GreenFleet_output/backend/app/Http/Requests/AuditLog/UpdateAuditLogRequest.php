<?php

namespace App\Http\Requests\AuditLog;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAuditLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'action' => ['sometimes', 'required', 'string', 'max:255'],
            'module' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'ip_address' => ['nullable', 'string', 'max:45'],
            'user_agent' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.exists' => 'The selected user is invalid.',
            'action.required' => 'The action is required.',
            'action.max' => 'The action may not be greater than 255 characters.',
            'module.required' => 'The module is required.',
            'module.max' => 'The module may not be greater than 255 characters.',
            'description.required' => 'The description is required.',
            'ip_address.max' => 'The IP address may not be greater than 45 characters.',
        ];
    }
}