<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\Auth\CurrentUserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\FuelLogController;
use App\Http\Controllers\FuelTypeController;
use App\Http\Controllers\MaintenanceRecordController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TransportRequestController;
use App\Http\Controllers\TripLocationController;
// use App\Http\Controllers\TripLogController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\VehicleDocumentController;
use App\Http\Controllers\VehicleInspectionController;
use App\Http\Controllers\VehicleTypeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

/*
 * Login
 */
Route::post(
    '/login',
    [LoginController::class, 'login']
);


/*
|--------------------------------------------------------------------------
| Public Transport Request Actions
|--------------------------------------------------------------------------
*/

/*
 * Legacy public request action.
 *
 * Keep this route if older emails in circulation
 * still use this URL.
 */
Route::get(
    '/requests/action/{id}',
    [TransportRequestController::class, 'approveAction']
);


/*
 * Signed line-manager action route.
 */
Route::get(
    '/public/requests/{id}/action',
    [TransportRequestController::class, 'handleLineManagerAction']
)
    ->name('public.request.line-manager-action')
    ->middleware('signed');


/*
 * Signed approve route.
 */
Route::get(
    '/public/requests/{id}/approve',
    [TransportRequestController::class, 'handleLineManagerAction']
)
    ->name('public.request.approve')
    ->middleware('signed');


/*
 * Signed reject route.
 */
Route::get(
    '/public/requests/{id}/reject',
    [TransportRequestController::class, 'handleLineManagerAction']
)
    ->name('public.request.reject')
    ->middleware('signed');


