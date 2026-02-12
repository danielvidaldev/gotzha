export interface Plan {
    id: number;
    name: string;
    slug: string;
    duration_months: number;
    original_price_pence: number;
    discounted_price_pence: number;
    discount_percentage: number;
    currency: string;
    is_active: boolean;
}

export interface Coupon {
    code: string;
    discountLabel: string;
    isApplied: boolean;
}

export interface Config {
    supportEmail: string;
    trustpilotScore: number;
    trustpilotReviews: number;
    vatRate: number;
    currency: string;
    currencySymbol: string;
    maxDevices: number;
}

export interface AccountForm {
    email: string;
    password: string;
}

export interface PaymentForm {
    payment_method: 'card' | 'apple_pay' | 'google_pay' | 'paypal';
    card_number: string;
    expiry: string;
    cvc: string;
    country: string;
    zip_code: string;
}

export interface AffiliateParams {
    utm_source?: string;
    utm_campaign?: string;
    aff_id?: string;
    sub_id?: string;
    landing_url?: string;
}

export interface OrderResult {
    id: string;
    total: number;
    currency: string;
    paid_at: string;
    plan_name: string;
    payment_method: string;
    card_last_four: string | null;
    card_brand: string | null;
}

export type SignupStep = 1 | 2 | 3 | 4;

export type AnalyticsEventName =
    | 'flow_viewed'
    | 'plan_selected'
    | 'step_completed'
    | 'signup_submitted'
    | 'signup_success'
    | 'signup_error';

export interface AnalyticsEvent {
    event: AnalyticsEventName;
    timestamp: string;
    data?: Record<string, unknown>;
}
