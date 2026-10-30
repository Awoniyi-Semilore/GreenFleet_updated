<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'transport_request_id',
        'submitted_by',
        'driver_id',
        'vehicle_id',
        'type',
        'category',
        'comment',
        'description',
        'status',
        'resolution_note',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function transportRequest(): BelongsTo
    {
        return $this->belongsTo(TransportRequest::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}