import supabase from "../supabase/client";

export const createCategory = async (categoryData) => {
    try {
        if (!categoryData || Object.keys(categoryData).length === 0) {
            return {
                success: false,
                error: "No se proporcionaron datos de categoría."
            };
        }

        const nombre = categoryData.nombre || categoryData.nombre_categoria;

        if (!nombre) {
            return {
                success: false,
                error: "El campo nombre es obligatorio."
            }
        }

        const { data: existingCategory, error: categoryError } = await supabase
            .from("categoria_producto").select("*").eq("nombre", nombre).single();

        if (existingCategory) {
            return {
                success: false,
                error: "Ya existe esta categoría en la base de datos."
            };
        }

        if (categoryError && categoryError.code !== 'PGRST116') {
            throw categoryError;
        }

        const { data, error } = await supabase
            .from("categoria_producto").insert([{
                nombre: nombre
            }]).select();

        if (error) throw error;

        return {
            success: true,
            data: data[0],
            message: "Categoría creada exitosamente."
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || "Error al crear la categoría."
        };
    }
};

export const getCategoryById = async (id) => {
    try {
        if (!id) {
            return {
                success: false,
                error: "Por favor, seleccione una categoría."
            };
        }
        const { data, error } = await supabase.from("categoria_producto").select("*").eq("id_categoria", id).single();

        if (error) throw error;

        return {
            success: true,
            categoria: data
        };
    } catch (error) {
        console.error("Error al obtener la categoría por ID:", error);
        return {
            success: false,
            error: error.message || "Error al obtener la categoría."
        };
    }
};


export const getAllCategories = async () => {
    try {
        const { data, error } = await supabase.from("categoria_producto").select("*").order("nombre", { ascending: true });

        if (error) throw error;

        return {
            success: true,
            data: data,
            count: data.length
        };
    } catch (error) {
        console.error("Error al obtener las categorías:", error);
        return {
            success: false,
            error: error.message || "Error al obtener las categorías."
        };
    }
};

export const updateCategory = async (id, updatedData) => {
    try {
        if (!id) {
            return {
                success: false,
                error: "Por favor, seleccione una categoría."
            };
        }

        if (!updatedData || Object.keys(updatedData).length === 0) {
            return {
                success: false,
                error: "No se proporcionaron datos para actualizar."
            };
        }

        const { data, error } = await supabase
            .from("categoria_producto")
            .update(updatedData)
            .eq("id_categoria", id)
            .select();

        if (error) throw error;

        return {
            success: true,
            data: data[0],
            message: "Categoría actualizada exitosamente."
        };
    } catch (error) {
        console.error("Error al actualizar la categoría:", error);
        return {
            success: false,
            error: error.message || "Error al actualizar la categoría."
        };
    }
};


export const deleteCategory = async (id) => {
    try {
        if (!id) {
            return {
                success: false,
                error: "Por favor, seleccione una categoría."
            };
        }
        const { error } = await supabase
            .from("categoria_producto")
            .delete()
            .eq("id_categoria", id);

        if (error) throw error;

        return {
            success: true,
            message: "Categoría desactivada exitosamente."
        };
    } catch (error) {
        console.error("Error al eliminar la categoría:", error);
        return {
            success: false,
            error: error.message || "Error al eliminar la categoría."
        };
    }
};

/*
ADVERTENCIA: ESTA FUNCIÓN NO SE USA
*/
export const searchCategories = async (searchTerm) => {
    try {
        if (!searchTerm || searchTerm.trim().length === 0) {
            return {
                success: false,
                error: "El término de búsqueda es requerido"
            };
        }

        const palabras = searchTerm.trim().split(" ");

        let query = supabase
            .from("categoria_producto")
            .select("*")

        const condiciones = palabras
            .map(palabra => `nombre.ilike.%${palabra}%`)
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
        console.error("Error al buscar categorías:", error);
        return {
            success: false,
            error: error.message || "Error al buscar categorías"
        };
    }
};
