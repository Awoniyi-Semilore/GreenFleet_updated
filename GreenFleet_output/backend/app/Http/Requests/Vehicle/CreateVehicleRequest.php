<?php

namespace App\Http\Requests\Vehicle;

use Illuminate\Foundation\Http\FormRequest;

class CreateVehicleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'plate_number'    => ['required', 'string', 'max:255', 'unique:vehicles,plate_number'],
            // FIX: vehicle_name column does not exist — accept it but don't persist it
            'vehicle_name'    => ['nullable', 'string', 'max:255'],
            'make'            => ['nullable', 'string', 'max:255'],
            'model'           => ['nullable', 'string', 'max:255'],
            'year'            => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'color'           => ['nullable', 'string', 'max:255'],
            'vehicle_type_id' => ['required', 'integer', 'exists:vehicle_types,id'],
            'fuel_type_id'    => ['required', 'integer', 'exists:fuel_types,id'],
            'branch_id'       => ['required', 'integer', 'exists:branches,id'],
            'capacity'        => ['nullable', 'integer', 'min:1'],
            // FIX: DB enum is AVAILABLE,ASSIGNED,MAINTENANCE,OUT_OF_SERVICE (not IN_USE)
            'status'          => ['nullable', 'in:AVAILABLE,ASSIGNED,MAINTENANCE,OUT_OF_SERVICE'],
        ];
    }

    public function messages(): array
    {
        return [
            'plate_number.required'    => 'The plate number is required.',
            'plate_number.unique'      => 'This plate number is already registered.',
            'vehicle_type_id.required' => 'Please select a vehicle type.',
            'vehicle_type_id.exists'   => 'The selected vehicle type is invalid.',
            'fuel_type_id.required'    => 'Please select a fuel type.',
            'fuel_type_id.exists'      => 'The selected fuel type is invalid.',
            'branch_id.required'       => 'Please select a branch.',
            'branch_id.exists'         => 'The selected branch is invalid.',
        ];
    }
}
