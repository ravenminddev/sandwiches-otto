import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TONE_STYLES = {
    amber: { bg: 'bg-amber-50', icon: 'text-amber-500', ring: 'group-hover:ring-amber-200' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', ring: 'group-hover:ring-emerald-200' },
    sky: { bg: 'bg-sky-50', icon: 'text-sky-500', ring: 'group-hover:ring-sky-200' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-500', ring: 'group-hover:ring-violet-200' }
};

export default function StatCard({ icon, label, value, tone = 'amber', delay = 0 }) {
    const toneClasses = TONE_STYLES[tone] || TONE_STYLES.amber;

    return (
        <div
            className="group animate-fade-in-up bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border/80 p-4 sm:p-5 flex items-center gap-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl flex items-center justify-center ring-1 ring-transparent transition-all duration-300 ${toneClasses.bg} ${toneClasses.ring}`}>
                <FontAwesomeIcon icon={icon} className={toneClasses.icon} size="lg" />
            </div>
            <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400 truncate">{label}</p>
                <p className="text-lg sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-200 truncate">{value}</p>
            </div>
        </div>
    );
}
