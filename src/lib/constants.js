export const MENSAJES = {
    LOGIN_EXISTOSO: "Login Exitoso",
    REGISTRO_EXISTOSO: "Registro Exitoso",
    CERRAR_SESION: "Sesion Cerrada",
    LOGIN_FALLIDO: "Login Fallido",
    REGISTRO_FALLIDO: "Registro Fallido",
    ERROR_DESCONOCIDO: "Error Desconocido",
    VENTA_GUARDADA: "Venta Guardada",
    ERROR_GUARDAR_VENTA: "Error al Guardar Venta",
    ERROR_GENERAL: "Ocurrió un error, por favor intenta nuevamente"
};


export const VALIDACIONES= {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 20,
    MAX_USERNAME_LENGTH: 50,
    MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
    ALLOWED_FILE_TYPES: ["image/jpeg", "image/png", "image/gif"],
    TIMEOUT_REQUEST: 60000,
}


export const RUTAS= {
    HOME: "/",
    LOGIN: "/login",
    ADMIN: "/admin",
    PRODUCTOS: "/admin/productos",
    REGISTRO: "/registro",
    PERFIL: "/perfil",
    HISTORIAL: "/historialGeneralUser",
    VENTAS: "/ventas",
}


