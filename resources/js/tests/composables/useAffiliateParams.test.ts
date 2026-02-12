import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAffiliateParams } from '@/composables/useAffiliateParams';

describe('useAffiliateParams', () => {
    beforeEach(() => {
        sessionStorage.clear();
        vi.clearAllMocks();
        // Reset location.search for each test
        Object.defineProperty(window.location, 'search', {
            value: '',
            writable: true,
            configurable: true,
        });
        Object.defineProperty(window.location, 'href', {
            value: 'http://localhost/signup',
            writable: true,
            configurable: true,
        });
    });

    it('extracts tracked params from URL', () => {
        Object.defineProperty(window.location, 'search', {
            value: '?utm_source=google&utm_campaign=spring&aff_id=abc&sub_id=123',
            writable: true,
            configurable: true,
        });

        const affiliate = useAffiliateParams();
        const params = affiliate.extractFromUrl();

        expect(params.utm_source).toBe('google');
        expect(params.utm_campaign).toBe('spring');
        expect(params.aff_id).toBe('abc');
        expect(params.sub_id).toBe('123');
    });

    it('ignores non-tracked params', () => {
        Object.defineProperty(window.location, 'search', {
            value: '?utm_source=google&random_param=test',
            writable: true,
            configurable: true,
        });

        const affiliate = useAffiliateParams();
        const params = affiliate.extractFromUrl();

        expect(params.utm_source).toBe('google');
        expect(params).not.toHaveProperty('random_param');
    });

    it('persists and loads params from sessionStorage', () => {
        const affiliate = useAffiliateParams();

        affiliate.persist({ utm_source: 'facebook', aff_id: 'xyz' });
        const loaded = affiliate.loadPersisted();

        expect(loaded.utm_source).toBe('facebook');
        expect(loaded.aff_id).toBe('xyz');
    });

    it('returns empty object when nothing persisted', () => {
        const affiliate = useAffiliateParams();
        const loaded = affiliate.loadPersisted();

        expect(loaded).toEqual({});
    });

    it('initialize merges params with URL > server > persisted priority', () => {
        // Pre-persist some params
        sessionStorage.setItem('pbr_affiliate_params', JSON.stringify({
            utm_source: 'old_source',
            sub_id: 'persisted_sub',
        }));

        // URL has utm_source
        Object.defineProperty(window.location, 'search', {
            value: '?utm_source=url_source',
            writable: true,
            configurable: true,
        });

        const affiliate = useAffiliateParams();
        const merged = affiliate.initialize({ utm_source: 'server_source', aff_id: 'server_aff' });

        // URL wins over server
        expect(merged.utm_source).toBe('url_source');
        // Server wins over persisted
        expect(merged.aff_id).toBe('server_aff');
        // Persisted fills gaps
        expect(merged.sub_id).toBe('persisted_sub');
    });

    it('adds landing_url when affiliate data exists', () => {
        Object.defineProperty(window.location, 'search', {
            value: '?aff_id=test',
            writable: true,
            configurable: true,
        });

        const affiliate = useAffiliateParams();
        const merged = affiliate.initialize();

        expect(merged.landing_url).toBe('http://localhost/signup');
    });

    it('getPayload returns persisted params', () => {
        const affiliate = useAffiliateParams();
        affiliate.initialize({ utm_source: 'test', aff_id: 'abc' });

        const payload = affiliate.getPayload();
        expect(payload.utm_source).toBe('test');
        expect(payload.aff_id).toBe('abc');
    });
});
