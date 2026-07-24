import supabase from "../supabase/client.js";
import { sendTemporaryCodeEmail } from "../services/email/email.js";
import { 
    validateInvitationToken, 
    markTokenAsUsed 
} from "../services/token.js";




export const loginStep1 = async (emailOrUsername, password) => {
    try {
        if (!emailOrUsername || !password) {
            return {
                success: false,
                error: "Email/Usuario y contraseña son requeridos"
            };
        }

        const { data: userData, error: userError } = await supabase
            .from("usuarios")
            .select("*, roles(nombre_rol, permisos)")
            .or(`email.eq.${emailOrUsername},nombre_usuario.eq.${emailOrUsername}`);

        if (userError) throw userError;

        if (!userData || userData.length === 0) {
            return {
                success: false,
                error: "Usuario no encontrado"
            };
        }

        const user = userData[0];

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: password
        });

        if (authError) throw authError;

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        return {
            success: true,
            user: sessionData.session?.user,
            userData: user,
            session: sessionData.session,
            esAdmin: user.id_rol === 1,
            message: "Login exitoso"
        };

    } catch (error) {
        console.error("Error en loginStep1:", error);
        return {
            success: false,
            error: error.message || "Error en el login"
        };
    }
};

export const loginStep2 = async (email, codigoTemporal) => {
    try {
        if (!email || !codigoTemporal) {
            return {
                success: false,
                error: "Email y código temporal son requeridos"
            };
        }

        // Obtener usuario (SIN .single())
        const { data: userData, error: userError } = await supabase
            .from("usuarios")
            .select("*, roles(nombre_rol, permisos)")
            .eq("email", email);

        if (userError) throw userError;

        if (!userData || userData.length === 0) {
            return {
                success: false,
                error: "Usuario no encontrado"
            };
        }

        const user = userData[0];

        // Validar código
        if (user.codigo_temporal !== codigoTemporal) {
            const nuevoIntento = (user.codigo_intentos || 0) + 1;

            await supabase
                .from("usuarios")
                .update({ codigo_intentos: nuevoIntento })
                .eq("id_usuario", user.id_usuario);

            if (nuevoIntento >= 3) {
                return {
                    success: false,
                    error: "Demasiados intentos fallidos. Solicita un nuevo código.",
                    maxAttemptsExceeded: true
                };
            }

            return {
                success: false,
                error: "Código temporal inválido"
            };
        }

       
        const ahora = new Date();
        const fechaExpiracion = new Date(user.codigo_expiracion);

        if (ahora > fechaExpiracion) {
            return {
                success: false,
                error: "El código temporal ha expirado. Solicita uno nuevo.",
                requiresNewCode: true
            };
        }

        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const { error: updateError } = await supabase
            .from("usuarios")
            .update({
                codigo_verificado: true,
                codigo_intentos: 0,
                codigo_temporal: null,
                fecha_ultima_modificacion: new Date().toISOString()
            })
            .eq("id_usuario", user.id_usuario);

        if (updateError) throw updateError;

        return {
            success: true,
            user: sessionData.session?.user,
            userData: user,
            session: sessionData.session,
            esAdmin: user.id_rol === 1,
            message: "Login exitoso"
        };

    } catch (error) {
        console.error("Error en loginStep2:", error);
        return {
            success: false,
            error: error.message || "Error en la verificación"
        };
    }
};


