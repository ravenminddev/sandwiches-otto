import { useEffect, useState } from 'react';
import moneyIcon from '@/assets/money.png';
import nequiIcon from '@/assets/nequi-logo.png';
import nequiWhiteIcon from '@/assets/nequi-white-logo.png';
import { getPaymentsSummaryToday } from '@/lib/services/pagos.js';

import Dog from "../../assets/dog.svg";
import Utensils from "../../assets/utensils.svg";
import FloatingElements from './FloatingElements';

export default function SalesMoney() {
    const [nequiMoney, setNequiMoney] = useState(0);
    const [cashMoney, setCashMoney] = useState(0);
    const [loading, setLoading] = useState(true);
    const [enter, setEnter]= useState('');

    const total = cashMoney + nequiMoney;
    const cashPercent = total > 0 ? (cashMoney / total) * 100 : 0;
    const nequiPercent = total > 0 ? (nequiMoney / total) * 100 : 0;

    const fetchSales = async () => {
        setLoading(true);
        const result = await getPaymentsSummaryToday();

        if (result.success && result.data) {

            setNequiMoney(result.data['NEQUI'] || result.data['Transferencia'] || 0);
            setCashMoney(result.data['EFECTIVO'] || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSales();
        
        const interval = setInterval(fetchSales, 30000);

        return () => clearInterval(interval);
    }, []);

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(amount);
    };

return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md sm:max-w-2xl lg:max-w-5xl mx-auto pt-4 sm:pt-5'>

        <div 
            onMouseLeave={()=>setEnter('')} 
            onMouseEnter={()=>setEnter('first')} 
            className='col-span-2 relative bg-white dark:bg-card border border-gray-200/60 dark:border-border w-full flex flex-col justify-center items-center py-5 lg:py-7 rounded-3xl gap-3 hover:ring-4 hover:ring-yellow-500/15 transition-all hover:-translate-y-1 overflow-hidden'
        >
            <h1 className='relative z-10 text-section-title'>Total ingresado el día de hoy</h1>
            <div className='relative z-10 bg-yellow-500/25 text-yellow-500 font-extrabold text-xl md:text-2xl lg:text-[26px] px-7 py-3 rounded-xl'>
                <p>{loading?'cargando...':formatMoney(nequiMoney+cashMoney)}</p>
            </div>

            <FloatingElements figure1={Dog} figure2={Utensils} enter={enter}/>
        </div>

        {/* Nequi */}
        <div className='bg-white dark:bg-card border border-gray-200/60 dark:border-border w-full flex flex-col justify-center items-center py-5 lg:py-7 rounded-3xl gap-3 hover:ring-4 hover:ring-yellow-500/15 transition-all hover:-translate-y-1'>
            <h2 className='text-section-title'>Nequi</h2>

            <div className='w-1/5 min-w-[90px] md:w-2/5 mx-auto h-20 md:h-24 flex items-center justify-center'>
                <img src={nequiIcon} alt='Nequi' className='max-h-full max-w-full object-contain dark:hidden' />
                <img src={nequiWhiteIcon} alt='Nequi' className='hidden max-h-full max-w-full object-contain dark:block' />
            </div>

            <div className='font-bold text-[18px] md:text-xl lg:text-2xl flex flex-col justify-center items-center'> 
                <p>{loading?'cargando...': formatMoney(nequiMoney)}</p>
                <p className='text-[#7500A3]'>
                {loading 
                    ? 'Información': `${nequiPercent.toFixed(0)}% del total`
                }
                </p>
            </div>
        </div>

        <div className='bg-white dark:bg-card border border-gray-200/60 dark:border-border w-full flex flex-col justify-center items-center py-5 lg:py-7 rounded-3xl gap-3 hover:ring-4 hover:ring-yellow-500/15 transition-all hover:-translate-y-1'>
            <h2 className='text-section-title'>Efectivo</h2>

            <div className='w-1/5 min-w-[90px] md:w-2/5 mx-auto h-20 md:h-24 flex items-center justify-center'>
                <img src={moneyIcon} alt='Efectivo' className='max-h-full max-w-full object-contain' />
            </div>

            <div className='font-bold text-[18px] md:text-xl lg:text-2xl flex flex-col justify-center items-center'> 
                <p>{loading?'cargando...': formatMoney(cashMoney)}</p>
                <p className='text-[#40D39B]'>
                {loading 
                    ? 'Información':`${cashPercent.toFixed(0)}% del total`
                }
                </p>
            </div>
        </div>

        <div className='bg-white dark:bg-card border border-gray-200/60 dark:border-border w-full flex flex-col justify-center items-center py-5 lg:py-7 rounded-3xl gap-3 hover:ring-4 hover:ring-yellow-500/15 transition-all hover:-translate-y-1 px-6'>
            <h2 className='text-section-title'>Distribución</h2>

            <div className='w-full flex flex-col gap-3'>
                <div className='w-full'>
                    <div className='flex justify-between text-sm font-semibold mb-1'>
                        <span>Efectivo</span>
                        <span>{loading ? '...' : `${cashPercent.toFixed(0)}%`}</span>
                    </div>
                    <div className='w-full h-7 bg-gray-200 dark:bg-white/15 rounded-full overflow-hidden'>
                        <div 
                            className='h-full bg-green-600 dark:bg-[#40D39B] rounded-full transition-all duration-500'
                            style={{ width: `${loading ? 0 : cashPercent}%` }}
                        />
                    </div>
                </div>

                {/* Barra Transferencias */}
                <div className='w-full'>
                    <div className='flex justify-between text-sm font-semibold mb-1'>
                        <span>Transferencias</span>
                        <span>{loading ? '...' : `${nequiPercent.toFixed(0)}%`}</span>
                    </div>
                    <div className='w-full h-7 bg-gray-200 dark:bg-white/15 rounded-full overflow-hidden'>
                        <div 
                            className='h-full bg-yellow-500 dark:bg-[#7500A3] rounded-full transition-all duration-500'
                            style={{ width: `${loading ? 0 : nequiPercent}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className='bg-white dark:bg-card border border-gray-200/60 dark:border-border w-full flex flex-col justify-center items-center py-5 lg:py-7 rounded-3xl gap-3 hover:ring-4 hover:ring-yellow-500/15 transition-all hover:-translate-y-1'>
            <h2 className='text-section-title'>Pedidos de hoy</h2>
            {/* aquí va el número de pedidos y gasto promedio */}
        </div>

    </div> 
);
}