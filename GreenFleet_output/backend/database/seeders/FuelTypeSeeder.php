<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FuelType;

class FuelTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Diesel',   'description' => 'Diesel fuel for heavy-duty and commercial vehicles'],
            ['name' => 'Petrol',   'description' => 'Petrol / gasoline for standard passenger vehicles'],
            ['name' => 'CNG',      'description' => 'Compressed Natural Gas'],
            ['name' => 'Electric', 'description' => 'Electric / battery-powered vehicles'],
        ];

        foreach ($types as $type) {
            FuelType::firstOrCreate(['name' => $type['name']], $type);
        }
    }
}
