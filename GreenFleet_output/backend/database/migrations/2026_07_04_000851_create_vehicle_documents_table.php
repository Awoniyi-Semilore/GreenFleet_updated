<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnUpdate();
            $table->string('document_name');
            $table->string('file_path');
            $table->date('expiry_date');
            $table->enum('status', ['VALID', 'EXPIRED', 'PENDING_RENEWAL'])->default('VALID');
            $table->timestamps();

            $table->index('vehicle_id');
            $table->index('status');
            $table->index('expiry_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_documents');
    }
};