export const register = async (email, password, nombreUsuario, codigoInvitacion) => {
    try {
        // Validar token de invitación
        const validationResult = await validateInvitationToken(email, codigoInvitacion);

        if (!validationResult.success) {
            return validationResult;
        }

        // Crear en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    nombre_usuario: nombreUsuario
                }
            }
        });

        if (authError) throw authError;

        if (!authData.user) {
            throw new Error("Error al crear usuario en Auth");
        }

        // Generar código temporal para verificación post-registro
        const codigoTemporal = Math.random().toString(36).substring(2, 8).toUpperCase();
        const fechaExpiracion = new Date();
        fechaExpiracion.setHours(fechaExpiracion.getHours() + 24);

        // Crear en tabla usuarios
        const { data: userData, error: userError } = await supabase
            .from("usuarios")
            .insert([{
                nombre_usuario: nombreUsuario,
                email: email,
                nombre_completo: nombreUsuario,
                id_rol: 2,
                estado: true,
                codigo_temporal: codigoTemporal,
                codigo_expiracion: fechaExpiracion.toISOString(),
                codigo_verificado: false,
                codigo_intentos: 0,
                imagen_perfil: null,
                fecha_creacion: new Date().toISOString()
            }])
            .select();

        if (userError) {
            try {
                await supabase.auth.admin.deleteUser(authData.user.id);
            } catch (e) {
                console.error("Error en rollback:", e);
            }
            throw userError;
        }

        if (!userData || userData.length === 0) {
            await supabase.auth.admin.deleteUser(authData.user.id);
            throw new Error("Error al crear registro de usuario");
        }

        // Marcar token como usado
        const tokenResult = await markTokenAsUsed(codigoInvitacion, userData[0].id_usuario);

        if (!tokenResult.success) {
            console.warn("Token no marcado como usado:", tokenResult.error);
        }

        // Enviar código temporal
        const emailResult = await sendTemporaryCodeEmail(email, codigoTemporal);

        if (!emailResult.success) {
            console.warn("Error al enviar email:", emailResult.error);
        }

        return {
            success: true,
            user: authData.user,
            userData: userData[0],
            message: "Registro exitoso. Se envió un código de verificación a tu email"
        };

    } catch (error) {
        console.error("Error en register:", error);
        return {
            success: false,
            error: error.message || "Error en el registro"
        };
    }
};


export const verifyRegistrationCode = async (email, code) => {
    try {
        if (!email || !code) {
            return {
                success: false,
                error: "Email y código son requeridos"
            };
        }

        const { data: userData, error: userError } = await supabase
            .from("usuarios")
            .select("*")
            .eq("email", email);

        if (userError) throw userError;

        if (!userData || userData.length === 0) {
            return {
                success: false,
                error: "Usuario no encontrado"
            };
        }

        const user = userData[0];

        // Validar código
        if (user.codigo_temporal !== code) {
            const nuevoIntento = (user.codigo_intentos || 0) + 1;

            await supabase
                .from("usuarios")
                .update({ codigo_intentos: nuevoIntento })
                .eq("id_usuario", user.id_usuario);

            if (nuevoIntento >= 3) {
                return {
                    success: false,
                    error: "Demasiados intentos. Solicita un nuevo código."
                };
            }

            return {
                success: false,
                error: "Código inválido"
            };
        }

        // Validar expiración
        const ahora = new Date();
        const fechaExpiracion = new Date(user.codigo_expiracion);

        if (ahora > fechaExpiracion) {
            return {
                success: false,
                error: "Código expirado. Solicita uno nuevo.",
                requiresNewCode: true
            };
        }

        // Marcar como verificado
        const { error: updateError } = await supabase
            .from("usuarios")
            .update({
                codigo_verificado: true,
                codigo_temporal: null,
                codigo_intentos: 0,
                fecha_ultima_modificacion: new Date().toISOString()
            })
            .eq("id_usuario", user.id_usuario);

        if (updateError) throw updateError;

        return {
            success: true,
            message: "Cuenta verificada. Ya puedes iniciar sesión"
        };

    } catch (error) {
        console.error("Error en verifyRegistrationCode:", error);
        return {
            success: false,
            error: error.message || "Error en la verificación"
        };
    }
};

