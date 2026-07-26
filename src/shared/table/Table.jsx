import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

import { useRef } from "react";

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import alertDecision from "../../utils/alertDecision";
import alertPop from "../../utils/alertPop";
import { useNavigate } from "react-router";
import { deleteSale } from "../../lib/services/ventas";
export default function Table({rowData, onVerRecibo,onDelete,  use='diary'}){

    const gridRef = useRef(null);
    const navigate = useNavigate();

    const handleEdit = (p)=>{
        use==='diary'?navigate(`/sales/history/editSale`, {state: {registro: p} }):navigate(`/generalhistory/EditSale`, {state: {registro: p} })
    }

  const handleDelete = async (p) => {
    const result = await alertDecision(
        '¿ESTÁ SEGURO DE ELIMINAR ESTA VENTA?',
        `Se eliminará permanentemente la venta #${p.id_venta}`,
        'question',
        'Eliminar',
        'Cancelar'
    );

    if (result.isConfirmed) {
        try {
            const deleteResult = await deleteSale(p.id_venta);

            if (deleteResult.success) {
                await alertPop(
                    'VENTA ELIMINADA',
                    'La venta ha sido eliminada correctamente',
                    'success',
                    'Continuar'
                );
                onDelete && onDelete();
            } else {
                await alertPop(
                    'ERROR',
                    deleteResult.error,
                    'error',
                    'Continuar'
                );
            }
        } catch (error) {
            await alertPop(
                'ERROR',
                error.message || 'Ocurrió un error al eliminar la venta',
                'error',
                'Continuar'
            );
        }
    }
};

    const columns =[
        {headerName: 'ID', field:'id_venta',
            cellRenderer: (p) => (
                <button
                    onClick={() => onVerRecibo(p.value)}
                    className='cursor-pointer text-[#cda401] hover:text-[#ac8a00] font-bold hover:underline'
                >
                    Ver #{p.value}
                </button>
            )
        },
        {headerName:'Empleado', field:'empleado'},
        {headerName: 'Cliente', field:'cliente'},
        {headerName: 'Subtotal', field:'subtotal', valueFormatter: p=> `$${p.value}`},
        {headerName: 'Descuento', field:'descuento', valueFormatter: p=> `$${p.value}`},
        {headerName: 'Fecha', field:'fecha'},
        {headerName: 'Estado', field:'estado'},
        {headerName: 'Total', field:'total', valueFormatter: p=> `$${p.value}`},
        {headerName: 'Acciones', field:'acciones', width: 200, flex:0, pinned: 'right',
            cellRenderer: (p)=>{
                return(
                    <div className="flex gap-3 py-2">
                        <button 
                            className='btn-row-action cursor-pointer bg-yellow-otto text-white w-full hover:brightness-95' 
                            onClick={()=>handleEdit(p.data)}>
                            Editar
                        </button>
                        <button 
                            className='btn-row-action cursor-pointer bg-[#FF2323] text-white w-full hover:brightness-95' 
                            onClick={()=>handleDelete(p.data)}
                        >
                            Eliminar
                        </button>
                    </div>
                )
            }
        }
    ];


    const exportDataToCVS= ()=>{
        gridRef.current.api.exportDataAsCsv()
    };

    const exportExcel= async ()=>{
        const fecha = new Date();
        const fechaFormateada = fecha.toLocaleDateString();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`ventas-${fechaFormateada.replace(/\//g,'-')}`);

        worksheet.columns = columns.filter(col=> col.field !== 'acciones').map(col=> ({
            header: col.headerName,
            key: col.field,
            width: 20
        }));
        
        worksheet.getColumn('total').numFmt = '"$"#,##0.00';

        rowData.forEach((row)=>{
            worksheet.addRow(row);
        });

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        worksheet.autoFilter = { from: 'A1', to: 'J1' };

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `ventas-${fechaFormateada.replace(/\//g,'-')}.xlsx`);
    };

    return(
        <section className="w-full">
            <div className="ag-theme-alpine rounded-xl overflow-hidden border border-gray-300" 
                style={{ height: 'clamp(300px, 50dvh, 450px)', width: '100%' }}
            >
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columns}
                    defaultColDef={{
                        sortable: true,
                        filter: true,
                        resizable: true
                    }}
                    rowHeight={50}
                    headerHeight={55}
                />
            </div>

            <div className="flex justify-center mt-6 gap-4 flex-wrap">
                <button 
                    onClick={exportDataToCVS} 
                    className="btn-page-action bg-white flex justify-center items-center cursor-pointer border-gray-300 text-black hover:bg-gray-100"
                >
                    Exportar a CSV
                </button>

                <button 
                    onClick={exportExcel} 
                    className="btn-page-action bg-white flex justify-center items-center gap-2 cursor-pointer border-gray-300 text-black hover:bg-gray-100"
                > 
                    Exportar Excel
                </button>
            </div>
        </section>
    )
}
