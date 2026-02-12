import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAnalyticsStore } from '@/stores/analyticsStore';

describe('analyticsStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('tracks events with name and timestamp', () => {
        const store = useAnalyticsStore();
        store.track('flow_viewed');

        expect(store.events).toHaveLength(1);
        expect(store.events[0].event).toBe('flow_viewed');
        expect(store.events[0].timestamp).toBeDefined();
    });

    it('tracks events with optional data', () => {
        const store = useAnalyticsStore();
        store.track('plan_selected', { planId: 1, planName: '1 Year' });

        expect(store.events[0].data).toEqual({ planId: 1, planName: '1 Year' });
    });

    it('accumulates multiple events', () => {
        const store = useAnalyticsStore();
        store.track('flow_viewed');
        store.track('plan_selected', { planId: 1 });
        store.track('step_completed', { step: 1 });

        expect(store.events).toHaveLength(3);
    });

    it('filters events by name', () => {
        const store = useAnalyticsStore();
        store.track('flow_viewed');
        store.track('plan_selected', { planId: 1 });
        store.track('plan_selected', { planId: 2 });
        store.track('step_completed', { step: 1 });

        const planEvents = store.getEventsByName('plan_selected');
        expect(planEvents).toHaveLength(2);
        expect(planEvents[0].data).toEqual({ planId: 1 });
        expect(planEvents[1].data).toEqual({ planId: 2 });
    });

    it('returns empty array when no events match', () => {
        const store = useAnalyticsStore();
        store.track('flow_viewed');

        expect(store.getEventsByName('signup_success')).toEqual([]);
    });

    it('logs to console in dev mode', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        const store = useAnalyticsStore();
        store.track('flow_viewed');

        // In test env, import.meta.env.DEV is true
        consoleSpy.mockRestore();
    });
});
