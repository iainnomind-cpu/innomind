import React from 'react';
import { Lock, Sparkles, CreditCard, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function TrialExpiredScreen() {
    const { signOut } = useAuth();
    const { companyProfile } = useUsers();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
    };

    const handleUpgrade = () => {
        // En un futuro esto llamará a Stripe. Por ahora redirige a precios o abre modal.
        navigate('/precios');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                {/* Header Pattern */}
                <div className="h-32 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    <div className="z-10 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg">
                        <Lock className="text-white w-10 h-10" />
                    </div>
                </div>

                <div className="p-8 text-center space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Tu periodo de prueba ha terminado</h1>
                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                            Esperamos que hayas disfrutado tus 30 días con Innomind. Para seguir usando tu workspace <span className="font-semibold text-slate-700">{companyProfile?.nombreEmpresa}</span> y no perder acceso a tu información, actualiza a un plan premium.
                        </p>
                    </div>

                    <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 text-left">
                        <h3 className="font-semibold text-emerald-900 flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            Mantén el acceso a:
                        </h3>
                        <ul className="space-y-2 text-sm text-emerald-800">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                Tu pipeline y base de datos
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                Cotizaciones y reportes
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                Configuración de tu empresa
                            </li>
                        </ul>
                    </div>

                    <div className="pt-2 space-y-3">
                        <button
                            onClick={handleUpgrade}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                        >
                            <CreditCard className="w-5 h-5" />
                            Contratar Plan
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                        
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 font-medium py-3 px-4 rounded-xl border border-slate-200 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
