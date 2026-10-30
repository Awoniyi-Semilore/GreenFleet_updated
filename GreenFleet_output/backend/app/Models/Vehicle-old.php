<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    protected $fillable = [
        'plate_number',
        'vehicle_name',
        'make',
        'model',
        'year',
        'color',
        'vehicle_type_id',
        'fuel_type_id',
        'branch_id',
        'capacity',
        'status',
    ];

    protected $casts = [
        'year' => 'integer',
        'capacity' => 'integer',
    ];

    protected $attributes = [
        'status' => 'AVAILABLE',
    ];

    public function vehicleType(): BelongsTo
    {
        return $this->belongsTo(VehicleType::class);
    }

    public function fuelType(): BelongsTo
    {
        return $this->belongsTo(FuelType::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(MaintenanceRecord::class);
    }

    public function fuelLogs(): HasMany
    {
        return $this->hasMany(FuelLog::class);
    }

    public function vehicleInspections(): HasMany
    {
        return $this->hasMany(VehicleInspection::class);
    }

    public function vehicleDocuments(): HasMany
    {
        return $this->hasMany(VehicleDocument::class);
    }
}