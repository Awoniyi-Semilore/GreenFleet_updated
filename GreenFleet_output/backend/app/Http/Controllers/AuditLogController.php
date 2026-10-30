<?php

namespace App\Http\Controllers;

use App\Http\Requests\AuditLog\CreateAuditLogRequest;
use App\Http\Requests\AuditLog\UpdateAuditLogRequest;
use App\Services\AuditLog\AuditLogService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(
            $this->auditLogService->getAllAuditLogs(),
            'Audit logs retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->auditLogService->getAuditLogById($id),
                'Audit log retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Audit log not found.',
                null,
                404
            );
        }
    }

    public function store(CreateAuditLogRequest $request): JsonResponse
    {
        return $this->successResponse(
            $this->auditLogService->createAuditLog($request->validated()),
            'Audit log created successfully.',
            201
        );
    }

    public function update(UpdateAuditLogRequest $request, int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->auditLogService->updateAuditLog(
                    $id,
                    $request->validated()
                ),
                'Audit log updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Audit log not found.',
                null,
                404
            );
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->auditLogService->deleteAuditLog($id);

            return $this->successResponse(
                null,
                'Audit log deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Audit log not found.',
                null,
                404
            );
        }
    }
}