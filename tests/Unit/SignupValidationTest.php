<?php

use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\StorePaymentRequest;

it('has the correct account validation rules', function () {
    $request = new StoreAccountRequest();
    $rules = $request->rules();

    expect($rules)->toHaveKeys(['email', 'password']);
    expect($rules['email'])->toContain('required');
    expect($rules['email'])->toContain('email');
    expect($rules['password'])->toContain('required');
    expect($rules['password'])->toContain('string');
    expect($rules['password'])->toContain('min:6');
});

it('has the correct payment validation rules', function () {
    $request = new StorePaymentRequest();
    $rules = $request->rules();

    expect($rules)->toHaveKeys(['user_id', 'plan_id', 'payment_method']);
    expect($rules['payment_method'])->toContain('required');
    expect($rules['payment_method'])->toContain('in:card,apple_pay,google_pay,paypal');
    expect($rules['card_number'])->toContain('required_if:payment_method,card');
    expect($rules['expiry'])->toContain('required_if:payment_method,card');
    expect($rules['cvc'])->toContain('required_if:payment_method,card');
});

it('authorizes all account requests', function () {
    $request = new StoreAccountRequest();
    expect($request->authorize())->toBeTrue();
});

it('authorizes all payment requests', function () {
    $request = new StorePaymentRequest();
    expect($request->authorize())->toBeTrue();
});

it('has custom error messages for account validation', function () {
    $request = new StoreAccountRequest();
    $messages = $request->messages();

    expect($messages)->toHaveKey('email.unique');
    expect($messages)->toHaveKey('password.min');
});
