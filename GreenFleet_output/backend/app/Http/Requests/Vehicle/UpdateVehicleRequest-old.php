<?php

namespace App\Http\Requests\Vehicle;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $vehicleId = $this->route('id');

        return [
            'plate_number' => ['sometimes', 'string', 'max:255', Rule::unique('vehicles', 'plate_number')->ignore($vehicleId)],
            'vehicle_name' => ['sometimes', 'string', 'max:255'],
            'make' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'color' => ['nullable', 'string', 'max:255'],
            'vehicle_type_id' => ['sometimes', 'integer', 'exists:vehicle_types,id'],
            'fuel_type_id' => ['sometimes', 'integer', 'exists:fuel_types,id'],
            'branch_id' => ['sometimes', 'integer', 'exists:branches,id'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'in:AVAILABLE,IN_USE,MAINTENANCE,OUT_OF_SERVICE'],
        ];
    }
}