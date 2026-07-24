import { Navigate } from "react-router";
import { useAuth } from "../lib/hooks/useAuth.js";


export default function ProtectedRoutes({ children, requiredRole = null }) {
    const { isAuthenticated, userData, loading } = useAuth();

    if (!isAuthenticated && !loading) {
        return <Navigate to="/login" />;
    }

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (requiredRole === 'admin' && userData?.id_rol !== 1) {
        return <Navigate to="/sales" />;
    }

    return children;
}