<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Driver extends Model
{
    protected $fillable = [
        'user_id',
        'branch_id',        // <-- ADDED
        'license_number',
        'license_expiry',
        'phone',
        'address',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo    // <-- ADDED
    {
        return $this->belongsTo(Branch::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }
}