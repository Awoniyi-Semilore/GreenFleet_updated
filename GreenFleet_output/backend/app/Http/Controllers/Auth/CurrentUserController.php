<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrentUserController extends Controller
{
    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->load(['role', 'department', 'branch']);

        return $this->successResponse([
            'id' => $user->id,
            'username' => $user->username,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role?->name ?? 'Staff',
            'role_id' => $user->role_id,
            'department' => $user->department?->name,
            'department_id' => $user->department_id,
            'branch' => $user->branch?->name,
            'branch_id' => $user->branch_id,           // <-- ADD THIS
            'status' => $user->status,
        ], 'User retrieved successfully.');
    }
}