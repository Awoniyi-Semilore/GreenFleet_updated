<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trip_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('transport_request_id')
                ->constrained('transport_requests')
                ->cascadeOnUpdate();

            $table->foreignId('assignment_id')
                ->constrained('assignments')
                ->cascadeOnUpdate();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnUpdate();

            $table->foreignId('driver_id')
                ->constrained('drivers')
                ->cascadeOnUpdate();

            $table->decimal('start_odometer', 10, 2);

            $table->decimal('end_odometer', 10, 2)
                ->nullable();

            $table->decimal('distance_travelled', 10, 2)
                ->nullable();

            $table->timestamp('departure_time');

            $table->timestamp('arrival_time')
                ->nullable();

            $table->decimal('fuel_used', 10, 2)
                ->nullable();

            $table->text('remarks')
                ->nullable();

            $table->enum('status', [
                'STARTED',
                'ONGOING',
                'COMPLETED'
            ]);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_logs');
    }
};