<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useSignupStore } from '@/stores/signupStore';
import { useAnalytics } from '@/composables/useAnalytics';
import { useValidation } from '@/composables/useValidation';
import TextInput from '@/Components/UI/TextInput.vue';
import GoldButton from '@/Components/UI/GoldButton.vue';
import PrivacyGuarantee from '@/Components/Signup/PrivacyGuarantee.vue';

const store = useSignupStore();
const analytics = useAnalytics();
const validation = useValidation();

const isLoading = ref(false);

onMounted(() => {
    validation.registerField('email', [
        validation.required('Email address is required'),
        validation.email('Please enter a valid email address'),
    ]);
    validation.registerField('password', [
        validation.required('Password is required'),
        validation.minLength(6, 'Password must be at least 6 characters'),
    ]);
});

async function handleContinue() {
    validation.clearServerErrors();

    const isValid = validation.validateAll({
        email: store.account.email,
        password: store.account.password,
    });

    if (!isValid) return;

    isLoading.value = true;
    store.setSubmitting(true);

    try {
        const response = await axios.post('/signup/account', {
            email: store.account.email,
            password: store.account.password,
        });

        if (response.data.success) {
            store.setUserId(response.data.user.id);
            store.completeStep(2);
            analytics.trackStepCompleted(2, { email: store.account.email });
            store.nextStep();
        }
    } catch (error: any) {
        if (error.response?.status === 422 && error.response?.data?.errors) {
            const laravelErrors: Record<string, string[]> = error.response.data.errors;
            const flat: Record<string, string> = {};
            for (const [key, messages] of Object.entries(laravelErrors)) {
                if (messages.length > 0) flat[key] = messages[0];
            }
            validation.setServerErrors(flat);
        } else {
            analytics.trackSignupError(
                error.response?.data?.message || 'Account creation failed',
                2,
            );
        }
    } finally {
        isLoading.value = false;
        store.setSubmitting(false);
    }
}
</script>

<template>
    <div>
        <!-- Step 1 header (active) -->
        <div class="rounded-lg border border-gray-200 bg-white p-3">
            <div class="flex items-center gap-2 text-xs text-gray-800">
                <span class="font-normal uppercase">Step 1</span>
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
            </div>

            <!-- Account form inside the step container -->
            <div class="mt-3 flex items-center justify-between">
                <h2 class="text-sm font-normal text-gray-900">Create an account</h2>
                <div class="flex items-center gap-1 text-xs text-gray-500">
                    <span>Secure server</span>
                    <svg class="h-3.5 w-3.5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>
                    </svg>
                </div>
            </div>

            <form class="mt-4 space-y-4" @submit.prevent="handleContinue">
                <TextInput
                    v-model="store.account.email"
                    type="email"
                    placeholder="Email Address"
                    :error="validation.getError('email')"
                    required
                    @update:model-value="validation.validateField('email', $event)"
                />

                <TextInput
                    v-model="store.account.password"
                    type="password"
                    placeholder="Password (+6 characters)"
                    :error="validation.getError('password')"
                    required
                    @update:model-value="validation.validateField('password', $event)"
                />

                <GoldButton
                    label="Continue"
                    type="submit"
                    :loading="isLoading"
                    :disabled="isLoading"
                />
            </form>
        </div>

        <!-- Collapsed Step 2 preview -->
        <div class="mt-5 rounded-lg border-0 shadow-md p-3">
            <div class="flex items-center gap-2 text-xs text-gray-400">
                <span class="font-normal uppercase">Step 2</span>
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <span>Payment Information</span>
            </div>
        </div>

        <!-- Back to plan selection -->
        <button
            type="button"
            class="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            @click="store.prevStep()"
        >
            &larr; Back to plan selection
        </button>

        <PrivacyGuarantee class="mt-4" />
    </div>
</template>
