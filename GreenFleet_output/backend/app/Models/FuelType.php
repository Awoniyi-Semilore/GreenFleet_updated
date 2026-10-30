<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FuelType extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }
}