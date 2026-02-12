<script setup lang="ts">
interface Step {
    number: number;
    label: string;
    isActive: boolean;
    isCompleted: boolean;
}

interface Props {
    steps: Step[];
}

defineProps<Props>();

const emit = defineEmits<{
    toggle: [stepNumber: number];
}>();
</script>

<template>
    <div class="space-y-0 border border-gray-200 rounded-card overflow-hidden">
        <div
            v-for="step in steps"
            :key="step.number"
            class="border-b border-gray-200 last:border-b-0"
        >
            <button
                type="button"
                class="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
                :class="[
                    step.isActive ? 'bg-gray-50' : 'bg-white',
                ]"
                @click="emit('toggle', step.number)"
            >
                <span
                    class="text-sm uppercase tracking-wide"
                    :class="[
                        step.isActive ? 'font-bold text-brand-charcoal' : 'font-medium text-gray-500',
                        step.isCompleted && !step.isActive ? 'text-brand-green cursor-pointer' : '',
                    ]"
                >
                    Step {{ step.number }}
                    <span class="ml-1 normal-case tracking-normal">{{ step.label }}</span>
                </span>

                <!-- Chevron -->
                <svg
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    :class="step.isActive ? 'rotate-180' : ''"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
        </div>
    </div>
</template>
