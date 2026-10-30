<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments.
     */
    public function index(): JsonResponse
{
    try {
        $departments = Department::all();
        return response()->json($departments, 200);
    } catch (\Exception $e) {
        Log::error('Department index error: ' . $e->getMessage());
        return response()->json(['message' => 'Failed to retrieve departments.'], 500);
    }
}

    /**
     * Store a newly created department.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'department_name'    => 'required|string|max:255',
            'line_manager_name'  => 'nullable|string|max:255',
            'line_manager_email' => 'nullable|email|max:255',
            'line_manager_title' => 'nullable|string|max:255',
            'description'        => 'nullable|string',
        ]);

        try {
            $department = Department::create($validated);
            return response()->json($department, 201);
        } catch (\Exception $e) {
            Log::error('Department store error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create department.'], 500);
        }
    }

    /**
     * Update the specified department in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'department_name'    => 'required|string|max:255',
            'line_manager_name'  => 'nullable|string|max:255',
            'line_manager_email' => 'nullable|email|max:255',
            'line_manager_title' => 'nullable|string|max:255',
            'description'        => 'nullable|string',
        ]);

        try {
            $department = Department::findOrFail($id);
            $department->update($validated);

            return response()->json($department, 200);
        } catch (\Exception $e) {
            Log::error('Department update error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update department.'], 500);
        }
    }

    /**
     * Remove the specified department from storage.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $department = Department::findOrFail($id);
            $department->delete();

            return response()->json(['message' => 'Department deleted successfully.'], 200);
        } catch (\Exception $e) {
            Log::error('Department destroy error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete department.'], 500);
        }
    }
}