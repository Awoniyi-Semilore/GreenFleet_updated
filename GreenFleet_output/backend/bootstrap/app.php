<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (ValidationException $e, $request) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        });

        $exceptions->renderable(function (ModelNotFoundException $e, $request) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found.',
            ], 404);
        });

        $exceptions->renderable(function (AuthenticationException $e, $request) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        });

        $exceptions->renderable(function (AuthorizationException $e, $request) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden.',
            ], 403);
        });

        $exceptions->renderable(function (Throwable $e, $request) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        });
    })->create();