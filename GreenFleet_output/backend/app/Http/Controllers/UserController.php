<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\CreateUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use App\Services\User\UserService;
use App\Services\Email\EmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(
            $this->userService->getAllUsers(),
            'Users retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(
            $this->userService->getUserById($id),
            'User retrieved successfully.'
        );
    }

    public function store(CreateUserRequest $request): JsonResponse
    {
        $result = $this->userService->createUser($request->validated());

        return $this->successResponse(
            $result,
            'User created successfully.',
            201
        );
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        return $this->successResponse(
            $this->userService->updateUser($id, $request->validated()),
            'User updated successfully.'
        );
    }

    public function changeStatus(int $id): JsonResponse
    {
        return $this->successResponse(
            $this->userService->changeStatus($id),
            'User status updated successfully.'
        );
    }

    public function resetPassword(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $tempPassword = Str::random(10) . 'A1!';
        $user->password = Hash::make($tempPassword);
        $user->save();

        $emailSent = app(EmailService::class)->sendPasswordReset($user, $tempPassword);

        return $this->successResponse([
            'email_sent' => $emailSent,
        ], 'Password reset successfully.');
    }
}