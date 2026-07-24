import supabase from "../supabase/client";
import { calculateTotal } from "../utils/funciones.js";


export const registrarVentaCompleta = async (datosVenta, detalles, pagos) => {
    try {
        const { data: ventaData, error: ventaError } = await supabase
            .from("ventas")
            .insert([{
                id_empleado: datosVenta.id_empleado,
                id_cliente: datosVenta.id_cliente || null,
                subtotal: datosVenta.subtotal,
                descuento: datosVenta.descuento,
                total: datosVenta.total,
                notas: datosVenta.notas || null,
                estado_venta: true
            }])
            .select();

        if (ventaError) throw ventaError;

        const id_venta = ventaData[0].id_venta;

        const detallesFormateados = detalles.map(detalle => ({
            id_venta: id_venta,
            id_producto: detalle.id_producto,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
            subtotal: detalle.subtotal
        }));

        const { error: detallesError } = await supabase
            .from("detalles_venta")
            .insert(detallesFormateados);

        if (detallesError) throw detallesError;

        const pagosFormateados = pagos.map(pago => ({
            id_venta: id_venta,
            id_metodo_pago: pago.id_metodo_pago,
            monto: pago.monto,
            fecha_pago: new Date().toISOString() // guarda UTC, muestra con mostrarFechaColombia()
        }));

        const { error: pagosError } = await supabase
            .from("pagos")
            .insert(pagosFormateados);

        if (pagosError) throw pagosError;

        return {
            success: true,
            data: { id_venta, ...ventaData[0] },
            message: "Venta registrada exitosamente"
        };

    } catch (error) {
        console.error("Error al registrar venta:", error);
        return {
            success: false,
            error: error.message || "Error al registrar la venta"
        };
    }
};

export const createSale = async (datosVenta) => {
    try {
        if (!datosVenta || Object.keys(datosVenta).length === 0) {
            return {
                success: false,
                error: "Los datos de la venta no pueden estar vacíos."
            };
        }

        if (!datosVenta.id_empleado) {
            return {
                success: false,
                error: "El id del empleado es requerido para crear una venta."
            };
        }

        const totalCalculado = calculateTotal(
            datosVenta.subtotal || 0,
            datosVenta.descuento || 0
        );

        if (!totalCalculado.success) return totalCalculado;

        const { data, error } = await supabase
            .from("ventas")
            .insert([{
                id_empleado: datosVenta.id_empleado,
                id_cliente: datosVenta.id_cliente || null,
                subtotal: datosVenta.subtotal || 0,
                descuento: datosVenta.descuento || 0,
                total: totalCalculado.total || 0,
                notas: datosVenta.notas || "",
                fecha_venta: datosVenta.fecha_venta || new Date().toISOString(), // guarda UTC
                estado_venta: datosVenta.estado_venta ?? true
            }])
            .select();

        if (error) throw error;

        return {
            success: true,
            data: data[0],
            message: "Venta creada exitosamente."
        };

    } catch (error) {
        console.error("Error al crear la venta:", error);
        return {
            success: false,
            error: error.message || "Error al crear la venta."
        };
    }
};

export const addSaleDetail = async (datosDetalle) => {
    try {
        if (!datosDetalle || Object.keys(datosDetalle).length === 0) {
            return {
                success: false,
                error: "Los datos del detalle de venta no pueden estar vacíos."
            };
        }

        if (!datosDetalle.id_venta || !datosDetalle.id_producto || !datosDetalle.cantidad || !datosDetalle.precio_unitario) {
            return {
                success: false,
                error: "Campos requeridos faltantes."
            };
        }

        const subtotal = datosDetalle.cantidad * datosDetalle.precio_unitario;

        const { data, error } = await supabase
            .from("detalle_ventas")
            .insert([{
                id_venta: datosDetalle.id_venta,
                id_producto: datosDetalle.id_producto,
                cantidad: datosDetalle.cantidad,
                precio_unitario: datosDetalle.precio_unitario,
                subtotal: subtotal
            }])
            .select();

        if (error) throw error;

        return {
            success: true,
            data: data[0],
            message: "Detalle de venta agregado exitosamente."
        };

    } catch (error) {
        console.error("Error al agregar el detalle de venta:", error);
        return {
            success: false,
            error: error.message || "Error al agregar el detalle de venta."
        };
    }
};

