<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [

            [
                'name' => 'Corporate Banking',
                'code' => 'CB'
            ],

            [
                'name' => 'Operations',
                'code' => 'OPS'
            ],

            [
                'name' => 'Information Technology',
                'code' => 'IT'
            ],

            [
                'name' => 'Human Resources',
                'code' => 'HR'
            ],

            [
                'name' => 'Finance',
                'code' => 'FIN'
            ]

        ];

        foreach ($departments as $department) {

            Department::firstOrCreate(

                ['code' => $department['code']],

                $department

            );
        }
    }
}