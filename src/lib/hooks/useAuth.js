import { useAuthStore } from "../authStore/useAuthStore.js";
import { login, logout } from "../supabase/auth.js";

export const useAuth = () => {
    const {
        user,
        userData,
        session,
        esAdmin,
        isAuthenticated,
        loading,
        error,
        setUser,
        setError,
        clearAuth,
        setLoading
    } = useAuthStore();

    const handleLogin = async (username, password) => {
        setLoading(true);
        const result = await login(username, password);
        setLoading(false);

        if (result.success) {
            setUser(result.user, result.userData, result.session, result.esAdmin);
        } else {
            setError(result.error);
        }

        return result;
    };

    const handleLogout = async () => {
        setLoading(true);
        const result = await logout();
        setLoading(false);

        if (result.success) {
            clearAuth();
        } else {
            setError(result.error);
        }

        return result;
    };

    return {
        user,
        userData,
        session,
        esAdmin,
        isAuthenticated,
        loading,
        error,
        login: handleLogin,
        logout: handleLogout,
        clearError: () => setError(null)
    };
};
