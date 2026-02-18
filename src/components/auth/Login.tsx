import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    // const { users } = useUsers();

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
                // If we have a message (like "Confirm your email"), we can show it as an error or a specific alert
                // For now, let's set it as autoFilled true but maybe use a different UI or just let the user see the form filled.
                // Or better, let's treat it as a success message if it comes from registration
                setAutoFilled(true); // Re-using the "Account created successfully" UI logic for now
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
                // Upsert user profile
                // We use 'upsert' to create if not exists, or update last login.
                // In a real scenario, you might want to only insert on signup.
                // But request says: "Crear o actualizar registro del usuario... s no existe"
                const { error: profileError } = await supabase
                    .from('users')
                    .upsert({
                        id: data.user.id,
                        email: data.user.email,
                        last_sign_in_at: new Date().toISOString(),
                        // username/workspace logic would go here if we had it from signup
                    }, { onConflict: 'id' });

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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">

                {/* Header */}
                <div className="px-8 py-6 bg-blue-600 text-center">
                    <div className="mx-auto w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Bienvenido</h1>
                    <p className="text-blue-100 text-sm mt-1">Ingresa a tu cuenta Innomind</p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">

                    {autoFilled && (
                        <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-start gap-3 animate-in slide-in-from-top-2">
                            <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-sm font-bold text-green-800">
                                    {location.state?.message ? '¡Casi listo!' : '¡Cuenta creada con éxito!'}
                                </p>
                                <p className="text-xs text-green-700">
                                    {location.state?.message || 'Tus credenciales se han autocompletado.'}
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 block">Usuario o Email</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="nombre@empresa.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 block">Contraseña</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                'Iniciando...'
                            ) : (
                                <>
                                    Iniciar Sesión <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500">
                        ¿No tienes una cuenta? <a href="#" className="text-blue-600 font-semibold hover:underline">Regístrate</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
