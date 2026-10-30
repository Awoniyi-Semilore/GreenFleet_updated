<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripLocation extends Model
{
    protected $fillable = [
        'transport_request_id',
        'assignment_id',
        'staff_id',
        'latitude',
        'longitude',
        'accuracy',
        'is_active',
        'last_updated_at',
    ];


    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'accuracy' => 'float',
        'is_active' => 'boolean',
        'last_updated_at' => 'datetime',
    ];


    /**
     * Transport request associated with this location.
     */
    public function transportRequest(): BelongsTo
    {
        return $this->belongsTo(
            TransportRequest::class,
            'transport_request_id'
        );
    }


    /**
     * Assignment associated with this location.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(
            Assignment::class,
            'assignment_id'
        );
    }


    /**
     * Staff member whose phone is supplying
     * the GPS location.
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'staff_id'
        );
    }
}