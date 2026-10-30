<?php

namespace App\Http\Controllers;

use App\Http\Requests\Approval\CreateApprovalRequest;
use App\Http\Requests\Approval\UpdateApprovalRequest;
use App\Services\Approval\ApprovalService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class ApprovalController extends Controller
{
    public function __construct(
        private readonly ApprovalService $approvalService
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(
            $this->approvalService->getAllApprovals(),
            'Approvals retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->approvalService->getApprovalById($id),
                'Approval retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Approval not found.',
                null,
                404
            );
        }
    }

    public function store(CreateApprovalRequest $request): JsonResponse
    {
        return $this->successResponse(
            $this->approvalService->createApproval($request->validated()),
            'Approval created successfully.',
            201
        );
    }

    public function update(UpdateApprovalRequest $request, int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->approvalService->updateApproval(
                    $id,
                    $request->validated()
                ),
                'Approval updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Approval not found.',
                null,
                404
            );
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->approvalService->deleteApproval($id);

            return $this->successResponse(
                null,
                'Approval deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Approval not found.',
                null,
                404
            );
        }
    }
}