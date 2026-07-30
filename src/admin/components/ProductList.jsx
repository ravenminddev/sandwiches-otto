import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { deactivateProduct } from '../../lib/services/products.js';
import ProductListCard from './ProductListCard';
import alertPop from '@/utils/alertPop.js';
import alertDecision from '@/utils/alertDecision.js';

const stagger = (index) => ({ animationDelay: `${Math.min(index, 8) * 45}ms` });

export default function ProductList({ products = [], flat = false, search = '', onProductosActualizados }) {
    const [deletingId, setDeletingId] = useState(null);

    const handleDelete = async (id, name) => {
        const result = await alertDecision(
            '¿DESEA ELIMINAR ESTE PRODUCTO?',
            name,
            'question',
            'Eliminar',
            'Cancelar'
        );

        if (result.isConfirmed) {
            setDeletingId(id);
            const deleteResult = await deactivateProduct(id);

            if (deleteResult.success) {
                await alertPop(
                    'PRODUCTO DESACTIVADO',
                    'Producto desactivado correctamente',
                    'success',
                    'Continuar'
                );
                await onProductosActualizados?.();
            } else {
                await alertPop(
                    'ERROR AL DESACTIVAR',
                    deleteResult.error,
                    'error',
                    'Continuar'
                );
            }
            setDeletingId(null);
        }
    };

    // Agrupa por categoría conservando el orden alfabético de productos
    // que ya trae la consulta. "Sin categoría" siempre al final.
    const grupos = useMemo(() => {
        const mapa = new Map();
        for (const p of products) {
            const cat = p.categoria || 'Sin categoría';
            if (!mapa.has(cat)) mapa.set(cat, []);
            mapa.get(cat).push(p);
        }
        return [...mapa.entries()].sort((a, b) => {
            if (a[0] === 'Sin categoría') return 1;
            if (b[0] === 'Sin categoría') return -1;
            return a[0].localeCompare(b[0]);
        });
    }, [products]);

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center text-center py-16 gap-4 animate-fade-in">
                <span className="w-16 h-16 rounded-full bg-yellow-otto/10 text-yellow-otto flex items-center justify-center text-2xl">
                    <FontAwesomeIcon icon={faBoxOpen} />
                </span>
                <div>
                    <p className="text-empty-state">No hay productos registrados</p>
                    <p className="text-sm text-dash-gray-soft mt-1">
                        Añade el primero con el botón de arriba
                    </p>
                </div>
            </div>
        );
    }

    // Resultados de búsqueda: grilla plana, sin secciones
    if (flat) {
        return (
            <div className="flex flex-col gap-4">
                <p className="text-sm text-dash-gray animate-fade-in">
                    {products.length} {products.length === 1 ? 'resultado' : 'resultados'} para &quot;{search}&quot;
                </p>
                <ul className="list-none grid grid-cols-3 gap-3 sm:gap-4">
                    {products.map((product, i) => (
                        <li key={product.id_producto} className="animate-rise" style={stagger(i)}>
                            <ProductListCard
                                product={product}
                                isDeleting={deletingId === product.id_producto}
                                onDelete={() => handleDelete(product.id_producto, product.nombre_producto)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    // Vista normal: secciones por categoría con grilla
    return (
        <div className="flex flex-col gap-8 sm:gap-10">
            {grupos.map(([categoria, items]) => (
                <section key={categoria} className="flex flex-col gap-3">
                    <header className="inline-flex items-center gap-2 animate-rise">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                            {categoria}
                        </h3>
                        <span className="text-xs font-medium bg-yellow-otto/10 text-yellow-otto rounded-full px-2 py-0.5 leading-none">
                            {items.length}
                        </span>
                    </header>

                    <ul className="list-none grid grid-cols-3 gap-3 sm:gap-4">
                        {items.map((product, i) => (
                            <li
                                key={product.id_producto}
                                className="animate-rise"
                                style={stagger(i)}
                            >
                                <ProductListCard
                                    product={product}
                                    isDeleting={deletingId === product.id_producto}
                                    onDelete={() => handleDelete(product.id_producto, product.nombre_producto)}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}
