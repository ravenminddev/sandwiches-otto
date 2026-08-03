import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faTrash, faCheck, faCreditCard, faCartShopping, faReceipt } from '@fortawesome/free-solid-svg-icons';
import { getAllPaymentMethods } from '@/lib/services/pagos.js';
import { registrarVentaCompleta } from '@/lib/services/ventas.js';
import { useAuth } from '../../lib/hooks/useAuth.js';
import alertPop from '@/utils/alertPop.js';

export default function ShoppingCart({ carrito, onAumentar, onDisminuir, onEliminar , onRegistroExitoso}) {
    const [descuento, setDescuento] = useState(0);
    const [pagos, setPagos] = useState([]);
    const [metodosPago, setMetodosPago] = useState([]);
    const [metodoPagoTemp, setMetodoPagoTemp] = useState('');
    const [montoPagoTemp, setMontoPagoTemp] = useState('');
    const [loading, setLoading] = useState(false);
    const { userData } = useAuth();
    useEffect(() => {
        if (carrito.length === 0) return;
        const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        setMontoPagoTemp(String(total));
    }, [carrito]);

    // Cargar métodos de pago
    useEffect(() => {
        const cargarMetodos = async () => {
            const result = await getAllPaymentMethods(false);
            if (result.success) {
                setMetodosPago(result.data);
                if (result.data.length > 0) {
                    setMetodoPagoTemp(result.data[0].id_metodo);
                }
            }
        };
        cargarMetodos();
    }, []);


    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const total = subtotal - descuento;
    const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
    const pendiente = total - totalPagado;

    // Agregar pago
    const agregarPago = async () => {
        const monto = parseFloat(montoPagoTemp);

        if (!montoPagoTemp || monto <= 0) {
            await alertPop('ERROR', 'Ingresa un monto válido', 'error', 'Continuar');
            return;
        }

        if (monto > pendiente) {
            await alertPop('ERROR', `El monto no puede exceder $${pendiente.toLocaleString('es-CO')}`, 'error', 'Continuar');
            return;
        }

        const metodo = metodosPago.find(m => m.id_metodo == metodoPagoTemp);

        setPagos([
            ...pagos,
            {
                id: Date.now(),
                id_metodo_pago: parseInt(metodoPagoTemp),
                nombre_metodo: metodo.nombre_metodo,
                monto: monto
            }
        ]);

        setMontoPagoTemp('');
    };

    // Eliminar pago
    const eliminarPago = (id) => {
        setPagos(pagos.filter(pago => pago.id !== id));
    };

    const handleRegistrarVenta = async () => {
        if (carrito.length === 0) {
            await alertPop('ERROR', 'El carrito está vacío', 'error', 'Continuar');
            return;
        }

        if (pendiente > 0) {
            await alertPop('ERROR', `Falta pagar $${pendiente.toLocaleString('es-CO')}`, 'error', 'Continuar');
            return;
        }

        setLoading(true);

        // Preparar datos de la venta
        const datosVenta = {
            id_empleado: userData.id_usuario,
            id_cliente: null,
            subtotal: subtotal,
            descuento: descuento,
            total: total,
            notas: null
        };

        // Preparar detalles
        const detalles = carrito.map(item => ({
            id_producto: item.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
            subtotal: item.precio * item.cantidad
        }));

        // Preparar pagos (sin el id temporal)
        const pagosParaGuardar = pagos.map(({ id, nombre_metodo, ...rest }) => rest);

        // Registrar venta
        const result = await registrarVentaCompleta(datosVenta, detalles, pagosParaGuardar);
        setLoading(false);

        if (result.success) {
            await alertPop('ÉXITO', 'Venta registrada correctamente', 'success');
            // Limpiar
            setPagos([]);
            setDescuento(0);
            onRegistroExitoso();
        } else {
            await alertPop('ERROR', result.error, 'error');
        }
    };

    return (
<div className='bg-white dark:bg-card rounded-3xl border border-gray-200/60 dark:border-border shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4 sm:p-6 sticky top-0 h-fit max-h-[85dvh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent'>
            {/* Título */}
            <div className='flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-zinc-700'>
                <div className='w-9 h-9 rounded-xl bg-yellow-otto/10 flex items-center justify-center'>
                    <FontAwesomeIcon icon={faReceipt} className='text-yellow-otto' size='sm' />
                </div>
                <h2 className='text-xl font-bold text-gray-900'>
                    Factura
                </h2>
            </div>

            {/* Lista de productos */}
            {carrito.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-10 text-center'>
                    <div className='w-14 h-14 flex items-center justify-center mb-3'>
                        <FontAwesomeIcon icon={faCartShopping} className='text-gray-300' size='lg' />
                    </div>
                    <p className='text-gray-400 dark:text-zinc-500 text-sm'>Aún no hay productos</p>
                    <p className='text-gray-300 text-xs mt-0.5'>Agrega items desde el catálogo</p>
                </div>
            ) : (
                <div className='space-y-2.5 mb-6 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent'>
                    {carrito.map(item => (
                        <div
                            key={item.id}
                            className='group bg-gray-50/70 dark:bg-zinc-800/70 hover:bg-gray-50 dark:hover:bg-zinc-800/50 p-3 rounded-2xl transition-colors duration-200'
                        >
                            <div className='flex justify-between items-start mb-2.5'>
                                <div className='flex-1 min-w-0 pr-2'>
                                    <h4 className='font-semibold text-sm text-gray-900 truncate'>
                                        {item.name}
                                    </h4>
                                    <p className='text-xs text-gray-500 dark:text-zinc-400 mt-0.5'>
                                        ${item.precio.toLocaleString('es-CO')} c/u
                                    </p>
                                </div>
                                <button
                                    onClick={() => onEliminar(item.id)}
                                    className='cursor-pointer text-gray-300 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 p-1'
                                >
                                    <FontAwesomeIcon icon={faTrash} size='sm' />
                                </button>
                            </div>

                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-1 bg-white dark:bg-card rounded-full p-1 shadow-sm'>
                                    <button
                                        onClick={() => onDisminuir(item.id)}
                                        className='cursor-pointer w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-zinc-800/70 text-gray-600 dark:text-zinc-400 rounded-full hover:bg-yellow-otto hover:text-white active:scale-90 transition-all duration-150'
                                    >
                                        <FontAwesomeIcon icon={faMinus} size='xs' />
                                    </button>
                                    <span className='w-6 text-center text-sm font-bold text-gray-900 dark:text-zinc-100'>
                                        {item.cantidad}
                                    </span>
                                    <button
                                        onClick={() => onAumentar(item.id)}
                                        className='cursor-pointer w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-zinc-800/70 text-gray-600 dark:text-zinc-400 rounded-full hover:bg-yellow-otto hover:text-white active:scale-90 transition-all duration-150'
                                    >
                                        <FontAwesomeIcon icon={faPlus} size='xs' />
                                    </button>
                                </div>
                                <p className='font-bold text-gray-900 dark:text-zinc-100 text-sm'>
                                    ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Descuento */}
            {carrito.length > 0 && (
                <div className='mb-5 pt-4 border-t border-gray-100 dark:border-zinc-700'>
                    <label className='text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-2 block'>
                        Descuento
                    </label>
                    <div className='relative'>
                        <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-sm'>$</span>
                        <input
                            type='number'
                            value={descuento}
                            onChange={(e) => {
                                const value = e.target.value;

                                if (value === '') {
                                    setDescuento('');
                                    return;
                                }

                                setDescuento(Math.max(0, parseFloat(value) || 0));
                            }}
                            placeholder='0'
                            className='w-full bg-gray-50 dark:bg-zinc-800/50 border border-transparent rounded-2xl pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-otto focus:bg-white dark:focus:bg-input transition-all duration-200 text-sm'
                            min='0'
                            max={subtotal}
                        />
                    </div>
                </div>
            )}

            {/* Totales */}
            {carrito.length > 0 && (
                <div className='space-y-2 pt-4 border-t border-gray-100 dark:border-zinc-700 mb-6'>
                    <div className='flex justify-between text-sm'>
                        <span className='text-gray-500 dark:text-zinc-400'>Subtotal</span>
                        <span className='font-semibold text-gray-700 dark:text-zinc-300'>${subtotal.toLocaleString('es-CO')}</span>
                    </div>
                    {descuento > 0 && (
                        <div className='flex justify-between text-sm'>
                            <span className='text-red-500'>Descuento</span>
                            <span className='text-red-500 font-medium'>-${descuento.toLocaleString('es-CO')}</span>
                        </div>
                    )}
                    <div className='flex justify-between items-center bg-yellow-otto/10 rounded-2xl px-4 py-3 mt-3'>
                        <span className='text-sm font-semibold text-gray-700 dark:text-zinc-300'>Total</span>
                        <span className='text-2xl font-extrabold text-yellow-otto'>${total.toLocaleString('es-CO')}</span>
                    </div>
                </div>
            )}

            {/* Sección de Pagos */}
            {carrito.length > 0 && (
                <div className='pt-4 border-t border-gray-100 dark:border-zinc-700 mb-6'>
                    <h3 className='font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5'>
                        <FontAwesomeIcon icon={faCreditCard} className='text-gray-400 dark:text-zinc-500' size='xs' />
                        Pagos
                    </h3>

                    {/* Agregar pago */}
                    <div className='space-y-2 mb-4 bg-gray-50/70 dark:bg-zinc-800/70 p-3 rounded-2xl'>
                        <select
                            value={metodoPagoTemp}
                            onChange={(e) => setMetodoPagoTemp(e.target.value)}
                            className='cursor-pointer w-full bg-white dark:bg-card text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-otto transition-all duration-200'
                        >
                            <option value="">Selecciona método de pago</option>
                            {metodosPago.map(metodo => (
                                <option key={metodo.id_metodo} value={metodo.id_metodo}>
                                    {metodo.nombre_metodo}
                                </option>
                            ))}
                        </select>

                        <input
                            type='number'
                            value={montoPagoTemp}
                            onChange={(e) => setMontoPagoTemp(e.target.value)}
                            placeholder={`Ingresa monto (Pendiente: $${pendiente.toLocaleString('es-CO')})`}
                            className='w-full bg-white dark:bg-card text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-otto transition-all duration-200'
                            min='0'
                        />

                        <button
                            onClick={agregarPago}
                            className='cursor-pointer w-full bg-yellow-otto text-white py-2 rounded-xl text-sm font-semibold hover:brightness-95 active:scale-[0.98] transition-all duration-150'
                        >
                            Agregar pago
                        </button>
                    </div>

                    {/* Lista de pagos realizados */}
                    {pagos.length > 0 && (
                        <div className='space-y-2 mb-4'>
                            {pagos.map(pago => (
                                <div
                                    key={pago.id}
                                    className='group flex justify-between items-center bg-green-50/70 p-2.5 rounded-xl'
                                >
                                    <div className='flex items-center gap-2.5'>
                                        <div className='w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0'>
                                            <FontAwesomeIcon icon={faCheck} className='text-white' size='xs' />
                                        </div>
                                        <div className='text-sm'>
                                            <p className='font-semibold text-gray-900 dark:text-zinc-100 leading-tight'>
                                                {pago.nombre_metodo}
                                            </p>
                                            <p className='text-green-600 text-xs font-medium'>
                                                ${pago.monto.toLocaleString('es-CO')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => eliminarPago(pago.id)}
                                        className='cursor-pointer text-gray-300 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 p-1'
                                    >
                                        <FontAwesomeIcon icon={faTrash} size='sm' />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Resumen de pagos */}
                    <div className='flex items-center justify-between gap-3'>
                        <div className='flex-1 bg-gray-50 dark:bg-zinc-800/50 rounded-xl px-3 py-2'>
                            <p className='text-[11px] text-gray-400 dark:text-zinc-500 font-medium uppercase tracking-wide'>Pagado</p>
                            <p className='text-sm font-bold text-gray-900 dark:text-zinc-100'>${totalPagado.toLocaleString('es-CO')}</p>
                        </div>
                        <div className={`flex-1 rounded-xl px-3 py-2 ${pendiente <= 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
                            <p className={`text-[11px] font-medium uppercase tracking-wide ${pendiente <= 0 ? 'text-green-500' : 'text-orange-400'}`}>Pendiente</p>
                            <p className={`text-sm font-bold ${pendiente <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                ${Math.max(0, pendiente).toLocaleString('es-CO')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Botón registrar */}
            <div className='flex items-center justify-center w-full'>
                <button
                    onClick={handleRegistrarVenta}
                    disabled={carrito.length === 0 || pendiente > 0 || loading}
                    className='cursor-pointer w-full py-3.5 bg-black dark:bg-zinc-200 dark:text-zinc-900 text-white font-bold rounded-2xl hover:brightness-110 dark:hover:brightness-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 shadow-lg shadow-black/10 dark:shadow-black/30'
                >
                    {loading
                        ? 'Registrando...'
                        : pendiente > 0
                            ? `Falta pagar $${pendiente.toLocaleString('es-CO')}`
                            : 'Registrar venta'
                    }
                </button>
            </div>
        </div>
    );
}