export const getSaleById = async (idVenta) => {
    try {
        if (!idVenta) {
            return {
                success: false,
                error: "El id de la venta es requerido para obtener los detalles."
            };
        }

        const { data, error } = await supabase
            .from("ventas")
            .select(`
                *,
                usuarios(nombre_completo, nombre_usuario),
                detalles_venta(
                    id_detalle,
                    cantidad,
                    precio_unitario,
                    subtotal,
                    productos(nombre_producto, imagen_producto)
                )
            `)
            .eq("id_venta", idVenta)
            .eq("estado_venta", true)
            .single();

        if (error) throw error;

        if (!data) {
            return {
                success: false,
                error: "No se encontró la venta con el id proporcionado."
            };
        }

        return {
            success: true,
            data: data,
            message: "Venta obtenida exitosamente."
        };

    } catch (error) {
        console.error("Error al obtener la venta:", error);
        return {
            success: false,
            error: error.message || "Error al obtener la venta."
        };
    }
};

export const cancelSale = async (idVenta) => {
    try {
        if (!idVenta) {
            return {
                success: false,
                error: "El id de la venta es requerido para cancelar la venta."
            };
        }

        const { data, error } = await supabase
            .from("ventas")
            .update({ estado_venta: false })
            .eq("id_venta", idVenta)
            .select();

        if (error) throw error;

        return {
            success: true,
            data: data[0],
            message: "Venta cancelada exitosamente."
        };

    } catch (error) {
        console.error("Error al cancelar la venta:", error);
        return {
            success: false,
            error: error.message || "Error al cancelar la venta."
        };
    }
};

export const getAllSales = async (includeCompleted = true) => {
    try {
        let query = supabase
            .from("ventas")
            .select(`
                *,
                usuarios(nombre_completo, nombre_usuario),
                detalles_venta(
                    cantidad,
                    precio_unitario,
                    subtotal,
                    productos(nombre_producto)
                )
            `);

        if (includeCompleted) {
            query = query.eq("estado_venta", true);
        }

        const { data, error } = await query.order("fecha_venta", { ascending: false });

        if (error) throw error;

        return {
            success: true,
            data: data,
            count: data.length
        };

    } catch (error) {
        console.error("Error al obtener ventas:", error);
        return {
            success: false,
            error: error.message || "Error al obtener ventas"
        };
    }
};

export const getSalesByEmployee = async (idEmpleado, includeCompleted = true) => {
    try {
        if (!idEmpleado) {
            return {
                success: false,
                error: "El ID del empleado es requerido"
            };
        }

        let query = supabase
            .from("ventas")
            .select(`
                *,
                usuarios(nombre_completo, nombre_usuario),
                detalles_venta(
                    cantidad,
                    precio_unitario,
                    subtotal,
                    productos(nombre_producto)
                )
            `)
            .eq("id_empleado", idEmpleado);

        if (includeCompleted) {
            query = query.eq("estado_venta", true);
        }

        const { data, error } = await query.order("fecha_venta", { ascending: false });

        if (error) throw error;

        return {
            success: true,
            data: data,
            count: data.length
        };

    } catch (error) {
        console.error("Error al obtener ventas del empleado:", error);
        return {
            success: false,
            error: error.message || "Error al obtener ventas"
        };
    }
};

