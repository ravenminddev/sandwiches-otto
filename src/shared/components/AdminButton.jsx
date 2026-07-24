export default function AdminButton({text, onClick}){

    const bgColor = text.toLowerCase()==='eliminar'?'bg-[#FF2323]':'bg-blue-600';

    return(
        <button
            type={'button'}
            onClick={onClick}
            className={`cursor-pointer ${bgColor} text-white font-medium text-sm sm:text-base rounded-md py-3 px-6 hover:brightness-95 transition-all`}
        >
            {text}
        </button>
    )
}