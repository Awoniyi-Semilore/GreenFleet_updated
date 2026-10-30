<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function login(array $credentials): array
    {
        // The login field may contain either the user's username or their
        // corporate email address.  Both values are unique on the users table.
        $loginIdentifier = trim($credentials['username']);

        $user = User::where(function ($query) use ($loginIdentifier) {
                $query->where('username', $loginIdentifier)
                    ->orWhere('email', $loginIdentifier);
            })
            ->with(['role', 'department', 'branch'])  // Eager load all relationships
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'username' => 'Invalid username or password.',
            ]);
        }

        if (! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'username' => 'Invalid username or password.',
            ]);
        }

        if ($user->status !== 'ACTIVE') {
            throw ValidationException::withMessages([
                'username' => 'Your account is inactive.',
            ]);
        }

        $user->tokens()->delete();

        $token = $user->createToken('greenfleet-token')->plainTextToken;

        return [
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'role' => $user->role?->name ?? 'Staff',
                'role_id' => $user->role_id,
                'department' => $user->department?->name,
                'department_id' => $user->department_id,
                'branch' => $user->branch?->name,
                'branch_id' => $user->branch_id,           // <-- ADD THIS
                'status' => $user->status,
            ],
            'token' => $token,
        ];
    }
}