export const getSalesToday = async () => {
    try {
        // Calcular inicio y fin del día en Colombia, convertido a UTC para la query
        const ahoraStr = new Date().toLocaleString("sv-SE", { timeZone: "America/Bogota" });
        const hoyStr = ahoraStr.split(" ")[0]; // "YYYY-MM-DD" en hora Colombia
        const inicioDelDia = new Date(`${hoyStr}T00:00:00-05:00`).toISOString();
        const finDelDia = new Date(`${hoyStr}T23:59:59-05:00`).toISOString();

        const { data, error } = await supabase
            .from("ventas")
            .select(`
                *,
                usuarios(nombre_completo, nombre_usuario),
                detalles_venta(
                    cantidad,
                    precio_unitario,
                    subtotal,
                    productos(nombre_producto)
                )
            `)
            .gte("fecha_venta", inicioDelDia)
            .lt("fecha_venta", finDelDia)
            .eq("estado_venta", true)
            .order("fecha_venta", { ascending: false });

        if (error) throw error;

        return {
            success: true,
            data: data,
            count: data.length
        };

    } catch (error) {
        console.error("Error al obtener ventas del día:", error);
        return {
            success: false,
            error: error.message || "Error al obtener ventas del día"
        };
    }
};

export const getSaleDetails = async (idVenta) => {
    try {
        if (!idVenta) {
            return {
                success: false,
                error: "El ID de la venta es requerido"
            };
        }

        const { data, error } = await supabase
            .from("ventas")
            .select(`
                *,
                usuarios(nombre_completo, nombre_usuario),
                detalles_venta(
                    id_detalle,
                    id_producto,
                    cantidad,
                    precio_unitario,
                    subtotal,
                    productos(nombre_producto, imagen_producto)
                ),
                pagos(
                    id_pago,
                    id_metodo_pago,
                    monto,
                    fecha_pago,
                    metodos_pago(nombre_metodo)
                )
            `)
            .eq("id_venta", idVenta)
            .single();

        if (error) throw error;

        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error("Error al obtener detalles de venta:", error);
        return {
            success: false,
            error: error.message || "Error al obtener los detalles"
        };
    }
};

export const actualizarVentaCompleta = async (idVenta, datosVenta, detalles, pagos) => {
    try {
        const { error: ventaError } = await supabase
            .from('ventas')
            .update({
                id_cliente: datosVenta.id_cliente || null,
                subtotal: datosVenta.subtotal,
                descuento: datosVenta.descuento,
                total: datosVenta.total,
                notas: datosVenta.notas || null
            })
            .eq('id_venta', idVenta);

        if (ventaError) throw ventaError;

        const { error: deleteDetallesError } = await supabase
            .from('detalles_venta')
            .delete()
            .eq('id_venta', idVenta);

        if (deleteDetallesError) throw deleteDetallesError;

        const detallesFormateados = detalles.map(detalle => ({
            id_venta: idVenta,
            id_producto: detalle.id_producto,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
            subtotal: detalle.subtotal
        }));

        const { error: detallesError } = await supabase
            .from('detalles_venta')
            .insert(detallesFormateados);

        if (detallesError) throw detallesError;

        const { error: deletePagosError } = await supabase
            .from('pagos')
            .delete()
            .eq('id_venta', idVenta);

        if (deletePagosError) throw deletePagosError;

        const pagosFormateados = pagos.map(pago => ({
            id_venta: idVenta,
            id_metodo_pago: pago.id_metodo_pago,
            monto: pago.monto,
            fecha_pago: new Date().toISOString() // guarda UTC, muestra con mostrarFechaColombia()
        }));

        const { error: pagosError } = await supabase
            .from('pagos')
            .insert(pagosFormateados);

        if (pagosError) throw pagosError;

        return {
            success: true,
            message: 'Venta actualizada exitosamente'
        };

    } catch (error) {
        console.error('Error al actualizar venta:', error);
        return {
            success: false,
            error: error.message || 'Error al actualizar la venta'
        };
    }
};

export const deleteSale = async (idVenta) => {
    try {
        if (!idVenta) {
            return {
                success: false,
                error: 'El ID de la venta es requerido'
            };
        }

        const { error } = await supabase
            .from('ventas')
            .delete()
            .eq('id_venta', idVenta);

        if (error) throw error;

        return {
            success: true,
            message: 'Venta eliminada correctamente'
        };

    } catch (error) {
        console.error('Error al eliminar venta:', error);
        return {
            success: false,
            error: error.message || 'Error al eliminar la venta'
        };
    }
};