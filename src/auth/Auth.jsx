import logoOtto from '@/assets/logo.png';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import alertPop from '@/utils/alertPop.js';
import InputBasic from '../shared/components/InputBasic';
import AnimatedPattern from './AnimatedPattern';

export default function Auth() {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const { loginStep1, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!emailOrUsername || !password) {
            await alertPop('ERROR', 'Por favor completa todos los campos', 'error', 'Continuar');
            return;
        }

        const result = await loginStep1(emailOrUsername, password);

        if (result.success) {
            await alertPop('ÉXITO', 'Inicio de sesión exitoso', 'success', 'Continuar').then(() => {
        navigate('/sales');
    });
        } else {
            await alertPop('ERROR', result.error, 'error', 'Continuar');
        }
    };

    return (
        <div className='w-full min-h-dvh grid portrait:grid-cols-1 portrait:grid-rows-[minmax(160px,26vh)_1fr] landscape:grid-cols-2 justify-center landscape:items-center portrait:items-start'>
            <section className='flex items-center justify-center relative bg-yellow-otto-light w-full h-full portrait:rounded-b-[2.5rem] landscape:rounded-r-3xl shadow-[0_4px_50px_7px_rgba(0,0,0,0.25)] overflow-hidden'>
                <AnimatedPattern/>
                <img
                    src={logoOtto}
                    alt='Logo Otto'
                    className='aspect-square w-[clamp(8rem,55vw,14rem)] landscape:w-[clamp(12rem,30vw+10vh,40rem)] max-w-md h-auto max-md:landscape:w-50 object-fit drop-shadow-black z-10 select-none pointer-events-none'
                />
            </section>

            <section className='px-9 py-4 sm:py-7 md:py-10 lg:py-14 w-full grid max-w-2xl gap-3 items-center text-[clamp(0.6rem,calc(1vw+1vh),1rem)] max-md:landscape:py-3 justify-self-center portrait:mt-10'>

                <div className='flex flex-col items-center justify-center mb-4 sm:mb-10'>
                    <h1 className='text-page-title text-center'>
                        BIENVENIDO/A
                    </h1>
                    <h2 className='text-page-subtitle text-center'>¡Otto te da una cálida bienvenida!</h2>
                </div>

                <form className='flex flex-col w-full gap-3 sm:gap-6 px-5 sm:px-10' onSubmit={handleLogin}>
                    <div className='flex flex-col gap-2'>
                        <label className='font-semibold text-gray-800' htmlFor='emailOrUsername'>
                            Correo electrónico o Usuario
                        </label>
                        <InputBasic 
                            type={'text'} 
                            placeholder={"Ingresa tu correo electrónico o usuario"} 
                            value={emailOrUsername} 
                            onChange={(e) => setEmailOrUsername(e.target.value)}
                            id='emailOrUsername'
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='font-semibold text-gray-800' htmlFor='password'>
                            Contraseña
                        </label>
                        <InputBasic 
                            type={'password'} 
                            placeholder={"Ingresa tu contraseña"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            id='password'
                        />
                    </div>
                    
                    <div className='flex justify-center items-center w-full mt-10'>
                        <button 
                            type='submit'
                            disabled={loading}
                            className='bg-black text-white font-medium rounded-3xl py-4 sm:py-5 md:py-7 w-full max-w-64 sm:max-w-57.5 hover:brightness-95 transition-all
                                        h-auto flex justify-center items-center cursor-pointer disabled:opacity-50'
                        >
                            {loading ? 'Cargando...' : 'Iniciar sesión'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}