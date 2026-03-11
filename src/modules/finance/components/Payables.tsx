import { useState } from 'react';
import { useAccountsPayable } from '@/context/AccountsPayableContext';
import { List, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import AccountsPayableList from './AccountsPayableList';
import AccountsPayableDetail from './AccountsPayableDetail';
import AccountsPayableCalendar from './AccountsPayableCalendar';
import PayablePaymentModal from './PayablePaymentModal';
import { AccountsPayable } from '@/types';

type ViewMode = 'list' | 'calendar' | 'detail';

export default function Payables() {
    const { isLoading, payables } = useAccountsPayable();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedPayable, setSelectedPayable] = useState<AccountsPayable | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [payableToPay, setPayableToPay] = useState<AccountsPayable | null>(null);

    if (isLoading && payables.length === 0) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-purple-600" size={48} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Cargando Cuentas por Pagar...</p>
                </div>
            </div>
        );
    }

    const handleSelectPayable = (payable: AccountsPayable) => {
        setSelectedPayable(payable);
        setViewMode('detail');
    };

    const handleOpenPayment = (payable: AccountsPayable) => {
        setPayableToPay(payable);
        setIsPaymentModalOpen(true);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Local Navigation Toolset */}
            {viewMode !== 'detail' && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Cuentas por Pagar</h2>
                        <p className="text-gray-500 font-medium">Gestión de obligaciones y programación de pagos</p>
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            <List size={18} />
                            Listado
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            <CalendarIcon size={18} />
                            Calendario
                        </button>
                    </div>
                </div>
            )}

            {/* Dynamic Content Rendering */}
            <div className="min-h-[600px]">
                {viewMode === 'list' && (
                    <AccountsPayableList
                        onSelectPayable={handleSelectPayable}
                        onAddPayment={handleOpenPayment}
                    />
                )}

                {viewMode === 'calendar' && (
                    <AccountsPayableCalendar />
                )}

                {viewMode === 'detail' && selectedPayable && (
                    <AccountsPayableDetail
                        payable={selectedPayable}
                        onBack={() => setViewMode('list')}
                    />
                )}
            </div>

            {/* Modals */}
            {isPaymentModalOpen && payableToPay && (
                <PayablePaymentModal
                    payable={payableToPay}
                    onClose={() => {
                        setIsPaymentModalOpen(false);
                        setPayableToPay(null);
                    }}
                />
            )}
        </div>
    );
}
