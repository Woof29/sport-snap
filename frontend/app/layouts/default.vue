<template>
    <div class="min-h-screen bg-gray-50 flex flex-col">
        <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div class="container mx-auto px-4 flex justify-between items-center h-16">
                <NuxtLink to="/" class="text-xl font-bold text-primary-600 flex items-center gap-2">
                    <i class="pi pi-camera" style="font-size: 1.5rem"></i>
                    SportSnap
                </NuxtLink>

                <nav class="flex items-center gap-3">
                    <Button label="賽事列表" as="router-link" to="/events" variant="text" severity="secondary" />
                    <ClientOnly>
                        <template v-if="!auth.token.value">
                            <Button
                                label="登入"
                                as="router-link"
                                to="/auth/login"
                                variant="text"
                                severity="secondary"
                            />
                            <Button label="註冊" as="router-link" to="/auth/register" />
                        </template>
                        <template v-else>
                            <Button
                                label="登出"
                                @click="auth.logout"
                                variant="text"
                                severity="secondary"
                                icon="pi pi-sign-out"
                            />
                        </template>
                    </ClientOnly>
                </nav>
            </div>
        </header>

        <main class="flex-grow container mx-auto px-4 py-6">
            <slot />
        </main>

        <footer class="bg-white border-t border-gray-200 py-6 mt-auto">
            <div class="container mx-auto px-4 text-center text-gray-500 text-sm">
                &copy; {{ new Date().getFullYear() }} SportSnap. All rights reserved.
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
const auth = useAuth();
</script>
