export const calculateTotal = (subtotal, descuento=0) => {
    try {
        if (typeof subtotal !== 'number' || subtotal < 0) {
            return {
                success: false, 
                error: "El subtotal debe ser un número positivo."
            };
        }

        if (typeof descuento !== 'number' || descuento < 0) {
            return {
                success: false,
                error: "El descuento debe ser un número positivo."
            };
        }

        if ( descuento > subtotal) {
            return {
                success: false,
                error: "El descuento no puede ser mayor que el subtotal."
            };
        }


        const total = subtotal - descuento;
        return {
            success: true,
            total: total,
            subtotal: subtotal,
            descuento: descuento,
            porcentajeDescuento: subtotal > 0 ? ((descuento / subtotal) * 100).toFixed(2) : 0
        };
    } catch (error) {
        console.error("Error al calcular el total:", error);
        return {
            success: false,
            error: "Error al calcular el total."
        };
    }
};

