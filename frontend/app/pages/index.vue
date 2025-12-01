<template>
    <div>
        <div class="container mx-auto px-4 py-12">
            <div class="text-center">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">歡迎來到 SportSnap</h1>
                <p class="text-xl text-gray-600 mb-8">捕捉精彩瞬間，連結運動熱情</p>

                <ClientOnly>
                    <div v-if="auth.user.value" class="bg-green-50 p-6 rounded-lg inline-block text-left">
                        <h3 class="text-lg font-medium text-green-800 mb-2">登入成功！</h3>

                        <p class="text-green-700">
                            <strong>Email:</strong>
                            {{ auth.user.value.email }}
                            <br />
                            <strong>Role:</strong>
                            {{ auth.user.value.role }}
                        </p>
                    </div>

                    <div v-else class="space-x-4">
                        <Button label="立即開始" as="router-link" to="/auth/register" size="large" />
                        <Button
                            label="登入帳號"
                            as="router-link"
                            to="/auth/login"
                            size="large"
                            variant="outlined"
                            severity="secondary"
                        />
                    </div>
                </ClientOnly>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    ssr: false // Disable SSR for this page to prevent hydration mismatch
});

const auth = useAuth();

onMounted(async () => {
    // 檢查認證狀態並載入用戶資訊
    await auth.checkAuth();
});
</script>
