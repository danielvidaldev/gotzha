import { ref } from 'vue';
import axios, { AxiosError } from 'axios';
import { useSignupStore } from '@/stores/signupStore';
import { useAnalytics } from '@/composables/useAnalytics';
import type { OrderResult } from '@/types/signup';

interface PaymentSuccessResponse {
    order: OrderResult;
}

interface PaymentErrorResponse {
    success?: boolean;
    error?: string;
    message?: string;
    errors?: Record<string, string[]>;
}

export function usePayment() {
    const isProcessing = ref(false);
    const error = ref<string | null>(null);

    async function processPayment(): Promise<boolean> {
        const store = useSignupStore();
        const analytics = useAnalytics();

        isProcessing.value = true;
        error.value = null;
        store.setSubmitting(true);
        store.setPaymentError(null);

        analytics.trackSignupSubmitted({
            planId: store.selectedPlanId,
            paymentMethod: store.payment.payment_method,
        });

        try {
            const response = await axios.post<PaymentSuccessResponse>('/signup/payment', {
                plan_id: store.selectedPlanId,
                email: store.account.email,
                password: store.account.password,
                payment_method: store.payment.payment_method,
                card_number: store.payment.card_number,
                expiry: store.payment.expiry,
                cvc: store.payment.cvc,
                country: store.payment.country,
                zip_code: store.payment.zip_code,
                coupon_code: store.coupon.isApplied ? store.coupon.code : undefined,
                affiliate_params: store.affiliateParams,
                user_id: store.userId,
            });

            const orderResult = response.data.order;
            store.setOrder(orderResult);
            store.completeStep(3);
            store.nextStep();

            analytics.trackSignupSuccess(orderResult.id);

            return true;
        } catch (err: unknown) {
            let errorMessage = 'An unexpected error occurred. Please try again.';

            if (err instanceof AxiosError && err.response) {
                const data = err.response.data as PaymentErrorResponse;

                if (data.error) {
                    errorMessage = data.error;
                } else if (data.message) {
                    errorMessage = data.message;
                } else if (data.errors) {
                    const firstKey = Object.keys(data.errors)[0];
                    if (firstKey && data.errors[firstKey].length > 0) {
                        errorMessage = data.errors[firstKey][0];
                    }
                }
            }

            error.value = errorMessage;
            store.setPaymentError(errorMessage);

            analytics.trackSignupError(errorMessage, store.currentStep);

            return false;
        } finally {
            isProcessing.value = false;
            store.setSubmitting(false);
        }
    }

    function clearError(): void {
        error.value = null;
    }

    return {
        isProcessing,
        error,
        processPayment,
        clearError,
    };
}
