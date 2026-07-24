import { useState } from 'react';
import { deactivateProduct } from '../../lib/services/products.js';
import ProductListCard from './ProductListCard';
import alertPop from '@/utils/alertPop.js';
import alertDecision from '@/utils/alertDecision.js';

export default function ProductList({ products = [], cols = 3, onProductosActualizados }) {
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

    if (products.length === 0) {
        return <div className='text-center py-14 text-gray-500'>No hay productos registrados</div>;
    }

    return (
        <ul className={`list-none grid gap-5 grid-cols-1 sm:grid-cols-2 ${cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
            {products.map((product) => (
                <li key={product.id_producto}>
                    <ProductListCard
                        id={product.id_producto}
                        name={product.nombre_producto}
                        img={product.imagen_producto}
                        price={product.precio}
                        isDeleting={deletingId === product.id_producto}
                        onDelete={() => handleDelete(product.id_producto, product.nombre_producto)}
                    />
                </li>
            ))}
        </ul>
    );
}
