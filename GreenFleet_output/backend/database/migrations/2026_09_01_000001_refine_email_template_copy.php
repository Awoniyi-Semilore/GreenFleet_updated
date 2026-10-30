<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $templates = [
            'Account Created' => [
                'subject' => 'Welcome to GreenFleet - Your account is ready',
                'body' => "Hello {{staff_name}},\n\nYour GreenFleet account has been created.\n\nUsername: {{username}}\nTemporary Password: {{temp_password}}\n\nPlease sign in to the GreenFleet portal and change your temporary password immediately.\n\nRegards,\nGreenFleet Support",
            ],
            'Password Reset' => [
                'subject' => 'GreenFleet - Password reset',
                'body' => "Hello {{staff_name}},\n\nYour GreenFleet password has been reset.\n\nUsername: {{username}}\nTemporary Password: {{temp_password}}\n\nPlease sign in and change this temporary password immediately.\n\nRegards,\nGreenFleet Support",
            ],
            'Request Submitted' => [
                'subject' => 'Transport request submitted - {{request_id}}',
                'body' => "Hello {{staff_name}},\n\nYour transport request (ID: {{request_id}}) has been submitted successfully.\n\nDestination: {{destination}}\nDeparture: {{departure_time}}\n\nYou will receive another notification when the request has been reviewed.\n\nRegards,\nGreenFleet Transport Operations",
            ],
            'Request Approved' => [
                'subject' => 'Transport request approved - {{request_id}}',
                'body' => "Hello {{staff_name}},\n\nYour transport request (ID: {{request_id}}) has been approved and assigned.\n\nDriver: {{driver_name}}\nPhone: {{driver_phone}}\nVehicle Registration: {{vehicle_plate}}\n\nPlease be ready at your confirmed pickup point. For assistance, contact Transport Operations.\n\nRegards,\nGreenFleet Transport Operations",
            ],
            'Request Rejected' => [
                'subject' => 'Transport request update - {{request_id}}',
                'body' => "Hello {{staff_name}},\n\nYour transport request (ID: {{request_id}}) could not be approved.\n\nReason: {{rejection_reason}}\n\nIf you require clarification, please contact Transport Operations.\n\nRegards,\nGreenFleet Transport Operations",
            ],
        ];

        foreach ($templates as $name => $values) {
            DB::table('email_templates')
                ->where('name', $name)
                ->update($values);
        }
    }

    public function down(): void
    {
        // Email copy is intentionally not reverted to avoid restoring outdated wording.
    }
};
