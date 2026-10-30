<?php

namespace App\Http\Requests\VehicleType;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $vehicleTypeId = $this->route('id');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('vehicle_types', 'name')->ignore($vehicleTypeId)],
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