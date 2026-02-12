<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    modelValue: string;
    label?: string;
    type?: 'text' | 'email' | 'password';
    placeholder?: string;
    error?: string | null;
    required?: boolean;
    hint?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    required: false,
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const inputClasses = computed(() => [
    'block w-full px-3 py-3 border rounded-btn text-sm bg-gray-50 transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white',
    props.error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-brand-gold focus:ring-brand-gold',
]);

function onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
}
</script>

<template>
    <div class="w-full">
        <label
            v-if="label"
            class="block text-xs font-normal text-gray-700 mb-1"
        >
            {{ label }}
            <span v-if="required" class="text-red-500">*</span>
        </label>

        <input
            :type="type"
            :value="modelValue"
            :placeholder="placeholder"
            :required="required"
            :aria-invalid="!!error"
            :aria-label="!label ? placeholder : undefined"
            :class="inputClasses"
            @input="onInput"
        />

        <p v-if="hint && !error" class="mt-1 text-xs text-gray-500">
            {{ hint }}
        </p>

        <p v-if="error" class="mt-1 text-xs text-red-600">
            {{ error }}
        </p>
    </div>
</template>
