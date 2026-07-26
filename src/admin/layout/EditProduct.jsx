import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCamera } from '@fortawesome/free-solid-svg-icons';
import alertPop from '@/utils/alertPop.js';
import { updateProduct, getProductById } from '../../lib/services/products.js';
import { uploadImageToCloudinary, validateImage } from '../../lib/services/cloudinary/cloudinary.js';

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 shadow-sm transition-all duration-200 outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/15 hover:border-gray-300';

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
                    nombre_producto: result.data.nombre_producto,
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

            let imagenUrl = producto?.imagen_producto;

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
                nombre_producto: formData.nombre_producto,
                precio: parseFloat(formData.precio),
                descripcion: formData.descripcion,
                imagen_producto: imagenUrl
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
            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <div className="animate-pulse flex flex-col gap-6">
                    <div className="h-5 w-24 bg-gray-200 rounded" />
                    <div className="h-8 w-64 bg-gray-200 rounded" />
                    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col gap-6">
                        <div className="aspect-[4/3] sm:aspect-square rounded-xl bg-gray-100 max-w-xs w-full mx-auto sm:mx-0" />
                        <div className="h-10 bg-gray-100 rounded-xl" />
                        <div className="h-10 bg-gray-100 rounded-xl" />
                        <div className="h-20 bg-gray-100 rounded-xl" />
                    </div>
                </div>
            </section>
        );
    }

    if (!producto) {
        return <div className='text-center py-10 text-gray-500'>Producto no encontrado</div>;
    }

    return (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <button
                type='button'
                onClick={handleVolver}
                className="cursor-pointer mb-6 text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 text-sm font-medium"
            >
                <FontAwesomeIcon icon={faArrowLeft} />
                Volver
            </button>

            <h1 className='text-page-title mb-6 sm:mb-8'>
                Editar producto
            </h1>

            <form onSubmit={handleSubmit} className='bg-white rounded-2xl shadow-sm p-5 sm:p-8 flex flex-col sm:flex-row gap-8'>

                {/* Imagen */}
                <div className="sm:w-56 shrink-0 flex flex-col items-center gap-3">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                        <img
                            src={file ? URL.createObjectURL(file) : (producto?.imagen_producto || 'https://via.placeholder.com/160')}
                            alt={producto?.nombre_producto}
                            className='w-full h-full object-cover'
                        />
                    </div>

                    <input
                        type="file"
                        ref={inputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/gif"
                        className='hidden'
                    />

                    <button
                        type="button"
                        onClick={clickEvent}
                        className="cursor-pointer w-full inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-medium text-sm rounded-lg py-2.5 px-4 hover:bg-gray-50 transition-colors"
                    >
                        <FontAwesomeIcon icon={faCamera} className="text-xs" />
                        {file ? 'Cambiar foto' : 'Actualizar foto'}
                    </button>
                </div>

                {/* Campos */}
                <div className="flex-1 flex flex-col gap-5">
                    <div className='flex gap-2 flex-col'>
                        <label htmlFor="nombre_producto" className='text-sm font-medium text-gray-700'>
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
                        <label htmlFor="precio" className='text-sm font-medium text-gray-700'>
                            Precio del producto
                        </label>
                        <input
                            type="number"
                            placeholder='Ej: 15000'
                            name="precio"
                            id="precio"
                            value={formData.precio}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            className={inputClass}
                        />
                    </div>

                    <div className='flex gap-2 flex-col'>
                        <label htmlFor="descripcion" className='text-sm font-medium text-gray-700'>
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

                    <div className='flex flex-col sm:flex-row gap-3 mt-2'>
                        <button
                            type='submit'
                            disabled={saving}
                            className={`cursor-pointer flex-1 bg-yellow-otto text-white font-medium rounded-lg py-3 px-4 transition-all ${saving ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-95'}`}
                        >
                            {saving ? 'Guardando...' : 'Actualizar producto'}
                        </button>
                        <button
                            type='button'
                            onClick={handleVolver}
                            className='cursor-pointer w-full sm:w-auto px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors'
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}
