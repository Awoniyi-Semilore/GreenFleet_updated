<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function permissions(): JsonResponse
    {
        $matrix = [];
        $permissions = DB::table('role_permissions')
            ->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
            ->join('roles', 'role_permissions.role_id', '=', 'roles.id')
            ->select('permissions.name as permission', 'roles.name as role', 'role_permissions.allowed')
            ->get()
            ->groupBy('permission');

        foreach ($permissions as $perm => $rows) {
            $matrix[$perm] = $rows->mapWithKeys(fn($r) => [$r->role => (bool) $r->allowed]);
        }

        return $this->successResponse($matrix, 'Permissions retrieved successfully.');
    }

    public function updatePermissions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'matrix' => 'required|array',
        ]);

        foreach ($validated['matrix'] as $permission => $roles) {
            $permId = DB::table('permissions')->where('name', $permission)->value('id');
            if (!$permId) continue;

            foreach ($roles as $roleName => $allowed) {
                $roleId = DB::table('roles')->where('name', $roleName)->value('id');
                if (!$roleId) continue;

                DB::table('role_permissions')->updateOrInsert(
                    ['role_id' => $roleId, 'permission_id' => $permId],
                    ['allowed' => $allowed, 'updated_at' => now()]
                );
            }
        }

        return $this->successResponse(null, 'Permissions updated successfully.');
    }

    public function userCounts(): JsonResponse
    {
        $counts = User::selectRaw('roles.name as role, count(*) as count')
            ->join('roles', 'users.role_id', '=', 'roles.id')
            ->groupBy('roles.name')
            ->pluck('count', 'role');

        return $this->successResponse($counts, 'User counts retrieved successfully.');
    }
}