<?php

namespace App\Services\MaintenanceRecord;

use App\Models\MaintenanceRecord;
use Illuminate\Database\Eloquent\Collection;

class MaintenanceRecordService
{
    public function getAllMaintenanceRecords(): Collection
    {
        return MaintenanceRecord::with(['vehicle'])
            ->orderBy('service_date', 'desc')
            ->get();
    }

    public function getMaintenanceRecordById(int $id): MaintenanceRecord
    {
        return MaintenanceRecord::with(['vehicle'])
            ->findOrFail($id);
    }

    public function createMaintenanceRecord(array $data): MaintenanceRecord
    {
        $maintenanceRecord = MaintenanceRecord::create($data);

        return $maintenanceRecord->load(['vehicle']);
    }

    public function updateMaintenanceRecord(int $id, array $data): MaintenanceRecord
    {
        $maintenanceRecord = MaintenanceRecord::findOrFail($id);

        $maintenanceRecord->update($data);

        return $maintenanceRecord->load(['vehicle']);
    }

    public function deleteMaintenanceRecord(int $id): void
    {
        $maintenanceRecord = MaintenanceRecord::findOrFail($id);

        $maintenanceRecord->delete();
    }
}