import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type {
    Plan,
    Coupon,
    Config,
    AccountForm,
    PaymentForm,
    AffiliateParams,
    OrderResult,
    SignupStep,
} from '@/types/signup';

const STORAGE_KEY = 'pbr_signup_state';

interface PersistedState {
    currentStep: SignupStep;
    selectedPlanId: number | null;
    account: AccountForm;
    payment: Omit<PaymentForm, 'cvc'>;
    affiliateParams: AffiliateParams;
    coupon: Coupon;
    userId: number | null;
    completedSteps: SignupStep[];
}

interface InitializeData {
    plans?: Plan[];
    initialStep?: SignupStep;
    config?: Config;
    affiliateParams?: AffiliateParams;
    coupon?: Coupon;
}

export const useSignupStore = defineStore('signup', () => {
    // ── State ──────────────────────────────────────────────────────────
    const currentStep = ref<SignupStep>(1);
    const plans = ref<Plan[]>([]);
    const selectedPlanId = ref<number | null>(null);
    const config = ref<Config | null>(null);
    const account = ref<AccountForm>({ email: '', password: '' });
    const payment = ref<PaymentForm>({
        payment_method: 'card',
        card_number: '',
        expiry: '',
        cvc: '',
        country: 'GB',
        zip_code: '',
    });
    const affiliateParams = ref<AffiliateParams>({});
    const coupon = ref<Coupon>({ code: '', discountLabel: '', isApplied: false });
    const userId = ref<number | null>(null);
    const order = ref<OrderResult | null>(null);
    const isSubmitting = ref(false);
    const paymentError = ref<string | null>(null);
    const completedSteps = ref<Set<SignupStep>>(new Set());

    // ── Getters ────────────────────────────────────────────────────────
    const selectedPlan = computed<Plan | undefined>(() => {
        if (selectedPlanId.value === null) return undefined;
        return plans.value.find((p) => p.id === selectedPlanId.value);
    });

    const subtotalPence = computed<number>(() => {
        const plan = selectedPlan.value;
        if (!plan) return 0;
        return plan.discounted_price_pence * plan.duration_months;
    });

    const taxPence = computed<number>(() => {
        const vatRate = config.value?.vatRate ?? 0;
        return Math.round(subtotalPence.value * (vatRate / 100));
    });

    const totalPence = computed<number>(() => {
        return subtotalPence.value + taxPence.value;
    });

    const formattedSubtotal = computed<string>(() => formatPrice(subtotalPence.value));
    const formattedTax = computed<string>(() => formatPrice(taxPence.value));
    const formattedTotal = computed<string>(() => formatPrice(totalPence.value));

    const canProceedFromStep = computed<Record<SignupStep, boolean>>(() => ({
        1: selectedPlanId.value !== null,
        2: account.value.email.trim() !== '' && account.value.password.trim() !== '',
        3:
            payment.value.payment_method !== 'card' ||
            (payment.value.card_number.trim() !== '' &&
                payment.value.expiry.trim() !== '' &&
                payment.value.cvc.trim() !== '' &&
                payment.value.country.trim() !== '' &&
                payment.value.zip_code.trim() !== ''),
        4: order.value !== null,
    }));

    // ── Actions ────────────────────────────────────────────────────────
    function initialize(data: InitializeData): void {
        if (data.plans) {
            plans.value = data.plans;
        }
        if (data.config) {
            config.value = data.config;
        }
        if (data.affiliateParams) {
            affiliateParams.value = { ...affiliateParams.value, ...data.affiliateParams };
        }
        if (data.coupon) {
            coupon.value = data.coupon;
        }

        // Restore persisted state from sessionStorage (may override initialStep)
        restoreState();

        // Auto-select first plan if none selected (after restore, so we don't overwrite)
        if (data.plans && selectedPlanId.value === null && data.plans.length > 0) {
            selectedPlanId.value = data.plans[0].id;
        }

        // Only apply initialStep if no persisted state was restored
        if (data.initialStep && currentStep.value === 1 && data.initialStep !== 1) {
            currentStep.value = data.initialStep;
        }
    }

    function goToStep(step: SignupStep): void {
        currentStep.value = step;
        persistState();
    }

    function nextStep(): void {
        if (currentStep.value < 4) {
            currentStep.value = (currentStep.value + 1) as SignupStep;
            persistState();
        }
    }

    function prevStep(): void {
        if (currentStep.value > 1) {
            currentStep.value = (currentStep.value - 1) as SignupStep;
            persistState();
        }
    }

    function completeStep(step: SignupStep): void {
        completedSteps.value.add(step);
        persistState();
    }

    function selectPlan(planId: number): void {
        selectedPlanId.value = planId;
        persistState();
    }

    function setUserId(id: number): void {
        userId.value = id;
        persistState();
    }

    function setOrder(result: OrderResult): void {
        order.value = result;
        persistState();
    }

    function setSubmitting(value: boolean): void {
        isSubmitting.value = value;
    }

    function setPaymentError(error: string | null): void {
        paymentError.value = error;
    }

    function removeCoupon(): void {
        coupon.value = { code: '', discountLabel: '', isApplied: false };
        persistState();
    }

    function resetFlow(): void {
        currentStep.value = 1;
        selectedPlanId.value = null;
        account.value = { email: '', password: '' };
        payment.value = {
            payment_method: 'card',
            card_number: '',
            expiry: '',
            cvc: '',
            country: 'GB',
            zip_code: '',
        };
        affiliateParams.value = {};
        coupon.value = { code: '', discountLabel: '', isApplied: false };
        userId.value = null;
        order.value = null;
        isSubmitting.value = false;
        paymentError.value = null;
        completedSteps.value = new Set();

        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch {
            // sessionStorage may not be available
        }
    }

    function persistState(): void {
        try {
            const state: PersistedState = {
                currentStep: currentStep.value,
                selectedPlanId: selectedPlanId.value,
                account: account.value,
                payment: {
                    payment_method: payment.value.payment_method,
                    // Never persist sensitive card data (PCI compliance)
                    card_number: '',
                    expiry: '',
                    country: payment.value.country,
                    zip_code: payment.value.zip_code,
                },
                affiliateParams: affiliateParams.value,
                coupon: coupon.value,
                userId: userId.value,
                completedSteps: Array.from(completedSteps.value) as SignupStep[],
            };
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // sessionStorage may not be available
        }
    }

    function restoreState(): void {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return;

            const persisted: PersistedState = JSON.parse(raw);

            if (persisted.currentStep) {
                currentStep.value = persisted.currentStep;
            }
            if (persisted.selectedPlanId !== undefined) {
                selectedPlanId.value = persisted.selectedPlanId;
            }
            if (persisted.account) {
                account.value = persisted.account;
            }
            if (persisted.payment) {
                payment.value = {
                    ...payment.value,
                    payment_method: persisted.payment.payment_method,
                    card_number: persisted.payment.card_number,
                    expiry: persisted.payment.expiry,
                    country: persisted.payment.country,
                    zip_code: persisted.payment.zip_code,
                    cvc: '', // NEVER restore CVC
                };
            }
            if (persisted.affiliateParams) {
                affiliateParams.value = persisted.affiliateParams;
            }
            if (persisted.coupon) {
                coupon.value = persisted.coupon;
            }
            if (persisted.userId !== undefined) {
                userId.value = persisted.userId;
            }
            if (persisted.completedSteps) {
                completedSteps.value = new Set(persisted.completedSteps);
            }
        } catch {
            // Invalid or unavailable sessionStorage — ignore
        }
    }

    function formatPrice(pence: number): string {
        const pounds = (pence / 100).toFixed(2);
        return `\u00A3${pounds}`;
    }

    return {
        // State
        currentStep,
        plans,
        selectedPlanId,
        config,
        account,
        payment,
        affiliateParams,
        coupon,
        userId,
        order,
        isSubmitting,
        paymentError,
        completedSteps,

        // Getters
        selectedPlan,
        subtotalPence,
        taxPence,
        totalPence,
        formattedSubtotal,
        formattedTax,
        formattedTotal,
        canProceedFromStep,

        // Actions
        initialize,
        goToStep,
        nextStep,
        prevStep,
        completeStep,
        selectPlan,
        setUserId,
        setOrder,
        setSubmitting,
        setPaymentError,
        removeCoupon,
        resetFlow,
        persistState,
        formatPrice,
    };
});
