import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export default function ReceiptModal({ venta, onClose }) {
    if (!venta) return null;

    const fecha = new Date(venta.fecha_venta);
    const fechaFormateada = fecha.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className='fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90dvh] overflow-y-auto'>
                
                {/* Header */}
                <div className='bg-yellow-otto text-white p-6 flex justify-between items-center sticky top-0'>
                    <h2 className='text-2xl font-bold'>Recibo de Venta</h2>
                    <button
                        onClick={onClose}
                        className='cursor-pointer text-white hover:bg-yellow-600 p-2 rounded'
                    >
                        <FontAwesomeIcon icon={faTimes} size='lg' />
                    </button>
                </div>

                {/* Contenido */}
                <div className='p-8'>
                    
                    {/* Info General */}
                    <div className='mb-8 pb-6 border-b'>
                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <p className='text-gray-600 text-sm'>ID Venta</p>
                                <p className='text-lg font-bold'>{venta.id_venta}</p>
                            </div>
                            <div>
                                <p className='text-gray-600 text-sm'>Empleado</p>
                                <p className='text-lg font-bold'>{venta.usuarios?.nombre_completo || 'N/A'}</p>
                            </div>
                            <div>
                                <p className='text-gray-600 text-sm'>Cliente</p>
                                <p className='text-lg font-bold'>{venta.id_cliente || 'Cliente anónimo'}</p>
                            </div>
                            <div>
                                <p className='text-gray-600 text-sm'>Fecha y Hora</p>
                                <p className='text-lg font-bold'>{fechaFormateada}</p>
                            </div>
                        </div>
                    </div>

                    {/* Productos */}
                    <div className='mb-8'>
                        <h3 className='text-xl font-bold mb-4'>Productos</h3>
                        <div className='space-y-3'>
                            {venta.detalles_venta && venta.detalles_venta.length > 0 ? (
                                venta.detalles_venta.map(detalle => (
                                    <div 
                                        key={detalle.id_detalle}
                                        className='flex justify-between items-center bg-gray-50 p-4 rounded-lg'
                                    >
                                        <div className='flex-1'>
                                            <p className='font-semibold text-gray-900'>
                                                {detalle.productos?.nombre_producto || 'Producto desconocido'}
                                            </p>
                                            <p className='text-sm text-gray-600'>
                                                Cantidad: {detalle.cantidad} x ${detalle.precio_unitario.toLocaleString('es-CO')}
                                            </p>
                                        </div>
                                        <p className='font-bold text-lg text-yellow-otto'>
                                            ${detalle.subtotal.toLocaleString('es-CO')}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className='text-gray-600'>No hay productos</p>
                            )}
                        </div>
                    </div>

                    {/* Totales */}
                    <div className='mb-8 pb-6 border-b space-y-2'>
                        <div className='flex justify-between text-gray-700'>
                            <span>Subtotal:</span>
                            <span>${venta.subtotal.toLocaleString('es-CO')}</span>
                        </div>
                        {venta.descuento > 0 && (
                            <div className='flex justify-between text-red-600'>
                                <span>Descuento:</span>
                                <span>-${venta.descuento.toLocaleString('es-CO')}</span>
                            </div>
                        )}
                        <div className='flex justify-between text-xl font-bold'>
                            <span>Total:</span>
                            <span className='text-yellow-otto'>${venta.total.toLocaleString('es-CO')}</span>
                        </div>
                    </div>

                    {/* Pagos */}
                    <div className='mb-8'>
                        <h3 className='text-xl font-bold mb-4'>Pagos</h3>
                        <div className='space-y-3'>
                            {venta.pagos && venta.pagos.length > 0 ? (
                                venta.pagos.map(pago => (
                                    <div 
                                        key={pago.id_pago}
                                        className='flex justify-between items-center bg-green-50 p-4 rounded-lg border border-green-200'
                                    >
                                        <div>
                                            <p className='font-semibold text-gray-900'>
                                                {pago.metodos_pago?.nombre_metodo || 'Método desconocido'}
                                            </p>
                                            <p className='text-sm text-gray-600'>
                                                {new Date(pago.fecha_pago).toLocaleTimeString('es-CO')}
                                            </p>
                                        </div>
                                        <p className='font-bold text-lg text-green-700'>
                                            ${pago.monto.toLocaleString('es-CO')}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className='text-gray-600'>No hay pagos registrados</p>
                            )}
                        </div>
                    </div>

                    {/* Estado */}
                    <div className='text-center'>
                        <span className={`px-4 py-2 rounded-full text-white font-bold ${
                            venta.estado_venta 
                                ? 'bg-green-500' 
                                : 'bg-red-500'
                        }`}>
                            {venta.estado_venta ? '✓ Completada' : '✗ Cancelada'}
                        </span>
                    </div>

                </div>

                {/* Footer */}
                <div className='bg-gray-100 p-6 border-t flex gap-4'>
                    <button
                        onClick={onClose}
                        className='cursor-pointer flex-1 bg-gray-500 text-white font-bold py-2 rounded-lg hover:bg-gray-600'
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={() => window.print()}
                        className='cursor-pointer flex-1 bg-yellow-otto text-white font-bold py-2 rounded-lg hover:brightness-95'
                    >
                        Imprimir
                    </button>
                </div>

            </div>
        </div>
    );
}