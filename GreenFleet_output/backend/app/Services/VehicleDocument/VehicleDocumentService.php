<?php

namespace App\Services\VehicleDocument;

use App\Models\VehicleDocument;
use Illuminate\Database\Eloquent\Collection;

class VehicleDocumentService
{
    public function getAllVehicleDocuments(): Collection
    {
        return VehicleDocument::with('vehicle')
            ->orderBy('expiry_date', 'asc')
            ->get();
    }

    public function getVehicleDocumentById(int $id): VehicleDocument
    {
        return VehicleDocument::with('vehicle')
            ->findOrFail($id);
    }

    public function createVehicleDocument(array $data): VehicleDocument
    {
        $vehicleDocument = VehicleDocument::create($data);

        return $vehicleDocument->load('vehicle');
    }

    public function updateVehicleDocument(int $id, array $data): VehicleDocument
    {
        $vehicleDocument = VehicleDocument::findOrFail($id);

        $vehicleDocument->update($data);

        return $vehicleDocument->load('vehicle');
    }

    public function deleteVehicleDocument(int $id): void
    {
        $vehicleDocument = VehicleDocument::findOrFail($id);

        $vehicleDocument->delete();
    }
}