<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transport_request_id')->nullable()->constrained('transport_requests')->cascadeOnDelete();
            $table->foreignId('submitted_by')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->cascadeOnDelete();
            $table->string('type')->nullable();
            $table->string('category')->nullable();
            $table->text('comment')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['Open', 'Resolved'])->default('Open');
            $table->text('resolution_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};