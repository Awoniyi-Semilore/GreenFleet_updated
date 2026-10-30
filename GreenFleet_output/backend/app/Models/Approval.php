<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Approval extends Model
{
    protected $fillable = [
        'transport_request_id',
        'approver_id',
        'level',
        'status',
        'comments',
        'approved_at',
    ];

    public function transportRequest(): BelongsTo
    {
        return $this->belongsTo(TransportRequest::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}