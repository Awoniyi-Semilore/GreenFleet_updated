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
    Schema::table('transport_requests', function (Blueprint $table) {
        $table->string('line_manager_email')->nullable()->after('branch_id');
    });
}

public function down(): void
{
    Schema::table('transport_requests', function (Blueprint $table) {
        $table->dropColumn('line_manager_email');
    });
}
};
