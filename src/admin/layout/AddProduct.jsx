import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { uploadImageToCloudinary, validateImage } from '../../lib/services/cloudinary/cloudinary.js';
import { createProduct } from '../../lib/services/products.js';
import { getAllCategories } from '../../lib/services/categories.js';
import alertPop from '@/utils/alertPop.js';
import { useModal } from '../../lib/context/ModalContext.jsx';

const initialFormData = {
    nombre_producto: '',
    descripcion: '',
    precio: '',
    id_categoria: '',
    ingredientes: '',
    disponible: true
};

const inputClass = 'w-full rounded-xl border border-dash-border dark:border-border bg-white dark:bg-input px-4 py-3 text-sm sm:text-base text-dash-ink dark:text-zinc-100 placeholder-dash-gray-soft dark:placeholder:text-zinc-500 shadow-sm transition-all duration-200 outline-none focus:border-yellow-otto focus:ring-4 focus:ring-yellow-otto/15 dark:focus:border-yellow-otto hover:border-dash-gray-soft dark:hover:border-zinc-500';

const labelClass = 'text-sm font-semibold text-dash-gray dark:text-zinc-300';

export default function AddProduct({ onProductoAgregado }) {
    const { openModal, closeModal } = useModal();
    const FormRef = useRef(null);
    const inputRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categorias, setCategorias] = useState([]);

    const [formData, setFormData] = useState(initialFormData);

    // Cargar categorías al montar
    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const result = await getAllCategories(false);
                if (result.success) {
                    setCategorias(result.data);
                } else {
                    await alertPop('ERROR', 'No se pudieron cargar las categorías', 'error', 'Continuar');
                }
            } catch {
                // Silenciado: si falla la carga de categorías, el formulario sigue
                // usable, solo el selector queda vacío.
            }
        };
        cargarCategorias();
    }, []);

    // Notificar al layout cuando el modal se abre/cierra
    useEffect(() => {
        if (isOpen) {
            openModal();
        } else {
            closeModal();
        }
    }, [isOpen, openModal, closeModal]);

    // Bloquear scroll de fondo, permitir cerrar con Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    const ResetForm = () => {
        FormRef.current?.reset();
        setFile(null);
        setFormData(initialFormData);
    };

    const clickEvent = () => {
        inputRef.current.click();
    };

    const procesarArchivo = async (filechosen) => {
        if (!filechosen) return;

        const validation = validateImage(filechosen);
        if (!validation.success) {
            await alertPop(
                'ERROR',
                validation.error,
                'error',
                'Continuar'
            );
            return;
        }

        setFile(filechosen);
    };

    const handleFileChange = async (e) => {
        await procesarArchivo(e.target.files[0]);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        await procesarArchivo(e.dataTransfer.files[0]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre_producto) {
            await alertPop('ERROR', 'El nombre del producto es requerido', 'error', 'Continuar');
            return;
        }

        if (!formData.precio) {
            await alertPop('ERROR', 'El precio es requerido', 'error', 'Continuar');
            return;
        }

        if (!formData.id_categoria) {
            await alertPop('ERROR', 'Selecciona una categoría', 'error', 'Continuar');
            return;
        }

        if (!file) {
            await alertPop('ERROR', 'Carga una imagen del producto', 'error', 'Continuar');
            return;
        }

        setLoading(true);

        // 1. Subir imagen a Cloudinary
        const uploadResult = await uploadImageToCloudinary(file);

        if (!uploadResult.success) {
            await alertPop('ERROR', 'Error al subir la imagen: ' + uploadResult.error, 'error', 'Continuar');
            setLoading(false);
            return;
        }

        // 2. Crear producto con URL de Cloudinary
        const datosProducto = {
            nombre: formData.nombre_producto,
            descripcion: formData.descripcion || null,
            precio: parseFloat(formData.precio),
            url_imagen: uploadResult.url,
            id_categoria: parseInt(formData.id_categoria),
            activo: formData.disponible
        };

        const createResult = await createProduct(datosProducto);
        setLoading(false);

        if (createResult.success) {
            await alertPop('ÉXITO', 'Producto creado exitosamente', 'success', 'Continuar');
            ResetForm();
            setIsOpen(false);
            await onProductoAgregado?.();
        } else {
            await alertPop('ERROR', createResult.error, 'error', 'Continuar');
        }
    };

    return (
        <>
            {/* FAB fijo en todas las pantallas */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Añadir producto"
                className="cursor-pointer fixed bottom-6 right-6 z-50 inline-flex items-center justify-center gap-2 rounded-full sm:rounded-3xl bg-yellow-otto text-dash-ink font-semibold shadow-xl shadow-yellow-otto/30 transition-all duration-300 hover:brightness-95 active:scale-90 ring-1 ring-inset ring-dash-ink/10 whitespace-nowrap w-14 h-14 text-lg sm:w-auto sm:h-auto sm:px-5 sm:py-3.5 sm:text-base"
            >
                <FontAwesomeIcon icon={faPlus} />
                <span className="hidden sm:inline">Añadir producto</span>
            </button>

            {isOpen && createPortal(
                <div
                    className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-product-title"
                >
                    <div
                        className="fixed inset-0 z-[1] bg-black/50 animate-fade-in"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Bottom-sheet en móvil, diálogo centrado desde sm */}
                    <div className="relative z-[2] bg-white dark:bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92dvh] flex flex-col sm:mx-4 animate-slide-up sm:animate-scale-in">

                        {/* Handle visual del sheet (solo móvil) */}
                        <div className="sm:hidden mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-dash-border dark:bg-zinc-600 shrink-0" aria-hidden="true" />

                        {/* Header */}
                        <div className="flex justify-between items-center p-5 border-b border-dash-border/70 dark:border-zinc-700/70 sticky top-0 bg-white dark:bg-card rounded-t-3xl sm:rounded-t-2xl z-10">
                            <h2 id="add-product-title" className="text-modal-title">
                                Añadir producto
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Cerrar"
                                className="cursor-pointer p-2 hover:bg-graywhite dark:hover:bg-zinc-800/70 rounded-full transition-colors text-dash-gray dark:text-zinc-400"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>
                        </div>

                        {/* Body */}
                        <form ref={FormRef} onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 sm:p-6 overflow-y-auto">

                            {/* Imagen */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl p-6 transition-all duration-200 ${
                                    isDragging
                                        ? 'border-yellow-otto bg-yellow-otto/5 scale-[1.01]'
                                        : 'border-dash-border dark:border-zinc-700 bg-graywhite dark:bg-zinc-800/70 hover:border-yellow-otto/50'
                                }`}
                            >
                                {file ? (
                                    <img
                                        className='w-28 h-28 object-cover rounded-xl mb-3 shadow-sm ring-1 ring-dash-border dark:ring-zinc-700'
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                    />
                                ) : (
                                    <FontAwesomeIcon icon={faCloudArrowUp} className="text-3xl text-dash-gray-soft dark:text-zinc-500 mb-3" />
                                )}

                                <input
                                    type="file"
                                    ref={inputRef}
                                    onChange={handleFileChange}
                                    className='hidden'
                                    accept="image/jpeg,image/png,image/gif"
                                />

                                {!file && (
                                    <p className="text-sm text-dash-gray-soft dark:text-zinc-500 mb-3 text-center">
                                        Arrastra una imagen aquí o selecciona un archivo
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={clickEvent}
                                    className="cursor-pointer bg-yellow-otto text-white font-medium text-sm rounded-3xl px-4 py-2 hover:brightness-95 active:scale-95 transition-all"
                                >
                                    {file ? 'Cambiar imagen' : 'Seleccionar imagen'}
                                </button>
                            </div>

                            {/* Nombre y Precio */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='flex gap-2 flex-col'>
                                    <label htmlFor="nombre_producto" className={labelClass}>
                                        Nombre del producto
                                    </label>
                                    <input
                                        type="text"
                                        placeholder='Ej: Sándwich de Pollo'
                                        name="nombre_producto"
                                        id="nombre_producto"
                                        value={formData.nombre_producto}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                    />
                                </div>

                                <div className='flex gap-2 flex-col'>
                                    <label htmlFor="precio" className={labelClass}>
                                        Precio del producto
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dash-gray-soft dark:text-zinc-400 font-semibold text-sm pointer-events-none">$</span>
                                        <input
                                            type="number"
                                            placeholder='15000'
                                            name="precio"
                                            id="precio"
                                            value={formData.precio}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            className={`${inputClass} pl-8`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Categoría y Descripción */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='flex gap-2 flex-col'>
                                    <label htmlFor="id_categoria" className={labelClass}>
                                        Categoría
                                    </label>
                                    <select
                                        name="id_categoria"
                                        id="id_categoria"
                                        value={formData.id_categoria}
                                        onChange={handleInputChange}
                                        className={`cursor-pointer ${inputClass}`}
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {categorias.map(cat => (
                                            <option key={cat.id_categoria} value={cat.id_categoria}>
                                                {cat.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className='flex gap-2 flex-col'>
                                    <label htmlFor="descripcion" className={labelClass}>
                                        Descripción
                                    </label>
                                    <input
                                        type="text"
                                        placeholder='Ej: Con pollo jugoso y verduras frescas'
                                        name="descripcion"
                                        id="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row gap-3 p-5 border-t border-dash-border/70 dark:border-zinc-700/70 sticky bottom-0 bg-white dark:bg-card sm:rounded-b-2xl">
                            <button
                                type="button"
                                onClick={ResetForm}
                                className="cursor-pointer w-full sm:w-auto px-6 py-3 border-2 border-dash-border dark:border-border text-dash-gray dark:text-zinc-300 rounded-3xl hover:bg-graywhite dark:hover:bg-zinc-800/70 font-semibold transition-colors"
                            >
                                Limpiar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`cursor-pointer flex-1 bg-yellow-otto text-white font-semibold rounded-3xl py-3 px-4 transition-all active:scale-[0.98] ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-95'}`}
                            >
                                {loading ? 'Guardando...' : 'Ingresar nuevo producto'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
