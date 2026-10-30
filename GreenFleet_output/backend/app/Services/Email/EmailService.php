<?php

namespace App\Services\Email;

use App\Models\EmailTemplate;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailService
{
    public function sendAccountCreated(User $user, string $tempPassword): bool
    {
        try {
            $template = EmailTemplate::where('name', 'Account Created')->first();
            
            if (!$template) {
                Log::error('Email template "Account Created" not found');
                return false;
            }

            $body = str_replace(
                ['{{staff_name}}', '{{username}}', '{{temp_password}}'],
                [$user->first_name ?? $user->name ?? 'User', $user->username, $tempPassword],
                $template->body
            );

            // Convert \n to <br> for HTML email
            $htmlBody = nl2br(e($body));

            Mail::send([], [], function ($message) use ($user, $template, $htmlBody) {
                $message->to($user->email)
                    ->subject($template->subject)
                    ->html($htmlBody);
            });

            Log::info('Account created email sent to: ' . $user->email);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send account created email: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    public function sendPasswordReset(User $user, string $tempPassword): bool
    {
        try {
            $template = EmailTemplate::where('name', 'Password Reset')->first();
            
            if (!$template) {
                Log::warning('Email template "Password Reset" not found, using fallback');
                
                // Fallback body with direct replacement (no template placeholders)
                $body = "Hi " . ($user->first_name ?? $user->name ?? 'User') . ",\n\nYour password has been reset.\n\nUsername: " . $user->username . "\nNew Temporary Password: " . $tempPassword . "\n\nPlease log in and change your password immediately.\n\nGreenFleet Team";
            } else {
                $body = str_replace(
                    ['{{staff_name}}', '{{username}}', '{{temp_password}}'],
                    [$user->first_name ?? $user->name ?? 'User', $user->username, $tempPassword],
                    $template->body
                );
            }

            $htmlBody = nl2br(e($body));

            // PHP 7+ Compatible fallback check (no ?-> operator used)
            $subject = $template ? $template->subject : 'GreenFleet — Password Reset';

            Mail::send([], [], function ($message) use ($user, $htmlBody, $subject) {
                $message->to($user->email)
                    ->subject($subject)
                    ->html($htmlBody);
            });

            Log::info('Password reset email sent to: ' . $user->email);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send password reset email: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return false;
        }
    }

    /**
     * Send dispatch confirmation email to requester with driver and vehicle details
     * 
     * FIX: Properly retrieves driver name from driver->user relationship
     * Includes full vehicle details (make, model, color, plate)
     */
    public function sendRequestApproved(User $user, $request, $driver, $vehicle): bool
    {
        try {
            $template = EmailTemplate::where('name', 'Request Approved')->first();
            
            // Get driver name from user relationship (FIX for missing names)
            $driverName = 'Unknown Driver';
            if ($driver && $driver->user) {
                $driverName = trim(
                    ($driver->user->first_name ?? '') . ' ' . ($driver->user->last_name ?? '')
                ) ?: 'Unknown Driver';
            } elseif ($driver && ($driver->first_name || $driver->last_name)) {
                // Fallback if data structure is different
                $driverName = trim(
                    ($driver->first_name ?? '') . ' ' . ($driver->last_name ?? '')
                ) ?: 'Unknown Driver';
            }

            // Get driver phone (check multiple fields)
            $driverPhone = $driver->phone ?? 
                          $driver->phone_number ?? 
                          ($driver->user->phone ?? 'Not provided');

            // Get vehicle details
            $vehiclePlate = $vehicle->plate_number ?? $vehicle->plate ?? 'N/A';
            $vehicleMake = $vehicle->make ?? 'Unknown';
            $vehicleModel = $vehicle->model ?? 'Model';
            $vehicleColor = $vehicle->color ?? 'N/A';
            $vehicleDescription = "$vehicleMake $vehicleModel ($vehicleColor)";

            // Use template if available, otherwise use detailed fallback
            if ($template) {
                $body = str_replace(
                    [
                        '{{staff_name}}',
                        '{{request_id}}',
                        '{{destination}}',
                        '{{driver_name}}',
                        '{{driver_phone}}',
                        '{{vehicle_plate}}',
                        '{{vehicle_description}}',
                    ],
                    [
                        $user->first_name ?? 'User',
                        $request->id,
                        $request->destination ?? 'N/A',
                        $driverName,
                        $driverPhone,
                        $vehiclePlate,
                        $vehicleDescription,
                    ],
                    $template->body
                );
            } else {
                // Detailed fallback email (used if template is not saved in DB)
                $body = sprintf(
                    "Hi %s,\n\n" .
                    "Your transport request #%s to %s has been approved and dispatched!\n\n" .
                    "DRIVER DETAILS:\n" .
                    "Name: %s\n" .
                    "Phone: %s\n\n" .
                    "VEHICLE DETAILS:\n" .
                    "Registration: %s\n" .
                    "Make & Model: %s\n" .
                    "Color: %s\n\n" .
                    "Kindly contact the driver with the provided phone number. Introduce yourself and inform him of your transport trip details.\n\n" .
                    "For any assistance, contact the Transport Team immediately.\n\n" .
                    "— GreenFleet Logistics",
                    $user->first_name ?? 'User',
                    $request->id,
                    $request->destination ?? 'your destination',
                    $driverName,
                    $driverPhone,
                    $vehiclePlate,
                    $vehicleDescription,
                    $vehicleColor
                );
            }

            $subject = $template 
                ? $template->subject 
                : "GreenFleet — Transport Request #{$request->id} Dispatched";

            Mail::send([], [], function ($message) use ($user, $subject, $body) {
                $message->to($user->email)
                    ->subject($subject)
                    ->html(nl2br(e($body)));
            });

            Log::info(
                'Dispatch confirmation email sent',
                [
                    'to' => $user->email,
                    'request_id' => $request->id,
                    'driver_name' => $driverName,
                    'vehicle_plate' => $vehiclePlate,
                ]
            );

            return true;
        } catch (\Exception $e) {
            Log::error(
                'Failed to send request approved email: ' . $e->getMessage(),
                [
                    'request_id' => $request->id,
                    'user_id' => $user->id,
                    'trace' => $e->getTraceAsString(),
                ]
            );
            return false;
        }
    }

    public function sendRequestRejected(User $user, $request, string $reason): bool
    {
        try {
            $template = EmailTemplate::where('name', 'Request Rejected')->first();
            if (!$template) return false;

            $body = str_replace(
                ['{{staff_name}}', '{{request_id}}', '{{rejection_reason}}'],
                [$user->first_name ?? 'User', $request->id, $reason],
                $template->body
            );

            Mail::send([], [], function ($message) use ($user, $template, $body) {
                $message->to($user->email)
                    ->subject($template->subject)
                    ->html(nl2br(e($body)));
            });

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send request rejected email: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send email to other pooled passengers informing them that a coworker has boarded.
     */
    public function sendWaitingForOthersMail(User $recipient, User $boardedUser, $assignment): bool
    {
        try {
            // Check for a saved template or use a highly descriptive fallback
            $template = EmailTemplate::where('name', 'Coworker Boarded Waiting')->first();
            
            // PHP 7+ Compatible ternary checks
            $fallbackPlate = ($assignment && $assignment->vehicle) ? $assignment->vehicle->plate_number : 'N/A';
            $subject = $template ? $template->subject : 'GreenFleet — Co-rider Boarded!';
            
            $body = $template ? str_replace(
                ['{{recipient_name}}', '{{boarded_name}}', '{{vehicle_plate}}'],
                [$recipient->first_name, $boardedUser->first_name, $fallbackPlate],
                $template->body
            ) : "Hi {$recipient->first_name},\n\nYour coworker {$boardedUser->first_name} has just boarded the vehicle ({$fallbackPlate}) and is waiting for departure!\n\nPlease make your way to the pickup spot to complete your shared dispatch ride.\n\nBest regards,\nGreenFleet Logistics";

            Mail::send([], [], function ($message) use ($recipient, $subject, $body) {
                $message->to($recipient->email)
                    ->subject($subject)
                    ->html(nl2br(e($body)));
            });

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send coworker boarded waiting email: ' . $e->getMessage());
            return false;
        }
    }
}