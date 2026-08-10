import { config } from "../../config.js";
import { VALIDACIONES } from "../../constants.js";

export const validateImage = (file) => {
    try {
        if (!file) {
            return {
                success: false,
                error: "No se ha seleccionado ningún archivo."
            }   ;
        }

         if (!VALIDACIONES.ALLOWED_FILE_TYPES.includes(file.type)) {
            return {
                success: false,
                error: `Tipo de archivo no permitido. Solo se aceptan: ${VALIDACIONES.ALLOWED_FILE_TYPES.join(", ")}`
            };
        }

        if (file.size > VALIDACIONES.MAX_FILE_SIZE) {
            return {
                success: false,
                error: `El archivo es muy grande. Máximo permitido: ${VALIDACIONES.MAX_FILE_SIZE / (1024 * 1024)}MB`
            };
        }

        return {
            success: true,
            message: "Archivo válido."
        }
    } catch (error) {
        return {
            success: false,
            error: error.message || "Error al validar la imagen."
        };
    }   
};

export const uploadImageToCloudinary = async (file) => {
    try {
        const validation = validateImage(file);

        if (!validation.success) {
            return validation;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", config.cloudinary.uploadPreset);

        const reponse = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/upload`, {
            method: "POST",
            body: formData
        });

        if (!reponse.ok) {
            throw new Error("Error al subir la imagen a Cloudinary.");
        }

        const data= await reponse.json();

        return {
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
            message: "Imagen subida exitosamente."
        };


    }catch (error) {
        console.error("Error en uploadImageToCloudinary:", error);
        return {
            success: false, 
            error: error.message || "Error al subir la imagen."
        };
    }   
};
