<script setup lang="ts">
interface Props {
    score: number;
    reviewCount: number;
}

defineProps<Props>();
</script>

<template>
    <div class="flex flex-col items-center text-center space-y-2">
        <!-- Rating text on top -->
        <p class="text-xs text-gray-500">
            Rated {{ score }} / 5 based on
            <strong class="text-gray-700">{{ reviewCount.toLocaleString() }} reviews</strong>
        </p>

        <!-- Excellent + stars inline -->
        <div class="flex items-center gap-2">
            <span class="text-lg font-bold text-gray-800">Excellent</span>
            <div class="flex items-center gap-0.5">
                <div
                    v-for="i in 5"
                    :key="i"
                    class="flex items-center justify-center w-6 h-6 bg-trustpilot"
                >
                    <svg
                        class="w-3.5 h-3.5 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        />
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>
