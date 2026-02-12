<?php

use App\Services\PaymentService;
use Illuminate\Support\Facades\Log;

it('processes a standard visa card successfully', function () {
    Log::shouldReceive('info')->once();

    $service = new \App\Services\PaymentService();

    $result = $service->charge([
        'amount' => 49.99,
        'currency' => 'USD',
        'payment_method' => 'credit_card',
        'card_number' => '4242424242424242',
    ]);

    expect($result['success'])->toBeTrue()
        ->and($result['transaction_id'])->toStartWith('txn_')
        ->and($result['card_brand'])->toBe('visa');
});

it('processes a mastercard successfully', function () {
    Log::shouldReceive('info')->once();

    $service = new \App\Services\PaymentService();

    $result = $service->charge([
        'amount' => 75.00,
        'currency' => 'USD',
        'payment_method' => 'credit_card',
        'card_number' => '5555555555554444',
    ]);

    expect($result['success'])->toBeTrue()
        ->and($result['transaction_id'])->toStartWith('txn_')
        ->and($result['card_brand'])->toBe('mastercard');
});

it('declines card ending 0000', function () {
    Log::shouldReceive('info')->once();

    $service = new \App\Services\PaymentService();

    $result = $service->charge([
        'amount' => 100.00,
        'currency' => 'USD',
        'payment_method' => 'credit_card',
        'card_number' => '4242424242420000',
    ]);

    expect($result['success'])->toBeFalse()
        ->and($result['error'])->toBe('Your card was declined. Please try a different payment method.');
});

it('times out card ending 1111', function () {
    Log::shouldReceive('info')->once();

    $service = new \App\Services\PaymentService();

    $result = $service->charge([
        'amount' => 100.00,
        'currency' => 'USD',
        'payment_method' => 'credit_card',
        'card_number' => '4242424242421111',
    ]);

    expect($result['success'])->toBeFalse()
        ->and($result['error'])->toBe('Payment processing timed out. Please try again.');
});

it('processes apple pay successfully', function () {
    Log::shouldReceive('info')->once();

    $service = new \App\Services\PaymentService();

    $result = $service->charge([
        'amount' => 29.99,
        'currency' => 'USD',
        'payment_method' => 'apple_pay',
    ]);

    expect($result['success'])->toBeTrue()
        ->and($result['transaction_id'])->toStartWith('txn_')
        ->and($result['card_brand'])->toBe('apple_pay');
});

it('processes google pay successfully', function () {
    Log::shouldReceive('info')->once();

    $service = new \App\Services\PaymentService();

    $result = $service->charge([
        'amount' => 29.99,
        'currency' => 'USD',
        'payment_method' => 'google_pay',
    ]);

    expect($result['success'])->toBeTrue()
        ->and($result['transaction_id'])->toStartWith('txn_')
        ->and($result['card_brand'])->toBe('google_pay');
});

it('processes paypal successfully', function () {
    Log::shouldReceive('info')->once();

    $service = new \App\Services\PaymentService();

    $result = $service->charge([
        'amount' => 29.99,
        'currency' => 'USD',
        'payment_method' => 'paypal',
    ]);

    expect($result['success'])->toBeTrue()
        ->and($result['transaction_id'])->toStartWith('txn_')
        ->and($result['card_brand'])->toBe('paypal');
});

it('detects visa card brand', function () {
    Log::shouldReceive('info')->once();

    $service = new \App\Services\PaymentService();

    $result = $service->charge([
        'amount' => 10.00,
        'currency' => 'USD',
        'payment_method' => 'credit_card',
        'card_number' => '4111111111111234',
    ]);

    expect($result['success'])->toBeTrue()
        ->and($result['card_brand'])->toBe('visa');
});

it('detects mastercard brand', function () {
    Log::shouldReceive('info')->once();

    $service = new \App\Services\PaymentService();

    $result = $service->charge([
        'amount' => 10.00,
        'currency' => 'USD',
        'payment_method' => 'credit_card',
        'card_number' => '5500000000001234',
    ]);

    expect($result['success'])->toBeTrue()
        ->and($result['card_brand'])->toBe('mastercard');
});

it('detects amex card brand', function () {
    Log::shouldReceive('info')->once();

    $service = new \App\Services\PaymentService();

    $result = $service->charge([
        'amount' => 10.00,
        'currency' => 'USD',
        'payment_method' => 'credit_card',
        'card_number' => '378282246310005',
    ]);

    expect($result['success'])->toBeTrue()
        ->and($result['card_brand'])->toBe('amex');
});

it('returns unknown for unrecognized card', function () {
    Log::shouldReceive('info')->once();

    $service = new \App\Services\PaymentService();

    $result = $service->charge([
        'amount' => 10.00,
        'currency' => 'USD',
        'payment_method' => 'credit_card',
        'card_number' => '9999999999991234',
    ]);

    expect($result['success'])->toBeTrue()
        ->and($result['card_brand'])->toBe('unknown');
});
