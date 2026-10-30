<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    public function index(): JsonResponse
    {
        $complaints = Complaint::with(['driver', 'vehicle', 'transportRequest'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'submitted_by' => $c->submitted_by,
                    'submittedBy' => $c->submitted_by,
                    'driver_id' => $c->driver_id,
                    'driver' => $c->driver ? [
                        'id' => $c->driver->id,
                        'name' => $c->driver->first_name . ' ' . $c->driver->last_name,
                    ] : null,
                    'driver_name' => $c->driver ? $c->driver->first_name . ' ' . $c->driver->last_name : null,
                    'vehicle_id' => $c->vehicle_id,
                    'vehicle' => $c->vehicle ? [
                        'id' => $c->vehicle->id,
                        'plate_number' => $c->vehicle->plate_number,
                        'plate' => $c->vehicle->plate_number,
                    ] : null,
                    'type' => $c->type ?? $c->category,
                    'category' => $c->category ?? $c->type,
                    'comment' => $c->comment ?? $c->description,
                    'description' => $c->description ?? $c->comment,
                    'status' => $c->status,
                    'resolution_note' => $c->resolution_note,
                    'date' => $c->created_at->format('M j, Y'),
                    'created_at' => $c->created_at->format('M j, Y g:i A'),
                ];
            });

        return $this->successResponse($complaints, 'Complaints retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        try {
            $c = Complaint::with(['driver', 'vehicle', 'transportRequest'])->findOrFail($id);
            return $this->successResponse([
                'id' => $c->id,
                'submitted_by' => $c->submitted_by,
                'submittedBy' => $c->submitted_by,
                'driver' => $c->driver ? [
                    'id' => $c->driver->id,
                    'name' => $c->driver->first_name . ' ' . $c->driver->last_name,
                ] : null,
                'driver_name' => $c->driver ? $c->driver->first_name . ' ' . $c->driver->last_name : null,
                'vehicle' => $c->vehicle ? [
                    'id' => $c->vehicle->id,
                    'plate_number' => $c->vehicle->plate_number,
                    'plate' => $c->vehicle->plate_number,
                ] : null,
                'type' => $c->type ?? $c->category,
                'category' => $c->category ?? $c->type,
                'comment' => $c->comment ?? $c->description,
                'description' => $c->description ?? $c->comment,
                'status' => $c->status,
                'resolution_note' => $c->resolution_note,
                'date' => $c->created_at->format('M j, Y'),
                'created_at' => $c->created_at->format('M j, Y g:i A'),
            ], 'Complaint retrieved successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Complaint not found.', null, 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'transport_request_id' => 'nullable|exists:transport_requests,id',
            'submitted_by' => 'nullable|exists:users,id',
            'driver_id' => 'nullable|exists:drivers,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'type' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $complaint = Complaint::create([
            ...$validated,
            'status' => 'Open',
        ]);

        return $this->successResponse([
            'id' => $complaint->id,
            'type' => $complaint->type,
            'status' => $complaint->status,
        ], 'Complaint created successfully.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $complaint = Complaint::findOrFail($id);
            $validated = $request->validate([
                'type' => 'sometimes|string|max:255',
                'category' => 'sometimes|string|max:255',
                'comment' => 'sometimes|string',
                'description' => 'sometimes|string',
                'status' => 'sometimes|in:Open,Resolved',
                'resolution_note' => 'sometimes|string',
            ]);

            $complaint->update($validated);

            return $this->successResponse([
                'id' => $complaint->id,
                'status' => $complaint->status,
            ], 'Complaint updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Complaint not found.', null, 404);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $complaint = Complaint::findOrFail($id);
            $complaint->delete();
            return $this->successResponse(null, 'Complaint deleted successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Complaint not found.', null, 404);
        }
    }
}