<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Branch;
use App\Models\Notification;
use App\Models\Role;
use App\Models\TransportRequest;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\VehicleType;
use App\Models\FuelType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TransportRequestPoolingTest extends TestCase
{
    use RefreshDatabase;

    public function test_pooled_passenger_boarding_sends_notifications_to_other_riders()
    {
        // Fake all outgoing emails
        Mail::fake();

        // 1. Create Lookup tables to prevent foreign key constraint violations
        $role = Role::create(['name' => 'Transport Admin', 'display_name' => 'Transport Admin']);
        $branch = Branch::create(['name' => 'Main Branch', 'code' => 'HQ']);
        
        $vehicleType = VehicleType::create(['name' => 'Sedan', 'capacity' => 4]);
        $fuelType = FuelType::create(['name' => 'Petrol']);

        // 2. Setup Fleet assets
        $vehicle = Vehicle::create([
            'plate_number' => 'XYZ-123',
            'vehicle_type_id' => $vehicleType->id,
            'fuel_type_id' => $fuelType->id,
            'branch_id' => $branch->id,
            'status' => 'AVAILABLE',
        ]);

        $driverUser = User::factory()->create([
            'role_id' => $role->id,
            'branch_id' => $branch->id,
        ]);
        
        $driver = Driver::create([
            'user_id' => $driverUser->id,
            'branch_id' => $branch->id,
            'license_number' => 'DL-987654',
            'status' => 'ACTIVE'
        ]);

        $admin = User::factory()->create([
            'role_id' => $role->id,
            'branch_id' => $branch->id,
        ]);

        // 3. Create 3 passengers
        $passengerA = User::factory()->create(['first_name' => 'Alice', 'email' => 'alice@example.com', 'role_id' => $role->id, 'branch_id' => $branch->id]);
        $passengerB = User::factory()->create(['first_name' => 'Bob', 'email' => 'bob@example.com', 'role_id' => $role->id, 'branch_id' => $branch->id]);
        $passengerC = User::factory()->create(['first_name' => 'Charlie', 'email' => 'charlie@example.com', 'role_id' => $role->id, 'branch_id' => $branch->id]);

        // 4. Create pooled assignment
        $assignment = Assignment::create([
            'vehicle_id' => $vehicle->id,
            'driver_id' => $driver->id,
            'assigned_by' => $admin->id,
            'assigned_at' => now(),
            'status' => 'ASSIGNED',
        ]);

        // 5. Create 3 requests sharing the pooled assignment
        $requestA = TransportRequest::create([
            'requester_id' => $passengerA->id,
            'branch_id' => $branch->id,
            'pickup_location' => 'HQ',
            'destination' => 'North Depot',
            'purpose' => 'Logistics meeting',
            'departure_date' => now()->toDateString(),
            'departure_time' => '09:00',
            'passenger_count' => 1,
            'status' => 'ASSIGNED',
            'assignment_id' => $assignment->id,
        ]);

        $requestB = TransportRequest::create([
            'requester_id' => $passengerB->id,
            'branch_id' => $branch->id,
            'pickup_location' => 'HQ',
            'destination' => 'North Depot',
            'purpose' => 'Delivery audit',
            'departure_date' => now()->toDateString(),
            'departure_time' => '09:00',
            'passenger_count' => 1,
            'status' => 'ASSIGNED',
            'assignment_id' => $assignment->id,
        ]);

        $requestC = TransportRequest::create([
            'requester_id' => $passengerC->id,
            'branch_id' => $branch->id,
            'pickup_location' => 'HQ',
            'destination' => 'North Depot',
            'purpose' => 'Staff training',
            'departure_date' => now()->toDateString(),
            'departure_time' => '09:00',
            'passenger_count' => 1,
            'status' => 'ASSIGNED',
            'assignment_id' => $assignment->id,
        ]);

        // Authenticate as Alice to simulate action
        $this->actingAs($passengerA);

        $responseSpot = $this->patchJson("/api/transport-requests/{$requestA->id}/spot-driver");
        $responseSpot->assertStatus(200);
        $this->assertDatabaseHas('transport_requests', [
            'id' => $requestA->id,
            'status' => 'DRIVER_SPOTTED',
        ]);

        // When Alice enters the vehicle, Bob and Charlie must get emails and notifications
        $responseBoard = $this->patchJson("/api/transport-requests/{$requestA->id}/board-vehicle");
        $responseBoard->assertStatus(200);

        // Assert Alice status updated
        $this->assertDatabaseHas('transport_requests', [
            'id' => $requestA->id,
            'status' => 'BOARDED_WAITING',
        ]);

        // Assert notifications were added for Bob and Charlie
        $this->assertDatabaseHas('notifications', [
            'user_id' => $passengerB->id,
            'title' => 'Coworker Boarded!',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $passengerC->id,
            'title' => 'Coworker Boarded!',
        ]);

        // Assert no notification was wrongly dispatched to Alice about herself
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $passengerA->id,
            'title' => 'Coworker Boarded!',
        ]);

        // Assert fleet admins were notified of the boarding action
        $this->assertDatabaseHas('notifications', [
            'user_id' => $admin->id,
            'title' => 'Pooled Passenger Boarded',
        ]);

        // Assert Bob and Charlie were emailed
        Mail::assertSent(function ($mail) use ($passengerB) {
            return $mail->hasTo($passengerB->email);
        });

        Mail::assertSent(function ($mail) use ($passengerC) {
            return $mail->hasTo($passengerC->email);
        });

        // Ensure Alice did not get an alert email about her own boarding action
        Mail::assertNotSent(function ($mail) use ($passengerA) {
            return $mail->hasTo($passengerA->email);
        });
    }
}