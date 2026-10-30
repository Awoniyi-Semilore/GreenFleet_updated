<?php

namespace App\Http\Requests\VehicleInspection;

use Illuminate\Foundation\Http\FormRequest;

class CreateVehicleInspectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'inspection_date' => ['required', 'date'],
            'result' => ['required', 'in:PASS,FAIL,CONDITIONAL'],
            'remarks' => ['nullable', 'string'],
            'next_inspection_date' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_id.required' => 'The vehicle is required.',
            'vehicle_id.exists' => 'The selected vehicle is invalid.',
            'inspection_date.required' => 'The inspection date is required.',
            'inspection_date.date' => 'The inspection date must be a valid date.',
            'result.required' => 'The result is required.',
            'result.in' => 'The result must be PASS, FAIL, or CONDITIONAL.',
            'next_inspection_date.required' => 'The next inspection date is required.',
            'next_inspection_date.date' => 'The next inspection date must be a valid date.',
        ];
    }
}