// ============ GENERAR Y ENVIAR CÓDIGO TEMPORAL ============
export const generateAndSendTemporaryCode = async (email) => {
    try {
        if (!email) {
            return {
                success: false,
                error: "El email es requerido"
            };
        }

        // Obtener usuario (SIN .single())
        const { data: userData, error: userError } = await supabase
            .from("usuarios")
            .select("*")
            .eq("email", email);

        if (userError) throw userError;

        if (!userData || userData.length === 0) {
            return {
                success: false,
                error: "Usuario no encontrado"
            };
        }

        const user = userData[0];

        // Generar código
        const codigoTemporal = Math.random().toString(36).substring(2, 8).toUpperCase();
        const fechaExpiracion = new Date();
        fechaExpiracion.setHours(fechaExpiracion.getHours() + 24);

        // Guardar en BD
        const { error: updateError } = await supabase
            .from("usuarios")
            .update({
                codigo_temporal: codigoTemporal,
                codigo_expiracion: fechaExpiracion.toISOString(),
                codigo_intentos: 0
            })
            .eq("id_usuario", user.id_usuario);

        if (updateError) throw updateError;

        // Enviar por email
        const emailResult = await sendTemporaryCodeEmail(email, codigoTemporal);

        if (!emailResult.success) {
            return {
                success: false,
                error: "Código generado pero error al enviar email"
            };
        }

        return {
            success: true,
            message: "Código temporal enviado a " + email
        };

    } catch (error) {
        console.error("Error al generar código temporal:", error);
        return {
            success: false,
            error: error.message || "Error al generar el código"
        };
    }
};

// ============ LOGOUT ============
export const logout = async () => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        return {
            success: true,
            message: "Sesión cerrada exitosamente"
        };

    } catch (error) {
        console.error("Error en logout:", error);
        return {
            success: false,
            error: error.message || "Error al cerrar sesión"
        };
    }
};

// ============ OBTENER USUARIO ACTUAL ============
export const getCurrentUser = async () => {
    try {
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!authData.user) {
            return {
                success: false,
                error: "No hay usuario autenticado"
            };
        }

        const { data: userData, error: userError } = await supabase
            .from("usuarios")
            .select("*, roles(nombre_rol, permisos)")
            .eq("email", authData.user.email);

        if (userError) throw userError;

        if (!userData || userData.length === 0) {
            return {
                success: false,
                error: "Usuario no encontrado en el sistema"
            };
        }

        return {
            success: true,
            user: authData.user,
            userData: userData[0],
            esAdmin: userData[0].id_rol === 1
        };

    } catch (error) {
        console.error("Error al obtener usuario actual:", error);
        return {
            success: false,
            error: error.message || "Error al obtener usuario"
        };
    }
};

// ============ RESET PASSWORD ============
export const resetPassword = async (email) => {
    try {
        if (!email) {
            return {
                success: false,
                error: "El email es requerido"
            };
        }

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/nueva-contraseña`
        });

        if (error) {
            throw error;
        }

        return {
            success: true,
            message: "Se envio un enlace de recuperacion a tu email"
        };
    } catch (error) {
        console.error("Error al resetear contraseña:", error);
        return {
            success: false,
            error: error.message || "Error al enviar enlace de Recuperacion"
        };
    }
};

// ============ COMPLETE PASSWORD RESET ============
export const completePasswordReset = async (email) => {
    try {
        if (!email) {
            return {
                success: false,
                error: "El email es requerido"
            };
        }

        const { data, error } = await supabase
            .from("usuarios")
            .update({
                fecha_ultima_modificacion: new Date().toISOString()
            })
            .eq("email", email)
            .select();

        if (error) throw error;

        return {
            success: true,
            data: data[0],
            message: "Contraseña actualizada exitosamente"
        };

    } catch (error) {
        console.error("Error al completar reset de contraseña:", error);
        return {
            success: false,
            error: error.message || "Error al actualizar contraseña"
        };
    }
};

// ============ CHANGE PASSWORD ============
export const changePassword = async (passwordActual, passwordNueva) => {
    try {
        if (!passwordActual || !passwordNueva) {
            return {
                success: false,
                error: "Las contraseñas son requeridas"
            };
        }

        if (passwordActual === passwordNueva) {
            return {
                success: false,
                error: "La nueva contraseña no puede ser igual a la actual"
            };
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) throw userError;

        const { data, error } = await supabase.auth.updateUser({
            password: passwordNueva
        });

        if (error) throw error;

        const { error: updateError } = await supabase
            .from("usuarios")
            .update({
                fecha_ultima_modificacion: new Date().toISOString()
            })
            .eq("email", userData.user.email);

        if (updateError) throw updateError;

        return {
            success: true,
            message: "Contraseña actualizada exitosamente"
        };

    } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        return {
            success: false,
            error: error.message || "Error al cambiar la contraseña"
        };
    }
};