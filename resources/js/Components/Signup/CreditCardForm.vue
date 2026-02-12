<script setup lang="ts">
import { computed } from 'vue';
import TextInput from '@/Components/UI/TextInput.vue';
import type { PaymentForm } from '@/types/signup';

interface Props {
    modelValue: PaymentForm;
    errors: Record<string, string>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:modelValue': [value: PaymentForm];
}>();

function updateField<K extends keyof PaymentForm>(field: K, value: PaymentForm[K]) {
    emit('update:modelValue', {
        ...props.modelValue,
        [field]: value,
    });
}

const cardBrand = computed(() => {
    const num = props.modelValue.card_number.replace(/\s/g, '');
    if (num.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    if (/^6(?:011|5)/.test(num)) return 'discover';
    return '';
});
</script>

<template>
    <div class="space-y-4">
        <!-- Card number -->
        <div class="relative">
            <TextInput
                :model-value="modelValue.card_number"
                label="Card number"
                type="text"
                placeholder="1234 1234 1234 1234"
                :error="errors.card_number"
                required
                @update:model-value="updateField('card_number', $event)"
            />
            <!-- Card brand icon area -->
            <div class="absolute right-3 top-[2.1rem] flex items-center">
                <!-- Visa -->
                <svg
                    v-if="cardBrand === 'visa'"
                    class="w-8 h-5 text-blue-700"
                    viewBox="0 0 48 32"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect width="48" height="32" rx="4" fill="#1A1F71" opacity="0.1" />
                    <path d="M19.5 21h-3l1.9-11.5h3L19.5 21zM15.3 9.5l-2.8 8-0.3-1.6-1.1-5.4s-0.1-1-1.4-1H6.1l-0.1.3s1.5.3 3.2 1.4L12 21h3.2l4.8-11.5H15.3zM35.4 21h2.8L35.7 9.5h-2.4c-1.1 0-1.3.8-1.3.8L27.8 21h3.2l.6-1.8h3.9l.4 1.8h-.5zM32.4 16.5l1.6-4.5.9 4.5h-2.5zM27.2 12.2l.4-2.5s-1.3-.5-2.7-.5c-1.5 0-5 .7-5 3.5 0 2.6 3.6 2.7 3.6 4 0 1.4-3.2 1.1-4.3.3l-.5 2.6s1.4.6 3.4.6c2.1 0 5.2-1.1 5.2-3.7 0-2.7-3.7-2.9-3.7-4 0-1.2 2.5-1 3.6-.3z" />
                </svg>
                <!-- Mastercard -->
                <svg
                    v-else-if="cardBrand === 'mastercard'"
                    class="w-8 h-5"
                    viewBox="0 0 48 32"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="18" cy="16" r="10" fill="#EB001B" opacity="0.8" />
                    <circle cx="30" cy="16" r="10" fill="#F79E1B" opacity="0.8" />
                </svg>
                <!-- Amex -->
                <svg
                    v-else-if="cardBrand === 'amex'"
                    class="w-8 h-5 text-blue-500"
                    viewBox="0 0 48 32"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect width="48" height="32" rx="4" fill="#2E77BC" opacity="0.2" />
                    <text x="24" y="20" text-anchor="middle" font-size="10" font-weight="bold" fill="#2E77BC">AMEX</text>
                </svg>
                <!-- Generic card -->
                <svg
                    v-else
                    class="w-6 h-4 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
            </div>
        </div>

        <!-- Expiry + CVC row -->
        <div class="grid grid-cols-2 gap-3">
            <TextInput
                :model-value="modelValue.expiry"
                label="Expiration date"
                type="text"
                placeholder="MM/YY"
                :error="errors.expiry"
                required
                @update:model-value="updateField('expiry', $event)"
            />
            <TextInput
                :model-value="modelValue.cvc"
                label="Security code"
                type="text"
                placeholder="CVC"
                :error="errors.cvc"
                required
                @update:model-value="updateField('cvc', $event)"
            />
        </div>

        <!-- Country + Zip row -->
        <div class="grid grid-cols-2 gap-3">
            <TextInput
                :model-value="modelValue.country"
                label="Country"
                type="text"
                placeholder="Your country"
                :error="errors.country"
                required
                @update:model-value="updateField('country', $event)"
            />
            <TextInput
                :model-value="modelValue.zip_code"
                label="Zip code"
                type="text"
                placeholder="XXXXX"
                :error="errors.zip_code"
                required
                @update:model-value="updateField('zip_code', $event)"
            />
        </div>
    </div>
</template>
