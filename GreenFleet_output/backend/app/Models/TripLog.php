<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripLog extends Model
{
    protected $fillable = [
        'transport_request_id',
        'assignment_id',
        'vehicle_id',
        'driver_id',
        'start_odometer',
        'end_odometer',
        'distance_travelled',
        'departure_time',
        'arrival_time',
        'fuel_used',
        'remarks',
        'status',
    ];

    public function transportRequest(): BelongsTo
    {
        return $this->belongsTo(TransportRequest::class);
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}