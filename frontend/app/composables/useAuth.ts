export interface User {
    id: number;
    email: string;
    role: string;
}

export const useAuth = () => {
    const token = useCookie('auth_token');
    const user = useState<User | null>('auth_user', () => null);

    // Set base URL for API calls
    const config = useRuntimeConfig();
    const API_BASE = config.public.apiBase;

    interface ApiResponse {
        token: string;
        user: User;
    }

    const login = async (email: string, password: string) => {
        try {
            const { data, error } = await useFetch<ApiResponse>(`${API_BASE}/auth/login`, {
                method: 'POST',
                body: {
                    email,
                    password
                }
            });

            if (error.value) {
                throw new Error(error.value.message || 'Login failed');
            }

            if (data.value) {
                token.value = data.value.token;
                user.value = data.value.user;
            }

            return {
                success: true
            };
        } catch (err: any) {
            return {
                success: false,
                error: err.message
            };
        }
    };

    const register = async (email: string, password: string, role: string) => {
        try {
            const { data, error } = await useFetch<ApiResponse>(`${API_BASE}/auth/register`, {
                method: 'POST',
                body: {
                    email,
                    password,
                    role
                }
            });

            if (error.value) {
                throw new Error(error.value.message || 'Registration failed');
            }

            return {
                success: true
            };
        } catch (err: any) {
            return {
                success: false,
                error: err.message
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
        logout
    };
};
