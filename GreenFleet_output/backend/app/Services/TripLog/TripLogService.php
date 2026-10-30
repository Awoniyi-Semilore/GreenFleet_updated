<?php

namespace App\Services\TripLog;

use App\Models\TripLog;
use Illuminate\Database\Eloquent\Collection;

class TripLogService
{
    public function getAllTripLogs(): Collection
    {
        return TripLog::with(['transportRequest', 'assignment', 'vehicle', 'driver'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getTripLogById(int $id): TripLog
    {
        return TripLog::with(['transportRequest', 'assignment', 'vehicle', 'driver'])
            ->findOrFail($id);
    }

    public function createTripLog(array $data): TripLog
    {
        $tripLog = TripLog::create($data);

        return $tripLog->load(['transportRequest', 'assignment', 'vehicle', 'driver']);
    }

    public function updateTripLog(int $id, array $data): TripLog
    {
        $tripLog = TripLog::findOrFail($id);

        $tripLog->update($data);

        return $tripLog->load(['transportRequest', 'assignment', 'vehicle', 'driver']);
    }

    public function deleteTripLog(int $id): void
    {
        $tripLog = TripLog::findOrFail($id);

        $tripLog->delete();
    }
}