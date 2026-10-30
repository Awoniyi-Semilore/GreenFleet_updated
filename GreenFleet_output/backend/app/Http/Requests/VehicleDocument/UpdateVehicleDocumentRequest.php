<?php

namespace App\Http\Requests\VehicleDocument;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVehicleDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['sometimes', 'required', 'exists:vehicles,id'],
            'document_name' => ['sometimes', 'required', 'string', 'max:255'],
            'file_path' => ['sometimes', 'required', 'string', 'max:255'],
            'expiry_date' => ['sometimes', 'required', 'date'],
            'status' => ['sometimes', 'required', 'in:VALID,EXPIRED,PENDING_RENEWAL'],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_id.required' => 'The vehicle is required.',
            'vehicle_id.exists' => 'The selected vehicle is invalid.',
            'document_name.required' => 'The document name is required.',
            'document_name.max' => 'The document name may not be greater than 255 characters.',
            'file_path.required' => 'The file path is required.',
            'file_path.max' => 'The file path may not be greater than 255 characters.',
            'expiry_date.required' => 'The expiry date is required.',
            'expiry_date.date' => 'The expiry date must be a valid date.',
            'status.required' => 'The status is required.',
            'status.in' => 'The status must be VALID, EXPIRED, or PENDING_RENEWAL.',
        ];
    }
}