import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './vendor/laravel/jetstream/**/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.vue',
        './resources/js/**/*.ts',
    ],

    theme: {
        extend: {
            colors: {
                'brand-gold': {
                    DEFAULT: '#F0C832',
                    50: '#FFFBE6',
                    100: '#FEF3B5',
                    200: '#FDEB84',
                    300: '#F8DE4E',
                    400: '#F0C832',
                    500: '#E0B820',
                    600: '#C8A218',
                    700: '#A08012',
                    800: '#7A620E',
                    900: '#5E4A0A',
                },
                'brand-charcoal': {
                    DEFAULT: '#2D2D2D',
                    50: '#F5F5F5',
                    100: '#E8E8E8',
                    200: '#D1D1D1',
                    300: '#999999',
                    400: '#666666',
                    500: '#4D4D4D',
                    600: '#3D3D3D',
                    700: '#333333',
                    800: '#2D2D2D',
                    900: '#1A1A1A',
                },
                'brand-green': {
                    DEFAULT: '#4CAF50',
                    light: '#66BB6A',
                    dark: '#388E3C',
                },
                'trustpilot': {
                    DEFAULT: '#00B67A',
                },
            },
            fontFamily: {
                sans: ['Satoshi Variable', 'Satoshi', ...defaultTheme.fontFamily.sans],
            },
            maxWidth: {
                'signup': '1200px',
            },
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.875rem' }],   // 10px
                'xxs': ['0.6875rem', { lineHeight: '1rem' }],      // 11px
            },
            borderRadius: {
                'btn': '8px',
                'card': '12px',
            },
        },
    },

    plugins: [forms, typography],
};
