import supabase from "../supabase/client";


export const createPayment = async (datosPago) => {
    try {
        if (!datosPago || Object.keys(datosPago).length === 0) {
            return {
                success: false,
                error: "Los datos del pago no pueden estar vacíos"
            };
        }

        if (!datosPago.id_venta || !datosPago.id_metodo_pago || !datosPago.monto) {
            return {
                success: false,
                error: "id_venta, id_metodo_pago y monto son requeridos"
            };
        }

        if (datosPago.monto <= 0) {
            return {
                success: false,
                error: "El monto debe ser mayor a 0"
            };
        }

    
        const { data: venta, error: ventaError } = await supabase
            .from("ventas")
            .select("total")
            .eq("id_venta", datosPago.id_venta)
            .single();

        if (ventaError) throw ventaError;


        const { data: pagosPrevios, error: pagosError } = await supabase
            .from("pagos")
            .select("monto")
            .eq("id_venta", datosPago.id_venta);

        if (pagosError) throw pagosError;

       
        const sumaPagosAnteriores = pagosPrevios.reduce((sum, pago) => sum + pago.monto, 0);
        const totalNuevoPago = sumaPagosAnteriores + datosPago.monto;

       
        if (totalNuevoPago > venta.total) {
            return {
                success: false,
                error: `El monto excede el total de la venta. Total: ${venta.total}, Pagado hasta ahora: ${sumaPagosAnteriores}, Intentas agregar: ${datosPago.monto}`
            };
        }

       
        const { data, error } = await supabase
            .from("pagos")
            .insert([{
                id_venta: datosPago.id_venta,
                id_metodo_pago: datosPago.id_metodo_pago,
                monto: datosPago.monto,
                fecha_pago: datosPago.fecha_pago || new Date().toISOString()
            }])
            .select();

        if (error) throw error;

        
        const ventaPagada = totalNuevoPago === venta.total;

        return {
            success: true,
            data: data[0],
            ventaPagada: ventaPagada,
            pendiente: venta.total - totalNuevoPago,
            message: ventaPagada ? "Pago registrado. Venta completamente pagada" : `Pago registrado. Pendiente: ${venta.total - totalNuevoPago}`
        };

    } catch (error) {
        console.error("Error al crear pago:", error);
        return {
            success: false,
            error: error.message || "Error al registrar el pago"
        };
    }
};

export const getPaymentsByVenta = async (idVenta) => {
    try {
        if (!idVenta) {
            return {
                success: false,
                error: "El ID de la venta es requerido"
            };
        }

        const { data, error } = await supabase
            .from("pagos")
            .select("*, metodos_pago(nombre_metodo)")
            .eq("id_venta", idVenta)
            .order("fecha_pago", { ascending: true });

        if (error) throw error;

        const totalPagado = data.reduce((sum, pago) => sum + pago.monto, 0);

        return {
            success: true,
            data: data,
            totalPagado: totalPagado,
            count: data.length
        };

    } catch (error) {
        console.error("Error al obtener pagos de venta:", error);
        return {
            success: false,
            error: error.message || "Error al obtener pagos"
        };
    }
};


export const getPaymentById = async (id) => {
    try {
        if (!id) {
            return {
                success: false,
                error: "El ID del pago es requerido"
            };
        }

        const { data, error } = await supabase
            .from("pagos")
            .select("*, metodos_pago(nombre_metodo), ventas(total, id_empleado)")
            .eq("id_pago", id)
            .single();

        if (error) throw error;

        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error("Error al obtener pago:", error);
        return {
            success: false,
            error: error.message || "Error al obtener el pago"
        };
    }
};


export const getAllPaymentMethods = async (includeInactive = false) => {
    try {
        let query = supabase
            .from("metodos_pago")
            .select("*");

        if (!includeInactive) {
            query = query.eq("activo", true);
        }

        const { data, error } = await query.order("nombre_metodo", { ascending: true });

        if (error) throw error;

        return {
            success: true,
            data: data,
            count: data.length
        };

    } catch (error) {
        console.error("Error al obtener métodos de pago:", error);
        return {
            success: false,
            error: error.message || "Error al obtener métodos de pago"
        };
    }
};

export const getPaymentsByDateRange = async (fechaInicio, fechaFin) => {
    try {
        if (!fechaInicio || !fechaFin) {
            return {
                success: false,
                error: "Las fechas de inicio y fin son requeridas"
            };
        }

        const { data, error } = await supabase
            .from("pagos")
            .select("*, metodos_pago(nombre_metodo), ventas(id_empleado, usuarios(nombre_completo))")
            .gte("fecha_pago", fechaInicio)
            .lte("fecha_pago", fechaFin)
            .order("fecha_pago", { ascending: false });

        if (error) throw error;

        
        const totalPagado = data.reduce((sum, pago) => sum + pago.monto, 0);

        return {
            success: true,
            data: data,
            totalPagado: totalPagado,
            count: data.length,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin
        };

    } catch (error) {
        console.error("Error al obtener pagos por rango de fecha:", error);
        return {
            success: false,
            error: error.message || "Error al obtener pagos"
        };
    }
};

export const getPaymentsSummaryToday = async () => {
    try {
        const today = new Date();
        const inicioDelDia = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const finDelDia = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

        const { data, error } = await supabase
        .from("pagos")
        .select(`
            monto,
            metodos_pago(id_metodo, nombre_metodo),
            ventas!inner(fecha_venta)
        `)
        .gte("ventas.fecha_venta", inicioDelDia)
        .lt("ventas.fecha_venta", finDelDia);

        if (error) throw error;

   
        const resumen = {};
        data.forEach(pago => {
            const nombreMetodo = pago.metodos_pago.nombre_metodo;
            if (!resumen[nombreMetodo]) {
                resumen[nombreMetodo] = 0;
            }
            resumen[nombreMetodo] += pago.monto;
        });

        return {
            success: true,
            data: resumen
        };

    } catch (error) {
        console.error("Error al obtener resumen de pagos:", error);
        return {
            success: false,
            error: error.message || "Error al obtener el resumen"
        };
    }
};