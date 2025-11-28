export const useAuth = () => {
    const token = useCookie('auth_token');
    const user = useState('auth_user', () => null);

    // Set base URL for API calls
    const config = useRuntimeConfig();
    const API_BASE = 'http://localhost:3001/api'; // In prod, this should be env var

    interface ApiResponse {
        success: boolean;
        error?: any;
        data?: any;
    }

    const login = async (email: string, password: string) => {
        try {
            const res: ApiResponse = await $fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                body: {
                    email,
                    password
                }
            });

            if (res.error) {
                throw new Error(res.error.data?.message || 'Login failed');
            }

            token.value = res.data.token;
            user.value = res.data.user;

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
            const res: ApiResponse = await $fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                body: {
                    email,
                    password,
                    role
                }
            });

            if (res.error) {
                throw new Error(res.error.data?.message || 'Registration failed');
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
