<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'plan_id' => ['required', 'exists:plans,id'],
            'payment_method' => ['required', 'in:card,apple_pay,google_pay,paypal'],
            'card_number' => ['required_if:payment_method,card', 'nullable', 'string'],
            'expiry' => ['required_if:payment_method,card', 'nullable', 'string', 'regex:/^\d{2}\/\d{2}$/'],
            'cvc' => ['required_if:payment_method,card', 'nullable', 'string', 'between:3,4'],
            'country' => ['nullable', 'string', 'max:100'],
            'zip_code' => ['nullable', 'string', 'max:10'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'affiliate' => ['nullable', 'array'],
            'affiliate.utm_source' => ['nullable', 'string', 'max:255'],
            'affiliate.utm_campaign' => ['nullable', 'string', 'max:255'],
            'affiliate.aff_id' => ['nullable', 'string', 'max:255'],
            'affiliate.sub_id' => ['nullable', 'string', 'max:255'],
        ];
    }
}
