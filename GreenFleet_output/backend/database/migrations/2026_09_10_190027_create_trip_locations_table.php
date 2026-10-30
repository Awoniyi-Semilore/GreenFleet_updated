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
        Schema::create('trip_locations', function (Blueprint $table) {

            $table->id();


            /*
             * The transport request that is currently
             * being tracked.
             */
            $table->foreignId('transport_request_id')
                ->constrained('transport_requests')
                ->cascadeOnDelete();


            /*
             * The assignment identifies the actual
             * driver + vehicle being used.
             *
             * Multiple transport requests can share
             * the same assignment.
             */
            $table->foreignId('assignment_id')
                ->constrained('assignments')
                ->cascadeOnDelete();


            /*
             * The staff member/passenger whose phone
             * is currently providing GPS.
             */
            $table->foreignId('staff_id')
                ->constrained('users')
                ->cascadeOnDelete();


            /*
             * GPS coordinates.
             */
            $table->decimal('latitude', 10, 8);

            $table->decimal('longitude', 11, 8);


            /*
             * GPS accuracy in metres.
             */
            $table->decimal(
                'accuracy',
                10,
                2
            )->nullable();


            /*
             * Whether this staff member is currently
             * sharing their location.
             */
            $table->boolean('is_active')
                ->default(true);


            /*
             * Last successful GPS update.
             */
            $table->timestamp(
                'last_updated_at'
            )->nullable();


            $table->timestamps();


            /*
             * One current location record per
             * staff member per assignment.
             */
            $table->unique([
                'assignment_id',
                'staff_id',
            ]);


            $table->index(
                'transport_request_id'
            );

            $table->index(
                'assignment_id'
            );

            $table->index(
                'staff_id'
            );

            $table->index(
                'is_active'
            );

            $table->index(
                'last_updated_at'
            );
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(
            'trip_locations'
        );
    }
};