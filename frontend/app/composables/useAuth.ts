export const useAuth = () => {
  const token = useCookie('auth_token');
  const user = useState('auth_user', () => null);

  // Set base URL for API calls
  const config = useRuntimeConfig();
  const API_BASE = 'http://localhost:3001/api'; // In prod, this should be env var

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await useFetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: { email, password },
      });

      if (error.value) {
        throw new Error(error.value.data?.message || 'Login failed');
      }

      const response = data.value as any;
      token.value = response.token;
      user.value = response.user;
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const register = async (email: string, password: string, role: string) => {
    try {
      const { data, error } = await useFetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: { email, password, role },
      });

      if (error.value) {
        throw new Error(error.value.data?.message || 'Registration failed');
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
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
  };
};
