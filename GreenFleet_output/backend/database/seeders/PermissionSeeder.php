<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'Create Requests',
            'Approve Requests',
            'Assign Vehicles',
            'Manage Drivers',
            'Manage Vehicles',
            'Manage Users',
            'View Reports',
            'Export Data',
            'Manage Settings',
            'View Audit Logs',
            'Manage Email Templates',
        ];

        foreach ($permissions as $name) {
            DB::table('permissions')->insertOrIgnore([
                'name' => $name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed default role_permissions
        $roles = DB::table('roles')->pluck('id', 'name');
        $perms = DB::table('permissions')->pluck('id', 'name');

        if ($roles->isEmpty() || $perms->isEmpty()) {
            return;
        }

        $defaults = [
            'Staff' => ['Create Requests'],
            'Transport Admin' => [
                'Approve Requests',
                'Assign Vehicles',
                'Manage Drivers',
                'Manage Vehicles',
                'View Reports',
                'Export Data',
            ],
            'System Administrator' => array_keys($perms->toArray()),
        ];

        foreach ($defaults as $roleName => $permNames) {
            $roleId = $roles[$roleName] ?? null;
            if (!$roleId) continue;

            foreach ($perms as $permName => $permId) {
                DB::table('role_permissions')->updateOrInsert(
                    ['role_id' => $roleId, 'permission_id' => $permId],
                    [
                        'allowed' => in_array($permName, $permNames),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}