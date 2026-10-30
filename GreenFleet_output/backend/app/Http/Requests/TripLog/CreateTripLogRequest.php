<?php

namespace App\Http\Requests\TripLog;

use Illuminate\Foundation\Http\FormRequest;

class CreateTripLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transport_request_id' => ['required', 'exists:transport_requests,id'],
            'assignment_id' => ['required', 'exists:assignments,id'],
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'driver_id' => ['required', 'exists:drivers,id'],
            'start_odometer' => ['required', 'numeric'],
            'end_odometer' => ['nullable', 'numeric'],
            'distance_travelled' => ['nullable', 'numeric'],
            'departure_time' => ['required', 'date'],
            'arrival_time' => ['nullable', 'date'],
            'fuel_used' => ['nullable', 'numeric'],
            'remarks' => ['nullable', 'string'],
            'status' => ['required', 'in:STARTED,ONGOING,COMPLETED'],
        ];
    }

    public function messages(): array
    {
        return [
            'transport_request_id.required' => 'The transport request is required.',
            'transport_request_id.exists' => 'The selected transport request is invalid.',
            'assignment_id.required' => 'The assignment is required.',
            'assignment_id.exists' => 'The selected assignment is invalid.',
            'vehicle_id.required' => 'The vehicle is required.',
            'vehicle_id.exists' => 'The selected vehicle is invalid.',
            'driver_id.required' => 'The driver is required.',
            'driver_id.exists' => 'The selected driver is invalid.',
            'start_odometer.required' => 'The start odometer is required.',
            'start_odometer.numeric' => 'The start odometer must be a number.',
            'end_odometer.numeric' => 'The end odometer must be a number.',
            'distance_travelled.numeric' => 'The distance travelled must be a number.',
            'departure_time.required' => 'The departure time is required.',
            'departure_time.date' => 'The departure time must be a valid date.',
            'arrival_time.date' => 'The arrival time must be a valid date.',
            'fuel_used.numeric' => 'The fuel used must be a number.',
            'status.required' => 'The status is required.',
            'status.in' => 'The status must be STARTED, ONGOING, or COMPLETED.',
        ];
    }
}