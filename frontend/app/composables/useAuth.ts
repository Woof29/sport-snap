import type { AuthResponse, CurrentUserResponse, LoginRequest, RegisterRequest } from '@shared/types/auth';
import { useAuthStore } from '~/stores/useAuthStore';

export const useAuth = () => {
    const authStore = useAuthStore();
    const config = useRuntimeConfig();
    const API_BASE = config.public.apiBase;

    // Check authentication status and load user if token exists
    const checkAuth = async () => {
        // Only check on client side
        if (import.meta.server) return;

        if (!authStore.token) {
            authStore.clearAuth();
            return;
        }

        try {
            const response = await $fetch<CurrentUserResponse>(`${API_BASE}/auth/me`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }
            });

            if (response) {
                authStore.setUser(response.user);
            }
        } catch (err) {
            // Error fetching user, clear auth
            authStore.clearAuth();
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const body: LoginRequest = { email, password };
            const response = await $fetch<AuthResponse>(`${API_BASE}/auth/login`, {
                method: 'POST',
                body
            });

            if (response) {
                authStore.setToken(response.token);
                authStore.setUser(response.user);
            }

            return {
                success: true
            };
        } catch (err: any) {
            return {
                success: false,
                error: err.message || err.data?.message || 'Login failed'
            };
        }
    };

    const register = async (email: string, password: string, role: string) => {
        try {
            const body: RegisterRequest = { email, password, role };
            await $fetch<AuthResponse>(`${API_BASE}/auth/register`, {
                method: 'POST',
                body
            });

            return {
                success: true
            };
        } catch (err: any) {
            return {
                success: false,
                error: err.message || err.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        authStore.clearAuth();
        navigateTo('/auth/login');
    };

    return {
        login,
        register,
        logout,
        checkAuth
    };
};
