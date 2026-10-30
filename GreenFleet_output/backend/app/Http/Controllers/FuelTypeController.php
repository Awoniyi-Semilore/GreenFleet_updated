<?php

namespace App\Http\Controllers;

use App\Http\Requests\FuelType\CreateFuelTypeRequest;
use App\Http\Requests\FuelType\UpdateFuelTypeRequest;
use App\Services\FuelType\FuelTypeService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class FuelTypeController extends Controller
{
    public function __construct(
        private readonly FuelTypeService $fuelTypeService
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(
            $this->fuelTypeService->getAll(),
            'Fuel types retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->fuelTypeService->getById($id),
                'Fuel type retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Fuel type not found.',
                null,
                404
            );
        }
    }

    public function store(CreateFuelTypeRequest $request): JsonResponse
    {
        return $this->successResponse(
            $this->fuelTypeService->create($request->validated()),
            'Fuel type created successfully.',
            201
        );
    }

    public function update(UpdateFuelTypeRequest $request, int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->fuelTypeService->update(
                    $id,
                    $request->validated()
                ),
                'Fuel type updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Fuel type not found.',
                null,
                404
            );
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->fuelTypeService->delete($id);

            return $this->successResponse(
                null,
                'Fuel type deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Fuel type not found.',
                null,
                404
            );
        }
    }
}