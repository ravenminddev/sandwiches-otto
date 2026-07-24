import { Chart, registerables } from 'chart.js';

let registered = false;

/**
 * Chart.js necesita registrar sus controladores/escalas antes de crear
 * cualquier gráfico. Se hace una sola vez sin importar cuántos componentes
 * de gráfico se monten. Aquí también se configuran los valores por
 * defecto (tipografía, animación) para que todas las gráficas del
 * dashboard compartan el mismo lenguaje visual "claro" sin tener que
 * repetirlo en cada componente.
 */
export const ensureChartRegistered = () => {
    if (!registered) {
        Chart.register(...registerables);

        Chart.defaults.font.family = "'Inter', 'Segoe UI', ui-sans-serif, system-ui, sans-serif";
        Chart.defaults.color = '#64748b';
        // Nota: no se sobrescribe Chart.defaults.animation ni .transitions
        // completos porque reemplazar esos objetos rompe la fusión interna
        // que usa Chart.js v4 para resolver las animaciones (provoca
        // "this._fn is not a function"). La duración/easing se define por
        // gráfica en sus propias `options.animation` si se necesita.

        registered = true;
    }
};

/**
 * Crea un degradado vertical suave para el relleno de las gráficas de
 * área/línea. Recibe el contexto 2D del canvas (no la instancia de
 * Chart) y dos colores en formato rgba/hex.
 */
export const createVerticalGradient = (ctx, height, colorTop, colorBottom) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colorTop);
    gradient.addColorStop(1, colorBottom);
    return gradient;
};

export { Chart };
