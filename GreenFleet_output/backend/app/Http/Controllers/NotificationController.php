<?php

namespace App\Http\Controllers;

use App\Services\Notification\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    /** GET /notifications — returns only the logged-in user's notifications */
    public function index(): JsonResponse
    {
        $notifications = $this->notificationService->getAllNotifications();

        return $this->successResponse(
            $notifications->map(fn ($n) => [
                'id'         => $n->id,
                'user_id'    => $n->user_id,
                'title'      => $n->title,
                'message'    => $n->message,
                'is_read'    => (bool) $n->is_read,
                'created_at' => $n->created_at,
                'updated_at' => $n->updated_at,
            ]),
            'Notifications retrieved successfully.'
        );
    }

    /** GET /notifications/unread-count */
    public function unreadCount(): JsonResponse
    {
        $count = \App\Models\Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return $this->successResponse(['count' => $count], 'Unread count retrieved.');
    }

    /** PATCH /notifications/{id}/read — mark one as read */
    public function markRead(int $id): JsonResponse
    {
        try {
            $n = $this->notificationService->updateNotification($id, ['is_read' => true]);
            return $this->successResponse([
                'id'      => $n->id,
                'is_read' => true,
            ], 'Notification marked as read.');
        } catch (\Exception $e) {
            return $this->errorResponse('Notification not found.', null, 404);
        }
    }

    /** PATCH /notifications/mark-all-read — mark all as read for current user */
    public function markAllRead(): JsonResponse
    {
        $this->notificationService->markAllReadForUser(Auth::id());
        return $this->successResponse(null, 'All notifications marked as read.');
    }

    /** PUT /notifications/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'is_read' => ['sometimes', 'nullable', 'boolean'],
            'title'   => ['sometimes', 'string'],
            'message' => ['sometimes', 'string'],
        ]);

        try {
            $n = $this->notificationService->updateNotification($id, $validated);
            return $this->successResponse($n, 'Notification updated.');
        } catch (\Exception $e) {
            return $this->errorResponse('Notification not found.', null, 404);
        }
    }

    /** DELETE /notifications/{id} */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->notificationService->deleteNotification($id);
            return $this->successResponse(null, 'Notification deleted.');
        } catch (\Exception $e) {
            return $this->errorResponse('Notification not found.', null, 404);
        }
    }
}
