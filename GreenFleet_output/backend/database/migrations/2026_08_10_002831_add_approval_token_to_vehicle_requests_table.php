<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Detect whether the table is named 'requests' or 'trip_requests' or 'vehicle_requests'
        $tableName = Schema::hasTable('requests') ? 'requests' : (Schema::hasTable('trip_requests') ? 'trip_requests' : 'vehicle_requests');

        if (Schema::hasTable($tableName)) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (!Schema::hasColumn($tableName, 'approval_token')) {
                    $table->string('approval_token', 64)->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        $tableName = Schema::hasTable('requests') ? 'requests' : (Schema::hasTable('trip_requests') ? 'trip_requests' : 'vehicle_requests');

        if (Schema::hasTable($tableName)) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (Schema::hasColumn($tableName, 'approval_token')) {
                    $table->dropColumn('approval_token');
                }
            });
        }
    }
};