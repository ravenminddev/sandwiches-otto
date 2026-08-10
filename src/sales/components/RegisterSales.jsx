import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import ProductCard from './ProductCard';
import { getAvailableProducts} from '../../lib/services/products.js';
import alertPop from '@/utils/alertPop.js';
import SearchBar from '../../shared/components/SearchBar.jsx';

export default function RegisterSales({ isAdmin = false }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { agregarAlCarrito, carrito = [] } = useOutletContext();

    useEffect(() => {
        const cargarProductos = async () => {
            setLoading(true);
            const result = await getAvailableProducts();

            if (result.success) {
                const productosFormateados = result.data.map(producto => ({
                    id: producto.id_producto,
                    name: producto.nombre_producto,
                    img: producto.imagen_producto,
                    precio: producto.precio,
                    descripcion: producto.descripcion,
                    ingredientes: producto.ingredientes,
                    categoria: producto.categorias?.nombre_categoria
                }));
                setProducts(productosFormateados);
            } else {
                await alertPop('ERROR', result.error, 'error', 'Continuar');
            }
            setLoading(false);
        };

        cargarProductos();
    }, []);

    const filteredProducts = products
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (a.categoria === 'Sándwiches' && b.categoria !== 'Sándwiches') return -1;
            if (a.categoria !== 'Sándwiches' && b.categoria === 'Sándwiches') return 1;
            return 0;
        }
    );

    if (loading) {
        return (
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className='rounded-2xl bg-white dark:bg-card overflow-hidden animate-pulse'>
                        <div className='w-full aspect-4/3 bg-gray-200 dark:bg-zinc-700' />
                        <div className='p-4 space-y-3'>
                            <div className='h-3 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mx-auto' />
                            <div className='h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/2 mx-auto' />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!loading && products.length === 0) {
        return (
            <div className='flex items-center justify-center min-h-[50vh]'>
                <h1 className='sr-only'>Registrar venta</h1>
                <div className='bg-white dark:bg-card border border-gray-200/60 dark:border-border rounded-lg shadow-lg p-8 text-center'>
                    <h2 className='text-empty-state'>No hay productos</h2>
                    <p className='text-gray-600 dark:text-zinc-400'>No se han registrado productos en la BD</p>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-4'>

            <h1 className='sr-only'>Registrar venta</h1>

            {/* BARRA DE BUSQUEDA */}
            <SearchBar value={search} onChange={setSearch}/>

            <h2 className='sr-only'>Productos disponibles</h2>

            {filteredProducts.length === 0 ? (
                <div className='text-center py-12 text-gray-500 dark:text-zinc-400'>
                    No se encontraron productos para &quot;{search}&quot;
                </div>
            ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => agregarAlCarrito(product)}
                            className='w-full h-full bg-none border-none p-0 cursor-pointer'
                        >
                            <ProductCard
                                product={product}
                                isAdmin={isAdmin}
                                quantityInCart={carrito.find(item => item.id === product.id)?.cantidad || 0}
                            />
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
