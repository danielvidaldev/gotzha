<script setup lang="ts">
const emit = defineEmits<{
    'select-method': [method: 'apple_pay' | 'google_pay' | 'paypal'];
}>();
</script>

<template>
    <div>
        <h3 class="text-center text-sm font-semibold text-gray-900 mb-1">Express Checkout</h3>
        <p class="text-xxs text-gray-600 text-center mb-5">
            Checkout with Paypal, ApplePay, GooglePay, or another locally available express checkout provider.
        </p>

        <!-- 3 buttons in a row on desktop, stacked on mobile -->
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <!-- Apple Pay -->
            <button
                type="button"
                class="flex items-center justify-center px-4 py-3 rounded-lg bg-black text-white font-bold text-base hover:bg-gray-900 transition-colors"
                @click="emit('select-method', 'apple_pay')"
            >
                <svg class="w-5 h-5 mr-1.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Pay
            </button>

            <!-- Google Pay -->
            <button
                type="button"
                class="flex items-center justify-center px-4 py-3 rounded-lg bg-black text-white font-bold text-base hover:bg-gray-900 transition-colors"
                @click="emit('select-method', 'google_pay')"
            >
                <svg class="w-5 h-5 mr-1.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Pay
            </button>

            <!-- PayPal -->
            <button
                type="button"
                class="flex items-center justify-center px-4 py-3 rounded-lg bg-brand-gold text-brand-charcoal font-bold text-base hover:bg-brand-gold-500 transition-colors"
                @click="emit('select-method', 'paypal')"
            >
                <svg class="w-5 h-5 mr-1.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 00-.607-.541c1.67 1.95 1.37 4.773.53 7.01-1.03 2.75-3.18 4.62-6.17 5.02-.14.02-.28.027-.42.027h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106H7.076l-.29 1.834a.641.641 0 00.633.74h3.39c.45 0 .835-.333.906-.778l.87-5.52c.082-.518.526-.9 1.05-.9h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.15.054-.294.077-.437.244-1.467.124-2.648-.327-3.664z" />
                </svg>
                PayPal
            </button>
        </div>
    </div>
</template>
