import React, { useState, useEffect } from 'react';
import {
    CreditCard, CheckCircle, AlertTriangle, XCircle, Clock,
    RefreshCw, ExternalLink, FileText, Zap, PauseCircle, ChevronRight,
    Shield
} from 'lucide-react';
import { useUsers } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';

const FINAPP_URL = 'https://finapp-innomind.vercel.app';

interface Invoice {
    id: string;
    amount: number;
    currency: string;
    status: string;
    date: string | null;
    pdfUrl: string | null;
    hostedUrl: string | null;
}

interface StripeSubData {
    status: string;
    plan: string | null;
    currentPeriodEnd: string;
    trialEnd: string | null;
    cancelAtPeriodEnd: boolean;
    daysRemaining: number;
    invoices: Invoice[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
    trialing: {
        label: 'En Prueba', color: 'text-amber-700', bg: 'bg-amber-50',
        border: 'border-amber-200', Icon: Clock,
    },
    active: {
        label: 'Activa', color: 'text-emerald-700', bg: 'bg-emerald-50',
        border: 'border-emerald-200', Icon: CheckCircle,
    },
    past_due: {
        label: 'Pago Pendiente', color: 'text-red-700', bg: 'bg-red-50',
        border: 'border-red-200', Icon: AlertTriangle,
    },
    paused: {
        label: 'Pausada', color: 'text-slate-600', bg: 'bg-slate-50',
        border: 'border-slate-200', Icon: PauseCircle,
    },
    canceled: {
        label: 'Cancelada', color: 'text-red-700', bg: 'bg-red-50',
        border: 'border-red-200', Icon: XCircle,
    },
    unpaid: {
        label: 'Sin Pago', color: 'text-red-700', bg: 'bg-red-50',
        border: 'border-red-200', Icon: AlertTriangle,
    },
};

const PLAN_NAMES: Record<string, string> = {
    core: 'Corē ERP',
    trak: 'Trak Projects',
    'crm-erp': 'Corē ERP',
    'project-tracker': 'Trak Projects',
};

function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
}

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(amount);
}

