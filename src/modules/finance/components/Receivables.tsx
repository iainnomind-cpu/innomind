import React, { useState } from 'react';
import { AccountsReceivableProvider } from '@/context/AccountsReceivableContext';
import ChargeNoteList from './accounts-receivable/ChargeNoteList';
import BankReconciliationView from './accounts-receivable/BankReconciliationView';
import OverdueReport from './accounts-receivable/OverdueReport';

export default function Receivables() {
    const [activeTab, setActiveTab] = useState<'list' | 'reconciliation' | 'report'>('list');

    return (
        <AccountsReceivableProvider>
            <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
                {/* Sub Navigation Tabs */}
                <div className="flex space-x-4 border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'list'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Notas de Cargo
                    </button>
                    <button
                        onClick={() => setActiveTab('reconciliation')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'reconciliation'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Conciliación Bancaria
                    </button>
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'report'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Reporte de Cartera
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-auto">
                    {activeTab === 'list' && <ChargeNoteList />}
                    {activeTab === 'reconciliation' && <BankReconciliationView />}
                    {activeTab === 'report' && <OverdueReport />}
                </div>
            </div>
        </AccountsReceivableProvider>
    );
}
