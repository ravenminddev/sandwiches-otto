export default function PrimaryButton({text,type, onClick}){
    return(
        <button
            type={type}
            onClick={onClick}
            className='cursor-pointer bg-yellow-otto text-white font-medium text-sm sm:text-base rounded-md py-3 px-4 w-full hover:brightness-95 transition-all'
        >
            {text}
        </button>
    )
}