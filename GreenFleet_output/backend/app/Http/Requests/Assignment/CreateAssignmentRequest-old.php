<?php

namespace App\Http\Requests\Assignment;

use Illuminate\Foundation\Http\FormRequest;

class CreateAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transport_request_id' => ['required', 'exists:transport_requests,id'],
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'driver_id' => ['required', 'exists:drivers,id'],
            'assigned_by' => ['required', 'exists:users,id'],
            'assigned_at' => ['required', 'date'],
            'status' => ['required', 'in:PENDING,ASSIGNED,IN_PROGRESS,COMPLETED,CANCELLED'],
            'remarks' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'transport_request_id.required' => 'The transport request is required.',
            'transport_request_id.exists' => 'The selected transport request is invalid.',
            'vehicle_id.required' => 'The vehicle is required.',
            'vehicle_id.exists' => 'The selected vehicle is invalid.',
            'driver_id.required' => 'The driver is required.',
            'driver_id.exists' => 'The selected driver is invalid.',
            'assigned_by.required' => 'The assigned by is required.',
            'assigned_by.exists' => 'The selected assigned by is invalid.',
            'assigned_at.required' => 'The assigned at is required.',
            'assigned_at.date' => 'The assigned at must be a valid date.',
            'status.required' => 'The status is required.',
            'status.in' => 'The status must be PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, or CANCELLED.',
        ];
    }
}