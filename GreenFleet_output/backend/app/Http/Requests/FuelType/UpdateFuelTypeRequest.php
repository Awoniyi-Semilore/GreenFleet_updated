<?php

namespace App\Http\Requests\FuelType;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFuelTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $fuelTypeId = $this->route('id');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('fuel_types', 'name')->ignore($fuelTypeId)],
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