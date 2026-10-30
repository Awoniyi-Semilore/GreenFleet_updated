<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelLog extends Model
{
    protected $fillable = [
        'vehicle_id',
        'fuel_type_id',
        'quantity',
        'cost',
        'odometer',
        'fuel_date',
        'receipt_number',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function fuelType(): BelongsTo
    {
        return $this->belongsTo(FuelType::class);
    }
}