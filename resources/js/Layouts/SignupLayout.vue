<script setup lang="ts">
import PlatformIcons from '@/Components/Signup/PlatformIcons.vue';
</script>

<template>
    <!-- Header -->
    <header class="relative z-10 bg-white" style="box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);">
        <div class="mx-auto max-w-signup px-4 sm:px-6 lg:px-8">
            <div class="flex h-12 items-center justify-center lg:justify-start">
                <div class="flex items-center gap-2">
                    <div class="flex h-6 w-9 items-center justify-center rounded bg-brand-gold text-2xs font-bold text-white">
                        VPN
                    </div>
                    <span class="text-sm font-medium text-gray-900">PrivateByRight</span>
                </div>
            </div>
        </div>
    </header>

    <!-- Main content -->
    <main class="min-h-[calc(100vh-48px-100px)] bg-gray-50">
        <div class="mx-auto max-w-signup px-4 pt-10 pb-10 sm:px-6 lg:px-8">
            <slot />
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-50 pb-6 pt-6 lg:pt-0">
        <div class="mx-auto max-w-signup px-4 sm:px-6 lg:px-8">
            <!-- Platform icons row -->
            <div class="flex items-center justify-center gap-3 py-4">
                <PlatformIcons />
            </div>

            <!-- Full-width divider -->
            <div class="border-t border-gray-200"></div>

            <!-- Copyright + links row -->
            <div class="flex flex-col items-center gap-2 pt-4 text-xs text-gray-500 sm:flex-row sm:justify-between">
                <span>&copy; 2026 PrivateByRight VPN. All rights reserved.</span>
                <div class="flex items-center gap-4">
                    <a href="#" class="hover:text-gray-700 underline">Privacy Policy</a>
                    <a href="#" class="hover:text-gray-700 underline">Terms of Service</a>
                    <a href="#" class="hover:text-gray-700 underline">Cookie Settings</a>
                </div>
            </div>
        </div>
    </footer>
</template>
