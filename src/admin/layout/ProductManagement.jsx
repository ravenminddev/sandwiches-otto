import { useState, useMemo } from 'react';
import ProductList from "../components/ProductList";
import AddProduct from "./AddProduct";
import SearchBar from "../../shared/components/SearchBar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableCellsLarge, faTableCells } from '@fortawesome/free-solid-svg-icons';

function GridButton({ cols, onClick, className = '' }) {
    return (
        <button
            type='button'
            onClick={onClick}
            className={`cursor-pointer w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-yellow-otto hover:border-yellow-300 flex items-center justify-center transition-colors shrink-0 ${className}`}
            title={cols === 2 ? 'Vista de 3 columnas' : 'Vista de 2 columnas'}
        >
            <FontAwesomeIcon icon={cols === 2 ? faTableCellsLarge : faTableCells} className='text-sm' />
        </button>
    );
}

export default function ProductManagement({ products = [], onProductosActualizados }) {
    const [search, setSearch] = useState('');
    const [cols, setCols] = useState(() => window.innerWidth < 1024 ? 2 : 3);

    const productosFiltrados = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return products;
        return products.filter(producto =>
            producto.nombre_producto?.toLowerCase().includes(query)
        );
    }, [products, search]);

    const totalProductos = products.length;

    return (
        <section className="relative flex flex-col gap-6 bg-graywhite rounded-3xl p-4 sm:p-6 lg:p-8">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2 className="text-section-title">
                        Catálogo de productos
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {totalProductos === 0
                            ? 'Aún no hay productos'
                            : `${totalProductos} ${totalProductos === 1 ? 'producto' : 'productos'} en total`}
                    </p>
                </div>

                <div className="flex flex-col items-start sm:flex-row sm:items-center gap-3 w-full sm:w-auto lg:w-auto">
                    <GridButton cols={cols} onClick={() => setCols(c => c === 2 ? 3 : 2)} className='hidden lg:flex' />
                    <SearchBar value={search} onChange={setSearch} placeholder="Buscar producto..." />
                    <AddProduct onProductoAgregado={onProductosActualizados} />
                </div>
            </div>

            {totalProductos > 0 && productosFiltrados.length === 0 ? (
                <div className="text-center py-14 text-gray-500">
                    No se encontraron productos para "{search}"
                </div>
            ) : (
                <ProductList products={productosFiltrados} cols={cols} onProductosActualizados={onProductosActualizados} />
            )}
        </section>
    );
}
