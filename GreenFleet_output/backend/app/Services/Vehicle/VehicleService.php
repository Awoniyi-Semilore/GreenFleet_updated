<?php

namespace App\Services\Vehicle;

use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Collection;

class VehicleService
{
    public function getAllVehicles(): Collection
    {
        return Vehicle::with(['vehicleType', 'fuelType', 'branch'])
            ->orderBy('plate_number')
            ->get();
    }

    public function getVehicleById(int $id): Vehicle
    {
        return Vehicle::with(['vehicleType', 'fuelType', 'branch', 'assignments'])
            ->findOrFail($id);
    }

    public function createVehicle(array $data): Vehicle
    {
        if (!isset($data['status'])) {
            $data['status'] = 'AVAILABLE';
        }

        $vehicle = Vehicle::create($data);

        return $vehicle->load(['vehicleType', 'fuelType', 'branch']);
    }

    public function updateVehicle(int $id, array $data): Vehicle
    {
        $vehicle = Vehicle::findOrFail($id);

        $vehicle->update($data);

        return $vehicle->load(['vehicleType', 'fuelType', 'branch']);
    }

    public function changeStatus(int $id, ?string $status = null): Vehicle
    {
        $vehicle = Vehicle::findOrFail($id);

        if ($status) {
            $vehicle->status = $status;
        } else {
            $vehicle->status = $vehicle->status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        }

        $vehicle->save();

        return $vehicle->load(['vehicleType', 'fuelType', 'branch']);
    }
}