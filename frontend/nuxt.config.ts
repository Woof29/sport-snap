import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
    modules: ['@primevue/nuxt-module'],
    primevue: {
        autoImport: true,
        options: {
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: '.dark'
                }
            }
        }
    },
    css: ['~/assets/css/main.scss'],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {}
        }
    },

    runtimeConfig: {
        public: {
            apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api'
        }
    },

    compatibilityDate: '2024-11-01',
    devtools: { enabled: true }
});
