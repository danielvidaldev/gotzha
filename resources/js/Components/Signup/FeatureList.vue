<script setup lang="ts">
const features = [
    { icon: '\uD83D\uDD12', text: 'Private & secure browsing' },
    { icon: '\u26A1', text: 'Fast for streaming' },
    { icon: '\uD83D\uDCBB', text: 'Multi-platform support' },
    { icon: '\uD83D\uDD11', text: 'Smart DNS included' },
    { icon: '\uD83D\uDCF1', text: '5 simultaneous VPN devices' },
];
</script>

<template>
    <ul class="space-y-2.5">
        <li
            v-for="feature in features"
            :key="feature.text"
            class="flex items-center space-x-2.5 text-sm font-medium text-gray-800"
        >
            <span class="text-base">{{ feature.icon }}</span>
            <span>{{ feature.text }}</span>
        </li>
    </ul>
</template>
