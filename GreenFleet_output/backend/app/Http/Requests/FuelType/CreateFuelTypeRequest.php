<?php

namespace App\Http\Requests\FuelType;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateFuelTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('fuel_types', 'name')],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The name is required.',
            'name.max' => 'The name may not be greater than 255 characters.',
            'name.unique' => 'The name has already been taken.',
        ];
    }
}