<?php

namespace App\Services\TransportRequest;

use App\Models\TransportRequest;
use App\Models\Assignment;
use App\Services\Email\EmailService;
use App\Services\Notification\NotificationService;
use App\Mail\LineManagerApprovalMail;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

class TransportRequestService
{
    public function getAllRequests(): Collection
    {
        return TransportRequest::with([
            'requester.department', 
            'requester.branch', 
            'approvals', 
            'assignment.driver.user',
            'assignment.vehicle'
        ])
        ->orderBy('created_at', 'desc')
        ->get();
    }

    public function getActiveTrips(): Collection
    {
        return TransportRequest::with([
            'requester.department', 
            'requester.branch', 
            'approvals', 
            'assignment.driver.user',
            'assignment.vehicle'
        ])
        ->whereIn('status', ['ASSIGNED', 'DRIVER_SPOTTED', 'BOARDED_WAITING'])
        ->orderBy('created_at', 'desc')
        ->get();
    }

    public function getRequestById(int $id): TransportRequest
    {
        return TransportRequest::with([
            'requester.department', 
            'requester.branch', 
            'approvals', 
            'assignment'
        ])
        ->findOrFail($id);
    }

    public function createRequest(array $data): TransportRequest
    {
        // Force the initial status to PENDING for new submissions
        $data['status'] = 'PENDING';
        
        $request = TransportRequest::create($data);

        // Load the requester relationship to fetch line manager information
        $request->load(['requester', 'approvals', 'assignment']);

        // Check if the user has a line manager configured with an email address
        if ($request->requester && !empty($request->requester->line_manager_email)) {
            Mail::to($request->requester->line_manager_email)->send(new LineManagerApprovalMail($request));
        }

        return $request;
    }

    public function updateRequest(int $id, array $data): TransportRequest
    {
        $request = TransportRequest::findOrFail($id);

        $request->update($data);

        return $request->load(['requester', 'approvals', 'assignment']);
    }

    /**
     * Approve request and assign driver/vehicle.
     */
    public function approveAndAssign(int $id, array $data): TransportRequest
    {
        $request = TransportRequest::findOrFail($id);

        // Create assignment if driver or vehicle is supplied
        if (!empty($data['driver_id']) || !empty($data['vehicle_id'])) {
            $assignment = Assignment::create([
                'transport_request_id' => $request->id,
                'driver_id'            => $data['driver_id'] ?? null,
                'vehicle_id'           => $data['vehicle_id'] ?? null,
                'assigned_by'          => Auth::id() ?? $request->user_id,
                'status'               => 'ASSIGNED',
            ]);

            $request->assignment_id = $assignment->id;
            $request->status = 'ASSIGNED';
        } else {
            $request->status = 'APPROVED';
        }

        if (!empty($data['remarks'])) {
            $request->remarks = $data['remarks'];
        }

        $request->save();

        return $request->load(['requester', 'approvals', 'assignment']);
    }

    /**
     * Change transport request status with optional reason.
     */
    public function changeStatus(int $id, string $status, ?string $reason = null): TransportRequest
    {
        $request = TransportRequest::findOrFail($id);

        $request->status = $status;
        if ($reason !== null) {
            $request->rejection_reason = $reason;
        }

        $request->save();

        return $request->load(['requester', 'approvals', 'assignment']);
    }

    /**
     * Confirm arrival at destination.
     */
    public function confirmArrival(int $id): TransportRequest
    {
        $request = TransportRequest::findOrFail($id);
        $request->status = 'COMPLETED';
        $request->save();

        return $request->load(['requester', 'approvals', 'assignment']);
    }

    /**
     * Mark a transport request as having spotted the driver.
     */
    public function spotDriver(int $id): TransportRequest
    {
        $request = TransportRequest::findOrFail($id);
        $request->status = 'DRIVER_SPOTTED';
        $request->save();

        return $request->load(['requester', 'approvals', 'assignment']);
    }

    /**
     * Mark a transport request as boarded and waiting for pooled co-riders.
     * Fires emails & push notifications to all other members of the pooled assignment.
     */
    public function boardVehicle(int $id): TransportRequest
    {
        $request = TransportRequest::with(['requester', 'assignment.vehicle'])->findOrFail($id);
        $request->status = 'BOARDED_WAITING';
        $request->save();

        $assignment = $request->assignment;
        if ($assignment) {
            // Find other pooled requests sharing this assignment
            $otherRequests = $assignment->transportRequests()
                ->where('id', '!=', $request->id)
                ->with('requester')
                ->get();

            foreach ($otherRequests as $otherReq) {
                $coPassenger = $otherReq->requester;
                if ($coPassenger) {
                    // 1. Send system in-app notification
                    NotificationService::send(
                        $coPassenger->id,
                        'Coworker Boarded!',
                        "{$request->requester->first_name} has boarded the vehicle. Please head to the pickup point!"
                    );

                    // 2. Dispatch alert email using resolved mail handler
                    $emailService = resolve(EmailService::class);
                    $emailService->sendWaitingForOthersMail($coPassenger, $request->requester, $assignment);
                }
            }

            // 3. Notify dispatch admins of boarding event
            NotificationService::notifyTransportAdmins(
                'Pooled Passenger Boarded',
                "{$request->requester->first_name} has entered the vehicle for Assignment ID #{$assignment->id}."
            );
        }

        return $request->load(['requester', 'approvals', 'assignment']);
    }
}
