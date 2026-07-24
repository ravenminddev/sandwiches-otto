import supabase from "../supabase/client";

export const createProduct = async (datosProducto) => {
    try {
        if (!datosProducto || Object.keys(datosProducto).length === 0) {
            return {
                success: false,
                error: "Por favor, proporcione los datos del producto."
            };
        }

        if (!datosProducto.nombre_producto || !datosProducto.precio || !datosProducto.id_categoria) {
            return {
                success: false,
                error: "Los campos nombre_producto, precio e id_categoria son obligatorios."
            };
        }

        const { data, error } = await supabase
            .from("productos")
            .insert([
                {
                    nombre_producto: datosProducto.nombre_producto,
                    descripcion: datosProducto.descripcion || null,
                    precio: datosProducto.precio,
                    imagen_producto: datosProducto.imagen_producto,
                    id_categoria: datosProducto.id_categoria,
                    ingredientes: datosProducto.ingredientes || null,
                    estado: true,
                    disponible: datosProducto.disponible !== false
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

export const getProducts = async (includeInactive = false) => {
    try {
        let query = supabase
            .from("productos")
            .select("*, categorias(nombre_categoria)");

        if (!includeInactive) {
            query = query.eq("estado", true);
        }

        const { data, error } = await query.order("nombre_producto", { ascending: true });

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

export const getProductById = async (id) => {
    try {
        if (id === undefined || id === null) {
            return {
                success: false,
                error: "Por favor, seleccione un ID de producto válido"
            };
        }

        const { data, error } = await supabase
            .from("productos")
            .select("*")
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
        return {
            success: false,
            error: "Ocurrió un error al obtener el producto. Por favor, inténtelo de nuevo."
        };
    }
};

export const updateProduct = async (id, datosProducto) => {
    try {
        if (id === undefined || id === null) {
            return {
                success: false,
                error: "Por favor, seleccione un ID de producto válido"
            };
        }

        if (!datosProducto || Object.keys(datosProducto).length === 0) {
            return {
                success: false,
                error: "Por favor, proporcione los datos del producto para actualizar."
            };
        }

        const dataWithTimestamp = {
            ...datosProducto,
            fecha_ultima_modificacion: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from("productos")
            .update(dataWithTimestamp)
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
            .from("productos")
            .update({ 
                estado: false, 
                fecha_ultima_modificacion: new Date().toISOString() 
            })
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
            .from("productos")
            .update({ 
                estado: true, 
                fecha_ultima_modificacion: new Date().toISOString() 
            })
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

export const getProductsByCategory = async (categoryId, includeInactive = false) => {
    try {
        if (!categoryId) {
            return {
                success: false,
                error: "Por favor, seleccione una categoría válida"
            };
        }

        let query = supabase
            .from("productos")
            .select("*, categorias(nombre_categoria)")
            .eq("id_categoria", categoryId);

        if (!includeInactive) {
            query = query.eq("estado", true);
        }

        const { data, error } = await query.order("nombre_producto", { ascending: true });

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
            .from("productos")
            .select("*, categorias(nombre_categoria)")
            .eq("estado", true)
            .eq("disponible", true)
            .order("nombre_producto", { ascending: true });

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
            .from("productos")
            .select("*, categorias(nombre_categoria)")
            .eq("estado", true);

        const condiciones = palabras
            .map(palabra => `nombre_producto.ilike.%${palabra}%,descripcion.ilike.%${palabra}%,ingredientes.ilike.%${palabra}%`)
            .join(";");

        const { data, error } = await query
            .or(condiciones)
            .order("nombre_producto", { ascending: true });

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