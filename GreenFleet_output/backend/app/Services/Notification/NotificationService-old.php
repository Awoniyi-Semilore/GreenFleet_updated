<?php

namespace App\Services\Notification;

use App\Models\Notification;
use Illuminate\Database\Eloquent\Collection;

class NotificationService
{
    public function getAllNotifications(): Collection
    {
        return Notification::with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getNotificationById(int $id): Notification
    {
        return Notification::with('user')
            ->findOrFail($id);
    }

    public function createNotification(array $data): Notification
    {
        $notification = Notification::create($data);

        return $notification->load('user');
    }

    public function updateNotification(int $id, array $data): Notification
    {
        $notification = Notification::findOrFail($id);

        $notification->update($data);

        return $notification->load('user');
    }

    public function deleteNotification(int $id): void
    {
        $notification = Notification::findOrFail($id);

        $notification->delete();
    }
}