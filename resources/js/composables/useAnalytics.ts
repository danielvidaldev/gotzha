import { useAnalyticsStore } from '@/stores/analyticsStore';
import type { AnalyticsEventName, SignupStep } from '@/types/signup';

export function useAnalytics() {
    const store = useAnalyticsStore();

    function track(event: AnalyticsEventName, data?: Record<string, unknown>): void {
        store.track(event, data);
    }

    function trackFlowViewed(): void {
        store.track('flow_viewed');
    }

    function trackPlanSelected(planId: number, planName: string): void {
        store.track('plan_selected', { planId, planName });
    }

    function trackStepCompleted(step: SignupStep, data?: Record<string, unknown>): void {
        store.track('step_completed', { step, ...data });
    }

    function trackSignupSubmitted(data?: Record<string, unknown>): void {
        store.track('signup_submitted', data);
    }

    function trackSignupSuccess(orderId: string): void {
        store.track('signup_success', { orderId });
    }

    function trackSignupError(error: string, step: SignupStep): void {
        store.track('signup_error', { error, step });
    }

    return {
        track,
        trackFlowViewed,
        trackPlanSelected,
        trackStepCompleted,
        trackSignupSubmitted,
        trackSignupSuccess,
        trackSignupError,
    };
}
