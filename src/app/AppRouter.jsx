import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import ProtectedRoute from '../routes/ProtectedRoutes.jsx';
import Auth from '@/auth/Auth';
import Register from '@/auth/Register';
import SalesLayout from '@/sales/layout/SalesLayout';
import RegisterSales from '@/sales/components/RegisterSales';
import SalesMoney from '@/sales/components/SalesMoney';
import DiarySales from '@/sales/components/DiarySales';
import GeneralSales from '@/generalSalesHistory/GeneralSales';
import AdminView from '@/admin/AdminView';
import EditProduct from '@/admin/layout/EditProduct';
import EditSales from '../sales/components/EditSales.jsx';

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={<Auth />} />
                <Route path='/registro' element={<Register />} />

                <Route path='/sales' element={
                    <ProtectedRoute>
                        <SalesLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<RegisterSales />} />
                    <Route path='money' element={<SalesMoney />} />
                    <Route path='history' element={<DiarySales />} />
                    <Route path='history/editSale' element={<EditSales />} />

                    <Route path='admin' element={
                        <ProtectedRoute requiredRole='admin'>
                            <AdminView />
                        </ProtectedRoute>
                    }>
                    </Route>

                    <Route path='admin/editProduct/:productId' element={
                        <ProtectedRoute requiredRole='admin'>
                            <EditProduct />
                        </ProtectedRoute>
                    } />
                </Route>

                <Route path='/generalhistory' element={
                    <ProtectedRoute>
                        <GeneralSales />
                    </ProtectedRoute>
                } />
                <Route path='/generalhistory/EditSale' element={<EditSales />} />

                <Route path='/auth' element={<Navigate to='/login' />} />
                <Route path='/' element={<Navigate to='/login' />} />
            </Routes>
        </BrowserRouter>
    );
}