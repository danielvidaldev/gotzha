<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateTracking extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'session_id',
        'utm_source',
        'utm_campaign',
        'aff_id',
        'sub_id',
        'landing_url',
        'ip_address',
        'user_agent',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
