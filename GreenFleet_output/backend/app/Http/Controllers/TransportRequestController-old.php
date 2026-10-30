<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransportRequest\CreateTransportRequestRequest;
use App\Http\Requests\TransportRequest\UpdateTransportRequestRequest;
use App\Services\TransportRequest\TransportRequestService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\TransportRequest;

class TransportRequestController extends Controller
{
    public function __construct(
        private readonly TransportRequestService $transportRequestService
    ) {}

    public function index(): JsonResponse
    {
        $requests = $this->transportRequestService->getAllRequests()->load([
            'requester.department',
            'requester.branch',
            'approvals',
            'assignment.driver',
            'assignment.vehicle'
        ]);

        $data = $requests->map(fn ($request) => $this->transformRequest($request));

        return $this->successResponse($data, 'Transport requests retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        try {
            $request = $this->transportRequestService->getRequestById($id);
            $request->load(['requester.department', 'requester.branch', 'approvals', 'assignment.driver', 'assignment.vehicle']);

            return $this->successResponse(
                $this->transformRequest($request),
                'Transport request retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Transport request not found.', null, 404);
        }
    }

    public function store(CreateTransportRequestRequest $request): JsonResponse
    {
        Log::info('Transport request store', [
            'validated' => $request->validated(),
            'user_id' => Auth::id(),
            'all_input' => $request->all(),
        ]);

        $created = $this->transportRequestService->createRequest($request->validated());
        $created->load(['requester.department', 'requester.branch', 'approvals', 'assignment.driver', 'assignment.vehicle']);

        return $this->successResponse(
            $this->transformRequest($created),
            'Transport request created successfully.',
            201
        );
    }

    public function update(UpdateTransportRequestRequest $request, int $id): JsonResponse
    {
        try {
            $updated = $this->transportRequestService->updateRequest($id, $request->validated());
            $updated->load(['requester.department', 'requester.branch', 'approvals', 'assignment.driver', 'assignment.vehicle']);

            return $this->successResponse(
                $this->transformRequest($updated),
                'Transport request updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Transport request not found.', null, 404);
        }
    }

    public function changeStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:PENDING,APPROVED,REJECTED,COMPLETED,CANCELLED',
        ]);

        try {
            return $this->successResponse(
                $this->transportRequestService->changeStatus($id, $validated['status']),
                'Transport request status updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Transport request not found.', null, 404);
        }
    }

    public function activeTrips()
    {
        $trips = TransportRequest::whereIn('status', ['IN_USE', 'ASSIGNED'])
            ->with(['requester', 'assignment.driver', 'assignment.vehicle'])
            ->get();

        $data = $trips->map(function ($trip) {
            $requester = $trip->requester;
            return [
                'id' => $trip->id,
                'status' => $trip->status,
                'user' => $requester ? [
                    'id' => $requester->id,
                    'first_name' => $requester->first_name,
                    'last_name' => $requester->last_name,
                    'name' => $requester->first_name . ' ' . $requester->last_name,
                ] : null,
                'driver' => $trip->assignment?->driver ? [
                    'id' => $trip->assignment->driver->id,
                    'name' => ($trip->assignment->driver->first_name ?? '') . ' ' . ($trip->assignment->driver->last_name ?? ''),
                ] : null,
                'vehicle' => $trip->assignment?->vehicle ? [
                    'id' => $trip->assignment->vehicle->id,
                    'plate' => $trip->assignment->vehicle->plate_number ?? $trip->assignment->vehicle->plate ?? null,
                ] : null,
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    private function transformRequest(TransportRequest $request): array
    {
        $requester = $request->requester;

        return [
            'id' => $request->id,
            'requester_id' => $request->requester_id,
            'branch_id' => $request->branch_id,
            'pickup_location' => $request->pickup_location,
            'destination' => $request->destination,
            'purpose' => $request->purpose,
            'departure_date' => $request->departure_date,
            'departure_time' => $request->departure_time,
            'passenger_count' => $request->passenger_count,
            'priority' => $request->priority,
            'status' => $request->status,
            'remarks' => $request->remarks,
            'created_at' => $request->created_at,
            'updated_at' => $request->updated_at,
            
            'user' => $requester ? [
                'id' => $requester->id,
                'first_name' => $requester->first_name,
                'last_name' => $requester->last_name,
                'name' => $requester->first_name . ' ' . $requester->last_name,
                'department' => $requester->department?->name,
                'branch' => $requester->branch?->name,
            ] : null,
            
            'staff_name' => $requester ? $requester->first_name . ' ' . $requester->last_name : null,
            'department' => $requester?->department?->name,
            'branch' => $requester?->branch?->name,
            
            'driver' => $request->assignment?->driver ? [
                'id' => $request->assignment->driver->id,
                'name' => ($request->assignment->driver->first_name ?? '') . ' ' . ($request->assignment->driver->last_name ?? ''),
                'phone' => $request->assignment->driver->phone ?? $request->assignment->driver->phone_number ?? null,
            ] : null,
            'driver_name' => $request->assignment?->driver 
                ? ($request->assignment->driver->first_name ?? '') . ' ' . ($request->assignment->driver->last_name ?? '')
                : null,
            'vehicle' => $request->assignment?->vehicle ? [
                'id' => $request->assignment->vehicle->id,
                'plate' => $request->assignment->vehicle->plate_number ?? $request->assignment->vehicle->plate ?? null,
                'plate_number' => $request->assignment->vehicle->plate_number ?? $request->assignment->vehicle->plate ?? null,
                'model' => $request->assignment->vehicle->vehicle_name ?? $request->assignment->vehicle->model ?? null,
                'color' => $request->assignment->vehicle->color ?? 'White',
            ] : null,
            'vehicle_plate' => $request->assignment?->vehicle?->plate_number ?? $request->assignment?->vehicle?->plate ?? null,
            
            'timeline_status' => $this->mapStatusToTimeline($request->status),
            'timelineStatus' => $this->mapStatusToTimeline($request->status),
        ];
    }

    private function mapStatusToTimeline(string $status): string
    {
        return match($status) {
            'PENDING' => 'Pending Review',
            'APPROVED' => 'Approved',
            'REJECTED' => 'Rejected',
            'ASSIGNED' => 'Driver Assigned',
            'IN_USE' => 'En Route',
            'COMPLETED' => 'Ride Completed',
            'CANCELLED' => 'Cancelled',
            default => $status,
        };
    }
}