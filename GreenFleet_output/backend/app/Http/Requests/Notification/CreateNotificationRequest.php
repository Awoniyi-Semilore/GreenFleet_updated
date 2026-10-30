<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class CreateNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'is_read' => ['required', 'boolean'],
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
            'is_read.required' => 'The is read status is required.',
            'is_read.boolean' => 'The is read status must be true or false.',
        ];
    }
}