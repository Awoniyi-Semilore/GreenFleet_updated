<?php

namespace App\Http\Controllers;

use App\Mail\LineManagerApprovalMail;
use App\Mail\TransportTeamNotificationMail;
use App\Models\Assignment;
use App\Models\Department;
use App\Models\Setting;
use App\Models\TransportRequest;
use App\Models\TripLocation;
use App\Services\Email\EmailService;
use App\Services\TransportRequest\TransportRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class TransportRequestController extends Controller
{
    protected TransportRequestService $transportRequestService;

    protected EmailService $emailService;

    public function __construct(
        TransportRequestService $transportRequestService,
        EmailService $emailService
    ) {
        $this->transportRequestService = $transportRequestService;
        $this->emailService = $emailService;
    }


    /*
    |--------------------------------------------------------------------------
    | Index
    |--------------------------------------------------------------------------
    */

    public function index(): JsonResponse
    {
        $requests = $this->transportRequestService
            ->getAllRequests();

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Active Trips
    |--------------------------------------------------------------------------
    */

    public function activeTrips(): JsonResponse
    {
        $requests = $this->transportRequestService
            ->getActiveTrips();

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Store
    |--------------------------------------------------------------------------
    */

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => [
                'required',
                'exists:departments,id',
            ],

            'pickup_location' => [
                'required',
                'string',
            ],

            'destination' => [
                'required',
                'string',
            ],

            'purpose' => [
                'required',
                'string',
            ],

            'departure_date' => [
                'required',
                'date',
            ],

            'departure_time' => [
                'required',
            ],

            'passenger_count' => [
                'required',
                'integer',
                'min:1',
            ],

            'priority' => [
                'nullable',
                'string',
                'in:LOW,NORMAL,HIGH,URGENT',
            ],

            'remarks' => [
                'nullable',
                'string',
            ],
        ]);

        $department = Department::findOrFail(
            $validated['department_id']
        );

        $initialStatus = !empty(
            $department->line_manager_email
        )
            ? 'PENDING_LINE_MANAGER'
            : 'PENDING_ADMIN';

        $user = Auth::user();

        $transportRequest = TransportRequest::create([
            'requester_id' => $user->id,

            'branch_id' => $user->branch_id,

            'line_manager_email' =>
                $department->line_manager_email,

            'pickup_location' =>
                $validated['pickup_location'],

            'destination' =>
                $validated['destination'],

            'purpose' =>
                $validated['purpose'],

            'departure_date' =>
                $validated['departure_date'],

            'departure_time' =>
                $validated['departure_time'],

            'passenger_count' =>
                $validated['passenger_count'],

            'priority' =>
                $validated['priority'] ?? 'NORMAL',

            'remarks' =>
                $validated['remarks'] ?? null,

            'status' =>
                $initialStatus,
        ]);

        $transportRequest->load([
            'requester',
            'requester.department',
            'assignment',
        ]);

        /*
         * Send line-manager approval email.
         */
        if ($department->line_manager_email) {
            try {
                Mail::to(
                    $department->line_manager_email
                )->send(
                    new LineManagerApprovalMail(
                        $transportRequest
                    )
                );
            } catch (\Throwable $e) {
                Log::error(
                    'Failed sending line manager email.',
                    [
                        'request_id' =>
                            $transportRequest->id,

                        'recipient' =>
                            $department->line_manager_email,

                        'error' =>
                            $e->getMessage(),
                    ]
                );

                return response()->json([
                    'success' => false,

                    'message' =>
                        'Request was created, but the approval email could not be sent.',

                    'error' =>
                        config('app.debug')
                            ? $e->getMessage()
                            : null,

                    'data' =>
                        $transportRequest,
                ], 500);
            }
        }

        return response()->json([
            'success' => true,

            'message' =>
                'Request submitted successfully.',

            'data' =>
                $transportRequest,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | Show
    |--------------------------------------------------------------------------
    */

    public function show(int $id): JsonResponse
    {
        $transportRequest =
            $this->transportRequestService
                ->getRequestById($id);

        return response()->json([
            'success' => true,
            'data' => $transportRequest,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Approve / Assign
    |--------------------------------------------------------------------------
    */

    public function approve(
        Request $request,
        int $id
    ): JsonResponse {
        $validated = $request->validate([
            'driver_id' => [
                'nullable',
                'exists:drivers,id',
            ],

            'vehicle_id' => [
                'nullable',
                'exists:vehicles,id',
            ],

            'remarks' => [
                'nullable',
                'string',
            ],
        ]);

        $transportRequest =
            TransportRequest::with([
                'requester',
            ])->findOrFail($id);

        /*
         * Driver and vehicle must be selected together
         * for an actual assignment.
         */
        if (
            !empty($validated['driver_id']) &&
            !empty($validated['vehicle_id'])
        ) {
            $assignment = Assignment::create([
                'driver_id' =>
                    $validated['driver_id'],

                'vehicle_id' =>
                    $validated['vehicle_id'],

                'assigned_by' =>
                    Auth::id(),

                'assigned_at' =>
                    now(),

                'status' =>
                    'ASSIGNED',

                'remarks' =>
                    $validated['remarks'] ?? null,
            ]);

            $transportRequest->assignment_id =
                $assignment->id;

            $transportRequest->status =
                'ASSIGNED';
        } else {
            $transportRequest->status =
                'APPROVED';
        }

        if (!empty($validated['remarks'])) {
            $transportRequest->remarks =
                $validated['remarks'];
        }

        $transportRequest->save();

        $transportRequest->load([
            'requester',
            'assignment.driver.user',
            'assignment.vehicle',
        ]);

        /*
         * Send approval email to requester.
         */
        try {
            $requester =
                $transportRequest->requester;

            $driver =
                $transportRequest
                    ->assignment
                    ?->driver;

            $vehicle =
                $transportRequest
                    ->assignment
                    ?->vehicle;

            if (
                $requester &&
                $driver &&
                $vehicle
            ) {
                $this->emailService
                    ->sendRequestApproved(
                        $requester,
                        $transportRequest,
                        $driver,
                        $vehicle
                    );
            } elseif (
                $requester &&
                $requester->email
            ) {
                Mail::send(
                    [],
                    [],
                    function ($msg) use (
                        $requester,
                        $transportRequest
                    ) {
                        $msg
                            ->to($requester->email)
                            ->subject(
                                "GreenFleet — Transport Request #{$transportRequest->id} Approved"
                            )
                            ->html(
                                "<p>Hi {$requester->first_name},</p>" .
                                "<p>Your transport request #{$transportRequest->id} to <strong>{$transportRequest->destination}</strong> has been approved by the Transport Team.</p>" .
                                "<p>You will receive driver and vehicle details shortly.</p>" .
                                "<p>— GreenFleet</p>"
                            );
                    }
                );
            }
        } catch (\Throwable $e) {
            Log::error(
                'Failed sending approval email.',
                [
                    'request_id' =>
                        $transportRequest->id,

                    'error' =>
                        $e->getMessage(),
                ]
            );
        }

        return response()->json([
            'success' => true,

            'message' =>
                "Request #{$id} approved successfully.",

            'data' =>
                $transportRequest,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Change Status
    |--------------------------------------------------------------------------
    */

    public function changeStatus(
        Request $request,
        int $id
    ): JsonResponse {
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                'in:PENDING,PENDING_LINE_MANAGER,PENDING_ADMIN,APPROVED,REJECTED,ASSIGNED,DRIVER_SPOTTED,BOARDED_WAITING,COMPLETED,CANCELLED',
            ],

            'reason' => [
                'nullable',
                'string',
            ],
        ]);

        $transportRequest =
            TransportRequest::with([
                'requester',
            ])->findOrFail($id);

        $transportRequest->status =
            $validated['status'];

        if (
            !empty($validated['reason'])
        ) {
            $transportRequest->rejection_reason =
                $validated['reason'];
        }

        $transportRequest->save();

        /*
         * If the trip has ended, deactivate
         * every location source belonging to
         * the assignment.
         */
        if (
            in_array(
                $validated['status'],
                [
                    'COMPLETED',
                    'CANCELLED',
                    'REJECTED',
                ],
                true
            ) &&
            $transportRequest->assignment_id
        ) {
            TripLocation::where(
                'assignment_id',
                $transportRequest->assignment_id
            )->update([
                'is_active' => false,
            ]);
        }

        /*
         * Send rejection email.
         */
        if (
            $validated['status'] === 'REJECTED'
        ) {
            try {
                $requester =
                    $transportRequest->requester;

                if ($requester) {
                    $this->emailService
                        ->sendRequestRejected(
                            $requester,
                            $transportRequest,
                            $validated['reason']
                                ?? 'No reason provided.'
                        );
                }
            } catch (\Throwable $e) {
                Log::error(
                    'Failed sending rejection email.',
                    [
                        'request_id' =>
                            $transportRequest->id,

                        'error' =>
                            $e->getMessage(),
                    ]
                );
            }
        }

        return response()->json([
            'success' => true,

            'message' =>
                "Status updated to {$validated['status']}.",

            'data' =>
                $transportRequest->fresh([
                    'requester',
                    'assignment',
                ]),
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Confirm Arrival
    |--------------------------------------------------------------------------
    */

    public function confirmArrival(
        Request $request,
        int $id
    ): JsonResponse {
        $transportRequest =
            TransportRequest::with([
                'assignment',
            ])->findOrFail($id);

        $transportRequest->status =
            'COMPLETED';

        $transportRequest->save();

        /*
         * The trip is finished.
         *
         * Stop every passenger/staff GPS source
         * associated with this assignment.
         */
        if (
            $transportRequest->assignment_id
        ) {
            TripLocation::where(
                'assignment_id',
                $transportRequest->assignment_id
            )->update([
                'is_active' => false,
            ]);
        }

        return response()->json([
            'success' => true,

            'message' =>
                'Arrival confirmed successfully.',

            'data' =>
                $transportRequest->fresh([
                    'assignment',
                ]),
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Spot Driver
    |--------------------------------------------------------------------------
    */

    public function spotDriver(
        int $id
    ): JsonResponse {
        $transportRequest =
            TransportRequest::findOrFail($id);

        if (
            $transportRequest->status !== 'ASSIGNED'
        ) {
            return response()->json([
                'success' => false,

                'message' =>
                    'The driver can only be marked as spotted after the trip has been assigned.',
            ], 422);
        }

        $transportRequest->status =
            'DRIVER_SPOTTED';

        $transportRequest->save();

        return response()->json([
            'success' => true,

            'message' =>
                'Driver spotted successfully.',

            'data' =>
                $transportRequest->fresh([
                    'requester',
                    'assignment.driver.user',
                    'assignment.vehicle',
                ]),
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Board Vehicle
    |--------------------------------------------------------------------------
    */

    public function boardVehicle(
        int $id
    ): JsonResponse {
        $transportRequest =
            $this->transportRequestService
                ->boardVehicle($id);

        return response()->json([
            'success' => true,

            'message' =>
                'Vehicle boarded successfully.',

            'data' =>
                $transportRequest,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Legacy Public Action
    |--------------------------------------------------------------------------
    */

    public function approveAction(
        Request $request,
        int $id
    ) {
        /*
         * Keep this endpoint for older email links.
         *
         * It simply forwards into the same action handler.
         */
        return $this->handleLineManagerAction(
            $request,
            $id
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Signed Line Manager Action
    |--------------------------------------------------------------------------
    */

    public function handleLineManagerAction(
        Request $request,
        int $id
    ) {
        $transportRequest =
            TransportRequest::with([
                'requester',
                'requester.department',
            ])->findOrFail($id);

        $action =
            $request->query('action')
            ?? $request->input('action');

        /*
         * If no explicit action was supplied,
         * detect it from the URL.
         */
        if (!$action) {
            if (
                str_contains(
                    $request->url(),
                    'approve'
                )
            ) {
                $action = 'approve';
            } elseif (
                str_contains(
                    $request->url(),
                    'reject'
                )
            ) {
                $action = 'reject';
            }
        }

        $managerName =
            $transportRequest
                ->requester
                ?->department
                ?->line_manager_name
            ?? 'Line Manager';


        /*
         * APPROVE
         */
        if ($action === 'approve') {

            $transportRequest->update([
                'status' =>
                    'PENDING_ADMIN',
            ]);

            $transportTeamEmail =
                $this->getTransportTeamEmail();

            try {
                Mail::to(
                    $transportTeamEmail
                )->send(
                    new TransportTeamNotificationMail(
                        $transportRequest,
                        $managerName
                    )
                );

                Log::info(
                    'Transport team notification sent.',
                    [
                        'request_id' =>
                            $transportRequest->id,

                        'recipient' =>
                            $transportTeamEmail,
                    ]
                );
            } catch (\Throwable $e) {
                Log::error(
                    'Failed sending transport team email.',
                    [
                        'request_id' =>
                            $transportRequest->id,

                        'recipient' =>
                            $transportTeamEmail,

                        'error' =>
                            $e->getMessage(),
                    ]
                );
            }

            return view(
                'public.request-action',
                [
                    'success' =>
                        true,

                    'title' =>
                        'Request Approved',

                    'message' =>
                        "Request #{$id} has been approved successfully and forwarded to the Transport Administration team.",

                    'requestId' =>
                        $id,
                ]
            );
        }


        /*
         * REJECT
         */
        if ($action === 'reject') {

            $transportRequest->update([
                'status' =>
                    'REJECTED',
            ]);

            return view(
                'public.request-action',
                [
                    'success' =>
                        true,

                    'title' =>
                        'Request Rejected',

                    'message' =>
                        "Request #{$id} has been rejected successfully. The Transport Administration team will not be notified.",

                    'requestId' =>
                        $id,
                ]
            );
        }


        /*
         * INVALID ACTION
         */
        return view(
            'public.request-action',
            [
                'success' =>
                    false,

                'title' =>
                    'Invalid Action',

                'message' =>
                    'The requested action could not be completed. Please return to GreenFleet and try again.',

                'requestId' =>
                    $id,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Simulate Manager Approval
    |--------------------------------------------------------------------------
    */

    public function simulateManagerApproval(
        Request $request,
        int $id
    ): JsonResponse {
        $action =
            $request->input(
                'action',
                'approve'
            );

        $transportRequest =
            TransportRequest::with([
                'requester',
                'requester.department',
            ])->findOrFail($id);


        /*
         * APPROVE
         */
        if ($action === 'approve') {

            $transportRequest->update([
                'status' =>
                    'PENDING_ADMIN',
            ]);

            $transportTeamEmail =
                $this->getTransportTeamEmail();

            $managerName =
                $transportRequest
                    ->requester
                    ?->department
                    ?->line_manager_name
                ?? 'Line Manager';

            try {
                Mail::to(
                    $transportTeamEmail
                )->send(
                    new TransportTeamNotificationMail(
                        $transportRequest,
                        $managerName
                    )
                );

                Log::info(
                    'Transport team notification sent (simulated).',
                    [
                        'request_id' =>
                            $transportRequest->id,

                        'recipient' =>
                            $transportTeamEmail,
                    ]
                );
            } catch (\Throwable $e) {
                Log::error(
                    'Failed sending transport team email (simulated).',
                    [
                        'request_id' =>
                            $transportRequest->id,

                        'recipient' =>
                            $transportTeamEmail,

                        'error' =>
                            $e->getMessage(),
                    ]
                );
            }

            return response()->json([
                'success' =>
                    true,

                'message' =>
                    "Line Manager approval simulated. Request #{$id} is now PENDING_ADMIN.",

                'data' =>
                    $transportRequest->fresh(),
            ]);
        }


        /*
         * REJECT
         */
        if ($action === 'reject') {

            $transportRequest->update([
                'status' =>
                    'REJECTED',

                'rejection_reason' =>
                    'Rejected by Line Manager (simulated from admin UI).',
            ]);

            return response()->json([
                'success' =>
                    true,

                'message' =>
                    "Line Manager rejection simulated. Request #{$id} is now REJECTED.",

                'data' =>
                    $transportRequest->fresh(),
            ]);
        }


        /*
         * Invalid action.
         */
        return response()->json([
            'success' =>
                false,

            'message' =>
                'Invalid action. Use "approve" or "reject".',
        ], 400);
    }


    /*
    |--------------------------------------------------------------------------
    | Transport Team Email
    |--------------------------------------------------------------------------
    */

    private function getTransportTeamEmail(): string
    {
        $default =
            'transport@greenwichmerchantbank.com';

        try {
            $setting =
                Setting::where(
                    'key',
                    'company'
                )->first();

            if (!$setting) {
                return $default;
            }

            $company =
                is_array($setting->value)
                    ? $setting->value
                    : json_decode(
                        $setting->value,
                        true
                    );

            if (
                is_array($company) &&
                !empty($company['transport_email'])
            ) {
                return trim(
                    $company['transport_email']
                );
            }
        } catch (\Throwable $e) {
            Log::warning(
                'Could not retrieve Group Transport email setting.',
                [
                    'error' =>
                        $e->getMessage(),
                ]
            );
        }

        return $default;
    }
}