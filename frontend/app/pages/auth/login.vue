<template>
    <div class="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <Card class="w-full max-w-md">
            <template #title>
                <div class="text-center">
                    <h2 class="text-2xl font-bold text-gray-900">登入您的帳號</h2>
                    <p class="mt-2 text-sm text-gray-600">
                        還沒有帳號？
                        <NuxtLink to="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">
                            立即註冊
                        </NuxtLink>
                    </p>
                </div>
            </template>

            <template #content>
                <div class="flex flex-col gap-4">
                    <!-- Google Login Button -->
                    <div class="flex justify-center">
                        <GoogleLogin :callback="handleGoogleCallback" />
                    </div>

                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <span class="w-full border-t border-gray-300" />
                        </div>
                        <div class="relative flex justify-center text-xs uppercase">
                            <span class="bg-white px-2 text-gray-500">或者使用 Email 登入</span>
                        </div>
                    </div>

                    <form @submit.prevent="handleLogin" class="space-y-6">
                        <div class="flex flex-col gap-2">
                            <label for="email" class="text-sm font-medium text-gray-700">Email</label>
                            <InputText
                                id="email"
                                v-model="email"
                                type="email"
                                placeholder="your@email.com"
                                class="w-full"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="password" class="text-sm font-medium text-gray-700">密碼</label>
                            <Password
                                id="password"
                                v-model="password"
                                :feedback="false"
                                toggleMask
                                placeholder="********"
                                class="w-full"
                                inputClass="w-full"
                                inputId="password_input"
                            />
                            <div class="text-right">
                                <NuxtLink
                                    to="/auth/forgot-password"
                                    class="text-sm text-primary-600 hover:text-primary-500"
                                >
                                    忘記密碼？
                                </NuxtLink>
                            </div>
                        </div>

                        <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

                        <Button type="submit" label="登入" class="w-full" :loading="loading" />
                    </form>
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import type { CallbackTypes } from 'vue3-google-login';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const auth = useAuth();

const handleLogin = async () => {
    loading.value = true;
    error.value = '';

    const res = await auth.login(email.value, password.value);

    if (res.success) {
        navigateTo('/');
    } else {
        error.value = res.error || '登入失敗';
    }

    loading.value = false;
};

const handleGoogleCallback: CallbackTypes.CredentialCallback = async (response) => {
    loading.value = true;
    error.value = '';

    if (response.credential) {
        const res = await auth.googleLogin(response.credential);

        if (res.success) {
            navigateTo('/');
        } else {
            error.value = res.error || 'Google 登入失敗';
        }
    } else {
        error.value = '無法取得 Google 憑證';
    }

    loading.value = false;
};
</script>
