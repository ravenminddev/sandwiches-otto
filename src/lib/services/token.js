import supabase from "../supabase/client.js";
import { sendInvitationEmail } from "./email/email.js";

// ============ GENERAR TOKEN DE INVITACIÓN ============
export const generateInvitationToken = async (idAdmin, emailNuevoUsuario) => {
    try {
        if (!idAdmin || !emailNuevoUsuario) {
            return {
                success: false,
                error: "El ID del administrador y el email del nuevo usuario son requeridos"
            };
        }

        // Generar token aleatorio
        const token = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Fecha de expiración: 7 días desde ahora
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);

        // Insertar token en BD
        const { data, error } = await supabase
            .from("tokens_invitacion")  // ✅ Nombre correcto
            .insert([{
                token: token,
                email_enviado: emailNuevoUsuario,  // ✅ Campo correcto
                id_admin: idAdmin,
                fecha_expiracion: fechaExpiracion.toISOString(),  // ✅ Fecha correcta
                usado: false,
                fecha_creacion: new Date().toISOString()
            }])
            .select();

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            throw new Error("Error al crear token de invitación");
        }

        // Enviar email con el token
        const emailResult = await sendInvitationEmail(
            emailNuevoUsuario,
            token,
            "Bienvenido a Otto"
        );

        if (!emailResult.success) {
            console.warn("Token creado pero error al enviar email:", emailResult.error);
            // No fallar si el email no se envía, el token ya existe
        }

        return {
            success: true,
            data: data[0],
            message: "Token de invitación generado y correo enviado correctamente"
        };

    } catch (error) {
        console.error("Error al generar token de invitación:", error);
        return {
            success: false,
            error: error.message || "Error al generar el token de invitación"
        };
    }
};

// ============ VALIDAR TOKEN DE INVITACIÓN ============
export const validateInvitationToken = async (email, token) => {
    try {
        if (!email || !token) {
            return {
                success: false,
                error: "Email y código son requeridos"
            };
        }

        // Buscar token (SIN .single())
        const { data, error } = await supabase
            .from("tokens_invitacion")
            .select("*")
            .eq("email_enviado", email)
            .eq("token", token);

        if (error) throw error;

        if (!data || data.length === 0) {
            return {
                success: false,
                error: "Código de invitación no encontrado o inválido"
            };
        }

        const tokenData = data[0];

        // Validar que no esté usado
        if (tokenData.usado) {
            return {
                success: false,
                error: "Este código de invitación ya fue utilizado"
            };
        }

        // Validar que no esté expirado
        const ahora = new Date();
        const fechaExpiracion = new Date(tokenData.fecha_expiracion);

        if (ahora > fechaExpiracion) {
            return {
                success: false,
                error: "Este código de invitación ha expirado (máximo 7 días)"
            };
        }

        return {
            success: true,
            data: tokenData,
            message: "Código válido"
        };

    } catch (error) {
        console.error("Error al validar código:", error);
        return {
            success: false,
            error: error.message || "Error al validar el código"
        };
    }
};

// ============ MARCAR TOKEN COMO USADO ============
export const markTokenAsUsed = async (token, idUsuarioCreado) => {
    try {
        if (!token || !idUsuarioCreado) {
            return {
                success: false,
                error: "El token y el ID del usuario son requeridos"
            };
        }

        const { data, error } = await supabase
            .from("tokens_invitacion")
            .update({
                usado: true,
                id_usuario_creado: idUsuarioCreado,
                fecha_uso: new Date().toISOString()
            })
            .eq("token", token)
            .eq("usado", false)
            .select();

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            return {
                success: false,
                error: "No se encontró un token válido para marcar como usado"
            };
        }

        return {
            success: true,
            data: data[0],
            message: "Token marcado como usado correctamente"
        };

    } catch (error) {
        console.error("Error al marcar token como usado:", error);
        return {
            success: false,
            error: error.message || "Error al marcar el token como usado"
        };
    }
};

// ============ REENVIAR EMAIL DE INVITACIÓN ============
export const resendInvitationEmail = async (email) => {
    try {
        if (!email) {
            return {
                success: false,
                error: "El email es requerido"
            };
        }

        // Obtener token por email (SIN .single())
        const { data, error } = await supabase
            .from("tokens_invitacion")
            .select("*")
            .eq("email_enviado", email)
            .eq("usado", false);

        if (error) throw error;

        if (!data || data.length === 0) {
            return {
                success: false,
                error: "No hay código de invitación pendiente para este email"
            };
        }

        const tokenData = data[0];

        // Validar que no esté expirado
        const ahora = new Date();
        const fechaExpiracion = new Date(tokenData.fecha_expiracion);

        if (ahora > fechaExpiracion) {
            return {
                success: false,
                error: "Este código ha expirado. Solicita uno nuevo a tu administrador"
            };
        }

        // Reenviar email
        const emailResult = await sendInvitationEmail(
            email,
            tokenData.token,
            "Bienvenido a Otto"
        );

        if (!emailResult.success) {
            return {
                success: false,
                error: "Error al reenviar el email"
            };
        }

        return {
            success: true,
            message: "Código reenviado exitosamente a " + email
        };

    } catch (error) {
        console.error("Error al reenviar email:", error);
        return {
            success: false,
            error: error.message || "Error al reenviar el email"
        };
    }
};