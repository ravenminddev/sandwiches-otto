import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import ProductManagement from './layout/ProductManagement.jsx';
import { getProducts } from '../lib/services/products.js';
import alertPop from '@/utils/alertPop.js';

function LoadingSkeleton() {
    return (
        <div className="animate-pulse flex flex-col gap-8">
            {[0, 1].map((section) => (
                <div key={section}>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-zinc-700 rounded mb-3" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i}>
                                <div className="aspect-square bg-gray-200 dark:bg-zinc-700 rounded-xl" />
                                <div className="h-3 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded mt-3 ml-1" />
                                <div className="h-3 w-1/2 bg-gray-200 dark:bg-zinc-700 rounded mt-2 ml-1" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AdminView() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarProductos = async () => {
        const result = await getProducts(false);

        if (result.success) {
            // Mapear datos al formato esperado
            const productosFormateados = result.data.map(prod => ({
                id_producto: prod.id_producto,
                nombre_producto: prod.nombre_producto,
                precio: prod.precio,
                imagen_producto: prod.imagen_producto,
                estado: prod.estado,
                descripcion: prod.descripcion,
                ingredientes: prod.ingredientes,
                id_categoria: prod.id_categoria,
                categoria: prod.categorias?.nombre_categoria || 'Sin categoría'
            }));
            setProductos(productosFormateados);
        } else {
            await alertPop(
                'ERROR AL CARGAR PRODUCTOS',
                result.error,
                'error',
                'Continuar');
        }
        setLoading(false);
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    return (
        <section className='w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8'>

            <header className="flex flex-row items-start justify-between gap-3 mb-6 sm:mb-8 animate-rise">
                <div>
                    <h1 className="text-[28px] leading-8 sm:text-[32px] sm:leading-9 font-black text-gray-900 dark:text-zinc-100">
                        Panel de Administración
                    </h1>
                    <p className="text-sm text-dash-gray dark:text-zinc-400 mt-1">
                        Gestiona tu catálogo de productos
                    </p>
                </div>

                <Link
                    to="/generalHistory"
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-dash-border dark:border-border text-xs sm:text-[13px] font-semibold text-dash-ink dark:text-zinc-300 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-yellow-otto/10 hover:border-yellow-otto/40 active:scale-[0.98] shrink-0 whitespace-nowrap"
                >
                    <FontAwesomeIcon icon={faChartLine} className="text-yellow-otto text-[10px] sm:text-xs" />
                    <span>Historial</span>
                </Link>
            </header>

            {loading ? (
                <LoadingSkeleton />
            ) : (
                <ProductManagement
                    products={productos}
                    onProductosActualizados={cargarProductos}
                />
            )}
        </section>
    );
}
