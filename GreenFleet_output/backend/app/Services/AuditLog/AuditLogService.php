<?php

namespace App\Services\AuditLog;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Collection;

class AuditLogService
{
    public function getAllAuditLogs(): Collection
    {
        return AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getAuditLogById(int $id): AuditLog
    {
        return AuditLog::with('user')
            ->findOrFail($id);
    }

    public function createAuditLog(array $data): AuditLog
    {
        $auditLog = AuditLog::create($data);

        return $auditLog->load('user');
    }

    public function updateAuditLog(int $id, array $data): AuditLog
    {
        $auditLog = AuditLog::findOrFail($id);

        $auditLog->update($data);

        return $auditLog->load('user');
    }

    public function deleteAuditLog(int $id): void
    {
        $auditLog = AuditLog::findOrFail($id);

        $auditLog->delete();
    }
}