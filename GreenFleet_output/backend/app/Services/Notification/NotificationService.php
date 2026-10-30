<?php

namespace App\Services\Notification;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class NotificationService
{
    /**
     * Get notifications for the currently authenticated user only.
     * Previously returned ALL notifications for ALL users — fixed.
     */
    public function getAllNotifications(): Collection
    {
        return Notification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getNotificationById(int $id): Notification
    {
        return Notification::where('user_id', Auth::id())
            ->findOrFail($id);
    }

    public function createNotification(array $data): Notification
    {
        return Notification::create($data);
    }

    public function updateNotification(int $id, array $data): Notification
    {
        $notification = Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->update($data);
        return $notification;
    }

    public function deleteNotification(int $id): void
    {
        $notification = Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->delete();
    }

    public function markAllReadForUser(int $userId): void
    {
        Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }

    /**
     * Send a notification to one or more users.
     * Called internally whenever a workflow event occurs.
     */
    public static function send(int|array $userIds, string $title, string $message): void
    {
        $ids = is_array($userIds) ? $userIds : [$userIds];
        foreach ($ids as $userId) {
            Notification::create([
                'user_id' => $userId,
                'title'   => $title,
                'message' => $message,
                'is_read' => false,
            ]);
        }
    }

    /**
     * Notify all Transport Admins.
     */
    public static function notifyTransportAdmins(string $title, string $message): void
    {
        $admins = User::whereHas('role', fn ($q) => $q->where('name', 'Transport Admin'))
            ->pluck('id')
            ->toArray();
        if (! empty($admins)) {
            self::send($admins, $title, $message);
        }
    }
}
