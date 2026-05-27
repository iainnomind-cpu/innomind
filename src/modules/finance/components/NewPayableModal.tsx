import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar as CalendarIcon, User, CreditCard, Plus } from 'lucide-react';
import { useAccountsPayable } from '@/context/AccountsPayableContext';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/context/WorkspaceContext';

interface NewPayableModalProps {
    onClose: () => void;
}

export default function NewPayableModal({ onClose }: NewPayableModalProps) {
    const { addPayable } = useAccountsPayable();
    const { workspace } = useWorkspace();

    const [concept, setConcept] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [supplierType, setSupplierType] = useState<'supplier' | 'employee' | 'company_expense' | 'custom'>('supplier');
    const [supplierId, setSupplierId] = useState('');
    const [customName, setCustomName] = useState('');
    const [notes, setNotes] = useState('');

    const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');
    const [newSupplierRFC, setNewSupplierRFC] = useState('');
    const [newSupplierEmail, setNewSupplierEmail] = useState('');

    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchSuppliers = async () => {
            if (!workspace?.id) return;
            const { data } = await supabase
                .from('suppliers')
                .select('*')
                .eq('workspace', workspace.id)
                .eq('activo', true)
                .order('nombreComercial');
            if (data) setSuppliers(data);
        };
        fetchSuppliers();
    }, [workspace?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isCreatingSupplier) {
                if (!newSupplierName) {
                    alert('Ingresa el nombre comercial del proveedor');
                    setIsSubmitting(false);
                    return;
                }
                const { data: newSupplier, error: supError } = await supabase
                    .from('suppliers')
                    .insert({
                        workspace: workspace?.id,
                        nombreComercial: newSupplierName,
                        rfc: newSupplierRFC,
                        email: newSupplierEmail,
                        activo: true
                    })
                    .select()
                    .single();

                if (supError) throw supError;
                
                setSuppliers(prev => [...prev, newSupplier]);
                setSupplierId(newSupplier.id);
                setSupplierType('supplier');
                setIsCreatingSupplier(false);
                // Proceed with the current supplierId set to the new one
            }

            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                alert('Monto inválido');
                return;
            }

            const payload: any = {
                concept,
                amount: numAmount,
                due_date: new Date(dueDate).toISOString(),
                notes
            };

            if (supplierType === 'supplier') {
                payload.supplier_type = 'supplier';
                // If we just created a supplier, supplierId might be delayed in state, so we check if we have it in state or use a fallback if it was just set
                payload.supplier_id = supplierId || undefined;
            } else if (supplierType === 'employee') {
                payload.supplier_type = 'employee';
            } else if (supplierType === 'company_expense') {
                payload.supplier_type = 'company_expense';
            } else if (supplierType === 'custom') {
                payload.supplier_type = 'supplier'; // Fallback
                payload.custom_supplier_name = customName;
            }

            await addPayable(payload);
            onClose();
        } catch (error) {
            console.error('Error creating payable:', error);
            alert('Error al crear la cuenta por pagar');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        Nueva Cuenta por Pagar
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto min-h-0">
                    <form id="new-payable-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Concepto</label>
                            <input
                                type="text"
                                required
                                value={concept}
                                onChange={(e) => setConcept(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="Ej. Pago de renta de oficina"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Monto</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign size={16} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="0.01"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Vencimiento</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CalendarIcon size={16} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="date"
                                        required
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Deuda / Acreedor</label>
                            <select
                                value={supplierType}
                                onChange={(e) => setSupplierType(e.target.value as any)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none mb-3"
                            >
                                <option value="supplier">Proveedor Registrado</option>
                                <option value="employee">Reembolso a Empleado</option>
                                <option value="company_expense">Gasto Corporativo Directo</option>
                                <option value="custom">Acreedor Libre (Sin registrar)</option>
                            </select>

                            {supplierType === 'supplier' && !isCreatingSupplier && (
                                <div className="flex gap-2 items-center">
                                    <select
                                        value={supplierId}
                                        onChange={(e) => setSupplierId(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        required={!isCreatingSupplier}
                                    >
                                        <option value="">-- Seleccionar Proveedor --</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.nombreComercial}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingSupplier(true)}
                                        className="shrink-0 flex items-center justify-center p-2.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                                        title="Registrar Nuevo Proveedor"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            )}

                            {supplierType === 'supplier' && isCreatingSupplier && (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-bold text-slate-800">Alta Rápida de Proveedor</h4>
                                        <button type="button" onClick={() => setIsCreatingSupplier(false)} className="text-xs text-purple-600 hover:underline">Cancelar</button>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={newSupplierName}
                                        onChange={e => setNewSupplierName(e.target.value)}
                                        placeholder="Nombre Comercial *"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSupplierRFC}
                                            onChange={e => setNewSupplierRFC(e.target.value)}
                                            placeholder="RFC (Opcional)"
                                            className="w-1/2 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                        />
                                        <input
                                            type="email"
                                            value={newSupplierEmail}
                                            onChange={e => setNewSupplierEmail(e.target.value)}
                                            placeholder="Correo (Opcional)"
                                            className="w-1/2 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {supplierType === 'custom' && (
                                <input
                                    type="text"
                                    required
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Nombre del acreedor..."
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Notas (Opcional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none min-h-[80px]"
                                placeholder="Cualquier detalle extra..."
                            />
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
                        form="new-payable-form"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {isSubmitting ? 'Guardando...' : 'Crear Cuenta'}
                    </button>
                </div>
            </div>
        </div>
    );
}
