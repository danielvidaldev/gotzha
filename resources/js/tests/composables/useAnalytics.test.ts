import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAnalytics } from '@/composables/useAnalytics';
import { useAnalyticsStore } from '@/stores/analyticsStore';

describe('useAnalytics', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('trackFlowViewed emits flow_viewed event', () => {
        const analytics = useAnalytics();
        const store = useAnalyticsStore();

        analytics.trackFlowViewed();

        expect(store.events).toHaveLength(1);
        expect(store.events[0].event).toBe('flow_viewed');
    });

    it('trackPlanSelected emits plan_selected with planId and planName', () => {
        const analytics = useAnalytics();
        const store = useAnalyticsStore();

        analytics.trackPlanSelected(1, '1 Year Plan');

        expect(store.events[0].event).toBe('plan_selected');
        expect(store.events[0].data).toEqual({ planId: 1, planName: '1 Year Plan' });
    });

    it('trackStepCompleted emits step_completed with step and extra data', () => {
        const analytics = useAnalytics();
        const store = useAnalyticsStore();

        analytics.trackStepCompleted(2, { email: 'test@test.com' });

        expect(store.events[0].event).toBe('step_completed');
        expect(store.events[0].data).toEqual({ step: 2, email: 'test@test.com' });
    });

    it('trackSignupSubmitted emits signup_submitted', () => {
        const analytics = useAnalytics();
        const store = useAnalyticsStore();

        analytics.trackSignupSubmitted({ planId: 1, paymentMethod: 'card' });

        expect(store.events[0].event).toBe('signup_submitted');
        expect(store.events[0].data).toEqual({ planId: 1, paymentMethod: 'card' });
    });

    it('trackSignupSuccess emits signup_success with orderId', () => {
        const analytics = useAnalytics();
        const store = useAnalyticsStore();

        analytics.trackSignupSuccess('INV_001');

        expect(store.events[0].event).toBe('signup_success');
        expect(store.events[0].data).toEqual({ orderId: 'INV_001' });
    });

    it('trackSignupError emits signup_error with error and step', () => {
        const analytics = useAnalytics();
        const store = useAnalyticsStore();

        analytics.trackSignupError('Card declined', 3);

        expect(store.events[0].event).toBe('signup_error');
        expect(store.events[0].data).toEqual({ error: 'Card declined', step: 3 });
    });

    it('track emits custom event', () => {
        const analytics = useAnalytics();
        const store = useAnalyticsStore();

        analytics.track('flow_viewed', { custom: 'data' });

        expect(store.events[0].event).toBe('flow_viewed');
        expect(store.events[0].data).toEqual({ custom: 'data' });
    });
});
