import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { getSaleDetails } from '@/lib/services/ventas.js';
import { actualizarVentaCompleta } from '@/lib/services/ventas.js';
import { getAllPaymentMethods } from '@/lib/services/pagos.js';
import ProductSelectorModal from '@/shared/components/ProductSelectorModal.jsx';
import alertPop from '@/utils/alertPop.js';
import alertDecision from '@/utils/alertDecision.js';

export default function EditSales() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const idVenta = state?.registro?.id_venta;

    // ─── Estado del carrito (productos de la venta) ───────────────────────────
    const [carrito, setCarrito] = useState([]);

    // ─── Estado de pagos ──────────────────────────────────────────────────────
    const [pagos, setPagos] = useState([]);
    const [metodosPago, setMetodosPago] = useState([]);
    const [metodoPagoTemp, setMetodoPagoTemp] = useState('');
    const [montoPagoTemp, setMontoPagoTemp] = useState('');

    // ─── Otros estados ────────────────────────────────────────────────────────
    const [cliente, setCliente] = useState('');
    const [descuento, setDescuento] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // ─── Cargar datos de la venta ─────────────────────────────────────────────
    useEffect(() => {
        const cargarVenta = async () => {
            if (!idVenta) {
                await alertPop('ERROR', 'No se encontró la venta', 'error', 'Continuar');
                navigate(-1);
                return;
            }

            setLoading(true);
            const result = await getSaleDetails(idVenta);

            if (!result.success) {
                await alertPop('ERROR', result.error, 'error', 'Continuar');
                navigate(-1);
                return;
            }

            const venta = result.data;

            // Cargar cliente y descuento
            setCliente(venta.id_cliente || '');
            setDescuento(venta.descuento || 0);

            // Cargar productos al carrito
            const productosFormateados = venta.detalles_venta.map(detalle => ({
                id: detalle.id_producto,
                name: detalle.productos.nombre_producto,
                img: detalle.productos.imagen_producto,
                precio: detalle.precio_unitario,
                cantidad: detalle.cantidad
            }));
            setCarrito(productosFormateados);
            console.log('Carrito agregado: ', productosFormateados);

            // Cargar pagos existentes
            const pagosFormateados = venta.pagos.map(pago => ({
                id: Date.now() + Math.random(), // ID temporal para el frontend
                id_metodo_pago: pago.id_metodo_pago,
                nombre_metodo: pago.metodos_pago.nombre_metodo,
                monto: pago.monto
            }));
            setPagos(pagosFormateados);

            setLoading(false);
        };

        cargarVenta();
    }, [idVenta]);

    // ─── Cargar métodos de pago ───────────────────────────────────────────────
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

    // ─── Cálculos ─────────────────────────────────────────────────────────────
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const total = subtotal - (parseFloat(descuento) || 0);
    const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
    const pendiente = total - totalPagado;

    // ─── Funciones del carrito ────────────────────────────────────────────────
    const agregarAlCarrito = (producto) => {
        const existe = carrito.find(item => item.id === producto.id);
        if (existe) {
            setCarrito(carrito.map(item =>
                item.id === producto.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            setCarrito([...carrito, { ...producto, cantidad: 1 }]);
        }
    };

    const aumentarCantidad = (id) => {
        setCarrito(carrito.map(item =>
            item.id === id
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
        ));
    };

    const disminuirCantidad = (id) => {
        setCarrito(carrito.map(item =>
            item.id === id && item.cantidad > 1
                ? { ...item, cantidad: item.cantidad - 1 }
                : item
        ).filter(item => item.cantidad > 0));
    };

    const eliminarDelCarrito = (id) => {
        setCarrito(carrito.filter(item => item.id !== id));
    };

    // ─── Funciones de pagos ───────────────────────────────────────────────────
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

        setPagos([...pagos, {
            id: Date.now(),
            id_metodo_pago: parseInt(metodoPagoTemp),
            nombre_metodo: metodo.nombre_metodo,
            monto: monto
        }]);

        setMontoPagoTemp('');
    };

    const eliminarPago = (id) => {
        setPagos(pagos.filter(pago => pago.id !== id));
    };

    // ─── Guardar cambios ──────────────────────────────────────────────────────
    const handleGuardar = async () => {
        if (carrito.length === 0) {
            await alertPop('ERROR', 'La venta debe tener al menos un producto', 'error', 'Continuar');
            return;
        }

        if (pendiente > 0) {
            await alertPop('ERROR', `Falta pagar $${pendiente.toLocaleString('es-CO')}`, 'error', 'Continuar');
            return;
        }

        const confirmacion = await alertDecision(
            '¿GUARDAR CAMBIOS?',
            `Se actualizará la venta #${idVenta}`,
            'question',
            'Guardar',
            'Cancelar'
        );

        if (!confirmacion.isConfirmed) return;

        setGuardando(true);

        const datosVenta = {
            id_cliente: cliente || null,
            subtotal,
            descuento: parseFloat(descuento) || 0,
            total
        };

        const detalles = carrito.map(item => ({
            id_producto: item.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
            subtotal: item.precio * item.cantidad
        }));

        const pagosParaGuardar = pagos.map(({ id, nombre_metodo, ...rest }) => rest);

        const result = await actualizarVentaCompleta(idVenta, datosVenta, detalles, pagosParaGuardar);

        setGuardando(false);

        if (result.success) {
            await alertPop('ÉXITO', 'Venta actualizada correctamente', 'success', 'Continuar');
            navigate(-1);
        } else {
            await alertPop('ERROR', result.error, 'error', 'Continuar');
        }
    };

    // ─── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500 dark:text-zinc-400 text-lg">Cargando venta...</p>
            </div>
        );
    }

    return (
        <section className="mb-10 min-h-screen">

            {/* Volver */}
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="cursor-pointer mb-6 text-gray-700 dark:text-zinc-300 p-2 hover:text-gray-900 dark:text-zinc-100 transition-all inline-flex items-center gap-2"
            >
                <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                <span>Volver</span>
            </button>

            <h1 className="text-page-title text-left mb-6">
                Editar Venta #{idVenta}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">

                {/* ── COLUMNA IZQUIERDA: Productos ─────────────────────────── */}
                <div className="bg-white dark:bg-card border border-gray-200/60 dark:border-border rounded-2xl shadow-lg p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-section-title">Productos</h2>
                        <button
                            onClick={() => setShowModal(true)}
                            className="cursor-pointer flex items-center gap-2 bg-yellow-otto text-white text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-95 transition-all"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Agregar
                        </button>
                    </div>

                    {/* Lista de productos */}
                    {carrito.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 dark:text-zinc-500">
                            <p>No hay productos en la venta</p>
                            <p className="text-sm mt-1">Presiona "Agregar" para añadir productos</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                            {carrito.map(item => (
                                <div
                                    key={item.id}
                                    className="gap-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-gray-200 dark:border-border"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        {/* Imagen */}
                                        <img
                                            src={item.img}
                                            alt={item.name}
                                            className="w-14 h-14 object-cover mr-2 rounded-lg flex-shrink-0"
                                        />

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-gray-900 dark:text-zinc-100 truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-sm">
                                                ${item.precio.toLocaleString('es-CO')}
                                            </p>
                                        </div>
                                        {/* Eliminar */}
                                        <button
                                            onClick={() => eliminarDelCarrito(item.id)}
                                            className="cursor-pointer text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                                        >
                                            <FontAwesomeIcon icon={faTrash} size="sm" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        {/* Controles cantidad */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => disminuirCantidad(item.id)}
                                                className="cursor-pointer bg-yellow-otto text-white w-6 h-6 rounded flex items-center justify-center hover:brightness-95"
                                            >
                                                <FontAwesomeIcon icon={faMinus} size="xs" />
                                            </button>
                                            <span className="w-6 h-6 text-center bg-gray-200 dark:bg-zinc-700 rounded text-sm font-semibold">
                                                {item.cantidad}
                                            </span>
                                            <button
                                                onClick={() => aumentarCantidad(item.id)}
                                                className="cursor-pointer bg-yellow-otto text-white w-6 h-6 rounded flex items-center justify-center hover:brightness-95"
                                            >
                                                <FontAwesomeIcon icon={faPlus} size="xs" />
                                            </button>
                                        </div>

                                        {/* Subtotal */}
                                        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 w-20 text-right flex-shrink-0">
                                            ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Cliente y Descuento */}
                    <div className="border-t pt-4 space-y-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                                Nombre del cliente
                            </label>
                            <input
                                type="text"
                                value={cliente}
                                onChange={(e) => setCliente(e.target.value)}
                                placeholder="Ej: Lucas Carvajal"
                                className="border border-gray-300 dark:border-border-strong bg-white dark:bg-card text-gray-700 dark:text-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                                Descuento
                            </label>
                            <input
                                type="number"
                                value={descuento}
                                onChange={(e) => setDescuento(Math.max(0, parseFloat(e.target.value) || 0))}
                                placeholder="0"
                                min="0"
                                max={subtotal}
                                className="border border-gray-300 dark:border-border-strong bg-white dark:bg-card text-gray-700 dark:text-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                    </div>

                    {/* Totales */}
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-zinc-400">
                            <span>Subtotal:</span>
                            <span className="font-semibold">${subtotal.toLocaleString('es-CO')}</span>
                        </div>
                        {descuento > 0 && (
                            <div className="flex justify-between text-sm text-red-500">
                                <span>Descuento:</span>
                                <span>-${parseFloat(descuento).toLocaleString('es-CO')}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total:</span>
                            <span className="text-yellow-otto">${total.toLocaleString('es-CO')}</span>
                        </div>
                    </div>
                </div>

                {/* ── COLUMNA DERECHA: Pagos ───────────────────────────────── */}
                <div className="bg-white dark:bg-card border border-gray-200/60 dark:border-border rounded-2xl shadow-lg p-6 flex flex-col gap-4">
                    <h2 className="text-section-title border-b pb-4">
                        Métodos de pago
                    </h2>

                    {/* Agregar pago */}
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl space-y-3">
                        <select
                            value={metodoPagoTemp}
                            onChange={(e) => setMetodoPagoTemp(e.target.value)}
                            className="cursor-pointer w-full border border-gray-300 dark:border-border-strong bg-white dark:bg-card text-gray-700 dark:text-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            <option value="">Selecciona método de pago</option>
                            {metodosPago.map(metodo => (
                                <option key={metodo.id_metodo} value={metodo.id_metodo}>
                                    {metodo.nombre_metodo}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            value={montoPagoTemp}
                            onChange={(e) => setMontoPagoTemp(e.target.value)}
                            placeholder={`Monto (Pendiente: $${Math.max(0, pendiente).toLocaleString('es-CO')})`}
                            min="0"
                            className="w-full border border-gray-300 dark:border-border-strong bg-white dark:bg-card text-gray-700 dark:text-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />

                        <button
                            onClick={agregarPago}
                            className="cursor-pointer w-full bg-yellow-otto text-white font-semibold py-2 rounded-lg hover:brightness-95 transition-all text-sm"
                        >
                            Agregar pago
                        </button>
                    </div>

                    {/* Lista de pagos */}
                    {pagos.length > 0 && (
                        <div className="space-y-2 max-h-52 overflow-y-auto">
                            {pagos.map(pago => (
                                <div
                                    key={pago.id}
                                    className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg p-3"
                                >
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-zinc-100">
                                            {pago.nombre_metodo}
                                        </p>
                                        <p className="text-green-700 text-sm">
                                            ${pago.monto.toLocaleString('es-CO')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => eliminarPago(pago.id)}
                                        className="cursor-pointer text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faTrash} size="sm" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Resumen pagos */}
                    <div className="bg-gray-100 dark:bg-zinc-800/70 rounded-lg p-3 space-y-1 text-sm mt-auto">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-zinc-400">Total pagado:</span>
                            <span className="font-semibold">${totalPagado.toLocaleString('es-CO')}</span>
                        </div>
                        <div className={`flex justify-between font-bold ${pendiente <= 0 ? 'text-green-600' : 'text-orange-500'}`}>
                            <span>Pendiente:</span>
                            <span>${Math.max(0, pendiente).toLocaleString('es-CO')}</span>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={handleGuardar}
                            disabled={guardando || carrito.length === 0 || pendiente > 0}
                            className="cursor-pointer flex-1 bg-yellow-otto text-white font-bold py-3 rounded-lg hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {guardando ? 'Guardando...' : pendiente > 0 ? `Falta $${pendiente.toLocaleString('es-CO')}` : 'Guardar cambios'}
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="cursor-pointer flex-1 border-2 border-gray-300 dark:border-border-strong text-gray-700 dark:text-zinc-300 font-medium py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/70 transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de productos */}
            <ProductSelectorModal
                show={showModal}
                onClose={() => setShowModal(false)}
                carritoActual={carrito}
                onAgregar={agregarAlCarrito}
            />
        </section>
    );
}