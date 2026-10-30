<?php

namespace App\Http\Controllers;

use App\Http\Requests\VehicleType\CreateVehicleTypeRequest;
use App\Http\Requests\VehicleType\UpdateVehicleTypeRequest;
use App\Services\Vehicle\VehicleTypeService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class VehicleTypeController extends Controller
{
    public function __construct(
        private readonly VehicleTypeService $vehicleTypeService
    ) {}

    public function index(): JsonResponse
    {
        $vehicleTypes = $this->vehicleTypeService->getAll();

        return $this->successResponse(
            $vehicleTypes,
            'Vehicle types retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $vehicleType = $this->vehicleTypeService->getById($id);

            return $this->successResponse(
                $vehicleType,
                'Vehicle type retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Vehicle type not found.',
                null,
                404
            );
        }
    }

    public function store(CreateVehicleTypeRequest $request): JsonResponse
    {
        $vehicleType = $this->vehicleTypeService->create($request->validated());

        return $this->successResponse(
            $vehicleType,
            'Vehicle type created successfully.',
            201
        );
    }

    public function update(UpdateVehicleTypeRequest $request, int $id): JsonResponse
    {
        try {
            $vehicleType = $this->vehicleTypeService->update(
                $id,
                $request->validated()
            );

            return $this->successResponse(
                $vehicleType,
                'Vehicle type updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Vehicle type not found.',
                null,
                404
            );
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->vehicleTypeService->delete($id);

            return $this->successResponse(
                null,
                'Vehicle type deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Vehicle type not found.',
                null,
                404
            );
        }
    }
}