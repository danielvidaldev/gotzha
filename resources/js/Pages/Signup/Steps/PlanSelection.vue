<script setup lang="ts">
import { useSignupStore } from '@/stores/signupStore';
import { useAnalytics } from '@/composables/useAnalytics';
import FeatureList from '@/Components/Signup/FeatureList.vue';
import PlanCard from '@/Components/Signup/PlanCard.vue';
import GoldButton from '@/Components/UI/GoldButton.vue';

const store = useSignupStore();
const analytics = useAnalytics();

function handleGetStarted() {
    if (!store.selectedPlan) return;
    analytics.trackPlanSelected(store.selectedPlan.id, store.selectedPlan.name);
    analytics.trackStepCompleted(1, { planId: store.selectedPlanId });
    store.completeStep(1);
    store.nextStep();
}
</script>

<template>
    <div>
        <!-- Headline -->
        <h1 class="mb-2 text-base font-medium text-gray-900">
            <span class="mr-0.5">🔥</span> 60% off PrivateByRight VPN
        </h1>
        <p class="mb-6 text-sm text-gray-500 leading-relaxed">
            Get fast, reliable privacy across your devices. Use VPN for encrypted
            protection and unlocked streaming setups on multiple devices&mdash;one plan,
            one dashboard, full control.
        </p>

        <!-- Feature list -->
        <FeatureList class="mb-6" />

        <!-- Plan cards -->
        <div class="mb-6 space-y-3">
            <PlanCard
                v-for="plan in store.plans"
                :key="plan.id"
                :plan="plan"
                :is-selected="store.selectedPlanId === plan.id"
                :coupon-applied="store.coupon.isApplied"
                :currency-symbol="store.config?.currencySymbol ?? '£'"
                @select="store.selectPlan(plan.id)"
            />
        </div>

        <!-- Get Started button -->
        <GoldButton
            label="Get Started"
            :disabled="!store.selectedPlanId"
            @click="handleGetStarted"
        />
    </div>
</template>
