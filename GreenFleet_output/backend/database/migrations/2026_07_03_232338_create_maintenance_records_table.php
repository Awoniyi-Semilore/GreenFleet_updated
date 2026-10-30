<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnUpdate();
            $table->string('service_type');
            $table->date('service_date');
            $table->date('next_service_date')->nullable();
            $table->decimal('cost', 12, 2);
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index('vehicle_id');
            $table->index('service_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_records');
    }
};