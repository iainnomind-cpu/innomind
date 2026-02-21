import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, CheckCircle2, Brain, Activity, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [autoFilled, setAutoFilled] = useState(false);

    useEffect(() => {
        if (location.state?.username) {
            setEmail(location.state.username);
            if (location.state?.password) {
                setPassword(location.state.password);
                setAutoFilled(true);
            }
            if (location.state?.message) {
                setAutoFilled(true);
            }
        }
    }, [location.state]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            if (data.user) {
                const { error: profileError } = await supabase
                    .from('users')
                    .update({ last_sign_in_at: new Date().toISOString() })
                    .eq('id', data.user.id);

                if (profileError) console.error('Error updating profile:', profileError);

                navigate('/crm/dashboard');
            }
        } catch (err: any) {
            console.error(err);
            setError('Correo o contraseña incorrectos.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen mesh-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects — matching Hero */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-lg">
                {/* Logo / Brand */}
                <div className="flex flex-col items-center mb-8">
                    <img src="/logo-innomind.png" alt="Innomind" className="h-32 w-auto mb-3" />
                    <span className="text-3xl font-bold tracking-[0.3em] text-white font-display uppercase">Innomind</span>
                    <span className="text-xs tracking-[0.35em] text-slate-400 mt-1 uppercase">Make it better with AI</span>
                </div>

                {/* Main Card */}
                <div className="glass-panel rounded-2xl overflow-hidden">
                    {/* Header with gradient */}
                    <div className="relative px-8 py-8 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/[0.02]"></div>
                        <div className="relative">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                                <Lock className="text-blue-400" size={28} />
                            </div>
                            <h1 className="text-2xl font-bold text-white font-display">Bienvenido de nuevo</h1>
                            <p className="text-slate-400 text-sm mt-2">Ingresa a tu cuenta para acceder al CRM</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">

                        {autoFilled && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                                <CheckCircle2 className="text-green-400 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm font-bold text-green-300">
                                        {location.state?.message ? '¡Casi listo!' : '¡Cuenta creada con éxito!'}
                                    </p>
                                    <p className="text-xs text-green-400/80">
                                        {location.state?.message || 'Tus credenciales se han autocompletado.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 block">Usuario o Email</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all hover:border-white/20"
                                        placeholder="nombre@empresa.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 block">Contraseña</label>
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

                            {/* Forgot password link */}
                            <div className="flex justify-end">
                                <a href="#" className="text-xs text-slate-400 hover:text-blue-400 transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </a>
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
                                        Iniciando sesión...
                                    </div>
                                ) : (
                                    <>
                                        Iniciar Sesión <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>


                    </div>
                </div>

                {/* Trust badges */}
                <div className="mt-8 flex items-center justify-center gap-6 text-slate-500">
                    <div className="flex items-center gap-2 text-xs">
                        <Shield size={14} className="text-green-500" />
                        <span>Datos encriptados</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <Activity size={14} className="text-blue-400" />
                        <span>99.9% uptime</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <Brain size={14} className="text-purple-400" />
                        <span>IA integrada</span>
                    </div>
                </div>

                {/* Back to home */}
                <div className="mt-6 text-center">
                    <a href="/" className="text-sm text-slate-500 hover:text-white transition-colors">
                        ← Volver al inicio
                    </a>
                </div>
            </div>
        </div>
    );
}
