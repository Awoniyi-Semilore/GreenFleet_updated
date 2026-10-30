<?php

namespace App\Http\Requests\TransportRequest;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class CreateTransportRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requester_id' => ['required', 'integer', 'exists:users,id'],
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'pickup_location' => ['required', 'string', 'max:255'],
            'destination' => ['required', 'string', 'max:255'],
            'purpose' => ['required', 'string'],
            'departure_date' => ['required', 'date'],
            'departure_time' => ['required'],
            'passenger_count' => ['required', 'integer', 'min:1'],
            'priority' => ['required', 'in:LOW,NORMAL,HIGH,URGENT'],
            'status' => ['required', 'in:PENDING,APPROVED,REJECTED,ASSIGNED,COMPLETED,CANCELLED'],
            'remarks' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $user = Auth::user();

        $this->merge([
            'requester_id' => $this->input('requester_id') ?: $user?->id,
            'branch_id' => $this->input('branch_id') ?: $user?->branch_id,
            'status' => $this->input('status', 'PENDING'),
        ]);
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
            'branch_id.required' => 'The branch is required.',
            'branch_id.integer' => 'The branch must be valid.',
            'branch_id.exists' => 'The selected branch does not exist.',
        ];
    }
}