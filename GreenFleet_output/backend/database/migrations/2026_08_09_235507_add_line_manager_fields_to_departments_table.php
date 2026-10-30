<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            if (!Schema::hasColumn('departments', 'line_manager_name')) {
                $table->string('line_manager_name')->nullable();
            }
            if (!Schema::hasColumn('departments', 'line_manager_email')) {
                $table->string('line_manager_email')->nullable();
            }
            if (!Schema::hasColumn('departments', 'line_manager_title')) {
                $table->string('line_manager_title')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropColumn(['line_manager_name', 'line_manager_email', 'line_manager_title']);
        });
    }
};