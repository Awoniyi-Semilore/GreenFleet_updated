<?php

namespace App\Http\Requests\Driver;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'license_number' => ['required', 'string', 'max:100', Rule::unique('drivers', 'license_number')],
            'license_expiry' => ['required', 'date'],
            'phone' => ['required', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'status' => ['required', 'in:ACTIVE,INACTIVE'],
            'branch_id' => ['nullable', 'exists:branches,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'The user is required.',
            'user_id.exists' => 'The selected user is invalid.',
            'license_number.required' => 'The license number is required.',
            'license_number.max' => 'The license number may not be greater than 100 characters.',
            'license_number.unique' => 'The license number has already been taken.',
            'license_expiry.required' => 'The license expiry date is required.',
            'license_expiry.date' => 'The license expiry must be a valid date.',
            'phone.required' => 'The phone number is required.',
            'phone.max' => 'The phone number may not be greater than 20 characters.',
            'status.required' => 'The status is required.',
            'status.in' => 'The status must be ACTIVE or INACTIVE.',
        ];
    }
}