<?php

namespace App\Http\Controllers;

use App\Http\Requests\MaintenanceRecord\CreateMaintenanceRecordRequest;
use App\Http\Requests\MaintenanceRecord\UpdateMaintenanceRecordRequest;
use App\Services\MaintenanceRecord\MaintenanceRecordService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class MaintenanceRecordController extends Controller
{
    public function __construct(
        private readonly MaintenanceRecordService $maintenanceRecordService
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(
            $this->maintenanceRecordService->getAllMaintenanceRecords(),
            'Maintenance records retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->maintenanceRecordService->getMaintenanceRecordById($id),
                'Maintenance record retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Maintenance record not found.',
                null,
                404
            );
        }
    }

    public function store(CreateMaintenanceRecordRequest $request): JsonResponse
    {
        return $this->successResponse(
            $this->maintenanceRecordService->createMaintenanceRecord($request->validated()),
            'Maintenance record created successfully.',
            201
        );
    }

    public function update(UpdateMaintenanceRecordRequest $request, int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->maintenanceRecordService->updateMaintenanceRecord(
                    $id,
                    $request->validated()
                ),
                'Maintenance record updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Maintenance record not found.',
                null,
                404
            );
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->maintenanceRecordService->deleteMaintenanceRecord($id);

            return $this->successResponse(
                null,
                'Maintenance record deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Maintenance record not found.',
                null,
                404
            );
        }
    }
}