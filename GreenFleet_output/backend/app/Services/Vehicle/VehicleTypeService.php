<?php

namespace App\Services\Vehicle;

use App\Models\VehicleType;
use Illuminate\Database\Eloquent\Collection;

class VehicleTypeService
{
    public function getAll(): Collection
    {
        return VehicleType::orderBy('name')->get();
    }

    public function getById(int $id): VehicleType
    {
        return VehicleType::findOrFail($id);
    }

    public function create(array $data): VehicleType
    {
        return VehicleType::create($data);
    }

    public function update(int $id, array $data): VehicleType
    {
        $vehicleType = VehicleType::findOrFail($id);

        $vehicleType->update($data);

        return $vehicleType;
    }

    public function delete(int $id): void
    {
        $vehicleType = VehicleType::findOrFail($id);

        $vehicleType->delete();
    }
}