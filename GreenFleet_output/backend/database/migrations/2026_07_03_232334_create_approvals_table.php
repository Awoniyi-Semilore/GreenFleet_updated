<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transport_request_id')->constrained('transport_requests')->cascadeOnUpdate();
            $table->foreignId('approved_by')->constrained('users')->cascadeOnUpdate();
            $table->enum('status', ['APPROVED', 'REJECTED']);
            $table->text('comments')->nullable();
            $table->timestamp('approved_at');
            $table->timestamps();

            $table->index('transport_request_id');
            $table->index('approved_by');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approvals');
    }
};