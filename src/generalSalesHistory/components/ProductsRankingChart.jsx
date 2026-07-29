import { useEffect, useRef, useState, useMemo } from 'react';
import { Chart, ensureChartRegistered } from '../utils/chartSetup.js';
import { filterSalesByPeriod, computeProductRanking, LOCAL_RANGE_OPTIONS } from '../utils/salesAnalytics.js';
import { useTheme } from '@/lib/context/ThemeContext.jsx';

ensureChartRegistered();

const AMBER = '#f59e0b';
const RED = '#ef4444';
const AMBER_SOFT = '#fde68a';

export default function ProductsRankingChart({ sales }) {
    const { theme } = useTheme();
    const [range, setRange] = useState('all');
    const [vista, setVista] = useState('mas');
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const isDark = theme === 'dark';
    const INK = isDark ? '#fafafa' : '#1e293b';
    const GRID = isDark ? '#3f3f46' : '#eef1f5';
    const MUTED = isDark ? '#a1a1aa' : '#94a3b8';
    const TOOLTIP_BG = isDark ? '#fafafa' : '#1e293b';
    const TOOLTIP_TEXT = isDark ? '#18181b' : '#fff';

    const ranking = useMemo(() => {
        const filtradas = filterSalesByPeriod(sales, range);
        return computeProductRanking(filtradas, 5);
    }, [sales, range]);

    const dataset = useMemo(() => {
        if (vista === 'mas') {
            return {
                labels: ranking.top.map((p) => p.nombre),
                data: ranking.top.map((p) => p.cantidad),
                colors: ranking.top.map((_, i) => (i === 0 ? AMBER : AMBER_SOFT))
            };
        }
        const menosAsc = [...ranking.bottom].reverse();
        return {
            labels: menosAsc.map((p) => p.nombre),
            data: menosAsc.map((p) => p.cantidad),
            colors: menosAsc.map((_, i) => (i === 0 ? RED : '#fecaca'))
        };
    }, [ranking, vista]);

    useEffect(() => {
        if (!canvasRef.current) return;

        chartRef.current = new Chart(canvasRef.current, {
            type: 'bar',
            data: {
                labels: dataset.labels,
                datasets: [{ data: dataset.data, backgroundColor: dataset.colors, borderRadius: 6, maxBarThickness: 20 }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 700, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: TOOLTIP_BG,
                        titleColor: TOOLTIP_TEXT,
                        bodyColor: TOOLTIP_TEXT,
                        padding: 10,
                        cornerRadius: 10,
                        displayColors: false,
                        callbacks: { label: (c) => `${c.parsed.x} unidades` }
                    }
                },
                scales: {
                    x: { beginAtZero: true, grid: { color: GRID }, border: { display: false }, ticks: { color: MUTED, font: { size: 11 }, precision: 0 } },
                    y: { grid: { display: false }, border: { display: false }, ticks: { color: INK, font: { size: 12, weight: '600' } } }
                }
            }
        });

        return () => chartRef.current?.destroy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme]);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;
        chart.data.labels = dataset.labels;
        chart.data.datasets[0].data = dataset.data;
        chart.data.datasets[0].backgroundColor = dataset.colors;
        chart.update();
    }, [dataset]);

    const sinDatos = dataset.labels.length === 0;

    return (
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col shadow-sm transition-shadow duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-section-title">Productos</h2>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>

            <div className="flex gap-1.5 mb-3">
                <button
                    onClick={() => setVista('mas')}
                    className={`btn-filter-chip rounded-full flex-1 sm:flex-none text-center ${
                        vista === 'mas' ? 'bg-yellow-otto text-gray-900 shadow-sm' : 'text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-border hover:bg-slate-100 dark:hover:bg-zinc-800/70'
                    }`}
                >
                    Más vendidos
                </button>
                <button
                    onClick={() => setVista('menos')}
                    className={`btn-filter-chip rounded-full flex-1 sm:flex-none text-center ${
                        vista === 'menos' ? 'bg-yellow-otto text-gray-900 shadow-sm' : 'text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-border hover:bg-slate-100 dark:hover:bg-zinc-800/70'
                    }`}
                >
                    Menos vendidos
                </button>
            </div>

            <div style={{ position: 'relative', width: '100%', height: 190 }}>
                <canvas ref={canvasRef} role="img" aria-label="Gráfica de barras horizontal de productos más o menos vendidos" />
                {sinDatos && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-zinc-500 text-sm">
                        Sin datos suficientes
                    </div>
                )}
            </div>

            <div className="flex gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-border">
                {LOCAL_RANGE_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setRange(opt.value)}
                        className={`btn-filter-chip flex-1 text-center rounded-lg border ${
                            range === opt.value ? 'bg-yellow-otto text-gray-900 shadow-sm' : 'text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-zinc-700'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}