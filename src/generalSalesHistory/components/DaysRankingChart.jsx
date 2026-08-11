import { useEffect, useRef, useState, useMemo } from 'react';
import { Chart, ensureChartRegistered } from '../utils/chartSetup.js';
import { filterSalesByPeriod, computeDayPerformance, formatShortDate, formatLongDate, LOCAL_RANGE_OPTIONS } from '../utils/salesAnalytics.js';
import { useTheme } from '@/lib/context/ThemeContext.jsx';

ensureChartRegistered();

const EMERALD = '#10b981';
const EMERALD_SOFT = '#a7f3d0';
const RED = '#ef4444';
const RED_SOFT = '#fecaca';

const colorearExtremo = (items, vista) => items.map((_, i) => {
    if (vista === 'mejores') return i === 0 ? EMERALD : EMERALD_SOFT;
    return i === 0 ? RED : RED_SOFT;
});

export default function DaysRankingChart({ sales }) {
    const { theme } = useTheme();
    const [range, setRange] = useState('all');
    const [vista, setVista] = useState('mejores');
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
        return computeDayPerformance(filtradas, 4);
    }, [sales, range]);

    const dataset = useMemo(() => {
        const dias = vista === 'mejores' ? ranking.mejores : [...ranking.peores].reverse();
        return {
            dias,
            labels: dias.map((d) => formatShortDate(d.date)),
            data: dias.map((d) => d.total),
            colors: colorearExtremo(dias, vista)
        };
    }, [ranking, vista]);

    useEffect(() => {
        if (!canvasRef.current) return;

        chartRef.current = new Chart(canvasRef.current, {
            type: 'bar',
            data: {
                labels: dataset.labels,
                datasets: [{ data: dataset.data, backgroundColor: dataset.colors, borderRadius: 6, maxBarThickness: 46 }]
            },
            options: {
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
                        callbacks: {
                            title: (items) => formatLongDate(dataset.dias[items[0].dataIndex].date),
                            label: (c) => '$' + c.parsed.y.toLocaleString('es-CO')
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: GRID }, border: { display: false }, ticks: { color: MUTED, font: { size: 11 }, callback: (v) => '$' + (v / 1000) + 'k' } },
                    x: { grid: { display: false }, border: { display: false }, ticks: { color: INK, font: { size: 12, weight: '600' } } }
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
        chart.options.plugins.tooltip.callbacks.title = (items) => formatLongDate(dataset.dias[items[0].dataIndex].date);
        chart.update();
    }, [dataset]);

    const sinDatos = dataset.labels.length === 0;

    return (
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col shadow-sm transition-shadow duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-section-title">Ventas por día</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            <div className="flex gap-1.5 mb-3">
                <button
                    onClick={() => setVista('mejores')}
                    className={`btn-filter-chip rounded-full flex-1 sm:flex-none text-center ${
                        vista === 'mejores' ? 'bg-yellow-otto text-gray-900 shadow-sm' : 'text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-border hover:bg-slate-100 dark:hover:bg-zinc-800/70'
                    }`}
                >
                    Mejores días
                </button>
                <button
                    onClick={() => setVista('peores')}
                    className={`btn-filter-chip rounded-full flex-1 sm:flex-none text-center ${
                        vista === 'peores' ? 'bg-yellow-otto text-gray-900 shadow-sm' : 'text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-border hover:bg-slate-100 dark:hover:bg-zinc-800/70'
                    }`}
                >
                    Peores días
                </button>
            </div>

            <div style={{ position: 'relative', width: '100%', height: 190 }}>
                <canvas ref={canvasRef} role="img" aria-label="Gráfica de barras verticales de mejores o peores días de venta" />
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