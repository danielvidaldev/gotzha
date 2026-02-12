<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Models\AffiliateTracking;
use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SignupController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService,
    ) {}

    public function show(Request $request, ?string $step = null): Response
    {
        $plans = Plan::where('is_active', true)->get();
        $affiliateParams = $request->session()->get('affiliate_params', []);

        return Inertia::render('Signup/Index', [
            'plans' => $plans,
            'initialStep' => $step ? (int) $step : 1,
            'affiliateParams' => $affiliateParams,
            'coupon' => [
                'code' => 'GOLD_DISCOUNT_2026',
                'discountLabel' => '67% OFF',
                'isApplied' => true,
            ],
            'config' => [
                'supportEmail' => 'support@privatebyright.com',
                'supportUrl' => 'support.privatebyright.com',
                'trustpilotScore' => 5,
                'trustpilotReviews' => 176,
                'vatRate' => 20,
                'currency' => 'GBP',
                'currencySymbol' => '£',
                'maxDevices' => 5,
            ],
        ]);
    }

    public function storeAccount(StoreAccountRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => explode('@', $validated['email'])[0],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        // Store affiliate tracking
        $affiliateParams = $request->session()->get('affiliate_params', []);
        if (!empty($affiliateParams)) {
            AffiliateTracking::create([
                'user_id' => $user->id,
                'session_id' => $request->session()->getId(),
                'utm_source' => $affiliateParams['utm_source'] ?? null,
                'utm_campaign' => $affiliateParams['utm_campaign'] ?? null,
                'aff_id' => $affiliateParams['aff_id'] ?? null,
                'sub_id' => $affiliateParams['sub_id'] ?? null,
                'landing_url' => $affiliateParams['landing_url'] ?? null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
            ],
        ]);
    }

    public function storePayment(StorePaymentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $plan = Plan::findOrFail($validated['plan_id']);
        $user = User::findOrFail($validated['user_id']);

        $subtotal = $plan->discounted_price_pence * $plan->duration_months;
        $taxRate = 20;
        $taxAmount = (int) round($subtotal * ($taxRate / 100));
        $total = $subtotal + $taxAmount;

        $paymentResult = $this->paymentService->charge([
            'amount' => $total,
            'currency' => 'GBP',
            'card_number' => $validated['card_number'] ?? null,
            'expiry' => $validated['expiry'] ?? null,
            'cvc' => $validated['cvc'] ?? null,
            'payment_method' => $validated['payment_method'],
        ]);

        if (!$paymentResult['success']) {
            return response()->json([
                'success' => false,
                'error' => $paymentResult['error'],
            ], 422);
        }

        $order = Order::create([
            'order_id' => 'INV_' . strtoupper(Str::random(4)),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'subtotal_pence' => $subtotal,
            'tax_pence' => $taxAmount,
            'tax_rate' => $taxRate,
            'total_pence' => $total,
            'currency' => 'GBP',
            'coupon_code' => $validated['coupon_code'] ?? null,
            'payment_method' => $validated['payment_method'],
            'card_last_four' => isset($validated['card_number'])
                ? substr(preg_replace('/\s/', '', $validated['card_number']), -4)
                : null,
            'card_brand' => $paymentResult['card_brand'] ?? null,
            'status' => 'completed',
            'paid_at' => now(),
        ]);

        // Link affiliate tracking to order (match by user_id for reliability)
        $tracking = AffiliateTracking::where('user_id', $user->id)
            ->whereNull('order_id')
            ->first();
        if ($tracking) {
            $tracking->update(['order_id' => $order->id]);
        }

        return response()->json([
            'success' => true,
            'order' => [
                'id' => $order->order_id,
                'total' => $order->total_pence,
                'currency' => $order->currency,
                'paid_at' => $order->paid_at->toISOString(),
                'plan_name' => $plan->name,
                'payment_method' => $order->payment_method,
                'card_last_four' => $order->card_last_four,
                'card_brand' => $order->card_brand,
            ],
        ]);
    }
}
