<?php

use App\Http\Controllers\SignupController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/signup');
});

// Signup flow
Route::get('/signup/{step?}', [SignupController::class, 'show'])
    ->where('step', '[1-4]')
    ->name('signup.show')
    ->middleware('capture.affiliate');

Route::post('/signup/account', [SignupController::class, 'storeAccount'])
    ->name('signup.account');

Route::post('/signup/payment', [SignupController::class, 'storePayment'])
    ->name('signup.payment');

// Jetstream auth routes
Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});
