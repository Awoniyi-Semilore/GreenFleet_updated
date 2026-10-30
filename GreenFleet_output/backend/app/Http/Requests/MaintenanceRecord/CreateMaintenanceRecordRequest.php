<?php

namespace App\Http\Requests\MaintenanceRecord;

use Illuminate\Foundation\Http\FormRequest;

class CreateMaintenanceRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'service_type' => ['required', 'string', 'max:255'],
            'service_date' => ['required', 'date'],
            'next_service_date' => ['nullable', 'date'],
            'cost' => ['required', 'numeric', 'min:0'],
            'remarks' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_id.required' => 'The vehicle is required.',
            'vehicle_id.exists' => 'The selected vehicle is invalid.',
            'service_type.required' => 'The service type is required.',
            'service_type.max' => 'The service type may not be greater than 255 characters.',
            'service_date.required' => 'The service date is required.',
            'service_date.date' => 'The service date must be a valid date.',
            'next_service_date.date' => 'The next service date must be a valid date.',
            'cost.required' => 'The cost is required.',
            'cost.numeric' => 'The cost must be a number.',
            'cost.min' => 'The cost must be at least 0.',
        ];
    }
}