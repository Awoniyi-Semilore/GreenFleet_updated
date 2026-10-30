<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fuel_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnUpdate();
            $table->decimal('litres', 10, 2);
            $table->decimal('cost', 12, 2);
            $table->decimal('odometer', 10, 2);
            $table->date('fuel_date');
            $table->string('station');
            $table->foreignId('created_by')->constrained('users')->cascadeOnUpdate();
            $table->timestamps();

            $table->index('vehicle_id');
            $table->index('fuel_date');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fuel_logs');
    }
};