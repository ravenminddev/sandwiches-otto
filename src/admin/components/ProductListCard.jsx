import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faPen, faTrash, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function ProductListCard({ product, onDelete, isDeleting }) {
    const { id_producto, nombre: name, url_imagen: img, precio: price, descripcion: description } = product;
    const formattedPrice = Number(price || 0).toLocaleString('es-CO');
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const closeMenu = useCallback(() => setMenuOpen(false), []);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e) => {
            if (!menuRef.current?.contains(e.target)) closeMenu();
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') closeMenu();
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [menuOpen, closeMenu]);

    return (
        <article
            className={`group relative h-full flex flex-col bg-white dark:bg-card rounded-2xl overflow-hidden ring-1 ring-dash-border/80 dark:ring-zinc-700/80 shadow-sm transition-[box-shadow,transform,ring-color] duration-200 ease-linear hover:shadow-lg hover:-translate-y-1 hover:ring-yellow-otto/40 active:scale-[0.98] ${
                isDeleting ? 'opacity-50 pointer-events-none' : ''
            }`}
        >
            <div className="relative bg-graywhite dark:bg-zinc-800/70 p-2">
                <div className="relative w-full aspect-[5/4] rounded-xl overflow-hidden bg-gray-100/60 dark:bg-zinc-700/60">
                    <img
                        src={img}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-opacity duration-150 ease-linear"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center text-3xl text-dash-gray-soft/60 dark:text-zinc-500/60" aria-hidden="true">
                        🍽️
                    </div>
                </div>

                {/* Menú de acciones ⋮ */}
                <div className="absolute top-3.5 right-3.5" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen(v => !v)}
                        aria-label={`Opciones de ${name}`}
                        aria-expanded={menuOpen}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-white/90 dark:bg-zinc-800/90 text-dash-gray dark:text-zinc-400 shadow-sm ring-1 ring-dash-border/60 dark:ring-zinc-700/60 transition-all duration-200 hover:text-dash-ink dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-700 active:scale-90"
                    >
                        <FontAwesomeIcon icon={faEllipsisVertical} className="text-sm" />
                    </button>

                    {menuOpen && (
                        <div className="absolute top-full right-0 mt-1.5 bg-white dark:bg-card rounded-xl shadow-lg shadow-black/8 ring-1 ring-dash-border/80 dark:ring-zinc-700/80 py-1 w-max overflow-hidden z-10 animate-rise origin-top-right">
                            <Link
                                to={`/sales/admin/editProduct/${id_producto}`}
                                onClick={closeMenu}
                                className="flex items-center gap-2 px-2.5 py-2 text-sm text-dash-ink dark:text-zinc-300 hover:bg-yellow-otto/10 transition-colors"
                            >
                                <FontAwesomeIcon icon={faPen} className="text-xs text-yellow-otto" />
                                Editar
                            </Link>
                            <button
                                type="button"
                                onClick={() => { closeMenu(); onDelete?.(); }}
                                disabled={isDeleting}
                                className={`w-full flex items-center gap-2 px-2.5 py-2 text-sm transition-colors ${
                                    isDeleting
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-dash-red dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer'
                                }`}
                            >
                                <FontAwesomeIcon icon={isDeleting ? faSpinner : faTrash} className={`text-xs ${isDeleting ? 'animate-spin' : ''}`} />
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 px-2.5 pb-2.5 pt-1 flex flex-col">
                <h3 className="text-[13px] font-medium leading-snug line-clamp-2 text-gray-900 dark:text-zinc-100">
                    {name}
                </h3>
                <p className="text-[13px] font-medium text-dash-gray dark:text-zinc-400 mt-0.5">
                    ${formattedPrice}
                </p>
                {description && (
                    <p className="text-[11px] leading-snug line-clamp-2 text-dash-gray-soft dark:text-zinc-500 mt-1">
                        {description}
                    </p>
                )}
            </div>
        </article>
    );
}
