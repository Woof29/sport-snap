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
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="flex flex-col gap-2">
            <label for="email" class="text-sm font-medium text-gray-700">Email</label>
            <InputText id="email" v-model="email" type="email" placeholder="your@email.com" class="w-full" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="text-sm font-medium text-gray-700">密碼</label>
            <Password id="password" v-model="password" :feedback="false" toggleMask placeholder="********" class="w-full" inputClass="w-full" />
          </div>

          <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

          <Button type="submit" label="登入" class="w-full" :loading="loading" />
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
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
</script>
