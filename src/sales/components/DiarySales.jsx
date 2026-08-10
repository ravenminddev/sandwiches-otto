import { useState, useEffect } from 'react';
import Table from '../../shared/table/Table';
import { getSalesToday, getSaleDetails } from '@/lib/services/ventas.js';
import ReceiptModal from '../components/ReceiptModal';
import alertPop from '@/utils/alertPop.js';

export default function DiarySales() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
    const [ventaDetalle, setVentaDetalle] = useState(null);

    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        weekday: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        const cargarVentas = async () => {
            setLoading(true);
            const result = await getSalesToday();

            if (result.success && result.data) {
                const ventasFormateadas = result.data.map(venta => ({
                    id_venta: venta.id_venta,
                    empleado: venta.usuarios?.nombre_completo || 'N/A',
                    cliente: venta.id_cliente || 'Cliente anónimo',
                    subtotal: venta.subtotal.toLocaleString('es-CO'),
                    descuento: venta.descuento.toLocaleString('es-CO'),
                    total: venta.total.toLocaleString('es-CO'),
                    hora: new Date(venta.fecha_venta).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    estado: venta.estado_venta ? '✓ Completada' : '✗ Cancelada',
                    // Guardar objeto original para el modal
                    _original: venta
                }));
                setSales(ventasFormateadas);
            } else {
                await alertPop('ERROR', result.error, 'error', 'Continuar');
            }
            setLoading(false);
        };

        cargarVentas();
    }, []);

  
    const handleVerRecibo = async (idVenta) => {
        setLoading(true);
        const result = await getSaleDetails(idVenta);
        setLoading(false);

        if (result.success) {
            setVentaDetalle(result.data);
        } else {
            await alertPop('ERROR', result.error, 'error', 'Continuar');
        }
    };

    if (loading && sales.length === 0) {
        return (
            <section className="bg-[--color-graywhite] min-h-full p-4 sm:p-8 flex items-center justify-center">
                <p className='text-xl text-gray-600 dark:text-zinc-400'>Cargando ventas del día...</p>
            </section>
        );
    }

    if (sales.length === 0) {
        return (
            <section className="bg-[--color-graywhite] min-h-full p-4 sm:p-8">
                <div className="flex flex-row text-left mb-6">
                    <h1 className="text-page-title text-pretty">{`Ventas del ${fechaFormateada}`}</h1>
                </div>
                <div className="bg-white dark:bg-card border border-gray-200/60 dark:border-border rounded-lg shadow-lg p-4 sm:p-8 text-center">
                    <h2 className='text-empty-state mb-4'>No hay ventas</h2>
                    <p className='text-sm sm:text-base text-gray-600 dark:text-zinc-400'>No se han registrado ventas para hoy</p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-[--color-graywhite] min-h-full p-4 sm:p-8">
            <div className="flex flex-row text-left mb-6">
                <h1 className="text-page-title text-pretty">{`Ventas del ${fechaFormateada}`}</h1>
            </div>

            <div className="bg-white dark:bg-card border border-gray-200/60 dark:border-border rounded-lg shadow-lg p-6 mb-6">
                <Table
                    rowData={sales}
                    onVerRecibo={handleVerRecibo}
                    columnDefs={[
                        {
                            headerName: 'ID',
                            field: 'id_venta',
                            cellRenderer: (params) => (
                                <button
                                    onClick={() => handleVerRecibo(params.value)}
                                    className='cursor-pointer text-blue-600 hover:text-blue-800 font-bold hover:underline'
                                >
                                    Ver #{params.value}
                                </button>
                            )
                        },
                        { headerName: 'Empleado', field: 'empleado' },
                        { headerName: 'Cliente', field: 'cliente' },
                        { headerName: 'Subtotal', field: 'subtotal' },
                        { headerName: 'Descuento', field: 'descuento' },
                        { headerName: 'Hora', field: 'hora' },
                        { headerName: 'Estado', field: 'estado' },
                        { headerName: 'Total', field: 'total' }
                    ]}
                />
            </div>

            {/* Modal del Recibo */}
            {ventaDetalle && (
                <ReceiptModal
                    venta={ventaDetalle}
                    onClose={() => setVentaDetalle(null)}
                />
            )}
        </section>
    )
}