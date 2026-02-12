<script setup lang="ts">
interface Props {
    label: string;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit';
    fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    loading: false,
    type: 'button',
    fullWidth: true,
});

const emit = defineEmits<{
    click: [event: MouseEvent];
}>();

function handleClick(event: MouseEvent) {
    if (!props.disabled && !props.loading) {
        emit('click', event);
    }
}
</script>

<template>
    <button
        :type="type"
        :disabled="disabled || loading"
        :aria-busy="loading"
        :class="[
            'inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2',
            fullWidth ? 'w-full' : '',
            disabled || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-brand-gold text-brand-charcoal hover:bg-brand-gold-500 active:bg-brand-gold-600 cursor-pointer',
        ]"
        @click="handleClick"
    >
        <svg
            v-if="loading"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-brand-charcoal"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
            />
            <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
        {{ label }}
    </button>
</template>
