<?php

namespace App\Services\Assignment;

use App\Models\Assignment;
use Illuminate\Database\Eloquent\Collection;

class AssignmentService
{
    public function getAllAssignments(): Collection
    {
        return Assignment::with(['transportRequest', 'vehicle', 'driver', 'assignedBy'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getAssignmentById(int $id): Assignment
    {
        return Assignment::with(['transportRequest', 'vehicle', 'driver', 'assignedBy'])
            ->findOrFail($id);
    }

    public function createAssignment(array $data): Assignment
    {
        $assignment = Assignment::create($data);

        return $assignment->load(['transportRequest', 'vehicle', 'driver', 'assignedBy']);
    }

    public function updateAssignment(int $id, array $data): Assignment
    {
        $assignment = Assignment::findOrFail($id);

        $assignment->update($data);

        return $assignment->load(['transportRequest', 'vehicle', 'driver', 'assignedBy']);
    }

    public function deleteAssignment(int $id): void
    {
        $assignment = Assignment::findOrFail($id);

        $assignment->delete();
    }
    
}