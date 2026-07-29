import { useEffect, useRef } from 'react';
import { Chart, ensureChartRegistered, createVerticalGradient } from '../utils/chartSetup.js';
import { formatShortDate, formatLongDate } from '../utils/salesAnalytics.js';
import { useTheme } from '@/lib/context/ThemeContext.jsx';

ensureChartRegistered();

const AMBER = '#f59e0b';

export default function SalesEvolutionChart({ data }) {
    const { theme } = useTheme();
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const isDark = theme === 'dark';
    const INK = isDark ? '#fafafa' : '#1e293b';
    const GRID = isDark ? '#3f3f46' : '#eef1f5';
    const MUTED = isDark ? '#a1a1aa' : '#94a3b8';

    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        const gradient = createVerticalGradient(ctx, 260, 'rgba(245,158,11,0.28)', 'rgba(245,158,11,0.02)');

        chartRef.current = new Chart(canvasRef.current, {
            type: 'line',
            data: {
                labels: data.map((d) => formatShortDate(d.date)),
                datasets: [{
                    data: data.map((d) => d.total),
                    borderColor: AMBER,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2.5,
                    pointBackgroundColor: isDark ? '#18181b' : '#fff',
                    pointBorderColor: AMBER,
                    pointBorderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 700, easing: 'easeOutQuart' },
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: INK,
                        titleColor: isDark ? '#18181b' : '#fff',
                        bodyColor: isDark ? '#18181b' : '#fff',
                        padding: 10,
                        cornerRadius: 10,
                        displayColors: false,
                        callbacks: {
                            title: (items) => formatLongDate(data[items[0].dataIndex].date),
                            label: (c) => '$' + c.parsed.y.toLocaleString('es-CO')
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: GRID },
                        border: { display: false },
                        ticks: { color: MUTED, font: { size: 11 }, callback: (v) => '$' + (v / 1000) + 'k' }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { color: MUTED, font: { size: 11 } }
                    }
                }
            }
        });

        return () => chartRef.current?.destroy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme]);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;
        chart.data.labels = data.map((d) => formatShortDate(d.date));
        chart.data.datasets[0].data = data.map((d) => d.total);
        chart.update();
    }, [data]);

    return (
        <div style={{ position: 'relative', width: '100%', height: 260 }}>
            <canvas
                ref={canvasRef}
                role="img"
                aria-label="Gráfica de línea de evolución de ventas por fecha"
            />
            {data.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-zinc-500 text-sm">
                    No hay ventas en este período para graficar
                </div>
            )}
        </div>
    );
}