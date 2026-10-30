<?php

namespace App\Http\Requests\Approval;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApprovalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transport_request_id' => ['sometimes', 'required', 'exists:transport_requests,id'],
            'approver_id' => ['sometimes', 'required', 'exists:users,id'],
            'level' => ['sometimes', 'required', 'integer', 'min:1'],
            'status' => ['sometimes', 'required', 'in:PENDING,APPROVED,REJECTED'],
            'comments' => ['nullable', 'string'],
            'approved_at' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'transport_request_id.required' => 'The transport request is required.',
            'transport_request_id.exists' => 'The selected transport request is invalid.',
            'approver_id.required' => 'The approver is required.',
            'approver_id.exists' => 'The selected approver is invalid.',
            'level.required' => 'The level is required.',
            'level.integer' => 'The level must be an integer.',
            'level.min' => 'The level must be at least 1.',
            'status.required' => 'The status is required.',
            'status.in' => 'The status must be PENDING, APPROVED, or REJECTED.',
            'approved_at.date' => 'The approved at must be a valid date.',
        ];
    }
}