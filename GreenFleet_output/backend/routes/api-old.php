<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\CurrentUserController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleTypeController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\FuelTypeController;
use App\Http\Controllers\TransportRequestController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\TripLogController;
use App\Http\Controllers\FuelLogController;
use App\Http\Controllers\MaintenanceRecordController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\VehicleInspectionController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\RoleController;

Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LogoutController::class, 'logout']);
    Route::get('/user', [CurrentUserController::class, 'user']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::patch('/users/{id}/status', [UserController::class, 'changeStatus']);
    Route::get('/reports/export', [ReportController::class, 'export']);
    Route::patch('/users/{id}/reset-password', [UserController::class, 'resetPassword']);

    Route::prefix('departments')->group(function () {
        Route::get('/', [DepartmentController::class, 'index']);
        Route::get('/{id}', [DepartmentController::class, 'show']);
        Route::post('/', [DepartmentController::class, 'store']);
        Route::put('/{id}', [DepartmentController::class, 'update']);
        Route::delete('/{id}', [DepartmentController::class, 'destroy']);
    });

    // Settings — simplified (no SMTP, no logo)
    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings/{section}', [SettingController::class, 'update']);

    // Role Permissions
    Route::get('/roles/permissions', [RoleController::class, 'permissions']);
    Route::put('/roles/permissions', [RoleController::class, 'updatePermissions']);
    Route::get('/roles/users-count', [RoleController::class, 'userCounts']);

    Route::prefix('vehicle-types')->group(function () {
        Route::get('/', [VehicleTypeController::class, 'index']);
        Route::get('/{id}', [VehicleTypeController::class, 'show']);
        Route::post('/', [VehicleTypeController::class, 'store']);
        Route::put('/{id}', [VehicleTypeController::class, 'update']);
        Route::delete('/{id}', [VehicleTypeController::class, 'destroy']);
    });

    Route::prefix('vehicles')->group(function () {
        Route::get('/', [VehicleController::class, 'index']);
        Route::get('/{id}', [VehicleController::class, 'show']);
        Route::post('/', [VehicleController::class, 'store']);
        Route::put('/{id}', [VehicleController::class, 'update']);
        Route::patch('/{id}/status', [VehicleController::class, 'changeStatus']);
    });

    Route::prefix('drivers')->group(function () {
        Route::get('/', [DriverController::class, 'index']);
        Route::get('/{id}', [DriverController::class, 'show']);
        Route::post('/', [DriverController::class, 'store']);
        Route::put('/{id}', [DriverController::class, 'update']);
        Route::patch('/{id}/status', [DriverController::class, 'changeStatus']);
    });

    Route::prefix('fuel-types')->group(function () {
        Route::get('/', [FuelTypeController::class, 'index']);
        Route::get('/{id}', [FuelTypeController::class, 'show']);
        Route::post('/', [FuelTypeController::class, 'store']);
        Route::put('/{id}', [FuelTypeController::class, 'update']);
        Route::delete('/{id}', [FuelTypeController::class, 'destroy']);
    });

    Route::prefix('transport-requests')->group(function () {
        Route::get('/', [TransportRequestController::class, 'index']);
        Route::get('/{id}', [TransportRequestController::class, 'show']);
        Route::post('/', [TransportRequestController::class, 'store']);
        Route::put('/{id}', [TransportRequestController::class, 'update']);
        Route::patch('/{id}/status', [TransportRequestController::class, 'changeStatus']);
    });

    Route::prefix('approvals')->group(function () {
        Route::get('/', [ApprovalController::class, 'index']);
        Route::get('/{id}', [ApprovalController::class, 'show']);
        Route::post('/', [ApprovalController::class, 'store']);
        Route::put('/{id}', [ApprovalController::class, 'update']);
        Route::delete('/{id}', [ApprovalController::class, 'destroy']);
    });

    Route::prefix('assignments')->group(function () {
        Route::get('/', [AssignmentController::class, 'index']);
        Route::get('/{id}', [AssignmentController::class, 'show']);
        Route::post('/', [AssignmentController::class, 'store']);
        Route::put('/{id}', [AssignmentController::class, 'update']);
        Route::delete('/{id}', [AssignmentController::class, 'destroy']);
    });

    // Route::prefix('trip-logs')->group(function () {
    //     Route::get('/', [TripLogController::class, 'index']);
    //     Route::get('/{id}', [TripLogController::class, 'show']);
    //     Route::post('/', [TripLogController::class, 'store']);
    //     Route::put('/{id}', [TripLogController::class, 'update']);
    //     Route::delete('/{id}', [TripLogController::class, 'destroy']);
    // });

    Route::prefix('fuel-logs')->group(function () {
        Route::get('/', [FuelLogController::class, 'index']);
        Route::get('/{id}', [FuelLogController::class, 'show']);
        Route::post('/', [FuelLogController::class, 'store']);
        Route::put('/{id}', [FuelLogController::class, 'update']);
        Route::delete('/{id}', [FuelLogController::class, 'destroy']);
    });

    Route::prefix('maintenance-records')->group(function () {
        Route::get('/', [MaintenanceRecordController::class, 'index']);
        Route::get('/{id}', [MaintenanceRecordController::class, 'show']);
        Route::post('/', [MaintenanceRecordController::class, 'store']);
        Route::put('/{id}', [MaintenanceRecordController::class, 'update']);
        Route::delete('/{id}', [MaintenanceRecordController::class, 'destroy']);
    });

    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/{id}', [NotificationController::class, 'show']);
        Route::post('/', [NotificationController::class, 'store']);
        Route::put('/{id}', [NotificationController::class, 'update']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

    Route::prefix('audit-logs')->group(function () {
        Route::get('/', [AuditLogController::class, 'index']);
        Route::get('/{id}', [AuditLogController::class, 'show']);
        Route::post('/', [AuditLogController::class, 'store']);
        Route::put('/{id}', [AuditLogController::class, 'update']);
        Route::delete('/{id}', [AuditLogController::class, 'destroy']);
    });

    Route::prefix('vehicle-inspections')->group(function () {
        Route::get('/', [VehicleInspectionController::class, 'index']);
        Route::get('/{id}', [VehicleInspectionController::class, 'show']);
        Route::post('/', [VehicleInspectionController::class, 'store']);
        Route::put('/{id}', [VehicleInspectionController::class, 'update']);
        Route::delete('/{id}', [VehicleInspectionController::class, 'destroy']);
    });

    // REMOVED: vehicle-documents routes (Issue #4)

    // Branches — FULL CRUD (Issue #2)
    Route::prefix('branches')->group(function () {
        Route::get('/', [BranchController::class, 'index']);
        Route::get('/{id}', [BranchController::class, 'show']);
        Route::post('/', [BranchController::class, 'store']);
        Route::put('/{id}', [BranchController::class, 'update']);
        Route::delete('/{id}', [BranchController::class, 'destroy']);
    });

    // Analytics
    Route::get('/analytics', [AnalyticsController::class, 'index']);
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
    Route::get('/reports/preview', [ReportController::class, 'preview']);

    // Email Templates
    Route::prefix('email-templates')->group(function () {
        Route::get('/', [EmailTemplateController::class, 'index']);
        Route::get('/{id}', [EmailTemplateController::class, 'show']);
        Route::post('/', [EmailTemplateController::class, 'store']);
        Route::put('/{id}', [EmailTemplateController::class, 'update']);
        Route::delete('/{id}', [EmailTemplateController::class, 'destroy']);
    });

    // Complaints
    Route::prefix('complaints')->group(function () {
        Route::get('/', [ComplaintController::class, 'index']);
        Route::get('/{id}', [ComplaintController::class, 'show']);
        Route::post('/', [ComplaintController::class, 'store']);
        Route::put('/{id}', [ComplaintController::class, 'update']);
        Route::delete('/{id}', [ComplaintController::class, 'destroy']);
    });

    Route::get('/active-trips', [TransportRequestController::class, 'activeTrips']);
});
