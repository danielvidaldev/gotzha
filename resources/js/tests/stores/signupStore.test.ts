import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSignupStore } from '@/stores/signupStore';
import type { Plan, Config, Coupon, AffiliateParams } from '@/types/signup';

const mockPlan: Plan = {
    id: 1,
    name: '1 Year Plan',
    slug: '1-year',
    duration_months: 12,
    original_price_pence: 1799,
    discounted_price_pence: 699,
    discount_percentage: 60,
    currency: 'GBP',
    is_active: true,
};

const mockConfig: Config = {
    supportEmail: 'support@test.com',
    trustpilotScore: 5,
    trustpilotReviews: 176,
    vatRate: 20,
    currency: 'GBP',
    currencySymbol: '£',
    maxDevices: 5,
};

const mockCoupon: Coupon = {
    code: 'SAVE67',
    discountLabel: '67% OFF',
    isApplied: true,
};

describe('signupStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    describe('initialize', () => {
        it('sets plans and config from data', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan], config: mockConfig });

            expect(store.plans).toEqual([mockPlan]);
            expect(store.config).toEqual(mockConfig);
        });

        it('auto-selects first plan when none selected', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            expect(store.selectedPlanId).toBe(mockPlan.id);
        });

        it('sets coupon data', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan], coupon: mockCoupon });

            expect(store.coupon.code).toBe('SAVE67');
            expect(store.coupon.isApplied).toBe(true);
        });

        it('merges affiliate params', () => {
            const params: AffiliateParams = { utm_source: 'google', aff_id: 'abc123' };
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan], affiliateParams: params });

            expect(store.affiliateParams.utm_source).toBe('google');
            expect(store.affiliateParams.aff_id).toBe('abc123');
        });

        it('restores state from sessionStorage', () => {
            const persisted = {
                currentStep: 2,
                selectedPlanId: 1,
                account: { email: 'test@test.com', password: 'pass123' },
                payment: { payment_method: 'card', card_number: '', expiry: '', country: 'GB', zip_code: '' },
                affiliateParams: {},
                coupon: { code: '', discountLabel: '', isApplied: false },
                userId: null,
                completedSteps: [1],
            };
            sessionStorage.setItem('pbr_signup_state', JSON.stringify(persisted));

            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            expect(store.currentStep).toBe(2);
            expect(store.account.email).toBe('test@test.com');
        });
    });

    describe('step navigation', () => {
        it('advances to next step', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            expect(store.currentStep).toBe(1);
            store.nextStep();
            expect(store.currentStep).toBe(2);
        });

        it('does not advance past step 4', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            store.goToStep(4);
            store.nextStep();
            expect(store.currentStep).toBe(4);
        });

        it('goes to previous step', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            store.goToStep(3);
            store.prevStep();
            expect(store.currentStep).toBe(2);
        });

        it('does not go below step 1', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            store.prevStep();
            expect(store.currentStep).toBe(1);
        });

        it('goToStep sets specific step', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            store.goToStep(3);
            expect(store.currentStep).toBe(3);
        });
    });

    describe('plan selection', () => {
        it('selects a plan by ID', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            store.selectPlan(1);
            expect(store.selectedPlanId).toBe(1);
            expect(store.selectedPlan).toEqual(mockPlan);
        });

        it('returns undefined for invalid plan ID', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            store.selectPlan(999);
            expect(store.selectedPlan).toBeUndefined();
        });
    });

    describe('computed prices', () => {
        it('calculates subtotal (discounted price * duration)', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan], config: mockConfig });
            store.selectPlan(1);

            // 699 pence * 12 months = 8388 pence
            expect(store.subtotalPence).toBe(8388);
        });

        it('calculates tax based on VAT rate', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan], config: mockConfig });
            store.selectPlan(1);

            // 8388 * 20% = 1677.6, rounded to 1678
            expect(store.taxPence).toBe(1678);
        });

        it('calculates total as subtotal + tax', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan], config: mockConfig });
            store.selectPlan(1);

            expect(store.totalPence).toBe(8388 + 1678);
        });

        it('returns zero when no plan is selected', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan], config: mockConfig });
            store.selectedPlanId = null;

            expect(store.subtotalPence).toBe(0);
            expect(store.taxPence).toBe(0);
            expect(store.totalPence).toBe(0);
        });
    });

    describe('formatPrice', () => {
        it('formats pence to pounds with £ symbol', () => {
            const store = useSignupStore();
            expect(store.formatPrice(699)).toBe('£6.99');
            expect(store.formatPrice(8388)).toBe('£83.88');
            expect(store.formatPrice(0)).toBe('£0.00');
        });
    });

    describe('canProceedFromStep', () => {
        it('step 1 requires plan selection', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            expect(store.canProceedFromStep[1]).toBe(true);

            store.selectedPlanId = null;
            expect(store.canProceedFromStep[1]).toBe(false);
        });

        it('step 2 requires email and password', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            expect(store.canProceedFromStep[2]).toBe(false);

            store.account.email = 'test@test.com';
            store.account.password = 'password123';
            expect(store.canProceedFromStep[2]).toBe(true);
        });

        it('step 3 allows non-card methods without card data', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            store.payment.payment_method = 'apple_pay';
            expect(store.canProceedFromStep[3]).toBe(true);
        });

        it('step 3 requires all card fields for card payment', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            store.payment.payment_method = 'card';
            expect(store.canProceedFromStep[3]).toBe(false);

            store.payment.card_number = '4242424242424242';
            store.payment.expiry = '12/28';
            store.payment.cvc = '123';
            store.payment.country = 'GB';
            store.payment.zip_code = 'SW1A 1AA';
            expect(store.canProceedFromStep[3]).toBe(true);
        });
    });

    describe('persistence security', () => {
        it('never persists card number to sessionStorage', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });
            store.payment.card_number = '4242424242424242';
            store.payment.expiry = '12/28';
            store.persistState();

            const raw = sessionStorage.getItem('pbr_signup_state');
            const persisted = JSON.parse(raw!);
            expect(persisted.payment.card_number).toBe('');
            expect(persisted.payment.expiry).toBe('');
        });

        it('never restores CVC from sessionStorage', () => {
            const persisted = {
                currentStep: 3,
                selectedPlanId: 1,
                account: { email: '', password: '' },
                payment: { payment_method: 'card', card_number: '4242', expiry: '12/28', country: 'GB', zip_code: '', cvc: '123' },
                affiliateParams: {},
                coupon: { code: '', discountLabel: '', isApplied: false },
                userId: null,
                completedSteps: [],
            };
            sessionStorage.setItem('pbr_signup_state', JSON.stringify(persisted));

            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            expect(store.payment.cvc).toBe('');
        });
    });

    describe('coupon management', () => {
        it('removes coupon', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan], coupon: mockCoupon });

            expect(store.coupon.isApplied).toBe(true);
            store.removeCoupon();
            expect(store.coupon.isApplied).toBe(false);
            expect(store.coupon.code).toBe('');
        });
    });

    describe('order management', () => {
        it('sets order result', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            const order = {
                id: 'INV_001',
                total: 8388,
                currency: 'GBP',
                paid_at: '2026-02-12',
                plan_name: '1 Year Plan',
                payment_method: 'card',
                card_last_four: '4242',
                card_brand: 'visa',
            };

            store.setOrder(order);
            expect(store.order).toEqual(order);
            expect(store.canProceedFromStep[4]).toBe(true);
        });
    });

    describe('resetFlow', () => {
        it('resets all state to defaults', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan], coupon: mockCoupon });
            store.goToStep(3);
            store.account.email = 'test@test.com';
            store.setUserId(42);

            store.resetFlow();

            expect(store.currentStep).toBe(1);
            expect(store.selectedPlanId).toBe(null);
            expect(store.account.email).toBe('');
            expect(store.userId).toBe(null);
            expect(store.coupon.isApplied).toBe(false);
            expect(store.order).toBe(null);
        });

        it('clears sessionStorage', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });
            store.persistState();

            expect(sessionStorage.getItem('pbr_signup_state')).not.toBe(null);

            store.resetFlow();
            expect(sessionStorage.getItem('pbr_signup_state')).toBe(null);
        });
    });

    describe('completeStep', () => {
        it('marks step as completed', () => {
            const store = useSignupStore();
            store.initialize({ plans: [mockPlan] });

            store.completeStep(1);
            expect(store.completedSteps.has(1)).toBe(true);

            store.completeStep(2);
            expect(store.completedSteps.has(2)).toBe(true);
        });
    });
});
