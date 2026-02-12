<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'duration_months',
        'original_price_pence',
        'discounted_price_pence',
        'discount_percentage',
        'currency',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'duration_months' => 'integer',
        'original_price_pence' => 'integer',
        'discounted_price_pence' => 'integer',
        'discount_percentage' => 'integer',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
