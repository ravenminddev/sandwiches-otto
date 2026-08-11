export default function InputBasic({type, placeholder, name, value, onChange, id, defaultValue}){
    return(
        <input
            type={type}
            placeholder={placeholder}
            name={name}
            value={value}
            onChange={onChange}
            id={id}
            defaultValue={defaultValue}
            className='w-full rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-[#2a2a2a] px-4 py-3 text-sm sm:text-base text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 shadow-sm transition-all duration-200 outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/15 hover:border-gray-300 dark:border-border-strong'
        />
    )
}