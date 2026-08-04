import { config } from "../../config.js";

/*
Este archivo no se utiliza actualmente, pero no se descarta su implementación en un futuro cercano 
(dependiendo de la evolución del proyecto y las necesidades del cliente).
*/



export const sendInvitationEmail= async (email, token, nombreUsuario) => {
    try{
        if (!email || !token || !nombreUsuario) {
            return {
                success: false,
                error: "El correo electrónico, token y nombre de usuario son requeridos para enviar la invitación."
            };
        }

        const enlaceInvitacion = `${window.location.origin}/registro?token=${token}`;

        const responde= await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.resend.email}`
            },
            body: JSON.stringify({
                from: "onboarding@resend.dev",
                to: email,
                subject: "Invitación para unirse a Otto WEB",
                html: `
                    <h2>¡Bienvenido a Otto Web!</h2>
                    <p>Tu código de invitación es:</p>
                    <h3 style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${token}</h3>
                    <p>Usa este código en la página de registro para crear tu cuenta.</p>
                    <p><strong>El código expira en 3 días.</strong></p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Si no solicitaste este código, ignora este email.</p>
                `
            })
        });

        if (!responde.ok) {
            const errorData = await responde.json();
            return {
                success: false,
                error: errorData.error || "Error al enviar el correo de invitación."
            };
        }

        const data = await responde.json();

        if (!responde.ok) {
            return {
                success: false,
                error: data.error || "Error al enviar el correo de invitación."
            };
        }

        return {
            success: true,
            data: data,
            message: "Correo de invitación enviado correctamente."
        };
    } catch (error) {
        console.error("Error al enviar el correo de invitación:", error);
        return {
            success: false,
            error: "Error al enviar el correo de invitación."
        };
    }
}


export const sendTemporaryCodeEmail = async (emailDestino, codigoTemporal) => {
    try {
        if (!emailDestino || !codigoTemporal) {
            return {
                success: false,
                error: "Email y código son requeridos"
            };
        }

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${config.resend.email}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "onboarding@resend.dev",
                to: emailDestino,
                subject: "Tu código temporal - Otto Web",
                html: `
                    <h2>Código de Verificación</h2>
                    <p>Tu código temporal para acceder es:</p>
                    <h3 style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${codigoTemporal}</h3>
                    <p>Este código expira en <strong>24 horas</strong>.</p>
                    <p style="color: #666; font-size: 12px;">Si no solicitaste este código, ignora este email.</p>
                `
            })
        });

        if (!response.ok) {
            throw new Error("Error al enviar email");
        }

        const data = await response.json();

        return {
            success: true,
            data: data,
            message: "Código enviado exitosamente"
        };

    } catch (error) {
        console.error("Error al enviar código temporal:", error);
        return {
            success: false,
            error: error.message || "Error al enviar el código"
        };
    }
};