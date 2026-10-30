<?php

namespace App\Http\Controllers;

use App\Http\Requests\Driver\CreateDriverRequest;
use App\Http\Requests\Driver\UpdateDriverRequest;
use App\Services\Driver\DriverService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class DriverController extends Controller
{
    public function __construct(
        private readonly DriverService $driverService
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(
            $this->driverService->getAllDrivers(),
            'Drivers retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->driverService->getDriverById($id),
                'Driver retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Driver not found.',
                null,
                404
            );
        }
    }

    public function store(CreateDriverRequest $request): JsonResponse
    {
        return $this->successResponse(
            $this->driverService->createDriver($request->validated()),
            'Driver created successfully.',
            201
        );
    }

    public function update(UpdateDriverRequest $request, int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->driverService->updateDriver(
                    $id,
                    $request->validated()
                ),
                'Driver updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Driver not found.',
                null,
                404
            );
        }
    }

    public function changeStatus(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->driverService->changeStatus($id),
                'Driver status updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Driver not found.',
                null,
                404
            );
        }
    }
}