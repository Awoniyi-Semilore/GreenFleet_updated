<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assignment extends Model
{
    protected $fillable = [
        'vehicle_id',
        'driver_id',
        'assigned_by',
        'assigned_at',
        'status',
        'remarks',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];


    /**
     * Transport requests pooled under this assignment.
     *
     * The relationship is:
     *
     * transport_requests.assignment_id
     *              ↓
     * assignments.id
     */
    public function transportRequests(): HasMany
    {
        return $this->hasMany(
            TransportRequest::class,
            'assignment_id'
        );
    }


    /**
     * Vehicle assigned to this trip.
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(
            Vehicle::class
        );
    }


    /**
     * Driver assigned to this trip.
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(
            Driver::class
        );
    }


    /**
     * User who created the assignment.
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'assigned_by'
        );
    }


    /**
     * Passenger/staff GPS records associated
     * with this assignment.
     */
    public function tripLocations(): HasMany
    {
        return $this->hasMany(
            TripLocation::class,
            'assignment_id'
        );
    }
}