<?php

namespace App\Http\Controllers;

use App\Http\Requests\Vehicle\CreateVehicleRequest;
use App\Http\Requests\Vehicle\UpdateVehicleRequest;
use App\Services\Vehicle\VehicleService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function __construct(
        private readonly VehicleService $vehicleService
    ) {}

    public function index(): JsonResponse
    {
        $vehicles = $this->vehicleService->getAllVehicles();

        $data = $vehicles->map(function ($vehicle) {
            return [
                'id' => $vehicle->id,
                'plate_number' => $vehicle->plate_number,
                'plate' => $vehicle->plate_number,
                'vehicle_name' => $vehicle->vehicle_name,
                'model' => $vehicle->model,
                'make' => $vehicle->make,
                'year' => $vehicle->year,
                'color' => $vehicle->color,
                'status' => $vehicle->status,
                'capacity' => $vehicle->capacity,
                'vehicle_type_id' => $vehicle->vehicle_type_id,
                'fuel_type_id' => $vehicle->fuel_type_id,
                'branch_id' => $vehicle->branch_id,
                'vehicleType' => $vehicle->vehicleType ? [
                    'id' => $vehicle->vehicleType->id,
                    'name' => $vehicle->vehicleType->name,
                ] : null,
                'fuelType' => $vehicle->fuelType ? [
                    'id' => $vehicle->fuelType->id,
                    'name' => $vehicle->fuelType->name,
                ] : null,
                'branch' => $vehicle->branch ? [
                    'id' => $vehicle->branch->id,
                    'name' => $vehicle->branch->name,
                    'branch_name' => $vehicle->branch->name,
                ] : null,
                'created_at' => $vehicle->created_at,
                'updated_at' => $vehicle->updated_at,
            ];
        });

        return $this->successResponse($data, 'Vehicles retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        try {
            $vehicle = $this->vehicleService->getVehicleById($id);

            $data = [
                'id' => $vehicle->id,
                'plate_number' => $vehicle->plate_number,
                'plate' => $vehicle->plate_number,
                'vehicle_name' => $vehicle->vehicle_name,
                'model' => $vehicle->model,
                'make' => $vehicle->make,
                'year' => $vehicle->year,
                'color' => $vehicle->color,
                'status' => $vehicle->status,
                'capacity' => $vehicle->capacity,
                'vehicle_type_id' => $vehicle->vehicle_type_id,
                'fuel_type_id' => $vehicle->fuel_type_id,
                'branch_id' => $vehicle->branch_id,
                'vehicleType' => $vehicle->vehicleType ? [
                    'id' => $vehicle->vehicleType->id,
                    'name' => $vehicle->vehicleType->name,
                ] : null,
                'fuelType' => $vehicle->fuelType ? [
                    'id' => $vehicle->fuelType->id,
                    'name' => $vehicle->fuelType->name,
                ] : null,
                'branch' => $vehicle->branch ? [
                    'id' => $vehicle->branch->id,
                    'name' => $vehicle->branch->name,
                    'branch_name' => $vehicle->branch->name,
                ] : null,
                'assignments' => $vehicle->assignments,
                'created_at' => $vehicle->created_at,
                'updated_at' => $vehicle->updated_at,
            ];

            return $this->successResponse($data, 'Vehicle retrieved successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Vehicle not found.', null, 404);
        }
    }

    public function store(CreateVehicleRequest $request): JsonResponse
    {
        return $this->successResponse(
            $this->vehicleService->createVehicle($request->validated()),
            'Vehicle created successfully.',
            201
        );
    }

    public function update(UpdateVehicleRequest $request, int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->vehicleService->updateVehicle($id, $request->validated()),
                'Vehicle updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Vehicle not found.', null, 404);
        }
    }

    public function changeStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:AVAILABLE,IN_USE,MAINTENANCE,OUT_OF_SERVICE',
        ]);

        try {
            return $this->successResponse(
                $this->vehicleService->changeStatus($id, $validated['status']),
                'Vehicle status updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Vehicle not found.', null, 404);
        }
    }
}