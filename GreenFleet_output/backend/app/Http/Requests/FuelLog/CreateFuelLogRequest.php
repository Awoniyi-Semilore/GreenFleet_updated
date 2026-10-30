<?php

namespace App\Http\Requests\FuelLog;

use Illuminate\Foundation\Http\FormRequest;

class CreateFuelLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'fuel_type_id' => ['required', 'exists:fuel_types,id'],
            'quantity' => ['required', 'numeric', 'min:0'],
            'cost' => ['required', 'numeric', 'min:0'],
            'odometer' => ['required', 'integer', 'min:0'],
            'fuel_date' => ['required', 'date'],
            'receipt_number' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_id.required' => 'The vehicle is required.',
            'vehicle_id.exists' => 'The selected vehicle is invalid.',
            'fuel_type_id.required' => 'The fuel type is required.',
            'fuel_type_id.exists' => 'The selected fuel type is invalid.',
            'quantity.required' => 'The quantity is required.',
            'quantity.numeric' => 'The quantity must be a number.',
            'quantity.min' => 'The quantity must be at least 0.',
            'cost.required' => 'The cost is required.',
            'cost.numeric' => 'The cost must be a number.',
            'cost.min' => 'The cost must be at least 0.',
            'odometer.required' => 'The odometer is required.',
            'odometer.integer' => 'The odometer must be an integer.',
            'odometer.min' => 'The odometer must be at least 0.',
            'fuel_date.required' => 'The fuel date is required.',
            'fuel_date.date' => 'The fuel date must be a valid date.',
            'receipt_number.max' => 'The receipt number may not be greater than 255 characters.',
        ];
    }
}