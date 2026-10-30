<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleInspection extends Model
{
    protected $fillable = [
        'vehicle_id',
        'inspection_date',
        'result',
        'remarks',
        'next_inspection_date',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}