import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import { getAvailableProducts } from '@/lib/services/products.js';
import alertPop from '@/utils/alertPop.js';

export default function ProductSelectorModal({ show, onClose, carritoActual, onAgregar }) {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!show) return;

        const cargarProductos = async () => {
            setLoading(true);
            const result = await getAvailableProducts();

            if (result.success) {
                const formateados = result.data.map(p => ({
                    id: p.id_producto,
                    name: p.nombre,
                    img: p.url_imagen,
                    precio: p.precio,
                    categoria: p.categoria_producto?.nombre
                }));
                setProductos(formateados);
            } else {
                await alertPop('ERROR', result.error, 'error', 'Continuar');
            }
            setLoading(false);
        };

        cargarProductos();
    }, [show]);

    const filtrados = productos
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (a.categoria === 'Sándwiches' && b.categoria !== 'Sándwiches') return -1;
            if (a.categoria !== 'Sándwiches' && b.categoria === 'Sándwiches') return 1;
            return 0;
        });

    // Verificar si un producto ya está en el carrito
    const estaEnCarrito = (id) => carritoActual.some(item => item.id === id);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Fondo oscuro */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-card rounded-2xl shadow-xl w-full max-w-3xl max-h-[85dvh] flex flex-col mx-4">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white dark:bg-card rounded-t-2xl z-10">
                    <h2 className="text-modal-title">
                        Agregar productos
                    </h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-zinc-800/70 rounded-full transition-colors"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-xl text-gray-600 dark:text-zinc-400" />
                    </button>
                </div>

                {/* Buscador */}
                <div className="px-5 py-3 border-b">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar producto..."
                            className="w-full border border-gray-300 dark:border-border-strong rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Grid de productos */}
                <div className="overflow-y-auto p-5 flex-1">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="rounded-2xl bg-gray-100 dark:bg-zinc-800/70 animate-pulse aspect-square" />
                            ))}
                        </div>
                    ) : filtrados.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
                            No se encontraron productos para "{search}"
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {filtrados.map(producto => (
                                <button
                                    key={producto.id}
                                    onClick={() => onAgregar(producto)}
                                    className={`cursor-pointer relative bg-white dark:bg-card border-2 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all text-left
                                        ${estaEnCarrito(producto.id)
                                            ? 'border-yellow-400 bg-yellow-50'
                                            : 'border-gray-200 dark:border-border hover:border-yellow-300'
                                        }`}
                                >
                                    {/* Badge si ya está en carrito */}
                                    {estaEnCarrito(producto.id) && (
                                        <div className="absolute top-2 right-2 bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center z-10">
                                            <FontAwesomeIcon icon={faCheck} size="xs" />
                                        </div>
                                    )}

                                    {/* Imagen */}
                                    <div className="aspect-4/3 overflow-hidden bg-gray-100 dark:bg-zinc-800/70">
                                        <img
                                            src={producto.img}
                                            alt={producto.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="p-3 text-center">
                                        <p className="font-bold text-sm text-gray-900 dark:text-zinc-100 leading-tight mb-1">
                                            {producto.name}
                                        </p>
                                        <p className="text-yellow-500 font-semibold text-sm">
                                            ${producto.precio.toLocaleString('es-CO')}
                                        </p>
                                        <div className={`mt-2 flex items-center justify-center gap-1 text-xs font-medium py-1 px-2 rounded-full
                                            ${estaEnCarrito(producto.id)
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-gray-100 dark:bg-zinc-800/70 text-gray-600 dark:text-zinc-400'
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={estaEnCarrito(producto.id) ? faCheck : faPlus} size="xs" />
                                            {estaEnCarrito(producto.id) ? 'Agregado' : 'Agregar'}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t sticky bottom-0 bg-white dark:bg-card rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="cursor-pointer w-full bg-yellow-otto text-white font-bold py-3 rounded-lg hover:brightness-95 transition-all"
                    >
                        Listo ({carritoActual.length} productos seleccionados)
                    </button>
                </div>
            </div>
        </div>
    );
}