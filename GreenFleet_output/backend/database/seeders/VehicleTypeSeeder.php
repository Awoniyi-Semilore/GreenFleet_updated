<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VehicleType;

class VehicleTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Sedan',       'description' => 'Standard 4-door passenger car'],
            ['name' => 'SUV',         'description' => 'Sport Utility Vehicle'],
            ['name' => 'Bus',         'description' => 'Large passenger bus (16+ seats)'],
            ['name' => 'Minibus',     'description' => 'Mini bus (7–15 seats)'],
            ['name' => 'Pickup',      'description' => 'Pickup truck'],
            ['name' => 'Van',         'description' => 'Cargo or passenger van'],
            ['name' => 'Coaster',     'description' => 'Medium-size coaster bus'],
        ];

        foreach ($types as $type) {
            VehicleType::firstOrCreate(['name' => $type['name']], $type);
        }
    }
}
