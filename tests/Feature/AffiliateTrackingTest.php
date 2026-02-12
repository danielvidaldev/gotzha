<?php

use App\Models\AffiliateTracking;
use App\Models\Plan;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('captures affiliate params from URL query', function () {
    $response = $this->get('/signup?utm_source=google&aff_id=123');

    $response->assertStatus(200);

    $affiliateParams = session('affiliate_params');

    expect($affiliateParams)->toBeArray()
        ->and($affiliateParams['utm_source'])->toBe('google')
        ->and($affiliateParams['aff_id'])->toBe('123')
        ->and($affiliateParams)->toHaveKey('landing_url');
});

it('persists affiliate params across requests', function () {
    // First request captures affiliate params
    $this->get('/signup?utm_source=google&aff_id=123');

    // Second request without any affiliate params
    $response = $this->get('/signup');

    $response->assertStatus(200);

    $affiliateParams = session('affiliate_params');

    expect($affiliateParams)->toBeArray()
        ->and($affiliateParams['utm_source'])->toBe('google')
        ->and($affiliateParams['aff_id'])->toBe('123');
});

it('passes affiliate params as Inertia prop', function () {
    $this->get('/signup?utm_source=google&aff_id=123')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Signup/Index')
            ->has('affiliateParams')
            ->where('affiliateParams.utm_source', 'google')
            ->where('affiliateParams.aff_id', '123')
        );
});

it('stores affiliate tracking on account creation', function () {
    // Visit signup with affiliate params to populate the session
    $this->get('/signup?utm_source=google&utm_campaign=summer&aff_id=123&sub_id=abc');

    // Submit account creation
    $response = $this->postJson('/signup/account', [
        'email' => 'affiliate@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJson(['success' => true]);

    $tracking = AffiliateTracking::first();

    expect($tracking)->not->toBeNull()
        ->and($tracking->utm_source)->toBe('google')
        ->and($tracking->utm_campaign)->toBe('summer')
        ->and($tracking->aff_id)->toBe('123')
        ->and($tracking->sub_id)->toBe('abc')
        ->and($tracking->landing_url)->toContain('/signup')
        ->and($tracking->session_id)->not->toBeEmpty()
        ->and($tracking->ip_address)->not->toBeNull()
        ->and($tracking->order_id)->toBeNull();
});

it('does not store affiliate tracking without params', function () {
    // Visit signup without any affiliate params
    $this->get('/signup');

    // Submit account creation
    $response = $this->postJson('/signup/account', [
        'email' => 'noaffiliate@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJson(['success' => true]);

    expect(AffiliateTracking::count())->toBe(0);
});

it('links affiliate tracking to order on payment', function () {
    // Create a plan for the payment step
    $plan = Plan::create([
        'name' => '1 Year Plan',
        'slug' => '1-year',
        'duration_months' => 12,
        'original_price_pence' => 1799,
        'discounted_price_pence' => 699,
        'discount_percentage' => 60,
        'currency' => 'GBP',
        'is_active' => true,
    ]);

    // Visit signup with affiliate params
    $this->get('/signup?utm_source=google&aff_id=456');

    // Create account (this stores the AffiliateTracking record with user_id)
    $accountResponse = $this->postJson('/signup/account', [
        'email' => 'payment@example.com',
        'password' => 'password123',
    ]);

    $accountResponse->assertStatus(200);
    $userId = $accountResponse->json('user.id');

    // Verify the tracking record exists without an order but with user_id
    $tracking = AffiliateTracking::first();
    expect($tracking)->not->toBeNull()
        ->and($tracking->order_id)->toBeNull()
        ->and($tracking->user_id)->toBe($userId);

    // Submit payment (using paypal to avoid card processing delays)
    $paymentResponse = $this->postJson('/signup/payment', [
        'user_id' => $userId,
        'plan_id' => $plan->id,
        'payment_method' => 'paypal',
    ]);

    $paymentResponse->assertStatus(200)
        ->assertJson(['success' => true]);

    // Refresh and verify the tracking record now has the order_id
    $tracking->refresh();
    expect($tracking->order_id)->not->toBeNull();
});

it('merges new params with existing session params', function () {
    // First visit with utm_source
    $this->get('/signup?utm_source=google');

    $firstParams = session('affiliate_params');
    expect($firstParams['utm_source'])->toBe('google');

    // Second visit with aff_id (should merge, not replace)
    $this->get('/signup?aff_id=789');

    $mergedParams = session('affiliate_params');

    expect($mergedParams)->toBeArray()
        ->and($mergedParams['utm_source'])->toBe('google')
        ->and($mergedParams['aff_id'])->toBe('789')
        ->and($mergedParams)->toHaveKey('landing_url');
});
