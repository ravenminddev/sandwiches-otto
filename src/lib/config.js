const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

export const config = {
    supabase: {
        url: SUPABASE_URL,
        anonKey: SUPABASE_ANON_KEY
    },
    cloudinary: {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET
    },
    resend: {
        email: RESEND_API_KEY
    }
};