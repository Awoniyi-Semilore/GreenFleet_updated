<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Department;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SettingController extends Controller
{
    private const CACHE_KEY = 'greenfleet_settings';
    private const CACHE_TTL = 3600; // 1 hour

    public function index(): JsonResponse
    {
        try {
            // Try cache first
            $cached = Cache::get(self::CACHE_KEY);

            if ($cached) {
                return $this->successResponse(
                    $cached,
                    'Settings retrieved from cache.'
                );
            }

            // Safe query for branches
            $branches = [];

            try {
                $branches = Branch::select(
                    'id',
                    'name',
                    'location',
                    'address'
                )
                    ->orderBy('name')
                    ->get()
                    ->toArray();
            } catch (\Exception $e) {
                Log::warning(
                    'Failed to load branches in settings: ' .
                    $e->getMessage()
                );
            }

            // Safe query for departments
            $departments = [];

            try {
                $departments = Department::select(
                    'id',
                    'department_name',
                    'line_manager_name',
                    'line_manager_email',
                    'line_manager_title',
                    'description'
                )
                    ->orderBy('department_name')
                    ->get()
                    ->toArray();
            } catch (\Exception $e) {
                Log::warning(
                    'Failed to load departments in settings: ' .
                    $e->getMessage()
                );
            }

            /*
             * IMPORTANT:
             *
             * The Group Transport Email must come from the company
             * setting stored in the database.
             *
             * Do NOT hard-code the email here.
             */
            $company = $this->getSetting('company', [
                'name' => 'Greenwich Merchant Bank',
                'transport_email' => 'transport@greenwichmerchantbank.com',
            ]);

            $transportEmail = $company['transport_email']
                ?? 'transport@greenwichmerchantbank.com';

            // Build settings payload
            $settings = [
                'company' => [
                    'name' => $company['name']
                        ?? 'Greenwich Merchant Bank',

                    'transport_email' => $transportEmail,
                ],

                // Keep this for frontend compatibility.
                // It now uses the actual database value.
                'group_transport_email' => $transportEmail,

                'branches' => $branches,

                'departments' => $departments,

                'vehicleTypes' => $this->getSetting(
                    'vehicleTypes',
                    ['Sedan', 'SUV', 'Bus', 'Van']
                ),

                'priorities' => $this->getSetting(
                    'priorities',
                    ['Low', 'Normal', 'High Urgent']
                ),
            ];

            Cache::put(
                self::CACHE_KEY,
                $settings,
                self::CACHE_TTL
            );

            return $this->successResponse(
                $settings,
                'Settings retrieved successfully.'
            );
        } catch (\Exception $e) {
            Log::error(
                'SettingController index error: ' .
                $e->getMessage()
            );

            return $this->errorResponse(
                'Failed to retrieve settings: ' . $e->getMessage(),
                null,
                500
            );
        }
    }

    public function update(
        Request $request,
        string $section
    ): JsonResponse {
        $allowedSections = [
            'company',
            'vehicleTypes',
            'priorities',
        ];

        if (!in_array($section, $allowedSections, true)) {
            return $this->errorResponse(
                'Invalid settings section. Use: ' .
                implode(', ', $allowedSections),
                null,
                422
            );
        }

        try {
            /*
             * If updating company settings, make sure the
             * transport email is valid before saving it.
             */
            if ($section === 'company') {
                $request->validate([
                    'name' => 'nullable|string|max:255',
                    'transport_email' => 'required|email|max:255',
                ]);
            }

            $value = $request->all();

            Setting::updateOrCreate(
                ['key' => $section],
                ['value' => $value]
            );

            /*
             * The settings endpoint uses cache, so immediately
             * invalidate the cached version after every update.
             */
            Cache::forget(self::CACHE_KEY);

            return $this->successResponse(
                $value,
                'Settings updated successfully.'
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error(
                'SettingController update error: ' .
                $e->getMessage()
            );

            return $this->errorResponse(
                'Failed to update settings: ' . $e->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * Get a setting from the database.
     */
    private function getSetting(
        string $key,
        array $default
    ): array {
        try {
            $setting = Setting::where('key', $key)->first();

            if (!$setting) {
                return $default;
            }

            /*
             * If the Setting model has a JSON cast, this will
             * already be an array.
             */
            if (is_array($setting->value)) {
                return $setting->value;
            }

            /*
             * Otherwise decode the JSON manually.
             */
            if (is_string($setting->value)) {
                $decoded = json_decode(
                    $setting->value,
                    true
                );

                if (is_array($decoded)) {
                    return $decoded;
                }
            }

            return $default;
        } catch (\Exception $e) {
            Log::warning(
                "Failed to retrieve setting key [{$key}]: " .
                $e->getMessage()
            );

            return $default;
        }
    }
}