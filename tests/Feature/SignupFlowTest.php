<?php

use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
use App\Services\PaymentService;

beforeEach(function () {
    $this->seed(\Database\Seeders\PlanSeeder::class);
    $this->plan = Plan::where('slug', '1-year')->first();
});

/*
|--------------------------------------------------------------------------
| Signup Page Rendering
|--------------------------------------------------------------------------
*/

it('renders the signup page with plans', function () {
    $response = $this->get('/signup');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Signup/Index')
        ->has('plans', 1)
        ->has('plans.0', fn ($plan) => $plan
            ->where('name', '1 Year Plan')
            ->where('slug', '1-year')
            ->where('duration_months', 12)
            ->where('original_price_pence', 1799)
            ->where('discounted_price_pence', 699)
            ->where('discount_percentage', 60)
            ->where('currency', 'GBP')
            ->where('is_active', true)
            ->etc()
        )
        ->where('initialStep', 1)
        ->has('config')
        ->has('coupon')
        ->has('affiliateParams')
    );
});

it('renders signup page with step parameter', function () {
    $response = $this->get('/signup/2');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Signup/Index')
        ->where('initialStep', 2)
    );
});

/*
|--------------------------------------------------------------------------
| Account Creation
|--------------------------------------------------------------------------
*/

it('creates an account with valid data', function () {
    $response = $this->postJson('/signup/account', [
        'email' => 'newuser@example.com',
        'password' => 'securepass123',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'user' => [
                'email' => 'newuser@example.com',
            ],
        ]);

    expect($response->json('user.id'))->toBeInt();

    $this->assertDatabaseHas('users', [
        'email' => 'newuser@example.com',
    ]);
});

