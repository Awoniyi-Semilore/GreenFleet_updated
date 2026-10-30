<?php

namespace App\Http\Controllers;

use App\Http\Requests\FuelLog\CreateFuelLogRequest;
use App\Http\Requests\FuelLog\UpdateFuelLogRequest;
use App\Services\FuelLog\FuelLogService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class FuelLogController extends Controller
{
    public function __construct(
        private readonly FuelLogService $fuelLogService
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(
            $this->fuelLogService->getAllFuelLogs(),
            'Fuel logs retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->fuelLogService->getFuelLogById($id),
                'Fuel log retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Fuel log not found.',
                null,
                404
            );
        }
    }

    public function store(CreateFuelLogRequest $request): JsonResponse
    {
        return $this->successResponse(
            $this->fuelLogService->createFuelLog($request->validated()),
            'Fuel log created successfully.',
            201
        );
    }

    public function update(UpdateFuelLogRequest $request, int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->fuelLogService->updateFuelLog(
                    $id,
                    $request->validated()
                ),
                'Fuel log updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Fuel log not found.',
                null,
                404
            );
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->fuelLogService->deleteFuelLog($id);

            return $this->successResponse(
                null,
                'Fuel log deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Fuel log not found.',
                null,
                404
            );
        }
    }
}