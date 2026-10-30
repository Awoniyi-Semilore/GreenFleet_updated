<?php

namespace App\Services\FuelType;

use App\Models\FuelType;
use Illuminate\Database\Eloquent\Collection;

class FuelTypeService
{
    public function getAll(): Collection
    {
        return FuelType::orderBy('name')->get();
    }

    public function getById(int $id): FuelType
    {
        return FuelType::findOrFail($id);
    }

    public function create(array $data): FuelType
    {
        return FuelType::create($data);
    }

    public function update(int $id, array $data): FuelType
    {
        $fuelType = FuelType::findOrFail($id);

        $fuelType->update($data);

        return $fuelType;
    }

    public function delete(int $id): void
    {
        $fuelType = FuelType::findOrFail($id);

        $fuelType->delete();
    }
}