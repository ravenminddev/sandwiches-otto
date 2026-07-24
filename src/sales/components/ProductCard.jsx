import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import BaseProductCard from '../../shared/components/ProductCard.jsx';

export default function ProductCard({ product, quantityInCart = 0 }) {
    const isSelected = quantityInCart > 0;

    return (
        <BaseProductCard
            img={product.img}
            name={product.name}
            price={product.precio}
            className={isSelected ? 'ring-2 ring-yellow-otto bg-yellow-50' : 'cursor-pointer active:scale-95'}
            actions={
                <button
                    type="button"
                    aria-label={isSelected ? 'Producto agregado' : 'Agregar producto'}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                        isSelected
                            ? 'bg-green-500 text-white scale-100'
                            : 'bg-yellow-otto text-white hover:scale-110'
                    }`}
                >
                    <FontAwesomeIcon
                        icon={isSelected ? faCheck : faPlus}
                        className="text-sm"
                    />
                </button>
            }
            overlay={
                <>
                    {isSelected && (
                        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                    )}
                    {isSelected && (
                        <div className="absolute top-2 left-2 bg-yellow-otto text-white text-xs font-bold rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center shadow-md ring-2 ring-white animate-pop">
                            {quantityInCart}
                        </div>
                    )}
                </>
            }
        />
    );
}
