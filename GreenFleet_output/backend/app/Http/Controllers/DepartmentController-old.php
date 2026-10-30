<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        return $this->successResponse(
            Department::all(),
            'Departments retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $department = Department::findOrFail($id);
        return $this->successResponse(
            $department,
            'Department retrieved successfully.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'department_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $department = Department::create($validated);

        return $this->successResponse(
            $department,
            'Department created successfully.',
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $department = Department::findOrFail($id);
        
        $validated = $request->validate([
            'department_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $department->update($validated);

        return $this->successResponse(
            $department,
            'Department updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $department = Department::findOrFail($id);
        $department->delete();

        return $this->successResponse(
            null,
            'Department deleted successfully.'
        );
    }
}