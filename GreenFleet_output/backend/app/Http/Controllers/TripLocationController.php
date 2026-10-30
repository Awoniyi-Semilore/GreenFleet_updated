<?php

namespace App\Http\Controllers;

use App\Models\TransportRequest;
use App\Models\TripLocation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TripLocationController extends Controller
{
    /**
     * Update the authenticated passenger/staff member's
     * current GPS location.
     */
    public function update(
        Request $request,
        int $id
    ): JsonResponse {
        $validated = $request->validate([
            'latitude' => [
                'required',
                'numeric',
                'between:-90,90',
            ],
            'longitude' => [
                'required',
                'numeric',
                'between:-180,180',
            ],
            'accuracy' => [
                'nullable',
                'numeric',
                'min:0',
            ],
        ]);

        $user = $request->user();

        $transportRequest = TransportRequest::with([
            'assignment',
        ])->findOrFail($id);

        /*
         * A request must have an assignment before
         * anyone can provide live vehicle location.
         */
        if (!$transportRequest->assignment_id) {
            return response()->json([
                'success' => false,
                'message' => 'This transport request does not have an active vehicle assignment.',
            ], 422);
        }

        /*
         * Only a passenger belonging to this assignment
         * can provide its location.
         */
        $isPassenger = $transportRequest
            ->assignment
            ->transportRequests()
            ->where(
                'requester_id',
                $user->id
            )
            ->exists();

        if (!$isPassenger) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a passenger on this vehicle assignment.',
            ], 403);
        }

        /*
         * Include IN_USE to support live updates while transit is underway.
         */
        $allowedStatuses = [
            'ASSIGNED',
            'DRIVER_SPOTTED',
            'BOARDED_WAITING',
            'IN_USE',
        ];

        if (!in_array(
            $transportRequest->status,
            $allowedStatuses,
            true
        )) {
            return response()->json([
                'success' => false,
                'message' => 'Live location is not available for this trip at its current stage.',
            ], 422);
        }

        /*
         * One current location record per staff member
         * per assignment.
         */
        $location = TripLocation::updateOrCreate(
            [
                'assignment_id' => $transportRequest->assignment_id,
                'staff_id' => $user->id,
            ],
            [
                'transport_request_id' => $transportRequest->id,
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'accuracy' => $validated['accuracy'] ?? null,
                'is_active' => true,
                'last_updated_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully.',
            'data' => $location,
        ]);
    }

    /**
     * Get the current live location for a transport request.
     */
    public function show(
        Request $request,
        int $id
    ): JsonResponse {
        $user = $request->user();

        $transportRequest = TransportRequest::with([
            'assignment.driver.user',
            'assignment.vehicle',
        ])->findOrFail($id);

        if (!$transportRequest->assignment_id) {
            return response()->json([
                'success' => true,
                'data' => null,
                'location_status' => 'NOT_SHARED',
                'message' => 'No vehicle assignment exists for this trip.',
                'sharing_summary' => [
                    'total_passengers' => 0,
                    'active_count' => 0,
                ],
            ]);
        }

        $isPassenger = $transportRequest
            ->assignment
            ->transportRequests()
            ->where(
                'requester_id',
                $user->id
            )
            ->exists();

        if (!$isPassenger) {
            $role = strtoupper(
                (string) (
                    $user->role
                    ?? $user->role_name
                    ?? ''
                )
            );

            $adminRoles = [
                'ADMIN',
                'TRANSPORT_ADMIN',
                'SUPER_ADMIN',
            ];

            if (!in_array($role, $adminRoles, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorised to view this trip location.',
                ], 403);
            }
        }

        $passengerIds = $transportRequest
            ->assignment
            ->transportRequests()
            ->pluck('requester_id')
            ->filter()
            ->unique()
            ->values();

        $totalPassengers = $passengerIds->count();

        $recentLocations = TripLocation::with([
            'staff:id,first_name,last_name',
        ])
            ->where('assignment_id', $transportRequest->assignment_id)
            ->where('is_active', true)
            ->where('last_updated_at', '>=', now()->subSeconds(90))
            ->orderByDesc('last_updated_at')
            ->get();

        $location = $recentLocations->first();

        if ($location) {
            return response()->json([
                'success' => true,
                'data' => [
                    'latitude' => $location->latitude,
                    'longitude' => $location->longitude,
                    'accuracy' => $location->accuracy,
                    'last_updated_at' => $location->last_updated_at,
                    'source_staff' => [
                        'id' => $location->staff?->id,
                        'name' => trim(
                            ($location->staff?->first_name ?? '') .
                            ' ' .
                            ($location->staff?->last_name ?? '')
                        ),
                    ],
                    'vehicle' => [
                        'id' => $transportRequest->assignment?->vehicle?->id,
                        'plate_number' => $transportRequest->assignment?->vehicle?->plate_number,
                    ],
                    'driver' => [
                        'id' => $transportRequest->assignment?->driver?->id,
                        'name' => trim(
                            ($transportRequest->assignment?->driver?->user?->first_name ?? '') .
                            ' ' .
                            ($transportRequest->assignment?->driver?->user?->last_name ?? '')
                        ),
                    ],
                ],
                'location_status' => 'LIVE',
                'message' => 'Live vehicle location is available.',
                'sharing_summary' => [
                    'total_passengers' => $totalPassengers,
                    'active_count' => $recentLocations->pluck('staff_id')->unique()->count(),
                ],
            ]);
        }

        $anyLocationRecordExists = TripLocation::where(
            'assignment_id',
            $transportRequest->assignment_id
        )->exists();

        $hasRecentButInactiveLocation = TripLocation::where(
            'assignment_id',
            $transportRequest->assignment_id
        )
            ->where('last_updated_at', '>=', now()->subSeconds(90))
            ->exists();

        if ($hasRecentButInactiveLocation) {
            return response()->json([
                'success' => true,
                'data' => null,
                'location_status' => 'SHARING_STOPPED',
                'message' => 'Live location sharing has been stopped by the passenger.',
                'sharing_summary' => [
                    'total_passengers' => $totalPassengers,
                    'active_count' => 0,
                ],
            ]);
        }

        if ($anyLocationRecordExists) {
            return response()->json([
                'success' => true,
                'data' => null,
                'location_status' => 'LOCATION_STALE',
                'message' => 'The previously shared vehicle location is no longer recent enough to display as live.',
                'sharing_summary' => [
                    'total_passengers' => $totalPassengers,
                    'active_count' => 0,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => null,
            'location_status' => 'NOT_SHARED',
            'message' => 'No passenger has enabled live location yet.',
            'sharing_summary' => [
                'total_passengers' => $totalPassengers,
                'active_count' => 0,
            ],
        ]);
    }

    /**
     * Stop the authenticated passenger's location sharing.
     */
    public function stop(
        Request $request,
        int $id
    ): JsonResponse {
        $user = $request->user();

        $transportRequest = TransportRequest::findOrFail($id);

        if (!$transportRequest->assignment_id) {
            return response()->json([
                'success' => true,
                'message' => 'No active vehicle assignment exists.',
            ]);
        }

        $location = TripLocation::where(
            'assignment_id',
            $transportRequest->assignment_id
        )
            ->where('staff_id', $user->id)
            ->first();

        if ($location) {
            $location->update([
                'is_active' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Location sharing stopped.',
        ]);
    }
}
