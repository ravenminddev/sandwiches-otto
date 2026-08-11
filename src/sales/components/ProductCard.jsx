import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';

export default function ProductCard({ product, quantityInCart = 0 }) {
    const isSelected = quantityInCart > 0;
    const formattedPrice = Number(product.precio || 0).toLocaleString('es-CO');

    return (
        <article
            className={`group relative h-full flex flex-col bg-white dark:bg-card rounded-2xl overflow-hidden ring-1 ring-dash-border/80 dark:ring-zinc-700/80 shadow-sm transition-[box-shadow,transform,ring-color] duration-200 ease-linear hover:shadow-lg hover:-translate-y-1 hover:ring-yellow-otto/40 active:scale-[0.98] ${
                isSelected ? 'ring-2 ring-yellow-otto bg-yellow-50/60' : ''
            }`}
        >
            <div className="relative bg-graywhite dark:bg-zinc-800/70 p-2">
                <div className="relative w-full aspect-[5/4] rounded-xl overflow-hidden bg-gray-100/60 dark:bg-zinc-700/60">
                    <img
                        src={product.img}
                        alt={product.name}
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

                    {isSelected && (
                        <div className="absolute inset-0 bg-yellow-otto/10" />
                    )}

                    {isSelected && (
                        <div className="absolute top-2 left-2 bg-yellow-otto text-white text-xs font-bold rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center shadow-md ring-2 ring-white animate-pop">
                            {quantityInCart}
                        </div>
                    )}

                    <button
                        type="button"
                        aria-label={isSelected ? 'Producto agregado' : 'Agregar producto'}
                        className={`absolute bottom-2 right-2 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 active:scale-90 ${
                            isSelected
                                ? 'bg-green-500 text-white'
                                : 'bg-yellow-otto text-white hover:bg-yellow-600'
                        }`}
                    >
                        <FontAwesomeIcon
                            icon={isSelected ? faCheck : faPlus}
                            className="text-sm"
                        />
                    </button>
                </div>
            </div>

            <div className="flex-1 px-2.5 pb-2.5 pt-1 flex flex-col">
                <h3 className="text-[13px] font-medium leading-snug line-clamp-2 text-gray-900 dark:text-zinc-100">
                    {product.name}
                </h3>
                <p className="text-[13px] font-medium text-dash-gray dark:text-zinc-400 mt-0.5">
                    ${formattedPrice}
                </p>
                {product.descripcion && (
                    <p className="text-[11px] leading-snug line-clamp-2 text-dash-gray-soft dark:text-zinc-500 mt-1">
                        {product.descripcion}
                    </p>
                )}
            </div>
        </article>
    );
}
