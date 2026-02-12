<script setup lang="ts">
interface Props {
    text?: string;
}

defineProps<Props>();
</script>

<template>
    <div class="relative flex items-center my-4">
        <div class="flex-grow border-t border-gray-300"></div>
        <span v-if="text" class="flex-shrink-0 mx-4 text-xs text-gray-900">
            {{ text }}
        </span>
        <div class="flex-grow border-t border-gray-300"></div>
    </div>
</template>
