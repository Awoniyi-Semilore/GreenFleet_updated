<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\Department;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = Role::where('name', 'System Administrator')->first();

        $department = Department::where('code', 'IT')->first();

        if (!$role || !$department) {
            return;
        }

        User::firstOrCreate(

            [
                'username' => 'Administrator'
            ],

            [

                'first_name' => 'GMB',

                'last_name' => 'Administrator',

                'email' => 'semilore.awoniyi@greenwichbankgroup.com',

                'password' => Hash::make('Password@100'),

                'role_id' => $role->id,

                'department_id' => $department->id,

                'branch_id' => 1,

                'status' => 'ACTIVE'

            ]

        );
    }
}