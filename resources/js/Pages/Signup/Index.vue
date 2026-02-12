<script setup lang="ts">
import { onMounted, watch, computed } from 'vue';
import { Head } from '@inertiajs/vue3';
import SignupLayout from '@/Layouts/SignupLayout.vue';
import OrderSummary from './Partials/OrderSummary.vue';
import PlanSelection from './Steps/PlanSelection.vue';
import CreateAccount from './Steps/CreateAccount.vue';
import PaymentInformation from './Steps/PaymentInformation.vue';
import Confirmation from './Steps/Confirmation.vue';
import { useSignupStore } from '@/stores/signupStore';
import { useAnalytics } from '@/composables/useAnalytics';
import { useAffiliateParams } from '@/composables/useAffiliateParams';
import type { Plan, Coupon, Config, AffiliateParams, SignupStep } from '@/types/signup';

const props = defineProps<{
    plans: Plan[];
    initialStep: number;
    affiliateParams: AffiliateParams;
    coupon: Coupon;
    config: Config;
}>();

const store = useSignupStore();
const analytics = useAnalytics();
const affiliate = useAffiliateParams();

// Initialize store immediately (before first render) so plan data is available
store.initialize({
    plans: props.plans,
    initialStep: props.initialStep as SignupStep,
    affiliateParams: props.affiliateParams,
    coupon: props.coupon,
    config: props.config,
});
affiliate.initialize(props.affiliateParams);

const stepComponents: Record<number, any> = {
    1: PlanSelection,
    2: CreateAccount,
    3: PaymentInformation,
    4: Confirmation,
};

const currentStepComponent = computed(() => stepComponents[store.currentStep] || PlanSelection);

onMounted(() => {
    analytics.trackFlowViewed();

    // Update URL to match current step
    updateUrl(store.currentStep);

    // Handle browser back/forward
    window.addEventListener('popstate', handlePopState);
});

function updateUrl(step: number) {
    const url = `/signup/${step}${window.location.search}`;
    window.history.replaceState({ step }, '', url);
}

function handlePopState(event: PopStateEvent) {
    if (event.state?.step) {
        store.goToStep(event.state.step as SignupStep);
    }
}

function handleReset() {
    store.resetFlow();
    window.location.replace('/signup');
}

// Watch step changes to update URL
watch(() => store.currentStep, (newStep) => {
    updateUrl(newStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>

<template>
    <Head title="Sign Up" />
    <SignupLayout>
        <div class="bg-white rounded-lg overflow-visible">
            <div class="flex flex-col lg:flex-row">
                <!-- Left column: Step content -->
                <div class="w-full p-6 sm:p-8 lg:w-1/2">
                    <Transition
                        mode="out-in"
                        enter-active-class="transition-all duration-300 ease-out"
                        enter-from-class="opacity-0 translate-y-2"
                        enter-to-class="opacity-100 translate-y-0"
                        leave-active-class="transition-all duration-200 ease-in"
                        leave-from-class="opacity-100 translate-y-0"
                        leave-to-class="opacity-0 -translate-y-2"
                    >
                        <component :is="currentStepComponent" :key="store.currentStep" />
                    </Transition>
                </div>

                <!-- Vertical divider (desktop only) -->
                <div class="hidden lg:block lg:w-px lg:bg-gray-200 lg:my-6"></div>

                <!-- Right column: Order summary (sticky on desktop) -->
                <div class="w-full border-t border-gray-200 p-6 sm:p-8 lg:w-1/2 lg:border-t-0">
                    <div class="lg:sticky lg:top-8">
                        <OrderSummary />
                    </div>
                </div>
            </div>
        </div>

        <!-- Reset button (only on confirmation step) -->
        <div v-if="store.currentStep === 4" class="mt-4 flex justify-end">
            <button
                type="button"
                class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                @click="handleReset"
            >
                Reset flow
            </button>
        </div>
    </SignupLayout>
</template>
