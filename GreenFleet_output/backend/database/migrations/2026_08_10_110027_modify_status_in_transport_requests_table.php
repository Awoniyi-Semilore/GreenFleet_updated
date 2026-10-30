<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;



return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transport_requests', function (Blueprint $table) {
            $table->string('status', 50)->default('PENDING_LINE_MANAGER')->change();
        });
    }

    public function down(): void
    {
        Schema::table('transport_requests', function (Blueprint $table) {
            $table->string('status', 255)->change();
        });
    }
};