import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { AnalyticsEvent, AnalyticsEventName } from '@/types/signup';

export const useAnalyticsStore = defineStore('analytics', () => {
    const events = ref<AnalyticsEvent[]>([]);

    function track(event: AnalyticsEventName, data?: Record<string, unknown>): void {
        // Enrich payload with affiliate params and selected plan from signup store
        let enrichedData = { ...data };
        try {
            const raw = sessionStorage.getItem('pbr_affiliate_params');
            if (raw) {
                const affiliateParams = JSON.parse(raw);
                if (Object.keys(affiliateParams).length > 0) {
                    enrichedData = { ...enrichedData, affiliateParams };
                }
            }
        } catch {
            // sessionStorage may not be available
        }

        const analyticsEvent: AnalyticsEvent = {
            event,
            timestamp: new Date().toISOString(),
            data: Object.keys(enrichedData).length > 0 ? enrichedData : undefined,
        };

        events.value.push(analyticsEvent);

        if (import.meta.env.DEV) {
            console.log('[Analytics]', analyticsEvent.event, analyticsEvent.data ?? '', analyticsEvent.timestamp);
        }
    }

    function getEventsByName(name: AnalyticsEventName): AnalyticsEvent[] {
        return events.value.filter((e) => e.event === name);
    }

    return {
        events,
        track,
        getEventsByName,
    };
});
