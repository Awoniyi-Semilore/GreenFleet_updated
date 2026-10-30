<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransportRequest extends Model
{
    protected $fillable = [
        'requester_id',
        'branch_id',
        'assignment_id',
        'line_manager_email',
        'pickup_location',
        'destination',
        'purpose',
        'departure_date',
        'departure_time',
        'passenger_count',
        'priority',
        'status',
        'rejection_reason',
        'remarks',
    ];


    /**
     * Staff member who created the request.
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'requester_id'
        );
    }


    /**
     * Approval records for this request.
     */
    public function approvals(): HasMany
    {
        return $this->hasMany(
            Approval::class,
            'transport_request_id'
        );
    }


    /**
     * Assignment containing this request.
     *
     * Multiple transport requests may share
     * one assignment.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(
            Assignment::class,
            'assignment_id'
        );
    }


    /**
     * Passenger/staff GPS records associated
     * with this request.
     */
    public function tripLocations(): HasMany
    {
        return $this->hasMany(
            TripLocation::class,
            'transport_request_id'
        );
    }
}