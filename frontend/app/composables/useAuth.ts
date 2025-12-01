import type { User } from '@shared/types/user';
import type { AuthResponse, CurrentUserResponse, LoginRequest, RegisterRequest } from '@shared/types/auth';

export const useAuth = () => {
    const token = useCookie('auth_token');
    const user = useState<User | null>('auth_user', () => null);

    // Set base URL for API calls
    const config = useRuntimeConfig();
    const API_BASE = config.public.apiBase;

    // Check authentication status and load user if token exists
    const checkAuth = async () => {
        // Only check on client side
        if (import.meta.server) return;

        if (!token.value) {
            user.value = null;
            return;
        }

        try {
            const response = await $fetch<CurrentUserResponse>(`${API_BASE}/auth/me`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token.value}`
                }
            });

            if (response) {
                user.value = response.user;
            }
        } catch (err) {
            // Error fetching user, clear token
            token.value = null;
            user.value = null;
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
                token.value = response.token;
                user.value = response.user;
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
            const response = await $fetch<AuthResponse>(`${API_BASE}/auth/register`, {
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
        token.value = null;
        user.value = null;
        navigateTo('/auth/login');
    };

    return {
        token,
        user,
        login,
        register,
        logout,
        checkAuth
    };
};
