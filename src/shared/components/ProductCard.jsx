export default function ProductCard({ img, name, price, description, actions, overlay, className = '' }) {
    const formattedPrice = Number(price || 0).toLocaleString('es-CO');

    return (
        <section className={`relative h-full flex flex-col rounded-2xl bg-white dark:bg-card overflow-hidden pb-4 ring-1 ring-gray-100 hover:ring-yellow-400 transition-all duration-300 ${className}`}>
            <div className="relative w-full shrink-0">
                <img
                    src={img}
                    alt={name}
                    className="w-full h-auto aspect-4/3 object-cover"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                />
                <div className="hidden absolute inset-0 items-center justify-center bg-gray-50 dark:bg-zinc-800/50 text-3xl" aria-hidden="true">
                    🍽️
                </div>
                {overlay}
            </div>

            <div className="flex-1 flex flex-col items-center justify-between pt-3 px-3 gap-1">
                {price != null && (
                    <p className="text-yellow-otto font-extrabold text-lg sm:text-xl leading-none mb-1">
                        ${formattedPrice}
                    </p>
                )}
                <h3 className="text-item-title text-center leading-tight line-clamp-2 min-h-8 sm:min-h-10">
                    {name}
                </h3>
                {description && (
                    <p className="text-xs text-gray-400 dark:text-zinc-500 text-center leading-snug line-clamp-2 w-full max-w-[90%]">
                        {description}
                    </p>
                )}
            </div>

            {actions && (
                <div className="flex justify-center items-center gap-2 mt-5">
                    {actions}
                </div>
            )}
        </section>
    );
}
