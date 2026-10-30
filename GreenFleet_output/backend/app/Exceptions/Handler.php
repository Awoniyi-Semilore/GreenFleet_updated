<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    protected function unauthenticated($request, AuthenticationException $exception)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please log in again.',
            ], 401);
        }

        // For web routes, redirect to login if route exists
        try {
            $redirectUrl = route('login');
        } catch (\Throwable $e) {
            $redirectUrl = '/login';
        }

        return redirect()->guest($redirectUrl);
    }

    public function render($request, Throwable $exception)
    {
        if ($request->is('api/*') || $request->expectsJson()) {
            if ($exception instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $exception->errors(),
                ], 422);
            }

            if ($exception instanceof ModelNotFoundException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resource not found.',
                ], 404);
            }

            if ($exception instanceof NotFoundHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Endpoint not found.',
                ], 404);
            }

            if ($exception instanceof MethodNotAllowedHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Method not allowed.',
                ], 405);
            }

            return response()->json([
                'success' => false,
                'message' => $exception->getMessage() ?: 'Server error.',
            ], 500);
        }

        return parent::render($request, $exception);
    }
}