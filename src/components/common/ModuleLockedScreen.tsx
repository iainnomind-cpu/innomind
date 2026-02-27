import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ModuleLockedScreen() {
    const navigate = useNavigate();

    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-[#050d1a] p-4 min-h-[80vh]">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border-8 border-slate-50 dark:border-[#050d1a]">
                    <Lock className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Módulo no disponible en tu plan
                </h2>

                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Actualiza tu plan para acceder a esta funcionalidad y potenciar la operación de tu negocio.
                </p>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => navigate('/crm/settings')} // Assuming settings has billing
                        className="w-full flex items-center justify-center h-12 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#00d4ff] text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
                    >
                        Ver planes disponibles
                    </button>

                    <button
                        onClick={() => navigate('/crm/dashboard')}
                        className="w-full flex items-center justify-center h-12 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-2"
                    >
                        <ArrowLeft size={18} />
                        Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    );
}
