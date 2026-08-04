import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCamera } from '@fortawesome/free-solid-svg-icons';
import alertPop from '@/utils/alertPop.js';
import { updateProduct, getProductById } from '../../lib/services/products.js';
import { uploadImageToCloudinary, validateImage } from '../../lib/services/cloudinary/cloudinary.js';

const inputClass = 'w-full rounded-xl border border-dash-border dark:border-border bg-white dark:bg-input px-4 py-3 text-sm sm:text-base text-dash-ink dark:text-zinc-100 placeholder-dash-gray-soft dark:placeholder:text-zinc-500 shadow-sm transition-all duration-200 outline-none focus:border-yellow-otto focus:ring-4 focus:ring-yellow-otto/15 dark:focus:border-yellow-otto hover:border-dash-gray-soft dark:hover:border-zinc-500';

const labelClass = 'text-sm font-semibold text-dash-gray dark:text-zinc-300';

export default function EditProduct() {
    const { productId } = useParams();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [producto, setProducto] = useState(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre_producto: '',
        precio: '',
        descripcion: ''
    });

    // Cargar producto al montar
    useEffect(() => {
        const cargarProducto = async () => {
            const result = await getProductById(productId);
            if (result.success) {
                setProducto(result.data);
                setFormData({
                    nombre_producto: result.data.nombre,
                    precio: result.data.precio,
                    descripcion: result.data.descripcion || ''
                });
            } else {
                await alertPop(
                    'ERROR AL CARGAR PRODUCTO',
                    result.error,
                    'error',
                    'Continuar'
                );
                navigate('/sales/admin');
            }
            setLoading(false);
        };
        cargarProducto();
    }, [productId, navigate]);

    const clickEvent = () => {
        inputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validation = validateImage(selectedFile);
            if (!validation.success) {
                await alertPop(
                    'ERROR AL CARGAR IMAGEN',
                    validation.error,
                    'error',
                    'Continuar'
                );
                return;
            }
            setFile(selectedFile);
        }
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
        setSaving(true);

        try {
            if (!formData.nombre_producto || !formData.precio) {
                await alertPop(
                    'ERROR AL ACTUALIZAR PRODUCTO',
                    'Nombre y precio son requeridos',
                    'error',
                    'Continuar'
                );
                setSaving(false);
                return;
            }

            let imagenUrl = producto?.url_imagen;

            // Si hay archivo nuevo, subirlo a Cloudinary
            if (file) {
                const uploadResult = await uploadImageToCloudinary(file);
                if (!uploadResult.success) {
                    throw new Error(uploadResult.error);
                }
                imagenUrl = uploadResult.url;
            }

            // Actualizar producto en BD
            const result = await updateProduct(producto.id_producto, {
                nombre: formData.nombre_producto,
                precio: parseFloat(formData.precio),
                descripcion: formData.descripcion,
                url_imagen: imagenUrl
            });

            if (result.success) {
                await alertPop(
                    'ÉXITO',
                    'Producto actualizado correctamente',
                    'success',
                    'Continuar'
                );
                navigate('/sales/admin');
            } else {
                await alertPop(
                    'ERROR AL ACTUALIZAR PRODUCTO',
                    result.error,
                    'error',
                    'Continuar'
                );
            }
        } catch (error) {
            await alertPop(
                'ERROR AL ACTUALIZAR PRODUCTO',
                error.message || 'Error al actualizar el producto',
                'error',
                'Continuar'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleVolver = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <div className="animate-pulse flex flex-col gap-6">
                    <div className="h-5 w-24 bg-gray-200 dark:bg-zinc-700 rounded" />
                    <div className="h-8 w-64 bg-gray-200 dark:bg-zinc-700 rounded" />
                    <div className="bg-white dark:bg-card rounded-3xl ring-1 ring-dash-border/60 dark:ring-zinc-700/60 p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-60 shrink-0 aspect-4/3 sm:aspect-square rounded-2xl bg-gray-100 dark:bg-zinc-800/70" />
                        <div className="flex-1 flex flex-col gap-5">
                            <div className="h-11 bg-gray-100 dark:bg-zinc-800/70 rounded-xl" />
                            <div className="h-11 bg-gray-100 dark:bg-zinc-800/70 rounded-xl" />
                            <div className="h-24 bg-gray-100 dark:bg-zinc-800/70 rounded-xl" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!producto) {
        return <div className='text-center py-10 text-dash-gray dark:text-zinc-400'>Producto no encontrado</div>;
    }

    return (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            <button
                type='button'
                onClick={handleVolver}
                className="cursor-pointer mb-5 text-dash-gray dark:text-zinc-400 hover:text-dash-ink dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-2 text-sm font-semibold animate-rise"
            >
                <FontAwesomeIcon icon={faArrowLeft} />
                Volver
            </button>

            <h1 className='text-page-title mb-6 sm:mb-8 animate-rise' style={{ animationDelay: '40ms' }}>
                Editar producto
            </h1>

            <form onSubmit={handleSubmit} className='flex flex-col gap-5'>

                <div className='bg-white dark:bg-card rounded-3xl ring-1 ring-dash-border/80 dark:ring-zinc-700/80 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row gap-6 animate-rise' style={{ animationDelay: '80ms' }}>

                    {/* Imagen */}
                    <div className="sm:w-60 shrink-0">
                        <div className="relative w-full aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden bg-graywhite dark:bg-zinc-800/70 ring-1 ring-dash-border/60 dark:ring-zinc-700/60">
                            <img
                                src={file ? URL.createObjectURL(file) : (producto?.url_imagen || 'https://via.placeholder.com/160')}
                                alt={producto?.nombre}
                                className='w-full h-full object-cover'
                            />

                            <button
                                type="button"
                                onClick={clickEvent}
                                aria-label={file ? 'Cambiar foto' : 'Actualizar foto'}
                                title={file ? 'Cambiar foto' : 'Actualizar foto'}
                                className="cursor-pointer absolute right-3 bottom-3 w-11 h-11 rounded-full bg-yellow-otto text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:brightness-95 active:scale-90"
                            >
                                <FontAwesomeIcon icon={faCamera} />
                            </button>
                        </div>

                        <input
                            type="file"
                            ref={inputRef}
                            onChange={handleFileChange}
                            accept="image/jpeg,image/png,image/gif"
                            className='hidden'
                        />

                        <p className="mt-2 text-xs text-dash-gray-soft dark:text-zinc-500 text-center">
                            Toca la cámara para {file ? 'cambiar' : 'actualizar'} la foto
                        </p>
                    </div>

                    {/* Campos */}
                    <div className="flex-1 flex flex-col gap-5">
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
                                    step="0.01"
                                    min="0"
                                    className={`${inputClass} pl-8`}
                                />
                            </div>
                        </div>

                        <div className='flex gap-2 flex-col'>
                            <label htmlFor="descripcion" className={labelClass}>
                                Descripción (opcional)
                            </label>
                            <textarea
                                name="descripcion"
                                id="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                placeholder='Descripción del producto'
                                className={`${inputClass} resize-none h-24`}
                            />
                        </div>
                    </div>
                </div>

                {/* Dock de acciones: siempre al alcance del pulgar en móvil */}
                <div className='sticky bottom-4 z-30 bg-white/95 dark:bg-card/95 backdrop-blur rounded-2xl ring-1 ring-dash-border dark:ring-zinc-700 shadow-lg p-3 flex flex-row gap-3 animate-rise' style={{ animationDelay: '140ms' }}>
                    <button
                        type='button'
                        onClick={handleVolver}
                        className='cursor-pointer px-5 py-3 border-2 border-dash-border dark:border-border text-dash-gray dark:text-zinc-300 rounded-xl hover:bg-graywhite dark:hover:bg-zinc-800/70 font-semibold transition-colors'
                    >
                        Cancelar
                    </button>
                    <button
                        type='submit'
                        disabled={saving}
                        className={`cursor-pointer flex-1 bg-yellow-otto text-white font-semibold rounded-xl py-3 px-4 transition-all active:scale-[0.98] ${saving ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-95'}`}
                    >
                        {saving ? 'Guardando...' : 'Actualizar producto'}
                    </button>
                </div>
            </form>
        </section>
    );
}
