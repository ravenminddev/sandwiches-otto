// Funciones puras para transformar el arreglo crudo de ventas (tal como
// lo devuelve getAllSales) en las métricas que necesita el dashboard.
// Mantenerlas separadas del componente facilita testear los cálculos
// sin tener que montar React.

const BOGOTA_TZ = 'America/Bogota';

/**
 * Devuelve la fecha (YYYY-MM-DD) de una venta en hora de Colombia,
 * siguiendo el mismo patrón que ya usa getSalesToday() en ventas.js.
 */
export const getVentaDateKey = (fechaVentaISO) => {
    return new Date(fechaVentaISO).toLocaleString('sv-SE', { timeZone: BOGOTA_TZ }).split(' ')[0];
};

export const formatCOP = (value) => `$${Math.round(value || 0).toLocaleString('es-CO')}`;

export const formatShortDate = (dateKey) => {
    // dateKey es 'YYYY-MM-DD'; se arma en hora local para no perder el día
    // por corrimiento de zona horaria al construir el Date.
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short'
    });
};

export const formatLongDate = (dateKey) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
};

export const PERIOD_OPTIONS = [
    { value: 'today', label: 'Hoy' },
    { value: '7d', label: '7 días' },
    { value: '30d', label: '30 días' },
    { value: 'all', label: 'Todo' }
];

// Rango local que usan las tarjetas de "Productos" y "Ventas" (mejores/peores
// días), independiente del selector de período global de arriba.
export const LOCAL_RANGE_OPTIONS = [
    { value: '1m', label: '1 mes' },
    { value: '3m', label: '3 meses' },
    { value: 'all', label: 'Todos' }
];

const PERIOD_TO_DAYS = { '7d': 7, '30d': 30, '1m': 30, '3m': 90 };

export const filterSalesByPeriod = (sales, period) => {
    if (period === 'all') return sales;

    const hoyKey = getVentaDateKey(new Date().toISOString());

    if (period === 'today') {
        return sales.filter((venta) => getVentaDateKey(venta.fecha_venta) === hoyKey);
    }

    const dias = PERIOD_TO_DAYS[period];
    if (!dias) return sales; // valor desconocido: no filtrar en vez de romper

    const limite = new Date();
    limite.setDate(limite.getDate() - (dias - 1));
    const limiteKey = getVentaDateKey(limite.toISOString());

    return sales.filter((venta) => getVentaDateKey(venta.fecha_venta) >= limiteKey);
};

export const computeSummary = (sales) => {
    const pedidosTotales = sales.length;
    const totalPeriodo = sales.reduce((acc, venta) => acc + Number(venta.total || 0), 0);
    const unidadesVendidas = sales.reduce((acc, venta) => {
        const unidadesVenta = (venta.detalles_venta || []).reduce((sum, d) => sum + Number(d.cantidad || 0), 0);
        return acc + unidadesVenta;
    }, 0);
    const ticketPromedio = pedidosTotales > 0 ? totalPeriodo / pedidosTotales : 0;

    return { pedidosTotales, totalPeriodo, unidadesVendidas, ticketPromedio };
};

/**
 * Agrupa el total vendido por día (hora Colombia) y lo devuelve
 * ordenado cronológicamente, listo para graficar.
 */
export const computeDailyEvolution = (sales) => {
    const porDia = new Map();

    sales.forEach((venta) => {
        const key = getVentaDateKey(venta.fecha_venta);
        const actual = porDia.get(key) || { date: key, total: 0, pedidos: 0 };
        actual.total += Number(venta.total || 0);
        actual.pedidos += 1;
        porDia.set(key, actual);
    });

    return Array.from(porDia.values()).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Ranking de productos por unidades vendidas, agregando todos los
 * detalles_venta de todas las ventas del período. Devuelve top y
 * bottom (dentro de los que sí tuvieron ventas).
 */
export const computeProductRanking = (sales, limit = 5) => {
    const porProducto = new Map();

    sales.forEach((venta) => {
        (venta.detalles_venta || []).forEach((detalle) => {
            const nombre = detalle.productos?.nombre_producto || 'Producto eliminado';
            const actual = porProducto.get(nombre) || { nombre, cantidad: 0, totalVendido: 0 };
            actual.cantidad += Number(detalle.cantidad || 0);
            actual.totalVendido += Number(detalle.subtotal || 0);
            porProducto.set(nombre, actual);
        });
    });

    const productos = Array.from(porProducto.values());
    const ordenadosDesc = [...productos].sort((a, b) => b.cantidad - a.cantidad);
    const ordenadosAsc = [...productos].sort((a, b) => a.cantidad - b.cantidad);

    return {
        top: ordenadosDesc.slice(0, limit),
        bottom: ordenadosAsc.slice(0, limit).reverse().filter(
            // evita repetir productos que ya salen en el top cuando hay pocos productos distintos
            (p) => !ordenadosDesc.slice(0, limit).includes(p)
        )
    };
};

/**
 * Mejores y peores días del período por total vendido.
 */
export const computeDayPerformance = (sales, limit = 3) => {
    const dias = computeDailyEvolution(sales);
    const ordenadosDesc = [...dias].sort((a, b) => b.total - a.total);
    const ordenadosAsc = [...dias].sort((a, b) => a.total - b.total);

    return {
        mejores: ordenadosDesc.slice(0, limit),
        peores: ordenadosAsc.slice(0, limit).filter(
            (d) => !ordenadosDesc.slice(0, limit).includes(d)
        )
    };
};
