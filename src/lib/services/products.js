import { ca } from "zod/v4/locales";
import supabase from "../supabase/client";

export const createProduct = async (productData) => {
    try {
        if (!productData || Object.keys(productData).length === 0) {
            return {
                success: false,
                error: "Por favor, proporcione los datos del producto."
            };
        }

        if (!productData.nombre || !productData.precio || !productData.id_categoria) {
            return {
                success: false,
                error: "Los campos nombre, precio e id_categoria son obligatorios."
            };
        }

        const { data, error } = await supabase
            .from("producto")
            .insert([
                {
                    nombre: productData.nombre,
                    descripcion: productData.descripcion || null,
                    precio: productData.precio,
                    url_imagen: productData.url_imagen,
                    id_categoria: productData.id_categoria,
                    activo: productData.activo !== false
                }
            ]).select();

        if (error) throw error;

        return {
            success: true,
            data: data[0],
            message: "Producto creado exitosamente"
        }
    } catch (error) {
        console.error("Error al crear el producto:", error);
        return {
            success: false,
            error: error.message || "Ocurrió un error al crear el producto."
        };
    }
};

export const getProducts = async (active = true) => {
    try {
        const { data, error } = await supabase
            .from("producto")
            .select("*, categoria_producto(nombre)")
            .order("nombre", { ascending: true })
            .eq("activo", active);

        if (error) throw error;

        if (!data || data.length === 0) {
            return {
                success: false,
                error: "No se encontraron productos en la base de datos"
            };
        }

        return {
            success: true,
            data: data,
            count: data.length,
            message: "Se han obtenido los productos correctamente"
        };

    } catch (error) {
        console.error(error.message);
        return {
            success: false,
            error: "Ocurrió un error al obtener los productos. Por favor, inténtelo de nuevo."
        };
    }
};

export const getAllProducts = async () => {
    try {
        const { data, error } = await supabase
            .from("producto")
            .select("*, categoria_producto(nombre)")
            .order("nombre", { ascending: true });
            
        if (error) throw error;

        if (!data || data.length === 0) {
            return {
                success: false,
                error: "No se encontraron productos en la base de datos"
            };
        }

        return {
            success: true,
            data: data,
            count: data.length,
            message: "Se han obtenido todos los productos correctamente"
        };
    }
    catch (error) {
        console.error(error.message);
        return {
            success: false,
            error: "Ocurrió un error al obtener los productos. Por favor, inténtelo de nuevo."
        };
    }
};

export const getProductById = async (id) => {
    try {
        if (id === undefined || id === null) {
            return {
                success: false,
                error: "Por favor, seleccione un ID de producto válido"
            };
        }

        const { data, error } = await supabase
            .from("producto")
            .select("*, categoria_producto(nombre)")
            .eq("id_producto", id)
            .single();

        if (error) throw error;

        if (!data) {
            return {
                success: false,
                error: "No se encontró el producto en la base de datos"
            };
        }

        return {
            success: true,
            data: data,
            message: "Se ha obtenido el producto correctamente"
        }

    } catch (error) {
        console.log("Error al obtener el producto con el id", id, ":", error)
        return {
            success: false,
            error: error.message || "Ocurrió un error al obtener el producto. Por favor, inténtelo de nuevo."
        };
    }
};

export const updateProduct = async (id, productData) => {
    try {
        if (id === undefined || id === null) {
            return {
                success: false,
                error: "Por favor, seleccione un ID de producto válido"
            };
        }

        if (!productData || Object.keys(productData).length === 0) {
            return {
                success: false,
                error: "Por favor, proporcione los datos del producto para actualizar."
            };
        }

        const { data, error } = await supabase
            .from("producto")
            .update(productData)
            .eq("id_producto", id)
            .select();

        if (error) throw error;

        return {
            success: true,
            data: data[0],
            message: "Producto actualizado exitosamente"
        };

    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        return {
            success: false,
            error: "Ocurrió un error al actualizar el producto. Por favor, inténtelo de nuevo."
        };
    }
};

export const deactivateProduct = async (id) => {
    try {
        if (id === undefined || id === null) {
            return {
                success: false,
                error: "Por favor, seleccione un ID de producto válido"
            };
        }

        const { data, error } = await supabase
            .from("producto")
            .update({ activo: false })
            .eq("id_producto", id)
            .select();

        if (error) throw error;

        return {
            success: true,
            data: data[0],
            message: "Producto desactivado exitosamente"
        };

    } catch (error) {
        console.error("Error al desactivar el producto:", error);
        return {
            success: false,
            error: "Ocurrió un error al desactivar el producto. Por favor, inténtelo de nuevo."
        };
    }
};

export const activateProduct = async (id) => {
    try {
        if (id === undefined || id === null) {
            return {
                success: false,
                error: "Por favor, seleccione un ID de producto válido"
            };
        }

        const { data, error } = await supabase
            .from("producto")
            .update({ activo: true })
            .eq("id_producto", id)
            .select();

        if (error) throw error;

        return {
            success: true,
            data: data[0],
            message: "Producto activado exitosamente"
        };
    } catch (error) {
        console.error("Error al activar el producto:", error);
        return {
            success: false,
            error: "Ocurrió un error al activar el producto. Por favor, inténtelo de nuevo."
        };
    }
};

export const getProductsByCategory = async (categoryId) => {
    try {
        if (!categoryId) {
            return {
                success: false,
                error: "Por favor, seleccione una categoría válida"
            };
        }

        const { data, error } = await supabase
            .from("producto")
            .select("*, categoria_producto(nombre)")
            .eq("id_categoria", categoryId)
            .order("nombre", { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            return {
                success: false,
                error: "No se encontraron productos para esta categoría"
            };
        }

        return {
            success: true,
            data: data,
            count: data.length,
            message: "Se han obtenido los productos por categoría correctamente"
        };

    } catch (error) {
        console.error("Error al obtener los productos por categoría:", error);
        return {
            success: false,
            error: "Ocurrió un error al obtener los productos por categoría. Por favor, inténtelo de nuevo."
        };
    }
};

export const getAvailableProducts = async () => {
    try {
        const { data, error } = await supabase
            .from("producto")
            .select("*, categoria_producto(nombre)")
            .eq("activo", true)
            .order("nombre", { ascending: true });

        if (error) throw error;

        return {
            success: true,
            data: data,
            count: data.length
        };

    } catch (error) {
        console.error("Error al obtener productos disponibles:", error);
        return {
            success: false,
            error: error.message || "Error al obtener productos"
        };
    }
};

export const searchProducts = async (searchTerm) => {
    try {
        if (!searchTerm || searchTerm.trim().length === 0) {
            return {
                success: false,
                error: "El término de búsqueda es requerido"
            };
        }

        const palabras = searchTerm.trim().split(" ");

        let query = supabase
            .from("producto")
            .select("*, categoria_producto(nombre)");

        const condiciones = palabras
            .map(palabra => `nombre.ilike.%${palabra}%,descripcion.ilike.%${palabra}%`)
            .join(";");

        const { data, error } = await query
            .or(condiciones)
            .order("nombre", { ascending: true });

        if (error) throw error;

        return {
            success: true,
            data: data,
            count: data.length,
            searchTerm: searchTerm
        };

    } catch (error) {
        console.error("Error al buscar productos:", error);
        return {
            success: false,
            error: error.message || "Error al buscar productos"
        };
    }
};
