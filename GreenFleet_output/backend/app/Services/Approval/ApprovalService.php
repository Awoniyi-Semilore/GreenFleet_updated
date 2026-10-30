<?php

namespace App\Services\Approval;

use App\Models\Approval;
use Illuminate\Database\Eloquent\Collection;

class ApprovalService
{
    public function getAllApprovals(): Collection
    {
        return Approval::with(['transportRequest', 'approver'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getApprovalById(int $id): Approval
    {
        return Approval::with(['transportRequest', 'approver'])
            ->findOrFail($id);
    }

    public function createApproval(array $data): Approval
    {
        $approval = Approval::create($data);

        return $approval->load(['transportRequest', 'approver']);
    }

    public function updateApproval(int $id, array $data): Approval
    {
        $approval = Approval::findOrFail($id);

        $approval->update($data);

        return $approval->load(['transportRequest', 'approver']);
    }

    public function deleteApproval(int $id): void
    {
        $approval = Approval::findOrFail($id);

        $approval->delete();
    }
}