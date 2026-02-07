
import React, { useState } from 'react';
import { Calculator, Clock, TrendingUp, Calendar, DollarSign, ArrowRight } from 'lucide-react';

export default function ROICalculator() {
    const [employees, setEmployees] = useState('');
    const [revenue, setRevenue] = useState('');
    const [hours, setHours] = useState('');
    const [solution, setSolution] = useState('saas');
    const [result, setResult] = useState<{ annualSavings: string, timeRecovered: string, roi: string, implementationTime: string } | null>(null);

    const calculateROI = () => {
        // Basic calculation logic for demonstration
        const emp = parseInt(employees) || 0; // Not used in simple calc but could be
        const rev = parseInt(revenue.replace(/[^0-9]/g, '')) || 0;
        const hrs = parseInt(hours) || 0;

        // Assumptions:
        // Manual hour cost = $25 avg
        // Efficiency gain = 30% of manual hours + 5% revenue optimization

        // Only calculate if inputs are present
        if (!rev && !hrs) return;

        const hourlyRate = 25;
        const moneySavedFromTime = hrs * hourlyRate;
        const moneySavedFromEfficiency = rev * 0.02; // 2% revenue leak prevention

        const monthlySavings = moneySavedFromTime + moneySavedFromEfficiency;
        const annualSavings = monthlySavings * 12;

        // Time recovered: 40% of manual hours
        const timeRecovered = hrs * 0.4;

        const time = solution === 'saas' ? "30 días" : "4 meses";
        const roiVal = solution === 'saas' ? "320%" : "215%"; // SaaS has higher immediate ROI due to lower initial cost

        setResult({
            annualSavings: annualSavings.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
            timeRecovered: Math.round(timeRecovered) + " horas/mes",
            roi: `${roiVal} en el primer año`,
            implementationTime: time
        });
    };

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400 mb-4">
                        <Calculator size={24} />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4">
                        Calcule su Retorno de Inversión
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Descubra cuánto puede ahorrar su empresa con Innomind
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Inputs */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); calculateROI(); }}>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Número de empleados
                                </label>
                                <input
                                    type="number"
                                    placeholder="Ej: 50"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={employees}
                                    onChange={(e) => setEmployees(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Ingresos mensuales aproximados
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-500">$</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="100,000"
                                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={revenue}
                                        onChange={(e) => setRevenue(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Horas mensuales en tareas manuales
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Clock size={16} className="text-slate-500" />
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="Ej: 200"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Tipo de solución que le interesa
                                </label>
                                <select
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                    value={solution}
                                    onChange={(e) => setSolution(e.target.value)}
                                >
                                    <option value="saas">Plataforma SaaS</option>
                                    <option value="custom">Desarrollo a Medida</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                            >
                                Calcular mi ROI
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    <div className={`transition-all duration-500 ${result ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 blur-sm'}`}>
                        <div className="bg-slate-900 dark:bg-black text-white p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-green-500/10 rounded-full blur-3xl"></div>

                            <h3 className="text-2xl font-bold mb-8 relative z-10">Resultados Estimados</h3>

                            <div className="space-y-6 relative z-10">
                                <ResultItem
                                    icon={<DollarSign className="text-green-400" />}
                                    label="Ahorro anual estimado"
                                    value={result?.annualSavings || "$0"}
                                    highlight
                                />
                                <ResultItem
                                    icon={<Clock className="text-blue-400" />}
                                    label="Tiempo recuperado"
                                    value={result?.timeRecovered || "0 horas/mes"}
                                />
                                <ResultItem
                                    icon={<TrendingUp className="text-green-400" />}
                                    label="ROI esperado"
                                    value={result?.roi || "0%"}
                                    highlight
                                />
                                <ResultItem
                                    icon={<Calendar className="text-purple-400" />}
                                    label="Tiempo de implementación"
                                    value={result?.implementationTime || "-"}
                                />
                            </div>

                            {result && (
                                <div className="mt-8 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                                    <button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                                        Solicitar Análisis Detallado <ArrowRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ResultItem({ icon, label, value, highlight = false }: any) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                    {icon}
                </div>
                <span className="text-slate-300 font-medium">{label}</span>
            </div>
            <span className={`text-xl font-bold ${highlight ? 'text-green-400' : 'text-white'}`}>
                {value}
            </span>
        </div>
    );
}
