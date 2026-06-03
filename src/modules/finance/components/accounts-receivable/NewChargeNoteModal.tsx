import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar as CalendarIcon, User, Plus, Trash2 } from 'lucide-react';
import { useAccountsReceivable } from '@/context/AccountsReceivableContext';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/context/WorkspaceContext';

interface NewChargeNoteModalProps {
    onClose: () => void;
}

export default function NewChargeNoteModal({ onClose }: NewChargeNoteModalProps) {
    const { addChargeNote } = useAccountsReceivable();
    const { workspace } = useWorkspace();

    const [prospectId, setProspectId] = useState('');
    const [noteNumber, setNoteNumber] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    
    const [items, setItems] = useState([{ id: Math.random().toString(), item_name: '', description: '', quantity: 1, unit_price: 0 }]);
    const [prospects, setProspects] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProspects = async () => {
            if (!workspace?.id) return;
            const { data } = await supabase
                .from('prospects')
                .select('id, nombre, empresa')
                .eq('workspace', workspace.id);
            if (data) setProspects(data);
        };
        fetchProspects();
        
        // Auto-generate note number
        setNoteNumber(`NC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
    }, [workspace?.id]);

    const handleAddItem = () => {
        setItems([...items, { id: Math.random().toString(), item_name: '', description: '', quantity: 1, unit_price: 0 }]);
    };

    const handleRemoveItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleItemChange = (id: string, field: string, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const totalAmount = subtotal; // Can add tax logic later if needed

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!prospectId) {
                alert('Selecciona un cliente');
                return;
            }

            const noteData = {
                prospect_id: prospectId,
                note_number: noteNumber,
                issue_date: new Date(issueDate).toISOString(),
                due_date: new Date(dueDate).toISOString(),
                subtotal: subtotal,
                total_amount: totalAmount
            };

            const noteItems = items.map(item => ({
                item_name: item.item_name,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: item.quantity * item.unit_price
            }));

            await addChargeNote(noteData, noteItems);
            onClose();
        } catch (error) {
            console.error('Error creating charge note:', error);
            alert('Error al crear la nota de cargo');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        Nueva Nota de Cargo (Cuentas por Cobrar)
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                    <form id="new-chargenote-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Header info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Cliente / Prospecto</label>
                                <select
                                    value={prospectId}
                                    onChange={(e) => setProspectId(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    required
                                >
                                    <option value="">-- Seleccionar Cliente --</option>
                                    {prospects.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre} {p.empresa ? `(${p.empresa})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Folio (Autogenerado)</label>
                                <input
                                    type="text"
                                    required
                                    value={noteNumber}
                                    onChange={(e) => setNoteNumber(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Emisión</label>
                                <input
                                    type="date"
                                    required
                                    value={issueDate}
                                    onChange={(e) => setIssueDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Vencimiento</label>
                                <input
                                    type="date"
                                    required
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Items */}
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-slate-800">Conceptos a Cobrar</h4>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                                >
                                    <Plus size={16} /> Agregar Fila
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={item.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div className="flex-1 w-full">
                                            <input
                                                type="text"
                                                placeholder="Nombre del concepto"
                                                required
                                                value={item.item_name}
                                                onChange={(e) => handleItemChange(item.id, 'item_name', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>
                                        <div className="w-full md:w-24">
                                            <input
                                                type="number"
                                                placeholder="Cant"
                                                required
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>
                                        <div className="w-full md:w-32 relative">
                                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                                <span className="text-slate-400 text-sm">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="Precio U."
                                                required
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => handleItemChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                                className="w-full pl-6 pr-2 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>
                                        <div className="w-full md:w-24 text-right font-bold text-slate-700">
                                            ${(item.quantity * item.unit_price).toLocaleString()}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(item.id)}
                                            disabled={items.length === 1}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Totals */}
                            <div className="mt-4 flex justify-end">
                                <div className="bg-slate-100 p-4 rounded-xl min-w-[200px]">
                                    <div className="flex justify-between items-center text-lg font-black text-slate-900">
                                        <span>Total:</span>
                                        <span>${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="new-chargenote-form"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {isSubmitting ? 'Guardando...' : 'Crear Nota de Cargo'}
                    </button>
                </div>
            </div>
        </div>
    );
}
