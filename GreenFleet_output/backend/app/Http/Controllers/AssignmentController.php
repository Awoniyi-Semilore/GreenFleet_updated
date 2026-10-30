<?php

namespace App\Http\Controllers;

use App\Http\Requests\Assignment\CreateAssignmentRequest;
use App\Http\Requests\Assignment\UpdateAssignmentRequest;
use App\Services\Assignment\AssignmentService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class AssignmentController extends Controller
{
    public function __construct(
        private readonly AssignmentService $assignmentService
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(
            $this->assignmentService->getAllAssignments(),
            'Assignments retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->assignmentService->getAssignmentById($id),
                'Assignment retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Assignment not found.',
                null,
                404
            );
        }
    }

    public function store(CreateAssignmentRequest $request): JsonResponse
    {
        return $this->successResponse(
            $this->assignmentService->createAssignment($request->validated()),
            'Assignment created successfully.',
            201
        );
    }

    public function update(UpdateAssignmentRequest $request, int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->assignmentService->updateAssignment(
                    $id,
                    $request->validated()
                ),
                'Assignment updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Assignment not found.',
                null,
                404
            );
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->assignmentService->deleteAssignment($id);

            return $this->successResponse(
                null,
                'Assignment deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Assignment not found.',
                null,
                404
            );
        }
    }
    
}