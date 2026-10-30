<?php

namespace App\Services\VehicleInspection;

use App\Models\VehicleInspection;
use Illuminate\Database\Eloquent\Collection;

class VehicleInspectionService
{
    public function getAllVehicleInspections(): Collection
    {
        return VehicleInspection::with('vehicle')
            ->orderBy('inspection_date', 'desc')
            ->get();
    }

    public function getVehicleInspectionById(int $id): VehicleInspection
    {
        return VehicleInspection::with('vehicle')
            ->findOrFail($id);
    }

    public function createVehicleInspection(array $data): VehicleInspection
    {
        $vehicleInspection = VehicleInspection::create($data);

        return $vehicleInspection->load('vehicle');
    }

    public function updateVehicleInspection(int $id, array $data): VehicleInspection
    {
        $vehicleInspection = VehicleInspection::findOrFail($id);

        $vehicleInspection->update($data);

        return $vehicleInspection->load('vehicle');
    }

    public function deleteVehicleInspection(int $id): void
    {
        $vehicleInspection = VehicleInspection::findOrFail($id);

        $vehicleInspection->delete();
    }
}