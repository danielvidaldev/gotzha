<script setup lang="ts">
import { computed } from 'vue';
import DiscountBadge from '@/Components/Signup/DiscountBadge.vue';
import CouponBadge from '@/Components/Signup/CouponBadge.vue';

interface PlanData {
    name: string;
    original_price_pence: number;
    discounted_price_pence: number;
    discount_percentage: number;
    duration_months: number;
}

interface Props {
    plan: PlanData;
    isSelected: boolean;
    couponApplied: boolean;
    currencySymbol?: string;
}

const props = withDefaults(defineProps<Props>(), {
    currencySymbol: '\u00A3',
});

const emit = defineEmits<{
    select: [];
}>();

const originalPriceFormatted = computed(() => {
    return (props.plan.original_price_pence / 100).toFixed(2);
});

const discountedPriceFormatted = computed(() => {
    return (props.plan.discounted_price_pence / 100).toFixed(2);
});

const yearlyTotal = computed(() => {
    const monthly = props.plan.discounted_price_pence / 100;
    return (monthly * (props.plan.duration_months || 12)).toFixed(2);
});
</script>

<template>
    <div
        class="relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors"
        :class="[
            isSelected
                ? 'border-brand-gold bg-brand-gold-50'
                : 'border-gray-200 bg-white hover:border-gray-300',
        ]"
        @click="emit('select')"
    >
        <div class="flex-1 min-w-0">
            <!-- Name + badges row (flex-wrap on mobile) -->
            <div class="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 mb-1">
                <span class="font-semibold text-sm text-brand-charcoal whitespace-nowrap">{{ plan.name }}</span>
                <div class="flex items-center gap-1.5">
                    <DiscountBadge
                        v-if="plan.discount_percentage > 0"
                        :percentage="plan.discount_percentage"
                    />
                    <CouponBadge v-if="couponApplied" />
                </div>
            </div>

            <!-- Price row: inline -->
            <div class="flex items-baseline gap-1 whitespace-nowrap">
                <span
                    v-if="plan.original_price_pence !== plan.discounted_price_pence"
                    class="text-xxs text-gray-400 line-through"
                >
                    {{ currencySymbol }}{{ originalPriceFormatted }}
                </span>
                <span class="text-xs font-bold text-brand-charcoal">
                    {{ currencySymbol }}{{ discountedPriceFormatted }}
                </span>
                <span class="text-xxs text-gray-500">/ month</span>
                <span class="text-xxs text-gray-400">&mdash;</span>
                <span class="text-xxs text-gray-400">billed yearly at {{ currencySymbol }}{{ yearlyTotal }}</span>
            </div>
        </div>

        <!-- Radio circle -->
        <div
            class="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
            :class="[
                isSelected
                    ? 'border-brand-gold'
                    : 'border-gray-300',
            ]"
        >
            <div
                v-if="isSelected"
                class="w-2.5 h-2.5 rounded-full bg-brand-gold"
            ></div>
        </div>
    </div>
</template>
