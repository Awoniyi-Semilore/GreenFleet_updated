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
        return $this->successResponse(
            $vehicles->map(fn ($v) => $this->transform($v)),
            'Vehicles retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $vehicle = $this->vehicleService->getVehicleById($id);
            return $this->successResponse(
                array_merge($this->transform($vehicle), ['assignments' => $vehicle->assignments]),
                'Vehicle retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Vehicle not found.', null, 404);
        }
    }

    public function store(CreateVehicleRequest $request): JsonResponse
    {
        // FIX: strip vehicle_name from payload if frontend sent it — column doesn't exist in DB.
        // Derive a display name from make + model instead.
        $data = $request->validated();
        unset($data['vehicle_name']);

        $vehicle = $this->vehicleService->createVehicle($data);
        return $this->successResponse($this->transform($vehicle), 'Vehicle created successfully.', 201);
    }

    public function update(UpdateVehicleRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            unset($data['vehicle_name']);

            $vehicle = $this->vehicleService->updateVehicle($id, $data);
            return $this->successResponse($this->transform($vehicle), 'Vehicle updated successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Vehicle not found.', null, 404);
        }
    }

    public function changeStatus(Request $request, int $id): JsonResponse
    {
        // FIX: enum is AVAILABLE,ASSIGNED,MAINTENANCE,OUT_OF_SERVICE — not IN_USE
        $validated = $request->validate([
            'status' => 'required|in:AVAILABLE,ASSIGNED,MAINTENANCE,OUT_OF_SERVICE',
        ]);

        try {
            $vehicle = $this->vehicleService->changeStatus($id, $validated['status']);
            return $this->successResponse($this->transform($vehicle), 'Vehicle status updated successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Vehicle not found.', null, 404);
        }
    }

    /** Build the response shape the frontend expects, including vehicle_name alias. */
    private function transform($vehicle): array
    {
        // FIX: vehicle_name doesn't exist in DB — synthesise it from make + model
        $vehicleName = trim(($vehicle->make ?? '') . ' ' . ($vehicle->model ?? '')) ?: ($vehicle->plate_number ?? '—');

        return [
            'id'              => $vehicle->id,
            'plate_number'    => $vehicle->plate_number,
            'plate'           => $vehicle->plate_number,
            // Provide vehicle_name alias so frontend code still works
            'vehicle_name'    => $vehicleName,
            'make'            => $vehicle->make,
            'model'           => $vehicle->model,
            'year'            => $vehicle->year,
            'color'           => $vehicle->color,
            'status'          => $vehicle->status,
            'capacity'        => $vehicle->capacity,
            'vehicle_type_id' => $vehicle->vehicle_type_id,
            'fuel_type_id'    => $vehicle->fuel_type_id,
            'branch_id'       => $vehicle->branch_id,
            'vehicleType'     => $vehicle->vehicleType
                ? ['id' => $vehicle->vehicleType->id, 'name' => $vehicle->vehicleType->name]
                : null,
            'fuelType'        => $vehicle->fuelType
                ? ['id' => $vehicle->fuelType->id, 'name' => $vehicle->fuelType->name]
                : null,
            'branch'          => $vehicle->branch
                ? ['id' => $vehicle->branch->id, 'name' => $vehicle->branch->name, 'branch_name' => $vehicle->branch->name]
                : null,
            'created_at'      => $vehicle->created_at,
            'updated_at'      => $vehicle->updated_at,
        ];
    }
}
