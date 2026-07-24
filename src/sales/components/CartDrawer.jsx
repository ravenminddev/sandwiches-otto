import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default function CartDrawer({ show, onClose, children }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[90dvh] overflow-y-auto bg-white rounded-t-2xl shadow-xl animate-slide-up">
                <div className="sticky top-0 bg-white pt-4 pb-2 px-4 flex justify-between items-center border-b z-10 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-gray-900">Carrito</h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-xl text-gray-600" />
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
