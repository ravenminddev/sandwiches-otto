import { Link } from 'react-router';

/*Sin uso temporalmente*/
export default function Register() {
    return (
        <section className='bg-white rounded-[3rem] shadow-2xl px-2 py-6 sm:py-7 md:py-10 lg:py-14 w-full grid max-w-2xl gap-3 
                                        items-center text-[clamp(0.6rem,calc(1vw+1vh),1rem)] max-md:landscape:py-3 justify-self-center'>
            <div className='flex flex-col items-center justify-center'>
                <h1 className='text-page-title text-center'>Registro</h1>
                <h2 className='text-page-subtitle text-center'>¡Crea tu nuevo usuario!</h2>
            </div>
            <div className='flex flex-col items-center gap-y-2 sm:gap-y-5 px-5 sm:px-10'>
                <form className='flex flex-col w-full gap-3 sm:gap-6'>
                    <div className='flex flex-col gap-2'>
                        <label className='font-semibold text-gray-800'>
                            Correo electrónico
                        </label>
                        <input
                            type='email'
                            placeholder='Ingresa tu correo electrónico'
                            className='w-full rounded-md border border-gray-300 px-2 py-3 text-gray-700 placeholder-gray-400 
                                    focus:outline-none focus:ring-2 focus:ring-yellow-500 h-8 sm:h-10 md:h-13 max-md:landscape:h-10'
                        />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='font-semibold text-gray-800'>
                            Contraseña
                        </label>
                        <input
                            type='password'
                            placeholder='Ingresa tu contraseña'
                            className='w-full rounded-md border border-gray-300 px-2 py-3 text-gray-700 placeholder-gray-400 focus:outline-none 
                                    focus:ring-2 focus:ring-yellow-500 h-8 sm:h-10 md:h-13 max-md:landscape:h-10'
                        />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='font-semibold text-gray-800'>
                            Confirmar contraseña
                        </label>
                        <input
                            type='password'
                            placeholder='Confirma tu contraseña'
                            className='w-full rounded-md border border-gray-300 px-2 py-3 text-gray-700 placeholder-gray-400 focus:outline-none 
                                    focus:ring-2 focus:ring-yellow-500 h-8 sm:h-10 md:h-13 max-md:landscape:h-10'
                        />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='font-semibold text-gray-800'>
                            Código de verificación
                        </label>
                        <input
                            type='text'
                            placeholder='Código proporcionado por el administrador'
                            className='w-full rounded-md border border-gray-300 px-2 py-3 text-gray-700 placeholder-gray-400 focus:outline-none 
                                    focus:ring-2 focus:ring-yellow-500 h-8 sm:h-10 md:h-13 max-md:landscape:h-10'
                        />
                    </div>

                    <Link to='/sales'>
                        <button
                            type='submit'
                            className='bg-yellow-otto text-white font-medium rounded-md py-3 w-full hover:brightness-95 transition-all
                                        h-8 sm:h-8 md:h-11 max-md:landscape:h-10 flex justify-center items-center cursor-pointer'
                        >
                            Registrarse
                        </button>
                    </Link>
                </form>
                <p className='text-gray-400'>¿Ya tienes cuenta? <Link to='/auth'><span className='text-yellow-otto underline cursor-pointer'>Inicia sesión aquí</span></Link></p>
            </div>
        </section>
    );
}