export default function BillingSettings() {
    const { user } = useAuth();
    const {
        subscriptionStatus, subscriptionPlan, currentPeriodEnd,
        cancelAtPeriodEnd, trialDaysRemaining, refreshSubscription,
        enabledModules,
    } = useUsers();

    const [liveData, setLiveData] = useState<StripeSubData | null>(null);
    const [isLoadingLive, setIsLoadingLive] = useState(false);
    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const email = user?.email;

    // Fetch live data from Stripe
    const fetchLiveData = async () => {
        if (!email) return;
        setIsLoadingLive(true);
        setError(null);
        try {
            const res = await fetch(`${FINAPP_URL}/api/subscription?email=${encodeURIComponent(email)}`);
            const data = await res.json();
            if (data.status && data.status !== 'no_customer' && data.status !== 'no_subscription') {
                setLiveData(data);
            } else {
                setLiveData(null);
            }
        } catch {
            setError('No se pudo conectar con el servidor de pagos.');
        } finally {
            setIsLoadingLive(false);
        }
    };

    useEffect(() => {
        fetchLiveData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    const handlePortal = async () => {
        if (!email) return;
        setIsPortalLoading(true);
        try {
            const res = await fetch(`${FINAPP_URL}/api/billing-portal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data?.url) {
                window.location.href = data.url;
            } else {
                setError('No se pudo abrir el portal de facturación.');
            }
        } catch {
            setError('Error al conectar con el servidor.');
        } finally {
            setIsPortalLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!email) return;
        setIsCheckoutLoading(true);
        try {
            const planKey = enabledModules?.includes('trak') && !enabledModules?.includes('crm-erp') ? 'trak' : 'core';
            const res = await fetch(`${FINAPP_URL}/api/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planKey, email }),
            });
            const data = await res.json();
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch {
            setError('Error al conectar con Stripe.');
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    // Determine effective status (prefer live data over DB)
    const effectiveStatus = liveData?.status || subscriptionStatus || 'trialing';
    const effectivePlan = liveData?.plan || subscriptionPlan;
    const effectivePeriodEnd = liveData?.currentPeriodEnd || currentPeriodEnd?.toISOString();
    const effectiveCancelAtEnd = liveData?.cancelAtPeriodEnd ?? cancelAtPeriodEnd;
    const effectiveDaysRemaining = liveData?.daysRemaining ?? trialDaysRemaining ?? 0;

    const statusCfg = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.trialing;
    const StatusIcon = statusCfg.Icon;

    const handleRefresh = async () => {
        await fetchLiveData();
        await refreshSubscription();
    };

    return (
        <div className="space-y-6">

            {/* Status Card */}
            <div className={`rounded-2xl border-2 ${statusCfg.border} ${statusCfg.bg} p-6`}>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${statusCfg.bg}`}>
                            <StatusIcon className={`w-6 h-6 ${statusCfg.color}`} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estado de Suscripción</p>
                            <p className={`text-xl font-bold ${statusCfg.color}`}>{statusCfg.label}</p>
                            {effectivePlan && (
                                <p className="text-sm text-slate-600 mt-0.5">
                                    Plan: <span className="font-semibold">{PLAN_NAMES[effectivePlan] || effectivePlan}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoadingLive}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoadingLive ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                </div>

                {/* Trial / Period info */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {effectiveStatus === 'trialing' && (
                        <div className="bg-white/70 rounded-xl p-3">
                            <p className="text-xs text-slate-500">Prueba gratuita termina</p>
                            <p className="font-semibold text-slate-800">{formatDate(liveData?.trialEnd || effectivePeriodEnd)}</p>
                            <p className={`text-sm font-medium mt-0.5 ${effectiveDaysRemaining <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
                                {effectiveDaysRemaining} día{effectiveDaysRemaining !== 1 ? 's' : ''} restante{effectiveDaysRemaining !== 1 ? 's' : ''}
                            </p>
                        </div>
                    )}
                    {effectiveStatus === 'active' && (
                        <div className="bg-white/70 rounded-xl p-3">
                            <p className="text-xs text-slate-500">
                                {effectiveCancelAtEnd ? 'Acceso hasta' : 'Próxima renovación'}
                            </p>
                            <p className="font-semibold text-slate-800">{formatDate(effectivePeriodEnd)}</p>
                            {effectiveCancelAtEnd && (
                                <p className="text-xs text-amber-600 mt-0.5 font-medium">
                                    ⚠️ Se cancelará al final del período
                                </p>
                            )}
                        </div>
                    )}
                    {effectiveStatus === 'past_due' && (
                        <div className="bg-white/70 rounded-xl p-3">
                            <p className="text-xs text-slate-500">Acción requerida</p>
                            <p className="font-semibold text-red-700">Actualiza tu método de pago</p>
                        </div>
                    )}
                    {effectiveStatus === 'canceled' && (
                        <div className="bg-white/70 rounded-xl p-3">
                            <p className="text-xs text-slate-500">Suscripción cancelada</p>
                            <p className="font-semibold text-slate-700">Acceso expirado</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-400" />
                    Gestionar Suscripción
                </h3>
                <div className="space-y-3">

                    {/* Active or Trialing → Manage in portal */}
                    {(effectiveStatus === 'active' || effectiveStatus === 'trialing' || effectiveStatus === 'past_due') && (
                        <button
                            onClick={handlePortal}
                            disabled={isPortalLoading}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
                        >
                            <span className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                {isPortalLoading ? 'Redirigiendo...' : 'Portal de Facturación'}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}

                    {/* Trialing → also offer direct checkout */}
                    {effectiveStatus === 'trialing' && (
                        <button
                            onClick={handleCheckout}
                            disabled={isCheckoutLoading}
                            className="w-full flex items-center justify-between px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
                        >
                            <span className="flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                {isCheckoutLoading ? 'Redirigiendo...' : 'Activar Suscripción Ahora'}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}

                    {/* Canceled or Paused → re-subscribe */}
                    {(effectiveStatus === 'canceled' || effectiveStatus === 'paused') && (
                        <button
                            onClick={handleCheckout}
                            disabled={isCheckoutLoading}
                            className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
                        >
                            <span className="flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                {isCheckoutLoading ? 'Redirigiendo...' : 'Reactivar Plan'}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}

                    <p className="text-xs text-slate-400 text-center pt-1">
                        El portal de facturación te permite cancelar, cambiar plan, actualizar tarjeta y ver facturas.
                    </p>
                </div>
            </div>

            {/* Invoice History */}
            {liveData?.invoices && liveData.invoices.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        Historial de Pagos
                    </h3>
                    <div className="space-y-2">
                        {liveData.invoices.map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">
                                        {formatCurrency(inv.amount, inv.currency)}
                                    </p>
                                    <p className="text-xs text-slate-500">{formatDate(inv.date)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {inv.status === 'paid' ? 'Pagado' : inv.status}
                                    </span>
                                    {inv.pdfUrl && (
                                        <a
                                            href={inv.pdfUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Descargar PDF"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading state */}
            {isLoadingLive && !liveData && (
                <div className="text-center py-8 text-slate-400 text-sm">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Consultando estado de suscripción...
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
}
