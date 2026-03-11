import { AccountsPayable } from '@/types';
import { ArrowLeft, Calendar, DollarSign, FileText, CheckCircle, AlertCircle, Clock, User, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AccountsPayableDetailProps {
    payable: AccountsPayable;
    onBack: () => void;
}

export default function AccountsPayableDetail({ payable, onBack }: AccountsPayableDetailProps) {
    const getStatusBadge = (payable: AccountsPayable) => {
        if (payable.status === 'paid') return <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1.5"><CheckCircle size={14} /> Pagado</span>;
        if (payable.status === 'cancelled') return <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1.5"><AlertCircle size={14} /> Cancelado</span>;
        return <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1.5"><Clock size={14} /> Pendiente</span>;
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Expediente Digital</h2>
                    <p className="text-sm text-gray-500 font-medium tracking-wide">DETALLE DE OBLIGACIÓN FINANCIERA</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                        <div className="p-1 bg-gradient-to-r from-purple-600 to-indigo-600 h-2"></div>
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Concepto</h3>
                                    <p className="text-xl font-bold text-gray-900 leading-snug">{payable.concept}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {getStatusBadge(payable)}
                                    <div className="text-xs text-gray-400 font-medium italic">ID: {payable.id.slice(0, 8)}...</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Monto Total</div>
                                    <div className="text-lg font-bold text-gray-900">${payable.amount.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Saldo Pendiente</div>
                                    <div className="text-lg font-bold text-red-600">${payable.balance_due.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Vencimiento</div>
                                    <div className="text-lg font-bold text-gray-900">{format(new Date(payable.due_date), "dd/MM/yyyy")}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Fecha Emisión</div>
                                    <div className="text-lg font-bold text-gray-900">{format(new Date(payable.created_at), "dd/MM/yyyy")}</div>
                                </div>
                            </div>

                            {payable.notes && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <FileText size={16} className="text-gray-400" />
                                        Notas Adicionales
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed p-4 bg-gray-50 rounded-xl border-l-4 border-purple-200">{payable.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment History Placeholder (Would require fetching from accounts_payable_payments) */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8 space-y-6">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                            <Clock size={22} className="text-purple-600" />
                            Historial de Pagos y Evidencia
                        </h3>

                        {payable.status === 'paid' ? (
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-gray-900">Pago de Liquidación</span>
                                            <span className="font-black text-gray-900">${payable.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-4 mt-1">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {payable.paid_at ? format(new Date(payable.paid_at), "dd MMM yyyy", { locale: es }) : 'N/A'}</span>
                                            <span className="flex items-center gap-1"><DollarSign size={12} /> {payable.payment_method || 'N/A'}</span>
                                        </div>
                                        {/* Reference if any */}
                                        {payable.payment_reference && (
                                            <div className="mt-2 text-xs font-medium text-gray-400 bg-gray-100 w-max px-2 py-1 rounded">
                                                Ref: {payable.payment_reference}
                                            </div>
                                        )}
                                    </div>
                                    {/* Link to evidence (Simulated for Now) */}
                                    <button className="flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors self-center">
                                        <ExternalLink size={14} />
                                        Ver Comprobante
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3 grayscale opacity-50 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                <Clock size={48} />
                                <p className="font-bold uppercase tracking-widest text-[10px]">Sin pagos registrados aún</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Supplier Widget */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 space-y-6">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Información del Proveedor</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl font-black">
                                    {(payable.supplier?.nombreComercial || 'P').charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{payable.supplier?.nombreComercial || 'Especial'}</div>
                                    <div className="text-xs text-gray-500 font-medium">RFC: {payable.supplier?.rfc || 'S/RFC'}</div>
                                </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <User size={16} className="text-gray-400" />
                                    <span>{payable.supplier?.email || 'Sin correo registrado'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Clock size={16} className="text-gray-400" />
                                    <span>Crédito: {payable.supplier?.condicionesPago || 0} días</span>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-gray-50 text-gray-600 font-bold rounded-xl text-xs hover:bg-gray-100 transition-all active:scale-95 border border-gray-200/50 uppercase tracking-wide">
                                Ver Perfil Proveedor
                            </button>
                        </div>
                    </div>

                    {/* Internal Audit Wrapper */}
                    <div className="bg-gray-900 rounded-2xl p-6 text-white space-y-4 shadow-2xl shadow-indigo-900/20">
                        <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Trazabilidad Interna</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs uppercase border border-white/5">
                                    AD
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-indigo-50">Admin Developer</div>
                                    <div className="text-[10px] text-indigo-300/60 font-medium">Registró esta obligación</div>
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-[10px] text-indigo-200 font-bold mb-1">FECHA REGISTRO</div>
                                <div className="text-xs font-mono">{format(new Date(payable.created_at), "dd/MM/yyyy HH:mm:ss")}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
