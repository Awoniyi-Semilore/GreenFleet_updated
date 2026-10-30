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
        // Re-creating or modifying assignments without a single transport_request_id
        Schema::dropIfExists('assignments');
        
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnUpdate();
            $table->foreignId('driver_id')->constrained('drivers')->cascadeOnUpdate();
            $table->foreignId('assigned_by')->constrained('users')->cascadeOnUpdate();
            $table->timestamp('assigned_at');
            $table->text('remarks')->nullable();
            $table->enum('status', ['ASSIGNED', 'ACCEPTED', 'REJECTED', 'COMPLETED'])->default('ASSIGNED');
            $table->timestamps();

            $table->index('vehicle_id');
            $table->index('driver_id');
            $table->index('assigned_by');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};