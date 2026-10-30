<?php

namespace App\Services\Driver;

use App\Models\Driver;
use Illuminate\Database\Eloquent\Collection;

class DriverService
{
    public function getAllDrivers(): Collection
    {
        return Driver::with('user')
            ->orderBy('license_number')
            ->get();
    }

    public function getDriverById(int $id): Driver
    {
        return Driver::with('user')
            ->findOrFail($id);
    }

    public function createDriver(array $data): Driver
    {
        $driver = Driver::create($data);

        return $driver->load('user');
    }

    public function updateDriver(int $id, array $data): Driver
    {
        $driver = Driver::findOrFail($id);

        $driver->update($data);

        return $driver->load('user');
    }

    public function changeStatus(int $id): Driver
    {
        $driver = Driver::findOrFail($id);

        $driver->status = $driver->status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        $driver->save();

        return $driver->load('user');
    }
}