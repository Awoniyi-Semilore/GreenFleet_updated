<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Driver;
use App\Models\User;
use App\Models\Role;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DriverController extends Controller
{
    public function index(): JsonResponse
    {
        $drivers = Driver::with(['user.role', 'user.department', 'branch'])->orderBy('id')->get();

        return $this->successResponse(
            $drivers->map(fn ($d) => $this->transformDriver($d)),
            'Drivers retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $driver = Driver::with(['user.role', 'user.department', 'branch'])->findOrFail($id);
            return $this->successResponse(
                $this->transformDriver($driver),
                'Driver retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Driver not found.', null, 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id'        => ['nullable', 'exists:users,id'],
            'first_name'     => ['required_without:user_id', 'nullable', 'string', 'max:100'],
            'last_name'      => ['required_without:user_id', 'nullable', 'string', 'max:100'],
            'phone'          => ['required', 'string', 'max:20'],
            'license_number' => ['nullable', 'string', 'max:100', 'unique:drivers,license_number'],
            'license_expiry' => ['nullable', 'date'],
            'address'        => ['nullable', 'string'],
            'branch_id'      => ['nullable', 'exists:branches,id'],
            'status'         => ['nullable', 'string'],
        ]);

        $dbStatus = $this->normaliseDriverStatus($validated['status'] ?? 'AVAILABLE');
        $userId   = $validated['user_id'] ?? null;

        if (! $userId) {
            $role = Role::where('name', 'Transport Admin')
                        ->orWhere('name', 'Staff')
                        ->first() ?? Role::first();

            $department = Department::first();

            if (! $role || ! $department) {
                return $this->errorResponse(
                    'Cannot create driver user: no roles or departments exist in the database. Please run seeders first.',
                    null,
                    422
                );
            }

            $firstName = $validated['first_name'];
            $lastName  = $validated['last_name'];
            $baseSlug  = strtolower(preg_replace('/\s+/', '.', $firstName . '.' . $lastName));
            $username  = $baseSlug;
            $counter   = 1;
            while (User::where('username', $username)->exists()) {
                $username = $baseSlug . $counter++;
            }

            $email     = $username . '@driver.internal';
            $emailBase = $email;
            $ec        = 1;
            while (User::where('email', $email)->exists()) {
                $email = $ec . '.' . $emailBase;
                $ec++;
            }

            $user = User::create([
                'first_name'    => $firstName,
                'last_name'     => $lastName,
                'username'      => $username,
                'email'         => $email,
                'password'      => Hash::make(Str::random(12) . 'A1!'),
                'role_id'       => $role->id,
                'department_id' => $department->id,
                'branch_id'     => $validated['branch_id'] ?? null,
                'status'        => 'ACTIVE',
            ]);

            $userId = $user->id;
        }

        $driver = Driver::create([
            'user_id'        => $userId,
            'phone'          => $validated['phone'],
            'license_number' => $validated['license_number'] ?? ('DRV-' . strtoupper(Str::random(6))),
            'license_expiry' => $validated['license_expiry'] ?? now()->addYears(2)->toDateString(),
            'address'        => $validated['address'] ?? null,
            'branch_id'      => $validated['branch_id'] ?? null,
            'status'         => $dbStatus,
        ]);

        $driver->load(['user.role', 'user.department', 'branch']);

        return $this->successResponse(
            $this->transformDriver($driver),
            'Driver created successfully.',
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $driver = Driver::with('user')->findOrFail($id);

            $validated = $request->validate([
                'first_name'     => ['nullable', 'string', 'max:100'],
                'last_name'      => ['nullable', 'string', 'max:100'],
                'phone'          => ['nullable', 'string', 'max:20'],
                'license_number' => ['nullable', 'string', 'max:100', 'unique:drivers,license_number,' . $id],
                'license_expiry' => ['nullable', 'date'],
                'address'        => ['nullable', 'string'],
                'branch_id'      => ['nullable', 'exists:branches,id'],
                'status'         => ['nullable', 'string'],
            ]);

            // 1. Update attached User if name fields provided
            if ($driver->user && (array_key_exists('first_name', $validated) || array_key_exists('last_name', $validated))) {
                $userUpdates = [];
                if (isset($validated['first_name'])) $userUpdates['first_name'] = $validated['first_name'];
                if (isset($validated['last_name']))  $userUpdates['last_name']  = $validated['last_name'];
                if (isset($validated['branch_id']))  $userUpdates['branch_id']  = $validated['branch_id'];
                
                $driver->user->update($userUpdates);
            }

            // 2. Update Driver table details
            $driverUpdates = [];
            if (array_key_exists('phone', $validated))          $driverUpdates['phone']          = $validated['phone'];
            if (array_key_exists('license_number', $validated)) $driverUpdates['license_number'] = $validated['license_number'];
            if (array_key_exists('license_expiry', $validated)) $driverUpdates['license_expiry'] = $validated['license_expiry'];
            if (array_key_exists('address', $validated))        $driverUpdates['address']        = $validated['address'];
            if (array_key_exists('branch_id', $validated))      $driverUpdates['branch_id']      = $validated['branch_id'];
            if (array_key_exists('status', $validated))         $driverUpdates['status']         = $this->normaliseDriverStatus($validated['status']);

            if (!empty($driverUpdates)) {
                $driver->update($driverUpdates);
            }

            $driver->load(['user.role', 'user.department', 'branch']);

            return $this->successResponse(
                $this->transformDriver($driver),
                'Driver updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Driver not found.', null, 404);
        }
    }

    public function changeStatus(int $id): JsonResponse
    {
        try {
            $driver = Driver::findOrFail($id);
            $newStatus = $driver->status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            $driver->update(['status' => $newStatus]);
            $driver->load(['user.role', 'user.department', 'branch']);

            return $this->successResponse(
                $this->transformDriver($driver),
                'Driver status updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Driver not found.', null, 404);
        }
    }

    private function normaliseDriverStatus(string $status): string
    {
        return match (strtoupper(trim($status))) {
            'AVAILABLE', 'ACTIVE'                             => 'ACTIVE',
            'OFF_DUTY', 'INACTIVE', 'WAITING',
            'RETURNING', 'ASSIGNED', 'AVAILABLE_AT_BRANCH'   => 'INACTIVE',
            default                                           => 'ACTIVE',
        };
    }

    private function transformDriver(Driver $driver): array
    {
        $user = $driver->user;
        return [
            'id'             => $driver->id,
            'user_id'        => $driver->user_id,
            'first_name'     => $user?->first_name ?? '',
            'last_name'      => $user?->last_name  ?? '',
            'name'           => trim(($user?->first_name ?? '') . ' ' . ($user?->last_name ?? '')),
            'phone'          => $driver->phone,
            'phone_number'   => $driver->phone,
            'license_number' => $driver->license_number,
            'license_expiry' => $driver->license_expiry,
            'address'        => $driver->address,
            'branch_id'      => $driver->branch_id,
            'branch'         => $driver->branch ? [
                'id'          => $driver->branch->id,
                'name'        => $driver->branch->name,
                'branch_name' => $driver->branch->name,
            ] : null,
            'status'         => $driver->status,
            'status_display' => $driver->status === 'ACTIVE' ? 'AVAILABLE' : 'OFF_DUTY',
            'created_at'     => $driver->created_at,
            'updated_at'     => $driver->updated_at,
        ];
    }

    public function updateLocation(Request $request, int $id): JsonResponse
    {
        try {
            $driver = Driver::findOrFail($id);

            $validated = $request->validate([
                'latitude'  => ['required', 'numeric', 'between:-90,90'],
                'longitude' => ['required', 'numeric', 'between:-180,180'],
                'speed'     => ['nullable', 'numeric', 'min:0'],
                'heading'   => ['nullable', 'numeric', 'between:0,360'],
            ]);

            $driver->update([
                'current_latitude'  => $validated['latitude'],
                'current_longitude' => $validated['longitude'],
            ]);

            return $this->successResponse(
                [
                    'driver_id' => $driver->id,
                    'latitude'  => $driver->current_latitude,
                    'longitude' => $driver->current_longitude,
                    'updated_at'=> now()->toIso8601String()
                ],
                'Telemetry broadcast updated successfully.'
            );

        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Driver not found.', null, 404);
        }
    }
}