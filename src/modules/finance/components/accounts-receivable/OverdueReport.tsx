import React from 'react';
import { useAccountsReceivable } from '@/context/AccountsReceivableContext';
import { AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function OverdueReport() {
    const { chargeNotes } = useAccountsReceivable();

    const overdueNotes = chargeNotes.filter(n => n.status === 'overdue');

    const aging = {
        '0_30': [] as typeof overdueNotes,
        '31_60': [] as typeof overdueNotes,
        '61_90': [] as typeof overdueNotes,
        '91_plus': [] as typeof overdueNotes,
    };

    const today = new Date();

    overdueNotes.forEach(note => {
        const dueDate = parseISO(note.due_date);
        const diff = differenceInDays(today, dueDate);

        if (diff <= 30) aging['0_30'].push(note);
        else if (diff <= 60) aging['31_60'].push(note);
        else if (diff <= 90) aging['61_90'].push(note);
        else aging['91_plus'].push(note);
    });

    const Section = ({ title, notes, colorClass }: { title: string, notes: typeof overdueNotes, colorClass: string }) => {
        const total = notes.reduce((sum, n) => sum + Number(n.balance_due), 0);

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className={`px-6 py-4 border-b border-gray-100 flex justify-between items-center ${colorClass}`}>
                    <h3 className="font-bold text-gray-900">{title}</h3>
                    <span className="font-bold rounded-lg px-3 py-1 bg-white/50">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {notes.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        <CheckCircle className="mx-auto mb-2 text-emerald-400" size={32} />
                        <p>No hay cartera vencida en este rango.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-xs font-semibold text-gray-500 uppercase">
                                    <th className="px-6 py-3">Nota / Folio</th>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3">Vencimiento</th>
                                    <th className="px-6 py-3 text-right">Saldo Deuda</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {notes.map(note => (
                                    <tr key={note.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{note.note_number}</td>
                                        <td className="px-6 py-4 text-gray-700">{note.prospect?.nombre || 'Desconocido'}</td>
                                        <td className="px-6 py-4 text-red-600 font-medium">
                                            {note.due_date} ({differenceInDays(today, parseISO(note.due_date))} días)
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            ${Number(note.balance_due).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const totalDebt = overdueNotes.reduce((sum, n) => sum + Number(n.balance_due), 0);

    return (
        <div className="h-full flex flex-col p-2">
            <div className="flex justify-between items-center mb-6 bg-red-50 p-6 rounded-xl border border-red-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-red-700">Reporte de Cartera Vencida</h2>
                        <p className="text-red-500 font-medium">Agrupado por antigüedad de saldos</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-red-500 uppercase font-bold text-sm tracking-wider">Deuda Total Vencida</p>
                    <p className="text-4xl font-extrabold text-red-700">${totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6">
                <div>
                    <Section title="0 - 30 Días" notes={aging['0_30']} colorClass="bg-orange-50" />
                    <Section title="31 - 60 Días" notes={aging['31_60']} colorClass="bg-orange-100" />
                </div>
                <div>
                    <Section title="61 - 90 Días" notes={aging['61_90']} colorClass="bg-red-50" />
                    <Section title="Más de 90 Días" notes={aging['91_plus']} colorClass="bg-red-100" />
                </div>
            </div>
        </div>
    );
}
