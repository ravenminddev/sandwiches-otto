export default function SearchBar({ value, onChange, placeholder = 'Buscar producto...' }) {
    return (
        <div className='w-full flex justify-center'>
            <div className='w-full max-w-md flex items-center border border-gray-300 dark:border-border-strong rounded-3xl px-4 py-2.5 text-sm focus-within:ring-yellow-500/15 focus-within:border-yellow-500 focus-within:ring-4 transition-shadow bg-white dark:bg-card'>
                <svg
                    className='w-4 h-4 text-gray-400 dark:text-zinc-500 mr-3 shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
                <input
                    type='text'
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className='w-full bg-transparent p-0 m-0 focus:outline-none'
                />
            </div>
        </div>
    );
}