<script setup lang="ts">
import { ref } from 'vue';
import { useSignupStore } from '@/stores/signupStore';
import { useAnalytics } from '@/composables/useAnalytics';
import { usePayment } from '@/composables/usePayment';
import { useValidation } from '@/composables/useValidation';
import ExpressCheckout from '@/Components/Signup/ExpressCheckout.vue';
import CreditCardForm from '@/Components/Signup/CreditCardForm.vue';
import Divider from '@/Components/UI/Divider.vue';
import GoldButton from '@/Components/UI/GoldButton.vue';
import LoadingSpinner from '@/Components/UI/LoadingSpinner.vue';
import PrivacyGuarantee from '@/Components/Signup/PrivacyGuarantee.vue';

const store = useSignupStore();
const analytics = useAnalytics();
const payment = usePayment();
const validation = useValidation();

const cardErrors = ref<Record<string, string>>({});

async function handleExpressCheckout(method: 'apple_pay' | 'google_pay' | 'paypal') {
    store.payment.payment_method = method;
    await payment.processPayment();
}

async function handleCardPayment() {
    const errors: Record<string, string> = {};
    const cardNum = store.payment.card_number.replace(/\s/g, '');

    if (!cardNum || cardNum.length < 13) {
        errors.card_number = 'Please enter a valid card number';
    }
    if (!store.payment.expiry || !/^\d{2}\/\d{2}$/.test(store.payment.expiry)) {
        errors.expiry = 'Enter MM/YY';
    }
    if (!store.payment.cvc || store.payment.cvc.length < 3) {
        errors.cvc = 'Enter CVC';
    }

    cardErrors.value = errors;
    if (Object.keys(errors).length > 0) return;

    store.payment.payment_method = 'card';
    await payment.processPayment();
}
</script>

<template>
    <div class="relative">
        <!-- Loading overlay -->
        <LoadingSpinner
            v-if="payment.isProcessing.value"
            overlay
            message="Processing payment..."
        />

        <!-- Collapsed Step 1 -->
        <div class="mb-3 rounded-lg border border-gray-200 p-3">
            <div class="flex items-center gap-2 text-xs text-gray-400">
                <span class="font-medium uppercase">Step 1</span>
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <span>Create an account</span>
            </div>
        </div>

        <!-- Step 2 header -->
        <div class="mb-4 rounded-lg border border-gray-200 p-3">
            <div class="flex items-center gap-2 text-xs text-gray-800">
                <span class="font-normal uppercase">Step 2</span>
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
            </div>

            <div class="mt-3 flex items-center justify-between">
                <h2 class="text-sm font-normal text-gray-900">Payment information</h2>
                <div class="flex items-center gap-1 text-xs text-gray-900">
                    <span>Secure server</span>
                    <svg class="h-3.5 w-3.5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>
                    </svg>
                </div>
            </div>

            <!-- Express Checkout -->
            <div class="mt-4">
                <ExpressCheckout @select-method="handleExpressCheckout" />
            </div>

            <Divider text="Or fill in your details" class="my-5" />

            <!-- Card form -->
            <div class="mb-3">
                <p class="text-xs text-gray-700 mb-2">Enter your payment details</p>
                <div class="mb-3 inline-flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-700">
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Card
                </div>
            </div>

            <form @submit.prevent="handleCardPayment">
                <CreditCardForm
                    v-model="store.payment"
                    :errors="cardErrors"
                />

                <!-- Terms -->
                <p class="mt-4 mb-6 text-xs text-gray-500 leading-relaxed">
                    By providing your card details, you give clickplay.io permission to charge your card
                    for future payments in accordance with their terms.
                </p>

                <!-- Error message -->
                <div
                    v-if="payment.error.value"
                    role="alert"
                    class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                    <p class="font-medium">Payment failed</p>
                    <p>{{ payment.error.value }}</p>
                    <button
                        type="button"
                        class="mt-2 text-xs font-medium text-red-600 hover:text-red-800 underline"
                        @click="payment.clearError()"
                    >
                        Try again
                    </button>
                </div>

                <GoldButton
                    label="Continue"
                    type="submit"
                    :loading="payment.isProcessing.value"
                    :disabled="payment.isProcessing.value"
                />
            </form>
        </div>

        <!-- Back to account step -->
        <button
            type="button"
            class="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            @click="store.prevStep()"
        >
            &larr; Back to account details
        </button>

        <PrivacyGuarantee class="mt-4" />
    </div>
</template>
