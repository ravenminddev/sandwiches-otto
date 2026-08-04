import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import ProductList from "../components/ProductList";
import AddProduct from "./AddProduct";

export default function ProductManagement({ products = [], onProductosActualizados }) {
    const [search, setSearch] = useState('');

    const query = search.trim().toLowerCase();

    const productosFiltrados = useMemo(() => {
        if (!query) return products;
        return products.filter(producto =>
            producto.nombre?.toLowerCase().includes(query)
        );
    }, [products, query]);

    const totalProductos = products.length;

    return (
        <section className="relative flex flex-col gap-5 pb-24">

            <div className="flex flex-col gap-3 animate-rise">
                <div className="inline-flex items-center gap-2">
                    <h2 className="text-[22px] sm:text-[24px] font-bold text-gray-900 dark:text-zinc-100">
                        Catálogo
                    </h2>
                    {totalProductos > 0 && (
                        <span className="text-xs font-medium bg-yellow-otto/10 text-yellow-otto rounded-full px-2.5 py-1 leading-none">
                            {totalProductos}
                        </span>
                    )}
                </div>

                <div className="relative">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dash-gray-soft dark:text-zinc-400 text-sm pointer-events-none"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar producto..."
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-input border border-dash-border/60 dark:border-border/60 text-[13px] text-dash-ink dark:text-zinc-100 placeholder:text-dash-gray-soft dark:placeholder:text-zinc-500 focus:outline-none focus:border-yellow-otto focus:ring-2 focus:ring-yellow-otto/15 transition-all"
                    />
                </div>
            </div>

            {totalProductos > 0 && productosFiltrados.length === 0 ? (
                <div className="text-center py-14 text-dash-gray dark:text-zinc-400 animate-fade-in">
                    No se encontraron productos para &quot;{search}&quot;
                </div>
            ) : (
                <ProductList
                    products={productosFiltrados}
                    flat={query.length > 0}
                    search={search.trim()}
                    onProductosActualizados={onProductosActualizados}
                />
            )}

            <AddProduct onProductoAgregado={onProductosActualizados} />
        </section>
    );
}
