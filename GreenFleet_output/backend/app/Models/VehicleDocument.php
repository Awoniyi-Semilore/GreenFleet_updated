<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleDocument extends Model
{
    protected $fillable = [
        'vehicle_id',
        'document_name',
        'file_path',
        'expiry_date',
        'status',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}