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
        Schema::table('drivers', function (Blueprint $table) {
            // 10 total digits, 8 after the decimal point (e.g., -90.12345678)
            $table->decimal('current_latitude', 10, 8)->nullable()->after('status');
            // 11 total digits, 8 after the decimal point (e.g., -180.12345678)
            $table->decimal('current_longitude', 11, 8)->nullable()->after('current_latitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn(['current_latitude', 'current_longitude']);
        });
    }
};