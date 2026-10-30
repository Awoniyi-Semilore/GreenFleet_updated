<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['sometimes', 'required', 'exists:users,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'message' => ['sometimes', 'required', 'string'],
            // FIX: 'sometimes|required' on a boolean causes failures on partial PATCH.
            // 'nullable' + 'boolean' allows both omission and explicit false/true.
            'is_read' => ['sometimes', 'nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'The user is required.',
            'user_id.exists' => 'The selected user is invalid.',
            'title.required' => 'The title is required.',
            'title.max' => 'The title may not be greater than 255 characters.',
            'message.required' => 'The message is required.',
            'is_read.boolean' => 'The is read status must be true or false.',
        ];
    }
}
