<?php

namespace App\Http\Controllers;

use App\Http\Requests\VehicleInspection\CreateVehicleInspectionRequest;
use App\Http\Requests\VehicleInspection\UpdateVehicleInspectionRequest;
use App\Services\VehicleInspection\VehicleInspectionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class VehicleInspectionController extends Controller
{
    public function __construct(
        private readonly VehicleInspectionService $vehicleInspectionService
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(
            $this->vehicleInspectionService->getAllVehicleInspections(),
            'Vehicle inspections retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->vehicleInspectionService->getVehicleInspectionById($id),
                'Vehicle inspection retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Vehicle inspection not found.',
                null,
                404
            );
        }
    }

    public function store(CreateVehicleInspectionRequest $request): JsonResponse
    {
        return $this->successResponse(
            $this->vehicleInspectionService->createVehicleInspection($request->validated()),
            'Vehicle inspection created successfully.',
            201
        );
    }

    public function update(UpdateVehicleInspectionRequest $request, int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->vehicleInspectionService->updateVehicleInspection(
                    $id,
                    $request->validated()
                ),
                'Vehicle inspection updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Vehicle inspection not found.',
                null,
                404
            );
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->vehicleInspectionService->deleteVehicleInspection($id);

            return $this->successResponse(
                null,
                'Vehicle inspection deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Vehicle inspection not found.',
                null,
                404
            );
        }
    }
}