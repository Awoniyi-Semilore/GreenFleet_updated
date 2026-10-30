<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Staff',
                'description' => 'Regular staff requesting transport'
            ],
            [
                'name' => 'Transport Admin',
                'description' => 'Transport officers managing requests'
            ],
            [
                'name' => 'System Administrator',
                'description' => 'System administrator with full access'
            ]
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}