<?php

namespace App\Services\User;

use App\Models\User;
use App\Services\Email\EmailService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class UserService
{
    public function __construct(
        private readonly EmailService $emailService
    ) {}

    public function getAllUsers(): Collection
    {
        return User::with(['role', 'department', 'branch'])
            ->orderBy('first_name')
            ->get();
    }

    public function getUserById(int $id): User
    {
        return User::with(['role', 'department', 'branch'])
            ->findOrFail($id);
    }

    public function createUser(array $data): array
    {
        $tempPassword = $data['password'];
        $data['password'] = Hash::make($tempPassword);

        $user = User::create($data);

        // Send welcome email with credentials
        $emailSent = $this->emailService->sendAccountCreated($user, $tempPassword);

        return [
            'user' => $user->load(['role', 'department', 'branch']),
            'email_sent' => $emailSent,
        ];
    }

    public function updateUser(int $id, array $data): User
    {
        $user = User::findOrFail($id);

        if (isset($data['password']) && $data['password'] !== '') {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return $user->load(['role', 'department', 'branch']);
    }

    public function changeStatus(int $id): User
    {
        $user = User::findOrFail($id);

        $user->status = $user->status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        $user->save();

        return $user->load(['role', 'department', 'branch']);
    }

    public function resetPassword(int $id): array
    {
        $user = User::findOrFail($id);
        $tempPassword = Str::random(10) . 'A1!';
        $user->password = Hash::make($tempPassword);
        $user->save();

        $emailSent = $this->emailService->sendPasswordReset($user, $tempPassword);

        return [
            'email_sent' => $emailSent,
        ];
    }
}