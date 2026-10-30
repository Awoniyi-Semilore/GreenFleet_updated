<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class BranchController extends Controller
{
    public function index(): JsonResponse
    {
        $branches = Branch::withCount([
                'vehicles', 
                'drivers',
                'vehicles as current_trips_count' => function ($q) {
                    $q->where('status', 'IN_USE');
                }
            ])
            ->get()
            ->map(function ($branch) {
                return [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'branch_name' => $branch->name,
                    'location' => $branch->location ?? $branch->address,
                    'address' => $branch->address,
                    'vehicle_count' => $branch->vehicles_count,
                    'driver_count' => $branch->drivers_count,
                    'current_trips' => $branch->current_trips_count ?? 0,
                ];
            });

        return $this->successResponse($branches, 'Branches retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        try {
            $branch = Branch::withCount([
                    'vehicles', 
                    'drivers',
                    'vehicles as current_trips_count' => function ($q) {
                        $q->where('status', 'IN_USE');
                    }
                ])
                ->findOrFail($id);

            return $this->successResponse([
                'id' => $branch->id,
                'name' => $branch->name,
                'branch_name' => $branch->name,
                'location' => $branch->location ?? $branch->address,
                'address' => $branch->address,
                'vehicle_count' => $branch->vehicles_count,
                'driver_count' => $branch->drivers_count,
                'current_trips' => $branch->current_trips_count ?? 0,
            ], 'Branch retrieved successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Branch not found.', null, 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:branches,name',
            'location' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
        ]);

        $branch = Branch::create($validated);

        return $this->successResponse([
            'id' => $branch->id,
            'name' => $branch->name,
            'branch_name' => $branch->name,
            'location' => $branch->location ?? $branch->address,
            'address' => $branch->address,
            'vehicle_count' => 0,
            'driver_count' => 0,
            'current_trips' => 0,
        ], 'Branch created successfully.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $branch = Branch::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255|unique:branches,name,' . $id,
                'location' => 'nullable|string|max:255',
                'address' => 'nullable|string|max:500',
            ]);

            $branch->update($validated);

            return $this->successResponse([
                'id' => $branch->id,
                'name' => $branch->name,
                'branch_name' => $branch->name,
                'location' => $branch->location ?? $branch->address,
                'address' => $branch->address,
                'vehicle_count' => $branch->vehicles()->count(),
                'driver_count' => $branch->drivers()->count(),
                'current_trips' => $branch->vehicles()->where('status', 'IN_USE')->count(),
            ], 'Branch updated successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Branch not found.', null, 404);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $branch = Branch::findOrFail($id);
            
            // Prevent deletion if branch has vehicles or drivers
            if ($branch->vehicles()->count() > 0 || $branch->drivers()->count() > 0) {
                return $this->errorResponse(
                    'Cannot delete branch with assigned vehicles or drivers. Reassign them first.',
                    null,
                    422
                );
            }

            $branch->delete();

            return $this->successResponse(null, 'Branch deleted successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Branch not found.', null, 404);
        }
    }
}
