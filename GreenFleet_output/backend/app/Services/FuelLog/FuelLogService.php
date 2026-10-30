<?php

namespace App\Services\FuelLog;

use App\Models\FuelLog;
use Illuminate\Database\Eloquent\Collection;

class FuelLogService
{
    public function getAllFuelLogs(): Collection
    {
        return FuelLog::with(['vehicle', 'fuelType'])
            ->orderBy('fuel_date', 'desc')
            ->get();
    }

    public function getFuelLogById(int $id): FuelLog
    {
        return FuelLog::with(['vehicle', 'fuelType'])
            ->findOrFail($id);
    }

    public function createFuelLog(array $data): FuelLog
    {
        $fuelLog = FuelLog::create($data);

        return $fuelLog->load(['vehicle', 'fuelType']);
    }

    public function updateFuelLog(int $id, array $data): FuelLog
    {
        $fuelLog = FuelLog::findOrFail($id);

        $fuelLog->update($data);

        return $fuelLog->load(['vehicle', 'fuelType']);
    }

    public function deleteFuelLog(int $id): void
    {
        $fuelLog = FuelLog::findOrFail($id);

        $fuelLog->delete();
    }
}