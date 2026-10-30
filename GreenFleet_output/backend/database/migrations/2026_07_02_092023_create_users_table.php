<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {

            $table->id();

            $table->string('first_name');

            $table->string('last_name');

            $table->string('username')->unique();

            $table->string('email')->unique();

            $table->string('password');

            $table->foreignId('role_id')
                ->constrained('roles')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('department_id')
                ->constrained('departments')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('branch_id')
                ->constrained('branches')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->enum('status', [
                'ACTIVE',
                'INACTIVE'
            ])->default('ACTIVE');

            $table->rememberToken();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};