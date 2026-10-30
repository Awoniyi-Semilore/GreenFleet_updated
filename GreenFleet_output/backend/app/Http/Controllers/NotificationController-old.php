<?php

namespace App\Http\Controllers;

use App\Http\Requests\Notification\CreateNotificationRequest;
use App\Http\Requests\Notification\UpdateNotificationRequest;
use App\Services\Notification\NotificationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(
            $this->notificationService->getAllNotifications(),
            'Notifications retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->notificationService->getNotificationById($id),
                'Notification retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Notification not found.',
                null,
                404
            );
        }
    }

    public function store(CreateNotificationRequest $request): JsonResponse
    {
        return $this->successResponse(
            $this->notificationService->createNotification($request->validated()),
            'Notification created successfully.',
            201
        );
    }

    public function update(UpdateNotificationRequest $request, int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->notificationService->updateNotification(
                    $id,
                    $request->validated()
                ),
                'Notification updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Notification not found.',
                null,
                404
            );
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->notificationService->deleteNotification($id);

            return $this->successResponse(
                null,
                'Notification deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse(
                'Notification not found.',
                null,
                404
            );
        }
    }
}