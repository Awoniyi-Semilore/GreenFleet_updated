<?php

namespace App\Services\TransportRequest;

use App\Models\TransportRequest;
use Illuminate\Database\Eloquent\Collection;

class TransportRequestService
{
    public function getAllRequests(): Collection
    {
        return TransportRequest::with(['requester', 'approvals', 'assignment'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getRequestById(int $id): TransportRequest
    {
        return TransportRequest::with(['requester', 'approvals', 'assignment'])
            ->findOrFail($id);
    }

    public function createRequest(array $data): TransportRequest
    {
        $request = TransportRequest::create($data);

        return $request->load(['requester', 'approvals', 'assignment']);
    }

    public function updateRequest(int $id, array $data): TransportRequest
    {
        $request = TransportRequest::findOrFail($id);

        $request->update($data);

        return $request->load(['requester', 'approvals', 'assignment']);
    }

    public function changeStatus(int $id): TransportRequest
    {
        $request = TransportRequest::findOrFail($id);

        $statuses = ['PENDING', 'APPROVED', 'REJECTED', 'ASSIGNED', 'COMPLETED', 'CANCELLED'];
        $currentIndex = array_search($request->status, $statuses);
        $nextIndex = ($currentIndex + 1) % count($statuses);
        $request->status = $statuses[$nextIndex];

        $request->save();

        return $request->load(['requester', 'approvals', 'assignment']);
    }
}