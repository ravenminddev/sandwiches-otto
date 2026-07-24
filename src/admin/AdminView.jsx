import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import ProductManagement from './layout/ProductManagement.jsx';
import { getProducts } from '../lib/services/products.js';
import alertPop from '@/utils/alertPop.js';

export default function AdminView(){
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        setLoading(true);
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
                id_categoria: prod.id_categoria
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

   const handleEditarProducto = (id) => {
    navigate(`/sales/admin/editProduct/${id}`);
};

    return(
        <section className='w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                <div className="font-black text-xl sm:text-2xl lg:text-3xl text-black tracking-tighter">
                    <h1>Manejo de la plataforma</h1>
                </div>

                <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0'>
                    <Link
                        to={'/sales/history'}
                        className="cursor-pointer text-center text-sm sm:text-base font-medium bg-yellow-otto text-white rounded-3xl py-3 w-full sm:w-auto px-5 hover:brightness-95 transition-all flex items-center justify-center"
                    >
                        Ventas del día
                    </Link>

                    <Link
                        to={'/generalHistory'}
                        className="cursor-pointer text-center text-sm sm:text-base font-medium bg-yellow-otto text-white rounded-3xl py-3 w-full sm:w-auto px-5 hover:brightness-95 transition-all flex items-center justify-center"
                    >
                        Historial de ventas
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="bg-graywhite rounded-3xl p-4 sm:p-6 lg:p-8 animate-pulse">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-6 w-48 bg-gray-200 rounded" />
                        <div className="h-10 w-40 bg-gray-200 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                                <div className="aspect-[4/3] bg-gray-100" />
                                <div className="p-4 flex flex-col gap-2">
                                    <div className="h-4 w-3/4 bg-gray-100 rounded" />
                                    <div className="h-4 w-1/2 bg-gray-100 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <ProductManagement
                    products={productos}
                    onEditarProducto={handleEditarProducto}
                    onProductosActualizados={cargarProductos}
                />
            )}
        </section>
    )
}
