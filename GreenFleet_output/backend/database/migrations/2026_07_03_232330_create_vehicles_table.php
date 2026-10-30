<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('plate_number')->unique();
            $table->string('make');
            $table->string('model');
            $table->year('year');
            $table->string('color')->nullable();
            $table->foreignId('vehicle_type_id')->constrained('vehicle_types')->cascadeOnUpdate();
            $table->foreignId('fuel_type_id')->constrained('fuel_types')->cascadeOnUpdate();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate();
            $table->integer('capacity');
            $table->enum('status', ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'OUT_OF_SERVICE'])->default('AVAILABLE');
            $table->timestamps();

            $table->index('status');
            $table->index('vehicle_type_id');
            $table->index('branch_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};