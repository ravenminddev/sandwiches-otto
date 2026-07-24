import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import BaseProductCard from '../../shared/components/ProductCard.jsx';

export default function ProductListCard({ id, name, img, price, onDelete, isDeleting }) {
    return (
        <BaseProductCard
            img={img}
            name={name}
            price={price}
            className={isDeleting ? 'opacity-50 pointer-events-none' : ''}
            actions={
                <>
                    <Link
                        to={`/sales/admin/editProduct/${id}`}
                        aria-label={`Editar ${name}`}
                        title="Editar producto"
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-yellow-otto text-white shadow-md hover:scale-110 transition-all duration-300"
                    >
                        <FontAwesomeIcon icon={faPen} className="text-sm" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => onDelete?.()}
                        disabled={isDeleting}
                        aria-label={`Eliminar ${name}`}
                        title="Eliminar producto"
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                            isDeleting
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:scale-110'
                        }`}
                    >
                        <FontAwesomeIcon icon={isDeleting ? faSpinner : faTrash} className={`text-sm ${isDeleting ? 'animate-spin' : ''}`} />
                    </button>
                </>
            }
        />
    );
}
