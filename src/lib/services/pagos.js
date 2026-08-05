import supabase from "../supabase/client";


export const createPayment = async (paymentData) => {
    try {
        if (!paymentData || Object.keys(paymentData).length === 0) {
            return {
                success: false,
                error: "Los datos del pago no pueden estar vacíos"
            };
        }

        if (!paymentData.id_venta || !paymentData.id_metodo_pago || !paymentData.monto) {
            return {
                success: false,
                error: "id_venta, id_metodo_pago y monto son requeridos"
            };
        }

        if (paymentData.monto <= 0) {
            return {
                success: false,
                error: "El monto debe ser mayor a 0"
            };
        }

        const { data: sale, error: saleError } = await supabase
            .from("venta")
            .select("total")
            .eq("id_venta", paymentData.id_venta)
            .single();

        if (saleError) throw saleError;

        const { data: previousPayments, error: paymentsError } = await supabase
            .from("pago")
            .select("monto")
            .eq("id_venta", paymentData.id_venta);

        if (paymentsError) throw paymentsError;

        const previousPaymentsSum = previousPayments.reduce((sum, payment) => sum + payment.monto, 0);
        const newPaymentTotal = previousPaymentsSum + paymentData.monto;

        if (newPaymentTotal > sale.total) {
            return {
                success: false,
                error: `El monto excede el total de la venta. Total: ${sale.total}, Pagado hasta ahora: ${previousPaymentsSum}, Intentas agregar: ${paymentData.monto}`
            };
        }

        const { data, error } = await supabase
            .from("pago")
            .insert([{
                id_venta: paymentData.id_venta,
                id_metodo_pago: paymentData.id_metodo_pago,
                monto: paymentData.monto
            }])
            .select();

        if (error) throw error;

        const ventaPagada = newPaymentTotal === sale.total;

        return {
            success: true,
            data: data[0],
            ventaPagada: ventaPagada,
            pendiente: sale.total - newPaymentTotal,
            message: ventaPagada ? "Pago registrado. Venta completamente pagada" : `Pago registrado. Pendiente: ${sale.total - newPaymentTotal}`
        };

    } catch (error) {
        console.error("Error al crear pago:", error);
        return {
            success: false,
            error: error.message || "Error al registrar el pago"
        };
    }
};

export const getPaymentsBySale = async (idVenta) => {
    try {
        if (!idVenta) {
            return {
                success: false,
                error: "El ID de la venta es requerido"
            };
        }

        const { data, error } = await supabase
            .from("pago")
            .select("*, metodo_pago (nombre)")
            .eq("id_venta", idVenta);

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
            .from("pago")
            .select("*, metodo_pago (nombre), venta (total, id_usuario)")
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


export const getAllPaymentMethods = async () => {
    try {
        const { data, error } = await supabase
            .from("metodo_pago")
            .select("*")
            .order("nombre", { ascending: true });

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
            .from("pago")
            .select("*, metodo_pago (nombre), venta!inner (id_usuario, fecha_pago, usuario (nombre, apellido))")
            .gte("venta.fecha_pago", fechaInicio)
            .lte("venta.fecha_pago", fechaFin)
            .order("venta.fecha_pago", { ascending: false });

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
            .from("pago")
            .select(`
                monto,
                metodo_pago (nombre),
                venta!inner (fecha_pago)
            `)
            .gte("venta.fecha_pago", inicioDelDia)
            .lt("venta.fecha_pago", finDelDia);

        if (error) throw error;

        const resumen = {};
        data.forEach(pago => {
            const nombreMetodo = pago.metodo_pago?.nombre;
            if (!nombreMetodo) return;
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
