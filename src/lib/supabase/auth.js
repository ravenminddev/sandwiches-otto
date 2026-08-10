import supabase from "../supabase/client.js";
import bcrypt from "bcryptjs";

// ============ LOGIN ============

export const login = async (username, password) => {
    try {
        if (!username || !password) {
            return {
                success: false,
                error: "Usuario y contraseña son requeridos"
            };
        }
        console.log(username);
        const { data: userData, error: userError } = await supabase
            .from("usuario")
            .select("*, rol(id_rol, nombre)")
            .eq("usuario", username)
            .eq("activo", true);
        console.log(userData);
        if (userError) throw userError;

        if (!userData || userData.length === 0) {
            return {
                success: false,
                error: "Usuario no encontrado o inactivo"
            };
        }

        const user = userData[0];
        console.log("Probando 3");
        const isEqual = await bcrypt.compare(password, user.contrasenia);

        if (!isEqual) {
            return {
                success: false,
                error: "Contraseña incorrecta"
            };
        }

        return {
            success: true,
            user: null,
            userData: user,
            session: null,
            esAdmin: user.id_rol === 1,
            message: "Login exitoso"
        };

    } catch (error) {
        console.error("Error en login:", error);
        return {
            success: false,
            error: error.message || "Error en el login"
        };
    }
};

// ============ LOGOUT ============
export const logout = async () => {
    return {
        success: true,
        message: "Sesión cerrada exitosamente"
    };
};
