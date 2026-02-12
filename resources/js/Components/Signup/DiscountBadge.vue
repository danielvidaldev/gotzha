<script setup lang="ts">
import Badge from '@/Components/UI/Badge.vue';

interface Props {
    percentage: number;
}

defineProps<Props>();
</script>

<template>
    <Badge :text="`${percentage}% OFF`" variant="gold" />
</template>
