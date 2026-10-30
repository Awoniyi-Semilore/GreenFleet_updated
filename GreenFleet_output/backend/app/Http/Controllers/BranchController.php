<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;

class BranchController extends Controller
{
    public function index(): JsonResponse
    {
        $branches = Branch::withCount([
                'vehicles',
                'drivers',
                // FIX: DB status is ASSIGNED not IN_USE
                'vehicles as current_trips_count' => fn ($q) => $q->where('status', 'ASSIGNED'),
            ])
            ->get()
            ->map(fn ($b) => $this->transformBranch($b));

        return $this->successResponse($branches, 'Branches retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        try {
            $branch = Branch::withCount([
                    'vehicles',
                    'drivers',
                    'vehicles as current_trips_count' => fn ($q) => $q->where('status', 'ASSIGNED'),
                ])
                ->findOrFail($id);

            return $this->successResponse($this->transformBranch($branch), 'Branch retrieved successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Branch not found.', null, 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255|unique:branches,name',
            // FIX: code is NOT NULL in DB but frontend never sends it — auto-generate
            'code'     => 'nullable|string|max:50|unique:branches,code',
            'location' => 'nullable|string|max:255',
            'address'  => 'nullable|string|max:500',
        ]);

        // Auto-generate code from name if not provided
        if (empty($validated['code'])) {
            $validated['code'] = $this->generateBranchCode($validated['name']);
        }

        $branch = Branch::create($validated);

        return $this->successResponse(
            $this->transformBranch($branch),
            'Branch created successfully.',
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $branch = Branch::findOrFail($id);

            $validated = $request->validate([
                'name'     => 'sometimes|string|max:255|unique:branches,name,' . $id,
                'code'     => 'nullable|string|max:50|unique:branches,code,' . $id,
                'location' => 'nullable|string|max:255',
                'address'  => 'nullable|string|max:500',
            ]);

            $branch->update($validated);

            return $this->successResponse(
                $this->transformBranch($branch->fresh(['vehicles', 'drivers'])),
                'Branch updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Branch not found.', null, 404);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $branch = Branch::findOrFail($id);

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

    /** Generate a short unique code from a branch name, e.g. "Victoria Island HQ" → "VIHQ" */
    private function generateBranchCode(string $name): string
    {
        // Take first letter of each word, uppercase
        $words = preg_split('/\s+/', trim($name));
        $code  = strtoupper(implode('', array_map(fn ($w) => $w[0] ?? '', $words)));

        // Ensure uniqueness
        $base    = $code;
        $counter = 1;
        while (Branch::where('code', $code)->exists()) {
            $code = $base . $counter++;
        }

        return $code;
    }

    private function transformBranch(Branch $branch): array
    {
        return [
            'id'            => $branch->id,
            'name'          => $branch->name,
            'branch_name'   => $branch->name,
            'code'          => $branch->code,
            'location'      => $branch->location ?? $branch->address,
            'address'       => $branch->address,
            'vehicle_count' => $branch->vehicles_count  ?? $branch->vehicles()->count(),
            'driver_count'  => $branch->drivers_count   ?? $branch->drivers()->count(),
            'current_trips' => $branch->current_trips_count ?? 0,
        ];
    }
}
