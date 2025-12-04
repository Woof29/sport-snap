<template>
    <div class="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <Card class="w-full max-w-md">
            <template #title>
                <div class="text-center">
                    <h2 class="text-2xl font-bold text-gray-900">註冊新帳號</h2>
                    <p class="mt-2 text-sm text-gray-600">
                        已有帳號？
                        <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
                            立即登入
                        </NuxtLink>
                    </p>
                </div>
            </template>

            <template #content>
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-gray-700">我是...</label>
                        <div class="flex flex-col gap-2">
                            <div class="flex items-center">
                                <RadioButton v-model="role" inputId="roleBuyer" name="role" value="buyer" />
                                <label for="roleBuyer" class="ml-2 cursor-pointer">參賽者 (買照片)</label>
                            </div>
                            <div class="flex items-center">
                                <RadioButton
                                    v-model="role"
                                    inputId="rolePhotographer"
                                    name="role"
                                    value="photographer"
                                />
                                <label for="rolePhotographer" class="ml-2 cursor-pointer">攝影師 (賣照片)</label>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-center">
                        <GoogleLogin :callback="handleGoogleCallback" />
                    </div>

                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <span class="w-full border-t border-gray-300" />
                        </div>
                        <div class="relative flex justify-center text-xs uppercase">
                            <span class="bg-white px-2 text-gray-500">或者使用 Email 註冊</span>
                        </div>
                    </div>

                    <form @submit.prevent="handleRegister" class="space-y-6">
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
                                toggleMask
                                placeholder="********"
                                class="w-full"
                                inputClass="w-full"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="confirmPassword" class="text-sm font-medium text-gray-700">確認密碼</label>
                            <Password
                                id="confirmPassword"
                                v-model="confirmPassword"
                                :feedback="false"
                                toggleMask
                                placeholder="********"
                                class="w-full"
                                inputClass="w-full"
                            />
                        </div>

                        <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

                        <Button type="submit" label="註冊" class="w-full" :loading="loading" />
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
const confirmPassword = ref('');
const role = ref('buyer');
const loading = ref(false);
const error = ref('');
const auth = useAuth();

const handleRegister = async () => {
    if (password.value !== confirmPassword.value) {
        error.value = '兩次密碼輸入不一致';
        return;
    }

    loading.value = true;
    error.value = '';

    const res = await auth.register(email.value, password.value, role.value);

    if (res.success) {
        // Auto login or redirect to login
        const loginRes = await auth.login(email.value, password.value);
        if (loginRes.success) {
            navigateTo('/');
        } else {
            navigateTo('/auth/login');
        }
    } else {
        error.value = res.error || '註冊失敗';
    }

    loading.value = false;
};

const handleGoogleCallback: CallbackTypes.CredentialCallback = async (response) => {
    loading.value = true;
    error.value = '';

    if (response.credential) {
        const res = await auth.googleLogin(response.credential, role.value);

        if (res.success) {
            navigateTo('/');
        } else {
            error.value = res.error || 'Google 註冊失敗';
        }
    } else {
        error.value = '無法取得 Google 憑證';
    }

    loading.value = false;
};
</script>
