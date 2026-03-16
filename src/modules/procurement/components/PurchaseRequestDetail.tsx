import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Info, Tag, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PurchaseRequestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        function isUUID(value: string) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return uuidRegex.test(value);
        }

        const fetchRequest = async () => {
            if (!id || !isUUID(id)) {
                navigate("/compras/solicitudes");
                return;
            }

            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('purchase_requests')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setRequest(data);
            } catch (err: any) {
                console.error("Error fetching request detail:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="p-8 text-center">
                <XCircle className="mx-auto text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar la solicitud</h2>
                <p className="text-gray-500 mb-6">{error || "No se pudo encontrar la solicitud de compra."}</p>
                <button
                    onClick={() => navigate('/compras/solicitudes')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                    Volver a Listado
                </button>
            </div>
        );
    }

    const statusConfig: any = {
        pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: <Clock size={16} /> },
        reviewing: { label: 'En Revisión', color: 'bg-blue-100 text-blue-700', icon: <Info size={16} /> },
        approved: { label: 'Aprobada', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={16} /> },
        rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700', icon: <XCircle size={16} /> },
        converted: { label: 'Convertida', color: 'bg-indigo-100 text-indigo-700', icon: <Tag size={16} /> },
        ordered: { label: 'Orden Generada', color: 'bg-indigo-100 text-indigo-700', icon: <Tag size={16} /> }
    };

    const config = statusConfig[request.status] || statusConfig.pending;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/compras/solicitudes')}
                    className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Detalles de Solicitud</h1>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sm:bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{request.title || request.custom_item_name}</h2>
                        <p className="text-sm text-gray-500">ID: {request.id}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${config.color}`}>
                        {config.icon} {config.label}
                    </span>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Información del Requerimiento</h3>
                            <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 flex items-center gap-2"><Tag size={16} /> Cantidad</span>
                                    <span className="font-bold text-gray-900">{request.quantity} {request.uom}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 flex items-center gap-2"><Calendar size={16} /> Fecha Requerida</span>
                                    <span className="font-bold text-gray-900">
                                        {request.required_date ? format(new Date(request.required_date), 'PPP', { locale: es }) : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 flex items-center gap-2"><Info size={16} /> Departamento</span>
                                    <span className="font-bold text-gray-900">{request.department || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Justificación</h3>
                            <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-50 min-h-[120px]">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {request.description || request.reason || 'No se proporcionó una justificación detallada.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400 font-medium px-1">
                            <span>Solicitado el: {format(new Date(request.created_at), 'dd/MM/yyyy')}</span>
                            <span className="capitalize">Prioridad: {request.priority}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
