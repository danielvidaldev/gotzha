<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    text: string;
    variant?: 'gold' | 'green' | 'gray';
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'gold',
});

const badgeClasses = computed(() => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium uppercase tracking-wide';

    switch (props.variant) {
        case 'gold':
            return `${base} bg-brand-gold text-brand-charcoal`;
        case 'green':
            return `${base} bg-brand-green-light text-brand-charcoal`;
        case 'gray':
            return `${base} bg-gray-200 text-gray-700`;
        default:
            return `${base} bg-brand-gold text-brand-charcoal`;
    }
});
</script>

<template>
    <span :class="badgeClasses">{{ text }}</span>
</template>
