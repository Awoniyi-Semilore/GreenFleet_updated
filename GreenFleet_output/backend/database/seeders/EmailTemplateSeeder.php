<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmailTemplate;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Account Created',
                'subject' => 'Welcome to GreenFleet — Your Account is Ready',
                  'body' => "Hello {{staff_name}},\n\nYour GreenFleet account has been created.\n\nUsername: {{username}}\nTemporary Password: {{temp_password}}\n\nPlease sign in to the GreenFleet portal and change your temporary password immediately.\n\nRegards,\nGreenFleet Support",
                'module' => 'auth',
            ],
            [
                'name' => 'Password Reset',
                'subject' => 'GreenFleet — Password Reset',
                  'body' => "Hello {{staff_name}},\n\nYour GreenFleet password has been reset.\n\nUsername: {{username}}\nTemporary Password: {{temp_password}}\n\nPlease sign in and change this temporary password immediately.\n\nRegards,\nGreenFleet Support",
                'module' => 'auth',
            ],
            [
                'name' => 'Request Submitted',
                'subject' => 'Transport Request Submitted — {{request_id}}',
                  'body' => "Hello {{staff_name}},\n\nYour transport request (ID: {{request_id}}) has been submitted successfully.\n\nDestination: {{destination}}\nDeparture: {{departure_time}}\n\nYou will receive another notification when the request has been reviewed.\n\nRegards,\nGreenFleet Transport Operations",
                'module' => 'request',
            ],
            [
                'name' => 'Request Approved',
                'subject' => 'Transport Request Approved — {{request_id}}',
                  'body' => "Hello {{staff_name}},\n\nYour transport request (ID: {{request_id}}) has been approved and assigned.\n\nDriver: {{driver_name}}\nPhone: {{driver_phone}}\nVehicle Registration: {{vehicle_plate}}\n\nPlease be ready at your confirmed pickup point. For assistance, contact Transport Operations.\n\nRegards,\nGreenFleet Transport Operations",
                'module' => 'request',
            ],
            [
                'name' => 'Request Rejected',
                'subject' => 'Transport Request Rejected — {{request_id}}',
                  'body' => "Hello {{staff_name}},\n\nYour transport request (ID: {{request_id}}) could not be approved.\n\nReason: {{rejection_reason}}\n\nIf you require clarification, please contact Transport Operations.\n\nRegards,\nGreenFleet Transport Operations",
                'module' => 'request',
            ],
            [
                'name' => 'Trip Completed',
                'subject' => 'Trip Completed — {{request_id}}',
                'body' => "Hi {{staff_name}},\n\nYour trip (Request ID: {{request_id}}) has been completed.\n\nThank you for using GreenFleet.\n\nWould you like to report a complaint? Log in to the portal.\n\nGreenFleet Team",
                'module' => 'trip',
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::firstOrCreate(
                ['name' => $template['name']],
                $template
            );
        }
    }
}
