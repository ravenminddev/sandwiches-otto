import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ProductRankingCard({ title, icon, items, tone = 'good' }) {
    const toneClasses = tone === 'good'
        ? { badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-500' }
        : { badge: 'bg-red-100 text-red-700', icon: 'text-red-500' };

    return (
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border/80 shadow-sm p-4 sm:p-6 flex flex-col h-full transition-shadow duration-300 hover:shadow-md">
            <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={icon} className={toneClasses.icon} />
                <h3 className="text-card-title">{title}</h3>
            </div>

            {items.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">Sin datos suficientes todavía</p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {items.map((item, i) => (
                        <li key={item.nombre} className="flex items-center gap-3">
                            <span className={`shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${toneClasses.badge}`}>
                                {i + 1}
                            </span>
                            <span className="flex-1 min-w-0 truncate text-sm sm:text-base text-slate-700 dark:text-zinc-300">{item.nombre}</span>
                            <span className="shrink-0 text-sm sm:text-base font-bold text-slate-800 dark:text-zinc-200">{item.cantidad} u.</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
