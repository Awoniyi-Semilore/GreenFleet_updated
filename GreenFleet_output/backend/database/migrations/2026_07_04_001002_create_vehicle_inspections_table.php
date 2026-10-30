<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnUpdate();
            $table->date('inspection_date');
            $table->enum('result', ['PASS', 'FAIL', 'CONDITIONAL']);
            $table->text('remarks')->nullable();
            $table->date('next_inspection_date');
            $table->timestamps();

            $table->index('vehicle_id');
            $table->index('inspection_date');
            $table->index('result');
            $table->index('next_inspection_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_inspections');
    }
};