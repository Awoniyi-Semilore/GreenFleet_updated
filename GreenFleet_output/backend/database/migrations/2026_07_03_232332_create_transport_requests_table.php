<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('transport_requests');

        Schema::create('transport_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_id')->constrained('users')->cascadeOnUpdate();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate();
            
            // The pooling link: multiple requests can share the same assignment (driver & vehicle dispatch)
            $table->unsignedBigInteger('assignment_id')->nullable();
            
            $table->string('pickup_location');
            $table->string('destination');
            $table->text('purpose');
            $table->date('departure_date');
            $table->time('departure_time');
            $table->integer('passenger_count');
            $table->enum('priority', ['LOW', 'NORMAL', 'HIGH', 'URGENT'])->default('NORMAL');
            
            // Added DRIVER_SPOTTED and BOARDED_WAITING for passenger flow workflows
            $table->enum('status', [
                'PENDING',
                'PENDING_LINE_MANAGER',
                'PENDING_ADMIN',
                'APPROVED',
                'REJECTED',
                'ASSIGNED',
                'DRIVER_SPOTTED',
                'BOARDED_WAITING',
                'COMPLETED',
                'CANCELLED',
            ])->default('PENDING');
            
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index('requester_id');
            $table->index('branch_id');
            $table->index('assignment_id');
            $table->index('status');
            $table->index('priority');
            $table->index('departure_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transport_requests');
    }
};