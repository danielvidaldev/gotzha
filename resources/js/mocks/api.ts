/**
 * Client-side API mock for static deployments (Vercel/Netlify).
 * When no Laravel backend is available, this interceptor catches network
 * errors and returns realistic mock responses so the full flow works.
 */
import axios from 'axios';
import type { AxiosResponse } from 'axios';

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockResponse(data: unknown, status = 200): AxiosResponse {
    return {
        data,
        status,
        statusText: 'OK',
        headers: {},
        config: {} as any,
    };
}

let mockUserId = 0;

export function setupMockApi(): void {
    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            // Only intercept network errors (no backend reachable)
            if (error.response || !error.config) {
                throw error;
            }

            const url = error.config.url as string;
            const data = typeof error.config.data === 'string'
                ? JSON.parse(error.config.data)
                : error.config.data || {};

            // Mock: POST /signup/account
            if (url === '/signup/account') {
                await delay(600 + Math.random() * 400);

                if (!data.email || !data.email.includes('@')) {
                    throw {
                        response: {
                            status: 422,
                            data: { errors: { email: ['Please enter a valid email address.'] } },
                        },
                    };
                }

                mockUserId++;
                return mockResponse({
                    success: true,
                    user: { id: mockUserId, email: data.email },
                });
            }

            // Mock: POST /signup/payment
            if (url === '/signup/payment') {
                const cardNumber = (data.card_number || '').replace(/\s/g, '');
                const lastFour = cardNumber.slice(-4);

                // Simulate realistic payment processing delay
                await delay(1500 + Math.random() * 1500);

                // Decline scenario
                if (lastFour === '0000') {
                    throw {
                        response: {
                            status: 422,
                            data: {
                                success: false,
                                error: 'Your card was declined. Please use a different payment method.',
                            },
                        },
                    };
                }

                // Timeout scenario
                if (lastFour === '1111') {
                    throw {
                        response: {
                            status: 422,
                            data: {
                                success: false,
                                error: 'Payment processing timed out. Please try again.',
                            },
                        },
                    };
                }

                // Detect card brand
                let cardBrand = 'unknown';
                if (cardNumber.startsWith('4')) cardBrand = 'visa';
                else if (cardNumber.startsWith('5')) cardBrand = 'mastercard';
                else if (cardNumber.startsWith('3')) cardBrand = 'amex';

                // Express checkout
                if (['apple_pay', 'google_pay', 'paypal'].includes(data.payment_method)) {
                    cardBrand = data.payment_method;
                }

                return mockResponse({
                    order: {
                        id: 'INV_' + Math.random().toString(36).substring(2, 6).toUpperCase(),
                        total: 8388,
                        currency: 'GBP',
                        paid_at: new Date().toISOString(),
                        plan_name: '1 Year Plan',
                        payment_method: data.payment_method || 'card',
                        card_last_four: lastFour || null,
                        card_brand: cardBrand,
                    },
                });
            }

            // For any other request, re-throw
            throw error;
        },
    );
}
