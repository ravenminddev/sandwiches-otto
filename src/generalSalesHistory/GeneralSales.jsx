import { useState, useEffect, useCallback, useMemo } from 'react';
import useScrollHide from '../lib/hooks/useScrollHide.js';
import { Link } from "react-router";
import ottoLogo from '@/assets/otto-logo.png';
import Table from "../shared/table/Table.jsx";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAllSales, getSaleDetails } from '@/lib/services/ventas.js';
import ReceiptModal from "../sales/components/ReceiptModal.jsx";
import alertPop from '../utils/alertPop.js';
import SalesEvolutionChart from './components/SalesEvolutionChart.jsx';
import TotalsCard from './components/TotalsCard.jsx';
import ProductsRankingChart from './components/ProductsRankingChart.jsx';
import DaysRankingChart from './components/DaysRankingChart.jsx';
import {
    PERIOD_OPTIONS,
    filterSalesByPeriod,
    computeSummary,
    computeDailyEvolution,
    formatCOP
} from './utils/salesAnalytics.js';

export default function GeneralSales(){
    const [rawSales, setRawSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ventaDetalle, setVentaDetalle] = useState(null);
    const [periodo, setPeriodo] = useState('30d');
    const showHeader = useScrollHide();

    const cargarVentas = useCallback(async () => {
        setLoading(true);
        const result = await getAllSales();

        if (result.success && result.data) {
            setRawSales(result.data);
        } else {
            await alertPop(
                'ERROR AL CARGAR VENTAS', 
                result.error, 
                'error', 
                'Continuar'
            );
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        cargarVentas();
    }, [cargarVentas]);

    const handleVerRecibo = async (idVenta) => {
        setLoading(true);
        const result = await getSaleDetails(idVenta);
        setLoading(false);

        if (result.success) {
            setVentaDetalle(result.data);
        } else {
            await alertPop(
                'ERROR AL CARGAR VENTA', 
                result.error, 
                'error', 
                'Continuar');
        }
    };

    // Filas formateadas para la tabla AG-Grid (igual que antes, separado de
    // los datos crudos que usa el dashboard).
    const sales = useMemo(() => rawSales.map(venta => ({
        id_venta: venta.id_venta,
        empleado: venta.usuario
            ? `${venta.usuario.nombre} ${venta.usuario.apellido}`.trim()
            : 'N/A',
        cliente: 'Cliente anónimo',
        subtotal: venta.subtotal.toLocaleString('es-CO'),
        descuento: venta.descuento.toLocaleString('es-CO'),
        total: venta.total.toLocaleString('es-CO'),
        fecha: new Date(venta.fecha_pago).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        estado: '✓ Completada'
    })), [rawSales]);

    const ventasDelPeriodo = useMemo(() => filterSalesByPeriod(rawSales, periodo), [rawSales, periodo]);
    const resumen = useMemo(() => computeSummary(ventasDelPeriodo), [ventasDelPeriodo]);
    const evolucion = useMemo(() => computeDailyEvolution(ventasDelPeriodo), [ventasDelPeriodo]);

    if (loading) {
        return (
            <section className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-app">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-9 h-9 rounded-full border-[3px] border-amber-200 border-t-amber-500 animate-spin" />
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Cargando historial...</p>
                </div>
            </section>
        );
    }

    return(
        <section className="min-h-screen bg-slate-50 dark:bg-app">

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out both;
                }
            `}</style>

            <header className={`bg-white dark:bg-card/90 backdrop-blur-sm border-b border-slate-200 dark:border-border sticky top-0 z-50 flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="flex items-center gap-3">
                    <Link to={'/sales'}>
                        <button className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-zinc-400 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-zinc-800/70 hover:text-slate-800 dark:hover:text-zinc-200">
                            <span className="inline-block transition-transform duration-300 hover:-translate-x-0.5">
                                <FontAwesomeIcon icon={faArrowLeft} size="lg"/>
                            </span>
                        </button>
                    </Link>
                    <p className="m-0 text-compact-header-title">Historial de ventas</p>
                </div>
            </header>

            <main className="max-w-[1180px] mx-auto w-full px-4 sm:px-8 lg:px-20 py-5 sm:py-6 flex flex-col gap-3.5 sm:gap-4">
            
                <div className="flex flex-row text-left mb-6">
                    <h1 className="text-page-title">Historial de ventas histórico</h1>
                </div>

                {rawSales.length === 0 ? (
                    <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border/80 shadow-sm p-8 text-center w-full animate-fade-in-up">
                        <h2 className='text-empty-state mb-3'>No hay ventas</h2>
                        <p className='text-slate-500 dark:text-zinc-400'>No se han registrado ventas en el sistema</p>
                    </div>
                ) : (
                    <>
                        {/* Selector de período global (alimenta totales y evolución) */}
                        <div className="flex gap-1.5 self-start bg-white dark:bg-card border border-slate-200 dark:border-border rounded-full p-1 shadow-sm animate-fade-in-up">
                            {PERIOD_OPTIONS.map((opcion) => (
                                <button
                                    key={opcion.value}
                                    onClick={() => setPeriodo(opcion.value)}
                                    className={`btn-filter-chip py-1.5 rounded-full text-xs sm:text-[13px] ${
                                        periodo === opcion.value ? 'bg-yellow-otto text-gray-900 shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/70'
                                    }`}
                                >
                                    {opcion.label}
                                </button>
                            ))}
                        </div>

                        <TotalsCard
                            ventas={formatCOP(resumen.totalPeriodo)}
                            pedidos={resumen.pedidosTotales}
                            ventaPromedio={formatCOP(resumen.ventaPromedio)}
                            unidades={resumen.unidadesVendidas}
                        />

                        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm animate-fade-in-up transition-shadow duration-300 hover:shadow-md" style={{ animationDelay: '80ms' }}>
                            <h2 className="text-section-title mb-2.5">Evolución de ventas</h2>
                            <SalesEvolutionChart data={evolucion} />
                        </div>

                        {/* Estas dos tarjetas traen su propio filtro de rango (1 mes / 3 meses / todos),
                            independiente del selector de arriba, igual que en el diseño de referencia. */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 animate-fade-in-up" style={{ animationDelay: '140ms' }}>
                            <ProductsRankingChart sales={rawSales} />
                            <DaysRankingChart sales={rawSales} />
                        </div>

                        {/* Detalle de ventas */}
                        <div className="pt-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <h2 className="text-section-title mb-4">Detalle de ventas</h2>
                            <Table 
                                rowData={sales}
                                onVerRecibo={handleVerRecibo}
                                onDelete={cargarVentas}
                            />
                        </div>
                    </>
                )}
            </main>

            {ventaDetalle && (
                <ReceiptModal 
                    venta={ventaDetalle}
                    onClose={() => setVentaDetalle(null)}
                />
            )}

            <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-no-repeat bg-center opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: `url(${ottoLogo})`,
                    backgroundSize: 'calc(20vw + 20vh)'
                }}
            />
        </section>
    )
}
