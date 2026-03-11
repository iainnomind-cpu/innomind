import React, { useState } from 'react';
import { useAccountsReceivable, ChargeNote } from '@/context/AccountsReceivableContext';
import { Search, FileText, CheckCircle, AlertCircle, Clock, DollarSign, Loader2 } from 'lucide-react';
import ChargeNoteDetail from './ChargeNoteDetail';
import PaymentModal from './PaymentModal';

export default function ChargeNoteList() {
    const { chargeNotes, isLoading, setSelectedNote, selectedNote } = useAccountsReceivable();
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [noteToPay, setNoteToPay] = useState<ChargeNote | null>(null);

    if (isLoading && chargeNotes.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
        );
    }

    // Active view: List or Detail
    if (selectedNote) {
        return <ChargeNoteDetail
            onBack={() => setSelectedNote(null)}
            onOpenPayment={(note) => { setNoteToPay(note); setPaymentModalOpen(true); }}
        />;
    }

    const filteredNotes = chargeNotes.filter(n =>
        n.note_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.prospect?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPendiente = chargeNotes.reduce((sum, n) => sum + Number(n.balance_due), 0);
    const totalVencido = chargeNotes.filter(n => n.status === 'overdue').reduce((sum, n) => sum + Number(n.balance_due), 0);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12} /> Pagado</span>;
            case 'overdue': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium flex items-center gap-1 w-max"><AlertCircle size={12} /> Vencido</span>;
            case 'partial': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium flex items-center gap-1 w-max"><DollarSign size={12} /> Parcial</span>;
            default: return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium flex items-center gap-1 w-max"><Clock size={12} /> Pendiente</span>;
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Notas</p>
                        <p className="text-2xl font-bold text-gray-900">{chargeNotes.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Por Cobrar (Pendiente)</p>
                        <p className="text-2xl font-bold text-gray-900">${totalPendiente.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-red-500 font-medium">Cartera Vencida</p>
                        <p className="text-2xl font-bold text-red-600">${totalVencido.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar folio o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1">
                <div className="overflow-x-auto h-full">
                    <table className="w-full relative">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Nota / Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Vencimiento</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Pendiente</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredNotes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No hay notas de cargo registradas
                                    </td>
                                </tr>
                            ) : (
                                filteredNotes.map(note => (
                                    <tr key={note.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedNote(note)}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{note.note_number}</div>
                                            <div className="text-xs text-gray-500">{note.issue_date}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{note.prospect?.nombre || 'Desconocido'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{note.due_date}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            ${Number(note.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-amber-600">
                                            ${Number(note.balance_due).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                {getStatusBadge(note.status)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {note.status !== 'paid' && note.status !== 'cancelled' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setNoteToPay(note);
                                                        setPaymentModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    <DollarSign size={16} /> Cobrar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isPaymentModalOpen && noteToPay && (
                <PaymentModal
                    note={noteToPay}
                    onClose={() => setPaymentModalOpen(false)}
                />
            )}
        </div>
    );
}
