<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::updateOrCreate(
            ['key' => 'company'],
            ['value' => [
                'name' => 'Greenwich Merchant Bank',
                'transport_email' => 'transport@greenwichmerchantbank.com'
            ]]
        );

        Setting::updateOrCreate(
            ['key' => 'vehicleTypes'],
            ['value' => ['Sedan', 'SUV', 'Bus', 'Van']]
        );

        Setting::updateOrCreate(
            ['key' => 'priorities'],
            ['value' => ['Low', 'Normal', 'High Urgent']]
        );
    }
}