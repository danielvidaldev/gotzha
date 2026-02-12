<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'plan_id',
        'subtotal_pence',
        'tax_pence',
        'tax_rate',
        'total_pence',
        'currency',
        'coupon_code',
        'payment_method',
        'card_last_four',
        'card_brand',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'subtotal_pence' => 'integer',
        'tax_pence' => 'integer',
        'tax_rate' => 'decimal:2',
        'total_pence' => 'integer',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function affiliateTracking(): HasOne
    {
        return $this->hasOne(AffiliateTracking::class);
    }
}
