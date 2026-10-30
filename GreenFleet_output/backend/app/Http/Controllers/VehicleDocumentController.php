<?php

namespace App\Http\Controllers;

use App\Http\Requests\VehicleDocument\CreateVehicleDocumentRequest;
use App\Http\Requests\VehicleDocument\UpdateVehicleDocumentRequest;
use App\Services\VehicleDocument\VehicleDocumentService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class VehicleDocumentController extends Controller
{
    public function __construct(
        private readonly VehicleDocumentService $vehicleDocumentService
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(
            $this->vehicleDocumentService->getAllVehicleDocuments(),
            'Vehicle documents retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->vehicleDocumentService->getVehicleDocumentById($id),
                'Vehicle document retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Vehicle document not found.',
                null,
                404
            );
        }
    }

    public function store(CreateVehicleDocumentRequest $request): JsonResponse
    {
        return $this->successResponse(
            $this->vehicleDocumentService->createVehicleDocument($request->validated()),
            'Vehicle document created successfully.',
            201
        );
    }

    public function update(UpdateVehicleDocumentRequest $request, int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->vehicleDocumentService->updateVehicleDocument(
                    $id,
                    $request->validated()
                ),
                'Vehicle document updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Vehicle document not found.',
                null,
                404
            );
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->vehicleDocumentService->deleteVehicleDocument($id);

            return $this->successResponse(
                null,
                'Vehicle document deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Vehicle document not found.',
                null,
                404
            );
        }
    }
}