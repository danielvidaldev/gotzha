<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Mock payment charge.
     *
     * Card ending 0000 = decline, 1111 = timeout, others = success.
     * Express checkout methods always succeed.
     */
    public function charge(array $data): array
    {
        Log::info('PaymentService::charge', [
            'amount' => $data['amount'],
            'currency' => $data['currency'],
            'payment_method' => $data['payment_method'],
            'card_last_four' => isset($data['card_number']) ? substr($data['card_number'], -4) : null,
        ]);

        // Simulate processing delay (1.5 - 3 seconds)
        usleep(random_int(1_500_000, 3_000_000));

        // Express checkout methods always succeed
        if (in_array($data['payment_method'], ['apple_pay', 'google_pay', 'paypal'])) {
            return [
                'success' => true,
                'transaction_id' => 'txn_' . bin2hex(random_bytes(8)),
                'card_brand' => $data['payment_method'],
            ];
        }

        $cardNumber = $data['card_number'] ?? '';
        $lastFour = substr($cardNumber, -4);

        // Failure: card ending in 0000
        if ($lastFour === '0000') {
            return [
                'success' => false,
                'error' => 'Your card was declined. Please try a different payment method.',
            ];
        }

        // Timeout: card ending in 1111
        if ($lastFour === '1111') {
            return [
                'success' => false,
                'error' => 'Payment processing timed out. Please try again.',
            ];
        }

        return [
            'success' => true,
            'transaction_id' => 'txn_' . bin2hex(random_bytes(8)),
            'card_brand' => $this->detectCardBrand($cardNumber),
        ];
    }

    private function detectCardBrand(string $cardNumber): string
    {
        if (str_starts_with($cardNumber, '4')) return 'visa';
        if (str_starts_with($cardNumber, '5') || str_starts_with($cardNumber, '2')) return 'mastercard';
        if (str_starts_with($cardNumber, '3')) return 'amex';
        return 'unknown';
    }
}