/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/logout',
        [LogoutController::class, 'logout']
    );

    Route::get(
        '/user',
        [CurrentUserController::class, 'user']
    );


    /*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'users',
        UserController::class
    );

    Route::patch(
        'users/{id}/status',
        [UserController::class, 'changeStatus']
    );

    Route::patch(
        'users/{id}/reset-password',
        [UserController::class, 'resetPassword']
    );


    /*
    |--------------------------------------------------------------------------
    | Departments
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'departments',
        DepartmentController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Branches
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'branches',
        BranchController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Roles
    |--------------------------------------------------------------------------
    */

    /*
     * Get role permissions.
     */
    Route::get(
        'roles/permissions',
        [RoleController::class, 'permissions']
    );

    /*
     * Update role permissions.
     */
    Route::put(
        'roles/permissions',
        [RoleController::class, 'updatePermissions']
    );

    /*
     * Get user counts by role.
     */
    Route::get(
        'roles/users-count',
        [RoleController::class, 'userCounts']
    );

    /*
     * Standard role CRUD.
     */
    Route::apiResource(
        'roles',
        RoleController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Vehicle Types & Fuel Types
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'vehicle-types',
        VehicleTypeController::class
    );

    Route::apiResource(
        'fuel-types',
        FuelTypeController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Vehicles
    |--------------------------------------------------------------------------
    */

    /*
     * Change vehicle status.
     */
    Route::patch(
        'vehicles/{id}/status',
        [VehicleController::class, 'changeStatus']
    );

    /*
     * Standard vehicle CRUD.
     */
    Route::apiResource(
        'vehicles',
        VehicleController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Drivers
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | Drivers do NOT provide GPS telemetry.
    |
    | GreenFleet's live vehicle location is provided
    | voluntarily by a staff member/passenger using
    | their own phone browser.
    |
    */

    Route::prefix('drivers')->group(function () {

        /*
         * List drivers.
         */
        Route::get(
            '/',
            [DriverController::class, 'index']
        );

        /*
         * Show driver.
         */
        Route::get(
            '/{id}',
            [DriverController::class, 'show']
        );

        /*
         * Create driver.
         */
        Route::post(
            '/',
            [DriverController::class, 'store']
        );

        /*
         * Update driver.
         */
        Route::put(
            '/{id}',
            [DriverController::class, 'update']
        );

        /*
         * Change driver status.
         */
        Route::patch(
            '/{id}/status',
            [DriverController::class, 'changeStatus']
        );
    });


    /*
    |--------------------------------------------------------------------------
    | Transport Requests
    |--------------------------------------------------------------------------
    */

    /*
     * Simulate line-manager approval/rejection
     * from the Transport Administration UI.
     */
    Route::post(
        'transport-requests/{id}/simulate-manager',
        [TransportRequestController::class, 'simulateManagerApproval']
    );


    /*
     * Get currently active trips.
     */
    Route::get(
        'active-trips',
        [TransportRequestController::class, 'activeTrips']
    );


    /*
     * Transport Admin approval / assignment.
     */
    Route::post(
        'transport-requests/{id}/approve',
        [TransportRequestController::class, 'approve']
    );


    /*
     * Confirm passenger arrival.
     */
    Route::post(
        'transport-requests/{id}/confirm-arrival',
        [TransportRequestController::class, 'confirmArrival']
    );


    /*
     * Change transport request status.
     */
    Route::patch(
        'transport-requests/{id}/status',
        [TransportRequestController::class, 'changeStatus']
    );


    /*
     * Passenger indicates that they have spotted the driver.
     */
    Route::patch(
        'transport-requests/{id}/spot-driver',
        [TransportRequestController::class, 'spotDriver']
    );


    /*
     * Passenger indicates that they have boarded the vehicle.
     */
    Route::patch(
        'transport-requests/{id}/board-vehicle',
        [TransportRequestController::class, 'boardVehicle']
    );


    /*
     * Standard transport request CRUD routes.
     *
     * IMPORTANT:
     * Keep this AFTER the custom transport-request
     * routes above.
     */
    Route::apiResource(
        'transport-requests',
        TransportRequestController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Passenger-Assisted Live Vehicle Location
    |--------------------------------------------------------------------------
    |
    | The driver does NOT have a GreenFleet platform.
    |
    | A passenger/staff member inside the assigned vehicle
    | can voluntarily share their phone's GPS location.
    |
    | This functionality is handled by:
    |
    |     TripLocationController
    |
    | It is intentionally separate from TripLogController.
    |
    */


    /*
     * Send/update current passenger GPS location.
     */
    Route::post(
        'transport-requests/{id}/location',
        [TripLocationController::class, 'update']
    );


    /*
     * Retrieve the current live vehicle location.
     */
    Route::get(
        'transport-requests/{id}/location',
        [TripLocationController::class, 'show']
    );


    /*
     * Stop the authenticated passenger's GPS sharing.
     */
    Route::delete(
        'transport-requests/{id}/location',
        [TripLocationController::class, 'stop']
    );


    /*
    |--------------------------------------------------------------------------
    | Approvals
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'approvals',
        ApprovalController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Assignments
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'assignments',
        AssignmentController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Trip Logs
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | TripLogController is separate from TripLocationController.
    |
    | TripLogController handles the existing trip-log CRUD
    | functionality.
    |
    | TripLocationController handles live GPS sharing.
    |
    */

    // Route::apiResource(
    //     'trip-logs',
    //     TripLogController::class
    // );


    /*
    |--------------------------------------------------------------------------
    | Complaints
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'complaints',
        ComplaintController::class
    );

    Route::patch(
        'complaints/{id}/resolve',
        [ComplaintController::class, 'resolve']
    );


    /*
    |--------------------------------------------------------------------------
    | Fuel Logs
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'fuel-logs',
        FuelLogController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Maintenance Records
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'maintenance-records',
        MaintenanceRecordController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Vehicle Inspections
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'vehicle-inspections',
        VehicleInspectionController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Vehicle Documents
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'vehicle-documents',
        VehicleDocumentController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    /*
     * Get unread notification count.
     */
    Route::get(
        'notifications/unread-count',
        [NotificationController::class, 'unreadCount']
    );


    /*
     * Mark all notifications as read.
     */
    Route::patch(
        'notifications/mark-all-read',
        [NotificationController::class, 'markAllRead']
    );


    /*
     * Mark a single notification as read.
     */
    Route::patch(
        'notifications/{id}/read',
        [NotificationController::class, 'markRead']
    );


    /*
     * Notification CRUD.
     *
     * Notifications are not created through this API,
     * so the store action is excluded.
     */
    Route::apiResource(
        'notifications',
        NotificationController::class
    )->except([
        'store',
    ]);


    /*
    |--------------------------------------------------------------------------
    | Analytics
    |--------------------------------------------------------------------------
    */

    Route::get(
        'analytics',
        [AnalyticsController::class, 'index']
    );

    Route::get(
        'analytics/dashboard',
        [AnalyticsController::class, 'dashboard']
    );


    /*
    |--------------------------------------------------------------------------
    | Reports
    |--------------------------------------------------------------------------
    */

    Route::get(
        'reports/export',
        [ReportController::class, 'export']
    );

    Route::get(
        'reports/preview',
        [ReportController::class, 'preview']
    );


    /*
    |--------------------------------------------------------------------------
    | Audit Logs
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'audit-logs',
        AuditLogController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Email Templates
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'email-templates',
        EmailTemplateController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Settings
    |--------------------------------------------------------------------------
    */

    Route::get(
        'settings',
        [SettingController::class, 'index']
    );

    Route::put(
        'settings/{section}',
        [SettingController::class, 'update']
    );
});