<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        Plan::create([
            'name' => '1 Year Plan',
            'slug' => '1-year',
            'duration_months' => 12,
            'original_price_pence' => 1799,
            'discounted_price_pence' => 699,
            'discount_percentage' => 60,
            'currency' => 'GBP',
            'is_active' => true,
        ]);
    }
}
