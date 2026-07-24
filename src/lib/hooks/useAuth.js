import { useAuthStore } from "../authStore/useAuthStore.js";
import { loginStep1, loginStep2, logout, register, verifyRegistrationCode } from "../supabase/auth.js";

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

    const handleLoginStep1 = async (email, password) => {
        setLoading(true);
        const result = await loginStep1(email, password);
        setLoading(false);

        if (result.success) {
            setUser(result.user, result.userData, result.session, result.esAdmin);
        } else {
            setError(result.error);
        }

        return result;
    };

    const handleLoginStep2 = async (email, codigoTemporal) => {
        setLoading(true);
        const result = await loginStep2(email, codigoTemporal);
        setLoading(false);

        if (result.success) {
            setUser(result.user, result.userData, result.session, result.esAdmin);
        } else {
            setError(result.error);
        }

        return result;
    };

    const handleRegister = async (email, password, nombreUsuario, codigoInvitacion) => {
        setLoading(true);
        const result = await register(email, password, nombreUsuario, codigoInvitacion);
        setLoading(false);

        if (result.success) {
            setError(null);
        } else {
            setError(result.error);
        }

        return result;
    };

    const handleVerifyRegistrationCode = async (email, code) => {
        setLoading(true);
        const result = await verifyRegistrationCode(email, code);
        setLoading(false);

        if (!result.success) {
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
        loginStep1: handleLoginStep1,
        loginStep2: handleLoginStep2,
        register: handleRegister,
        verifyRegistrationCode: handleVerifyRegistrationCode,
        logout: handleLogout,
        clearError: () => setError(null)
    };
};