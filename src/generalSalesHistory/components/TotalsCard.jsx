import { faSackDollar, faReceipt, faTicket, faBoxesStacked } from '@fortawesome/free-solid-svg-icons';
import StatCard from './StatCard.jsx';

/**
 * Grid de estadísticas del período seleccionado. Reemplaza la tarjeta
 * de "totales" única por 4 tarjetas individuales (una por métrica),
 * cada una con su propio ícono y color, en línea con el resto del
 * dashboard.
 */
export default function TotalsCard({ ventas, pedidos, ticketPromedio, unidades }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            <StatCard icon={faSackDollar} label="Ventas del período" value={ventas} tone="amber" delay={0} />
            <StatCard icon={faReceipt} label="Pedidos" value={pedidos} tone="sky" delay={60} />
            <StatCard icon={faTicket} label="Ticket promedio" value={ticketPromedio} tone="violet" delay={120} />
            <StatCard icon={faBoxesStacked} label="Unidades vendidas" value={unidades} tone="emerald" delay={180} />
        </div>
    );
}
