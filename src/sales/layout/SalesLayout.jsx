import { Outlet, useNavigate, useLocation } from 'react-router';
import ottoLogo from '@/assets/logo.png';
import Sidebar from './Sidebar';
import { useState, useRef, useEffect, useCallback } from 'react';
import ShoppingCart from '../components/ShoppingCart.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faBars, faCashRegister, faCircleDollarToSlot, faClockRotateLeft, faCog, faRightFromBracket, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../lib/hooks/useAuth.js';
import { useTheme } from '../../lib/context/ThemeContext.jsx';
import alertDecision from '../../utils/alertDecision.js';
import { ModalProvider, useModal } from '../../lib/context/ModalContext.jsx';

function DrawerLink({ icon, label, path, onClick, onAction }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = path && location.pathname === path;
    const handleClick = () => {
        onClick();
        if (onAction) {
            onAction();
        } else {
            navigate(path);
        }
    };
    return (
        <button
            onClick={handleClick}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors font-medium ${
                isActive
                    ? 'bg-yellow-otto/20 text-yellow-otto'
                    : 'hover:bg-yellow-otto/10 text-gray-700 dark:text-zinc-300 dark:hover:text-zinc-100'
            }`}
        >
            <FontAwesomeIcon icon={icon} className={`w-5 ${isActive ? 'text-yellow-otto' : 'text-gray-500 dark:text-zinc-400'}`} />
            <span>{label}</span>
        </button>
    );
}

function SalesLayoutInner() {
    const { isModalOpen } = useModal();
    const location = useLocation();
    const isRegisterRoute = location.pathname === '/sales/' || location.pathname === '/sales';
    const isAdminRoute = location.pathname.startsWith('/sales/admin');
    const [carrito, setCarrito] = useState([]);
    const hasDesktopCart = isRegisterRoute && carrito.length > 0;
    const [showCart, setShowCart] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const { userData } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isAdmin = userData?.id_rol === 1;
    const [navbarHidden, setNavbarHidden] = useState(false);
    const lastScrollY = useRef(0);

    const handleScroll = useCallback(() => {
        if (showMobileSidebar) {
            setNavbarHidden(false);
            return;
        }
        const currentScrollY = window.scrollY;
        if (currentScrollY <= 10) {
            setNavbarHidden(false);
        } else if (currentScrollY > lastScrollY.current) {
            setNavbarHidden(true);
        } else {
            setNavbarHidden(false);
        }
        lastScrollY.current = currentScrollY;
    }, [showMobileSidebar]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const agregarAlCarrito = (producto) => {
        const existe = carrito.find(item => item.id === producto.id);

        if (existe) {
            setCarrito(carrito.map(item =>
                item.id === producto.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            setCarrito([...carrito, { ...producto, cantidad: 1 }]);
        }
    };

    const aumentarCantidad = (id) => {
        setCarrito(carrito.map(item =>
            item.id === id
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
        ));
    };

    const disminuirCantidad = (id) => {
        setCarrito(carrito.map(item =>
            item.id === id && item.cantidad > 1
                ? { ...item, cantidad: item.cantidad - 1 }
                : item
        ).filter(item => item.cantidad > 0));
    };

    const eliminarDelCarrito = (id) => {
        setCarrito(carrito.filter(item => item.id !== id));
    };

    const limpiarCarrito = () => {
        setCarrito([]);
        setShowCart(false);
    };

    const handleLogout = async () => {
        const result = await alertDecision(
            '¿DESEA CERRAR SESIÓN?',
            'Presione confirmar para completar proceso',
            'info',
            'Cerrar sesión',
            'Cancelar'
        );
        if (result.isConfirmed) {
            window.location.href = '/';
        }
    };

    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    return (
        <div className="grid [grid-template-areas:'sidebar_main'] grid-cols-[clamp(70px,12vw,150px)_1fr] max-lg:[grid-template-areas:'main'] max-lg:grid-cols-1 min-h-dvh">

            {/* ── Mobile navbar (full-width, integrated) ── */}
            <div className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    navbarHidden || isModalOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
                }`}>
                <nav
                    className="bg-white dark:bg-card rounded-2xl shadow-lg flex items-center justify-between px-4 h-20"
                >
                    <button
                        onClick={() => setShowMobileSidebar(true)}
                        className={`text-2xl transition-colors ${showMobileSidebar ? 'text-yellow-otto' : 'text-gray-700 dark:text-zinc-300'}`}
                        aria-label="Abrir menú"
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                            className="cursor-pointer text-muted hover:text-yellow-otto transition-colors"
                        >
                            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="text-lg" />
                        </button>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                            className="cursor-pointer"
                        >
                            <img src={ottoLogo} alt="Otto" className="w-16 h-16 select-none" />
                        </button>
                    </div>
                    </div>
                </nav>
            </div>

            {/* ── Mobile dropdown drawer (expands downward from navbar) ── */}
            <div
                className={`lg:hidden fixed left-0 right-0 z-40 bg-white dark:bg-card rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
                    showMobileSidebar
                        ? 'max-h-[75dvh] opacity-100 translate-y-0'
                        : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
                }`}
                style={{ top: '4rem' }}
            >
                <div className="p-4 space-y-1">
                    <DrawerLink icon={faCashRegister} label="Registrar" path="/sales" onClick={() => setShowMobileSidebar(false)} />
                    <DrawerLink icon={faCircleDollarToSlot} label="Ventas" path="/sales/money" onClick={() => setShowMobileSidebar(false)} />
                    <DrawerLink icon={faClockRotateLeft} label="Historial" path="/sales/history" onClick={() => setShowMobileSidebar(false)} />
                    {isAdmin && (
                        <DrawerLink icon={faCog} label="Admin" path="/sales/admin" onClick={() => setShowMobileSidebar(false)} />
                    )}
                    <hr className="my-2 border-gray-200 dark:border-border" />
                    <DrawerLink icon={faRightFromBracket} label="Salir" onClick={() => setShowMobileSidebar(false)} onAction={handleLogout} />
                </div>
            </div>

            {showMobileSidebar && (
                <div
                    className="lg:hidden fixed inset-0 z-30 bg-black/50"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}
            <Sidebar className='max-lg:hidden [grid-area:sidebar]' />

            <main className='[grid-area:main] w-full px-4 sm:px-6 lg:px-10 lg:py-10 max-lg:pt-20 max-lg:pb-10 overflow-y-auto relative'>
                <div className="flex w-full relative z-10">
                    <div className={`transition-all duration-700 ease-out ${hasDesktopCart ? 'lg:w-2/3 lg:pr-6' : 'lg:w-full lg:pr-0'}`}>
                        <Outlet context={{ agregarAlCarrito, carrito }} />
                    </div>
                    <div
                        className={`hidden lg:block transition-all duration-700 ease-out overflow-hidden ${
                            hasDesktopCart ? 'lg:w-1/3 translate-y-0 opacity-100' : 'lg:w-0 translate-y-12 opacity-0 pointer-events-none'
                        }`}
                    >
                        <ShoppingCart
                            carrito={carrito}
                            onAumentar={aumentarCantidad}
                            onDisminuir={disminuirCantidad}
                            onEliminar={eliminarDelCarrito}
                            onRegistroExitoso={limpiarCarrito}
                        />
                    </div>
                </div>
            </main>

            {(totalItems > 0 && !showCart) || isModalOpen || isAdminRoute ? (
                <button
                    onClick={() => setShowCart(true)}
                    className={`cursor-pointer lg:hidden fixed bottom-6 right-6 z-40 bg-yellow-otto text-white p-4 rounded-full shadow-lg hover:brightness-95 transition-all duration-[2000ms] active:scale-90 ${
                        isModalOpen || isAdminRoute ? 'translate-y-40 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
                    }`}
                    aria-label="Abrir carrito"
                >
                    <FontAwesomeIcon icon={faCartShopping} className="text-2xl" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-6 h-6 flex items-center justify-center shadow-md">
                        {totalItems}
                    </span>
                </button>
            ) : null}

            <CartDrawer show={showCart} onClose={() => setShowCart(false)}>
                <ShoppingCart
                    carrito={carrito}
                    onAumentar={aumentarCantidad}
                    onDisminuir={disminuirCantidad}
                    onEliminar={eliminarDelCarrito}
                    onRegistroExitoso={limpiarCarrito}
                />
            </CartDrawer>

            <div
                className="fixed top-[10dvh] left-[clamp(70px,10vw,90px)] max-lg:left-0 right-0 bottom-0 bg-no-repeat bg-center
                        opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `url(${ottoLogo})`,
                    backgroundSize: 'calc(27vw + 27vh)'
                }}
            />
        </div>
    );
}

export default function SalesLayout() {
    return (
        <ModalProvider>
            <SalesLayoutInner />
        </ModalProvider>
    );
}
