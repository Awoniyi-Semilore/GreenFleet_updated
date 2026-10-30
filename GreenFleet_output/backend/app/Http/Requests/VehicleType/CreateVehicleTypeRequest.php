<?php

namespace App\Http\Requests\VehicleType;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateVehicleTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('vehicle_types', 'name')],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The name is required.',
            'name.max' => 'The name may not be greater than 100 characters.',
            'name.unique' => 'The name has already been taken.',
        ];
    }
}