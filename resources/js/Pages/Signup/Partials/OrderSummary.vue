<script setup lang="ts">
import { computed } from 'vue';
import { useSignupStore } from '@/stores/signupStore';
import Badge from '@/Components/UI/Badge.vue';
import TrustpilotWidget from '@/Components/Signup/TrustpilotWidget.vue';

const store = useSignupStore();

const plan = computed(() => store.selectedPlan);
const isConfirmation = computed(() => store.currentStep === 4);

const originalFormatted = computed(() => {
    if (!plan.value) return '';
    return store.formatPrice(plan.value.original_price_pence);
});

const discountedFormatted = computed(() => {
    if (!plan.value) return '';
    return store.formatPrice(plan.value.discounted_price_pence);
});

const monthlyLabel = computed(() => {
    if (!plan.value || !store.config) return '';
    return `${store.config.currencySymbol}${(plan.value.discounted_price_pence / 100).toFixed(2)} / month`;
});

const renewalDate = computed(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
});

const yearlyPrice = computed(() => {
    if (!plan.value) return '';
    return store.formatPrice(plan.value.discounted_price_pence * plan.value.duration_months);
});

// The summary badge uses the coupon's discountLabel (e.g. "67% OFF") when coupon is applied
const summaryBadgeText = computed(() => {
    if (store.coupon.isApplied && store.coupon.discountLabel) {
        return store.coupon.discountLabel;
    }
    if (plan.value) {
        return `${plan.value.discount_percentage}% OFF`;
    }
    return '';
});
</script>

<template>
    <div>
        <!-- Plan header -->
        <div v-if="plan" class="flex items-start gap-3 mb-5">
            <!-- Dark logo square -->
            <div class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-brand-charcoal">
                <svg class="h-7 w-7 text-brand-gold" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-3.23 9.36-7 10.58-3.77-1.22-7-5.75-7-10.58V6.3l7-3.12zm-1 5.82v6h2v-6h-2zm0-3v2h2v-2h-2z"/>
                </svg>
            </div>
            <div class="min-w-0">
                <h3 class="text-sm font-medium text-gray-900">PrivateByRight</h3>
                <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="text-xxs text-gray-500">{{ plan.name }}</span>
                    <Badge :text="summaryBadgeText" variant="gold" />
                </div>
                <div class="mt-0.5">
                    <span class="text-xs text-gray-400 line-through">{{ originalFormatted }}</span>
                    <span class="ml-1 text-xs font-semibold text-gray-900">{{ discountedFormatted }}</span>
                    <span class="text-xs text-gray-500"> / month</span>
                </div>
            </div>
        </div>

        <!-- Price breakdown -->
        <div v-if="plan" class="space-y-2 border-t border-gray-200 pt-4">
            <div class="flex justify-between text-xs">
                <span class="text-gray-500">Yearly price ({{ monthlyLabel }})</span>
                <span class="text-gray-900">{{ store.formattedSubtotal }}</span>
            </div>
            <div class="flex justify-between text-xs">
                <span class="text-gray-500">Sales Tax / VAT</span>
                <span class="text-gray-900">
                    {{ isConfirmation ? `{${store.config?.vatRate ?? 20}% of subtotal}` : 'to be calculated' }}
                </span>
            </div>
        </div>

        <!-- Total -->
        <div v-if="plan" class="mt-4 border-t border-gray-200 pt-4 pb-4 border-b border-gray-200">
            <div class="flex justify-between">
                <span class="text-sm font-semibold text-gray-900">
                    {{ isConfirmation ? 'Paid today (GBP)' : 'Due today (GBP)' }}
                </span>
                <span class="text-sm font-semibold text-gray-900">{{ store.formattedSubtotal }}</span>
            </div>
        </div>

        <!-- Coupon (hidden on confirmation step) -->
        <div v-if="store.coupon.isApplied && !isConfirmation" class="mt-4 flex items-center gap-1.5 text-xs">
            <span class="text-gray-500">Coupon Applied:</span>
            <span class="font-bold text-gray-900">{{ store.coupon.code }}</span>
            <button
                class="text-gray-500 underline hover:text-gray-700"
                @click="store.removeCoupon()"
            >
                remove
            </button>
        </div>

        <!-- Confirmation-specific: renewal info, payment method, order ID -->
        <div v-if="isConfirmation" class="mt-4 space-y-3 text-xs text-gray-600">
            <p>
                Renews on {{ renewalDate }} at {{ yearlyPrice }} / year unless cancelled.
                Cancel anytime in your dashboard or by contacting support.
            </p>
            <p>
                Payment method: <strong class="text-gray-900">{{ store.order?.card_brand?.toUpperCase() || 'VISA' }} ending in {{ store.order?.card_last_four || '1234' }}</strong>
            </p>
            <p>
                Order ID: <strong class="text-gray-900">{{ store.order?.id || 'INV_1234' }}</strong>
                <a href="#" class="ml-1 text-gray-900 underline hover:text-gray-700">Download invoice (PDF)</a>
            </p>
        </div>

        <!-- Support -->
        <div class="mt-4 text-xs text-gray-500">
            <p>
                For any questions or concerns, email us at
                <a href="mailto:support@privatebyright.com" class="text-gray-600 underline hover:text-gray-800">support@privatebyright.com</a>
                or visit
                <a href="#" class="text-gray-600 underline hover:text-gray-800">support.privatebyright.com</a>.
            </p>
        </div>

        <!-- Trustpilot (no border separator) -->
        <div class="mt-6">
            <TrustpilotWidget
                :score="store.config?.trustpilotScore ?? 5"
                :review-count="store.config?.trustpilotReviews ?? 176"
            />
        </div>
    </div>
</template>
