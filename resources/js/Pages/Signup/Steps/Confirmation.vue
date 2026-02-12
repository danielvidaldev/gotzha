<script setup lang="ts">
import { onMounted } from 'vue';
import { useSignupStore } from '@/stores/signupStore';
import { useAnalytics } from '@/composables/useAnalytics';

const store = useSignupStore();
const analytics = useAnalytics();

onMounted(() => {
    analytics.trackStepCompleted(4, { orderId: store.order?.id });
});
</script>

<template>
    <div>
        <!-- Success header -->
        <div class="mb-8 flex items-start gap-5">
            <!-- Green checkmark circle -->
            <div class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400">
                <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <div>
                <h1 class="text-lg font-medium text-gray-900">
                    You're protected.<br />
                    PrivateByRight is active.
                </h1>
                <p class="mt-2 text-sm text-gray-600">
                    We've emailed your receipt to <strong>{{ store.account.email }}</strong>. You can
                    now connect up to {{ store.config?.maxDevices ?? 5 }} devices.
                </p>
            </div>
        </div>

        <!-- Setup instructions — aligned with the title text (offset by icon + gap) -->
        <div class="space-y-5 pl-[84px] sm:pl-[84px]">
            <div>
                <h3 class="text-sm font-bold text-gray-900">
                    1. Choose your device
                    <a href="#" class="ml-2 text-xs font-normal text-gray-900 underline hover:text-gray-700">
                        Download app &rarr;
                    </a>
                </h3>
                <p class="mt-1 text-xs text-gray-600">
                    Select your platform to download the correct version of the app.
                </p>
            </div>

            <div>
                <h3 class="text-sm font-bold text-gray-900">2. Download and install</h3>
                <p class="mt-1 text-xs text-gray-600">
                    Open the installer or store listing and follow the prompts.
                </p>
            </div>

            <div>
                <h3 class="text-sm font-bold text-gray-900">3. Sign in and tap Connect</h3>
                <p class="mt-1 text-xs text-gray-600">
                    Pick a location (or use smart defaults) and connect instantly.
                </p>
            </div>
        </div>
    </div>
</template>
