import type { User } from '~/types/user';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    // Initialize token from cookie for persistence
    const token = useCookie<string | null>('auth_token', {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        sameSite: 'lax',
        secure: true // Ensure this is appropriate for your env (dev vs prod)
    });

    const isAuthenticated = computed(() => !!token.value);

    const setUser = (newUser: User) => {
        user.value = newUser;
    };

    const setToken = (newToken: string) => {
        token.value = newToken;
    };

    const clearUser = () => {
        user.value = null;
    };

    const clearToken = () => {
        token.value = null;
    };

    // Helper action to clear everything
    const clearAuth = () => {
        clearUser();
        clearToken();
    };

    return {
        user,
        token,
        isAuthenticated,
        setUser,
        setToken,
        clearUser,
        clearToken,
        clearAuth
    };
});
