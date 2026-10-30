<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fuel_logs', function (Blueprint $table) {
            $table->foreignId('fuel_type_id')
                ->after('vehicle_id')
                ->nullable()
                ->constrained('fuel_types')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('fuel_logs', function (Blueprint $table) {
            $table->dropForeign(['fuel_type_id']);
            $table->dropColumn('fuel_type_id');
        });
    }
};