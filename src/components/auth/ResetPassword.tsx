import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, Shield, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Verificar que el usuario tenga una sesión válida de recuperación
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.');
            }
        };
        
        // Supabase intercepta el token de recuperación en el hash de la URL
        // y crea la sesión automáticamente al cargar la página.
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setError('');
            }
        });

        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);
            
            // Redirigir al CRM después de 2 segundos
            setTimeout(() => {
                navigate('/crm/dashboard');
            }, 2000);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Hubo un error al actualizar la contraseña.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen mesh-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-lg">
                <div className="flex flex-col items-center mb-8">
                    <img src="/logo-innomind.png" alt="Innomind" className="h-32 w-auto mb-3" />
                    <span className="text-3xl font-bold tracking-[0.3em] text-white font-display uppercase">Innomind</span>
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="relative px-8 py-8 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/[0.02]"></div>
                        <div className="relative">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                                <KeyRound className="text-blue-400" size={28} />
                            </div>
                            <h1 className="text-2xl font-bold text-white font-display">
                                Nueva Contraseña
                            </h1>
                            <p className="text-slate-400 text-sm mt-2">
                                Ingresa tu nueva contraseña para acceder a tu cuenta
                            </p>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {success ? (
                            <div className="text-center space-y-4 py-8">
                                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                    <Shield className="text-green-400" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white">¡Contraseña Actualizada!</h3>
                                <p className="text-slate-400 text-sm">
                                    Redirigiendo al inicio...
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300 block">Nueva Contraseña</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all hover:border-white/20"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300 block">Confirmar Contraseña</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all hover:border-white/20"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Actualizando...
                                        </div>
                                    ) : (
                                        <>
                                            Actualizar Contraseña <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
