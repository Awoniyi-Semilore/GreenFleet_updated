<?php

namespace App\Http\Requests\TransportRequest;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateTransportRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requester_id' => ['nullable', 'integer', 'exists:users,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'pickup_location' => ['required', 'string', 'max:255'],
            'destination' => ['required', 'string', 'max:255'],
            'purpose' => ['required', 'string'],
            'departure_date' => ['required', 'date'],
            'departure_time' => ['required'],
            'passenger_count' => ['required', 'integer', 'min:1'],
            'priority' => ['required', 'in:LOW,NORMAL,HIGH,URGENT'],
            // Updated to support DRIVER_SPOTTED and BOARDED_WAITING statuses
            'status' => ['required', 'in:PENDING,APPROVED,REJECTED,ASSIGNED,DRIVER_SPOTTED,BOARDED_WAITING,COMPLETED,CANCELLED'],
            'remarks' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $user = Auth::user();

        // Only merge if the field is missing or empty
        if (!$this->has('requester_id') || !$this->input('requester_id')) {
            $this->merge([
                'requester_id' => $user?->id,
            ]);
        }

        if (!$this->has('branch_id') || !$this->input('branch_id')) {
            $this->merge([
                'branch_id' => $user?->branch_id,
            ]);
        }

        if (!$this->has('status')) {
            $this->merge([
                'status' => $this->input('status', 'PENDING'),
            ]);
        }
    }

    public function messages(): array
    {
        return [
            'pickup_location.required' => 'The pickup location is required.',
            'destination.required' => 'The destination is required.',
            'purpose.required' => 'The purpose is required.',
            'departure_date.required' => 'The departure date is required.',
            'departure_time.required' => 'The departure time is required.',
            'passenger_count.required' => 'The passenger count is required.',
            'priority.required' => 'The priority is required.',
            'status.required' => 'The status is required.',
        ];
    }
}