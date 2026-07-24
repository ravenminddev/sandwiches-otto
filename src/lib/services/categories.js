import supabase from "../supabase/client";

export const createCategory = async (categoryData) => {
    try {


        if (!categoryData || Object.keys(categoryData).length === 0) {
            return {
                success: false,
                error: "No se proporcionaron datos de categoría."
            };
        }

        if (!categoryData.nombre_categoria) {
            return {
                success: false,
                error: "El campo nombre categoria es obligatorio."
            }
        }

        const { data: categoriaExistente, error: errorCategoria } = await supabase
            .from("categorias").select("*").eq("nombre_categoria", categoryData.nombre_categoria).single();

        if (categoriaExistente) {
            return {
                success: false,
                error: "Ya existe esta categoria en la base de datos."
            };
        }

        if (errorCategoria && errorCategoria.code !== 'PGRST116') {
            throw errorCategoria;
        }

        const { data, error } = await supabase
            .from("categorias").insert([{
                nombre_categoria: categoryData.nombre_categoria,
                descripcion: categoryData.descripcion_categoria,
                estado_categoria: true
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
        const { data, error } = await supabase.from("categorias").select("*").eq("id", id).single();

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


export const getAllCategories = async (includeInactive= false) => {
    try {
        let query = supabase.from("categorias").select("*");

        if (!includeInactive) {
            query = query.eq("estado_categoria", true);
        }

        const { data, error } = await query.order("nombre_categoria", { ascending: true });

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

export const updatecategory= async (id, datosActualizados) => {
    try {
        if (!id) {
            return {
                success: false,
                error: "Por favor, seleccione una categoría."
            };
        }

        if (!datosActualizados || Object.keys(datosActualizados).length === 0) {
            return {
                success: false,
                error: "No se proporcionaron datos para actualizar."
            };
        }

            const { data, error } = await supabase
            .from("categorias")
            .update(datosActualizados)
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


export const deleteLogicCategory = async (id) => {
    try {
        if (!id) {
            return {
                success: false,
                error: "Por favor, seleccione una categoría."
            };
}
        const {data: existeCategoria} = await supabase.from("categorias").select("*").eq("id_categoria", id).single();  
        
        if (!existeCategoria) {
            return {
                success: false,
                error: "La categoría que intenta eliminar no existe."
            };
        }

        const { data, error } = await supabase.from("categorias").update({estado_categoria: false}).eq("id_categoria", id);

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

export const activeLogicCategory = async (id) => {
    try {
        if (!id) { 
            return {
                success: false,
                error: "Por favor, seleccione una categoría."
            };
        }
        const {data: existeCategoria} = await supabase.from("categorias").select("*").eq("id_categoria", id).single();
        if (!existeCategoria) {
            return {
                success: false,
                error: "La categoría que intenta activar no existe."
            };
        }

        const { data, error } = await supabase.from("categorias").update({estado_categoria: true}).eq("id_categoria", id);

        if (error) throw error;

        return {
            success: true,
            message: "Categoría activada exitosamente."
        };
    }
    catch (error) {
        console.error("Error al activar la categoría:", error);
        return {    
            success: false,
            error: error.message || "Error al activar la categoría."
        };
    }
};

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
            .from("categorias")
            .select("*")
            .eq("estado_categoria", true);

      
        const condiciones = palabras
            .map(palabra => `nombre_categoria.ilike.%${palabra}%,descripcion.ilike.%${palabra}%`)
            .join(";");

        const { data, error } = await query
            .or(condiciones)
            .order("nombre_categoria", { ascending: true });

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