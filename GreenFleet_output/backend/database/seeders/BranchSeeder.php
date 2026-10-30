<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Branch::firstOrCreate(

            [
                'code' => 'HQ'
            ],

            [

                'name' => 'Head Office',

                'address' => 'Head Office'

            ]

        );
    }
}