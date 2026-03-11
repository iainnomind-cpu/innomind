import React, { useState, useRef, useMemo } from 'react';
import { useAccountsReceivable, BankMovement } from '@/context/AccountsReceivableContext';
import { Upload, FileDown, CheckCircle, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function BankReconciliationView() {
    const { bankMovements, chargeNotes, importBankMovements, reconcileMovement, ignoreMovement } = useAccountsReceivable();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    // Flatten all payments across all charge notes for matching
    const allPayments = useMemo(() => {
        return chargeNotes.flatMap(cn =>
            (cn.payments || []).map(p => ({
                ...p,
                note_number: cn.note_number,
                client_name: cn.prospect?.nombre
            }))
        );
    }, [chargeNotes]);

    // Suggested matches logic
    const analyzeMovements = () => {
        return bankMovements.map(m => {
            // If already matched, skip suggestion logic
            if (m.matched_payment_id) {
                const matched = allPayments.find(p => p.id === m.matched_payment_id);
                return { ...m, isMatched: true, suggestedMatch: matched, confidence: 100 };
            }

            // Try to find a match
            let bestMatch = null;
            let highestConfidence = 0;

            for (const p of allPayments) {
                let confidence = 0;

                // Match exact amounts
                if (Number(p.amount) === Number(m.amount)) confidence += 50;

                // Match close dates (within 3 days)
                if (m.movement_date && p.payment_date) {
                    const diff = Math.abs(differenceInDays(parseISO(m.movement_date), parseISO(p.payment_date)));
                    if (diff === 0) confidence += 30;
                    else if (diff <= 3) confidence += 15;
                }

                // Match reference/description
                if (m.description.toLowerCase().includes(p.reference?.toLowerCase() || 'NOMATCH') ||
                    (m.reference && p.reference && m.reference.toLowerCase() === p.reference.toLowerCase())) {
                    confidence += 20;
                }

                // Penalty for mismatched amount type (receipt vs expense), assuming notes payments are all positive inflow
                // and bank movement amounts could be positive for inflow. If movement is negative, it's not a payment received.
                if (Number(m.amount) < 0) {
                    confidence = 0;
                }

                if (confidence > highestConfidence && confidence > 50) {
                    highestConfidence = confidence;
                    bestMatch = p;
                }
            }

            return { ...m, isMatched: false, suggestedMatch: bestMatch, confidence: highestConfidence };
        });
    };

    const mappedMovements = analyzeMovements();
    const unmatchedMovementsCount = mappedMovements.filter(m => !m.isMatched && Number(m.amount) > 0).length;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const rows = text.split('\n').map(row => row.split(','));
                // Basic parser assuming columns: Date, Description, Reference, Amount
                // This is a naive implementation; real ones use papaparse

                const newMovements = [];
                for (let i = 1; i < rows.length; i++) { // Skip header
                    const [date, desc, ref, amt] = rows[i];
                    if (date && desc && amt) {
                        const parsedAmt = parseFloat(amt.replace(/[^0-9.-]+/g, ""));
                        if (!isNaN(parsedAmt)) {
                            newMovements.push({
                                movement_date: new Date(date).toISOString().split('T')[0],
                                description: desc.trim(),
                                reference: ref?.trim() || '',
                                amount: parsedAmt
                            });
                        }
                    }
                }

                if (newMovements.length > 0) {
                    await importBankMovements(newMovements);
                    alert(`Importados ${newMovements.length} movimientos bancarios.`);
                } else {
                    alert("No se encontraron movimientos válidos en el archivo. El formato debe ser Fecha,Descripción,Referencia,Monto");
                }
            } catch (err) {
                console.error(err);
                alert('Error al parsear el archivo CSV.');
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="h-full flex flex-col p-2">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Conciliación Bancaria</h2>
                    <p className="text-sm text-gray-500">Concilia los pagos registrados en el sistema con tus movimientos bancarios.</p>
                </div>

                <div>
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        disabled={isImporting}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50"
                    >
                        <Upload size={18} /> {isImporting ? 'Importando...' : 'Importar CSV Banco'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-2">Movimientos Importados</span>
                    <span className="text-3xl font-extrabold text-gray-900">{bankMovements.length}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-2">Pagos Registrados</span>
                    <span className="text-3xl font-extrabold text-blue-600">{allPayments.length}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-emerald-200 fill-emerald-50 flex flex-col">
                    <span className="text-sm font-medium text-emerald-600 mb-2">Conciliados (Match)</span>
                    <span className="text-3xl font-extrabold text-emerald-700">{mappedMovements.filter(m => m.isMatched).length}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-amber-200 flex flex-col">
                    <span className="text-sm font-medium text-amber-600 mb-2">Por Conciliar (Ingresos)</span>
                    <span className="text-3xl font-extrabold text-amber-600">{unmatchedMovementsCount}</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Sugerencias de Conciliación</h3>
                </div>
                <div className="overflow-auto flex-1">
                    {mappedMovements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                            <FileDown size={48} className="text-gray-300 mb-4" />
                            <p className="text-lg font-medium">No hay movimientos bancarios</p>
                            <p className="text-sm mt-1">Sube un archivo CSV de tu estado de cuenta para comenzar.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                                <tr className="text-xs font-semibold text-gray-500 uppercase">
                                    <th className="px-6 py-4">Movimiento Banco (CSV)</th>
                                    <th className="px-6 py-4 border-l border-gray-100 bg-blue-50/30">Pago Sugerido en Sistema</th>
                                    <th className="px-6 py-4">Coincidencia</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {mappedMovements.map(m => (
                                    <tr key={m.id} className={m.isMatched ? 'bg-emerald-50/50' : 'hover:bg-gray-50'}>
                                        <td className="px-6 py-5">
                                            <div className="font-medium text-gray-900">{m.movement_date} <span className={Number(m.amount) > 0 ? 'text-green-600 ml-2 font-bold' : 'text-red-600 ml-2 font-bold'}>${Number(m.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                            <div className="text-xs text-gray-500 mt-1">{m.description}</div>
                                            {m.reference && <div className="text-xs font-mono text-gray-400 mt-1">Ref: {m.reference}</div>}
                                        </td>
                                        <td className="px-6 py-5 border-l border-gray-100 bg-blue-50/10">
                                            {m.isMatched ? (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="text-emerald-500" size={16} />
                                                    <div>
                                                        <div className="font-medium text-emerald-800">Conciliado con pago en Nota {m.suggestedMatch?.note_number}</div>
                                                        <div className="text-xs text-emerald-600 mt-1">Fecha: {m.suggestedMatch?.payment_date} · Cliente: {m.suggestedMatch?.client_name}</div>
                                                    </div>
                                                </div>
                                            ) : m.suggestedMatch ? (
                                                <div>
                                                    <div className="font-medium text-blue-900">Pago en Nota {m.suggestedMatch.note_number} (${Number(m.suggestedMatch.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })})</div>
                                                    <div className="text-xs text-blue-600 mt-1">Fecha: {m.suggestedMatch.payment_date} · Ref: {m.suggestedMatch.reference || 'N/A'}</div>
                                                    <div className="text-xs text-blue-600 mt-1 font-semibold">{m.suggestedMatch.client_name}</div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-400 italic flex items-center gap-2">
                                                    <AlertTriangle size={14} /> Sin pago sugerido (Monto exacto no encontrado)
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            {m.isMatched ? (
                                                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-bold ring-1 ring-emerald-200">MATCH 100%</span>
                                            ) : m.suggestedMatch ? (
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${m.confidence > 70 ? 'bg-green-100 text-green-800 ring-1 ring-green-200' : 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'}`}>
                                                    {m.confidence}% {m.confidence > 70 ? 'ALTO' : 'MEDIO'}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {m.isMatched ? (
                                                <div className="inline-flex gap-2">
                                                    <button onClick={() => ignoreMovement(m.id)} className="text-gray-400 hover:text-red-500 text-xs flex items-center gap-1 font-medium transition-colors" title="Deshacer Match">
                                                        <RefreshCw size={14} /> Deshacer
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    {m.suggestedMatch && (
                                                        <button
                                                            onClick={() => reconcileMovement(m.id, m.suggestedMatch!.id)}
                                                            className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 shadow-sm"
                                                        >
                                                            Confirmar
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => ignoreMovement(m.id)}
                                                        className="px-2 py-1.5 bg-white border border-gray-200 text-gray-500 rounded font-medium text-sm hover:text-gray-800 hover:bg-gray-50"
                                                        title="Ignorar este movimiento bancario"
                                                    >
                                                        Ignorar
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
