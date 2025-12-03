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

                    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

                    <Button type="submit" label="註冊" class="w-full" :loading="loading" />
                </form>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
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
</script>
