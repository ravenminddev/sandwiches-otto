import { NavLink, useNavigate, useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faRightFromBracket, faCog, faClockRotateLeft, faCircleDollarToSlot, faCashRegister, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../lib/hooks/useAuth.js';
import { useTheme } from '../../lib/context/ThemeContext.jsx';
import alertDecision from '../../utils/alertDecision.js';
import logoOtto from '@/assets/logo.png';
import { useEffect, useState } from 'react';

const routeToActive = {
    '/sales/': 'registrar',
    '/sales/money': 'ventas',
    '/sales/history': 'historial',
    '/sales/admin': 'admin',
};

export default function Sidebar({ className, isDimmed }) {
    const { userData } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isAdmin = userData?.id_rol === 1;
    const location = useLocation();
    const [isActive, setIsActive] = useState(() => routeToActive[location.pathname] || 'registrar');

    const navigate = useNavigate();

    useEffect(() => {
        const active = routeToActive[location.pathname];
        if (active) setIsActive(active);
    }, [location.pathname]);

    //BACKEND: logica para cerrar sesión
    const handleClose = async (e) => {
        e.preventDefault();

        const result = await alertDecision(
            '¿DESEA CERRAR SESIÓN?',
            'Presione confirmar para completar proceso',
            'info',
            'Cerrar sesión',
            'Cancelar'
        )

        if(result.isConfirmed){
            navigate('/');
        }else{
            navigate('/sales')
        }
    }

    return (
        <nav className={`flex flex-col bg-card text-main items-center justify-between z-100 h-dvh sticky top-0 py-[4vh] gap-y-[3vh] border-r border-border font-medium text-[clamp(0.75rem,1vw,1rem)] ${className}`}>

            <div className="flex flex-col items-center gap-2">
                <button
                    type="button"
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                    className="cursor-pointer w-16 h-16 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow ring-1 ring-border"
                >
                    <img src={logoOtto} alt="Logo Otto" className="w-14 h-14 select-none pointer-events-none" />
                </button>
                <button
                    type="button"
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                    className="cursor-pointer text-sm text-muted hover:text-yellow-otto transition-colors"
                >
                    <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="w-4" />
                </button>
            </div> 

            <div className={'flex flex-col gap-y-3 w-full'}>

                <NavLink to='/sales/' onClick={()=>(setIsActive('registrar'))}>
                    <div className={` ${isActive==='registrar'?'bg-yellow-otto/20 pl-4':''} group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-yellow-otto/10 hover:pl-4 `}>
                        <FontAwesomeIcon 
                            icon={faCashRegister} 
                            className={`w-5 shrink-0 text-black/70 dark:text-zinc-400 transition-colors duration-200 group-hover:text-yellow-otto ${isActive==='registrar'?'text-yellow-otto':''}`}
                        />
                        <span className={`text-muted dark:text-zinc-300 transition-colors duration-200 group-hover:text-yellow-otto ${isActive==='registrar'?'text-yellow-otto':''}`}>Registrar</span>
                    </div>
                </NavLink>

                <NavLink to='/sales/money' onClick={() => setIsActive('ventas')}>
                    <div className={`${isActive === 'ventas' ? 'bg-yellow-otto/20 pl-4' : ''} group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-yellow-otto/10 hover:pl-4`}>
                        <FontAwesomeIcon
                            icon={faCircleDollarToSlot}
                            className={`w-5 shrink-0 text-black/70 dark:text-zinc-400 transition-colors duration-200 group-hover:text-yellow-otto ${isActive === 'ventas' ? 'text-yellow-otto' : ''}`}
                        />
                        <span className={`text-muted dark:text-zinc-300 transition-colors duration-200 group-hover:text-yellow-otto ${isActive === 'ventas' ? 'text-yellow-otto font-medium' : ''}`}>
                            Ventas
                        </span>
                    </div>
                </NavLink>

                <NavLink to='/sales/history' onClick={() => setIsActive('historial')}>
                    <div className={`${isActive === 'historial' ? 'bg-yellow-otto/20 pl-4' : ''} group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-yellow-otto/10 hover:pl-4`}>
                        <FontAwesomeIcon
                            icon={faClockRotateLeft}
                            className={`w-5 shrink-0 text-black/70 dark:text-zinc-400 transition-colors duration-200 group-hover:text-yellow-otto ${isActive === 'historial' ? 'text-yellow-otto' : ''}`}
                        />
                        <span className={`text-muted dark:text-zinc-300 transition-colors duration-200 group-hover:text-yellow-otto ${isActive === 'historial' ? 'text-yellow-otto font-medium' : ''}`}>
                            Historial
                        </span>
                    </div>
                </NavLink>

                {isAdmin && (
                    <NavLink to='/sales/admin' onClick={() => setIsActive('admin')}>
                        <div className={`${isActive === 'admin' ? 'bg-yellow-otto/20 pl-4' : ''} group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-yellow-otto/10 hover:pl-4`}>
                            <FontAwesomeIcon
                                icon={faCog}
                                className={`w-5 shrink-0 text-black/70 dark:text-zinc-400 transition-colors duration-200 group-hover:text-yellow-otto ${isActive === 'admin' ? 'text-yellow-otto' : ''}`}
                            />
                            <span className={`text-muted dark:text-zinc-300 transition-colors duration-200 group-hover:text-yellow-otto ${isActive === 'admin' ? 'text-yellow-otto font-medium' : ''}`}>
                                Admin
                            </span>
                        </div>
                    </NavLink>
                )}
            </div>

            <div className='w-full'>
                <button 
                    type='button' 
                    onClick={handleClose} 
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-yellow-otto/10 hover:pl-4 w-full`}
                >
                    <FontAwesomeIcon 
                        icon={faRightFromBracket} 
                        className='w-5 shrink-0 text-black/70 dark:text-zinc-400 transition-colors duration-200 group-hover:text-yellow-otto' 
                    />
                    <span className='text-muted dark:text-zinc-300 transition-colors duration-200 group-hover:text-yellow-otto'>Salir</span>
                </button>
            </div>

        </nav>
    );
}