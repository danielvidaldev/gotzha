import type { AffiliateParams } from '@/types/signup';

const STORAGE_KEY = 'pbr_affiliate_params';

const TRACKED_PARAMS: (keyof AffiliateParams)[] = [
    'utm_source',
    'utm_campaign',
    'aff_id',
    'sub_id',
];

export function useAffiliateParams() {
    function extractFromUrl(): AffiliateParams {
        const params: AffiliateParams = {};

        try {
            const searchParams = new URLSearchParams(window.location.search);

            for (const key of TRACKED_PARAMS) {
                const value = searchParams.get(key);
                if (value) {
                    params[key] = value;
                }
            }
        } catch {
            // window.location may not be available in SSR
        }

        return params;
    }

    function persist(data: AffiliateParams): void {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
            // sessionStorage may not be available
        }
    }

    function loadPersisted(): AffiliateParams {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return {};
            return JSON.parse(raw) as AffiliateParams;
        } catch {
            return {};
        }
    }

    function initialize(serverParams?: AffiliateParams): AffiliateParams {
        const persisted = loadPersisted();
        const fromUrl = extractFromUrl();

        // Priority: URL params > server params > persisted params
        const merged: AffiliateParams = {
            ...persisted,
            ...serverParams,
            ...fromUrl,
        };

        // Add landing URL if we have any affiliate data
        if (Object.keys(merged).length > 0 && !merged.landing_url) {
            try {
                merged.landing_url = window.location.href;
            } catch {
                // window may not be available
            }
        }

        persist(merged);
        return merged;
    }

    function getPayload(): AffiliateParams {
        return loadPersisted();
    }

    return {
        extractFromUrl,
        persist,
        loadPersisted,
        initialize,
        getPayload,
    };
}