it('fails account creation with invalid email', function () {
    $response = $this->postJson('/signup/account', [
        'email' => 'not-an-email',
        'password' => 'securepass123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('fails account creation with short password', function () {
    $response = $this->postJson('/signup/account', [
        'email' => 'user@example.com',
        'password' => 'abc',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});

it('fails account creation with duplicate email', function () {
    User::create([
        'name' => 'existing',
        'email' => 'duplicate@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/signup/account', [
        'email' => 'duplicate@example.com',
        'password' => 'securepass123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

/*
|--------------------------------------------------------------------------
| Payment Processing
|--------------------------------------------------------------------------
*/

it('processes payment with valid card', function () {
    $this->mock(PaymentService::class, function ($mock) {
        $mock->shouldReceive('charge')
            ->once()
            ->andReturn([
                'success' => true,
                'transaction_id' => 'txn_test123',
                'card_brand' => 'visa',
            ]);
    });

    $user = User::create([
        'name' => 'testuser',
        'email' => 'pay@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/signup/payment', [
        'user_id' => $user->id,
        'plan_id' => $this->plan->id,
        'payment_method' => 'card',
        'card_number' => '4242424242424242',
        'expiry' => '12/28',
        'cvc' => '123',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
        ]);

    expect($response->json('order'))->toHaveKeys([
        'id', 'total', 'currency', 'paid_at', 'plan_name', 'payment_method', 'card_last_four', 'card_brand',
    ]);

    expect($response->json('order.total'))->toBe(10066);
    expect($response->json('order.currency'))->toBe('GBP');
    expect($response->json('order.plan_name'))->toBe('1 Year Plan');
    expect($response->json('order.payment_method'))->toBe('card');
    expect($response->json('order.card_last_four'))->toBe('4242');
    expect($response->json('order.card_brand'))->toBe('visa');

    $this->assertDatabaseHas('orders', [
        'user_id' => $user->id,
        'plan_id' => $this->plan->id,
        'subtotal_pence' => 8388,
        'tax_pence' => 1678,
        'total_pence' => 10066,
        'currency' => 'GBP',
        'payment_method' => 'card',
        'card_last_four' => '4242',
        'card_brand' => 'visa',
        'status' => 'completed',
    ]);
});

it('rejects payment with declined card', function () {
    $this->mock(PaymentService::class, function ($mock) {
        $mock->shouldReceive('charge')
            ->once()
            ->andReturn([
                'success' => false,
                'error' => 'Your card was declined. Please try a different payment method.',
            ]);
    });

    $user = User::create([
        'name' => 'testuser',
        'email' => 'declined@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/signup/payment', [
        'user_id' => $user->id,
        'plan_id' => $this->plan->id,
        'payment_method' => 'card',
        'card_number' => '4242424242420000',
        'expiry' => '12/28',
        'cvc' => '123',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'error' => 'Your card was declined. Please try a different payment method.',
        ]);

    $this->assertDatabaseMissing('orders', [
        'user_id' => $user->id,
    ]);
});

it('rejects payment with timeout card', function () {
    $this->mock(PaymentService::class, function ($mock) {
        $mock->shouldReceive('charge')
            ->once()
            ->andReturn([
                'success' => false,
                'error' => 'Payment processing timed out. Please try again.',
            ]);
    });

    $user = User::create([
        'name' => 'testuser',
        'email' => 'timeout@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/signup/payment', [
        'user_id' => $user->id,
        'plan_id' => $this->plan->id,
        'payment_method' => 'card',
        'card_number' => '4242424242421111',
        'expiry' => '12/28',
        'cvc' => '123',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'error' => 'Payment processing timed out. Please try again.',
        ]);

    $this->assertDatabaseMissing('orders', [
        'user_id' => $user->id,
    ]);
});

it('processes express checkout payment', function () {
    $this->mock(PaymentService::class, function ($mock) {
        $mock->shouldReceive('charge')
            ->once()
            ->andReturn([
                'success' => true,
                'transaction_id' => 'txn_paypal_test',
                'card_brand' => 'paypal',
            ]);
    });

    $user = User::create([
        'name' => 'testuser',
        'email' => 'express@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/signup/payment', [
        'user_id' => $user->id,
        'plan_id' => $this->plan->id,
        'payment_method' => 'paypal',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
        ]);

    expect($response->json('order.payment_method'))->toBe('paypal');
    expect($response->json('order.card_last_four'))->toBeNull();
    expect($response->json('order.card_brand'))->toBe('paypal');

    $this->assertDatabaseHas('orders', [
        'user_id' => $user->id,
        'plan_id' => $this->plan->id,
        'payment_method' => 'paypal',
        'status' => 'completed',
    ]);
});

it('validates payment request fields', function () {
    $response = $this->postJson('/signup/payment', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors([
            'user_id',
            'plan_id',
            'payment_method',
        ]);
});

it('validates card fields are required when payment method is card', function () {
    $user = User::create([
        'name' => 'testuser',
        'email' => 'cardval@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/signup/payment', [
        'user_id' => $user->id,
        'plan_id' => $this->plan->id,
        'payment_method' => 'card',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors([
            'card_number',
            'expiry',
            'cvc',
        ]);
});

/*
|--------------------------------------------------------------------------
| Order Total Calculation
|--------------------------------------------------------------------------
*/

it('calculates order totals correctly', function () {
    $this->mock(PaymentService::class, function ($mock) {
        $mock->shouldReceive('charge')
            ->once()
            ->andReturn([
                'success' => true,
                'transaction_id' => 'txn_calc_test',
                'card_brand' => 'visa',
            ]);
    });

    $user = User::create([
        'name' => 'testuser',
        'email' => 'calc@example.com',
        'password' => bcrypt('password123'),
    ]);

    $this->postJson('/signup/payment', [
        'user_id' => $user->id,
        'plan_id' => $this->plan->id,
        'payment_method' => 'card',
        'card_number' => '4242424242424242',
        'expiry' => '12/28',
        'cvc' => '123',
    ]);

    $order = Order::where('user_id', $user->id)->first();

    // subtotal = discounted_price_pence * duration_months = 699 * 12 = 8388
    expect($order->subtotal_pence)->toBe(8388);

    // tax = subtotal * 20% = 8388 * 0.20 = 1677.6, rounded = 1678
    expect($order->tax_pence)->toBe(1678);

    // total = subtotal + tax = 8388 + 1678 = 10066
    expect($order->total_pence)->toBe(10066);

    expect($order->tax_rate)->toBe('20.00');
    expect($order->currency)->toBe('GBP');
    expect($order->status)->toBe('completed');
    expect($order->paid_at)->not->toBeNull();
});
