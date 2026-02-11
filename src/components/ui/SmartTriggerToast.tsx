import { useState, useEffect } from 'react';
import { Lightbulb, X, Sparkles, TrendingUp } from 'lucide-react';

interface TriggerRule {
    id: string;
    condition: (modules: string[]) => boolean;
    title: string;
    description: string;
    moduleToAdd: string;
    icon: 'lightbulb' | 'sparkles' | 'trend';
    primaryActionLabel?: string;
    secondaryActionLabel?: string;
}

export function SmartTriggerToast({ selectedModules, onActivateModule }: { selectedModules: string[], onActivateModule: (module: string) => void }) {
    const [activeSuggestion, setActiveSuggestion] = useState<TriggerRule | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [dismissed, setDismissed] = useState<string[]>([]);

    const rules: TriggerRule[] = [
        {
            id: 'rule-sales-finance',
            condition: (m) => m.includes('Pipeline de Ventas') && !m.includes('Flujo de Caja Predictivo'),
            title: 'Sugerencia',
            description: 'Activa "Flujo de Caja Predictivo" para automatizar la facturación cuando cierres ventas.',
            moduleToAdd: 'Flujo de Caja Predictivo',
            icon: 'lightbulb',
            primaryActionLabel: 'Activar ahora',
            secondaryActionLabel: 'Después'
        },
        {
            id: 'rule-leads-marketing',
            condition: (m) => m.includes('Leads y Prospección') && m.includes('Pipeline de Ventas') && !m.includes('Automatización de Marketing'),
            title: 'Pack Recomendado',
            description: 'Añade "Automatización de Marketing". Empresas similares aumentan conversión 40% con esta combinación.',
            moduleToAdd: 'Automatización de Marketing',
            icon: 'sparkles',
            primaryActionLabel: 'Añadir',
            secondaryActionLabel: '+2,000 MXN/mes'
        },
        {
            id: 'rule-inventory-finance',
            condition: (m) => m.includes('Gestión de Compras') && m.includes('Gestión de Inventario') && !m.includes('Flujo de Caja Predictivo'),
            title: 'Combo Operativo',
            description: 'Activa "Flujo de Caja Predictivo" para controlar el capital inmovilizado automáticamente.',
            moduleToAdd: 'Flujo de Caja Predictivo',
            icon: 'trend',
            primaryActionLabel: 'Activar',
            secondaryActionLabel: 'Incluido en tu plan'
        }
    ];

    useEffect(() => {
        // Reset state when selection changes to avoid stale suggestions
        setIsVisible(false);
        setActiveSuggestion(null);

        const match = rules.find(r => r.condition(selectedModules) && !dismissed.includes(r.id));

        if (match) {
            const timer = setTimeout(() => {
                setActiveSuggestion(match);
                setIsVisible(true);
            }, 500); // Immediate feedback (500ms debounce)

            return () => clearTimeout(timer);
        }
    }, [selectedModules, dismissed]);

    if (!activeSuggestion || !isVisible) return null;

    const Icon = activeSuggestion.icon === 'sparkles' ? Sparkles : activeSuggestion.icon === 'trend' ? TrendingUp : Lightbulb;
    const iconColor = activeSuggestion.icon === 'sparkles' ? 'text-purple-600 bg-purple-100' : activeSuggestion.icon === 'trend' ? 'text-blue-600 bg-blue-100' : 'text-amber-600 bg-amber-100';

    return (
        <div className="absolute bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 relative overflow-hidden ring-1 ring-slate-900/5">

                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X size={16} />
                </button>

                <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                        <Icon size={20} className={activeSuggestion.icon === 'sparkles' ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">{activeSuggestion.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                            {activeSuggestion.description}
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    onActivateModule(activeSuggestion.moduleToAdd);
                                    setIsVisible(false);
                                    setDismissed(prev => [...prev, activeSuggestion.id]);
                                }}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                            >
                                {activeSuggestion.primaryActionLabel || 'Activar'}
                            </button>
                            {activeSuggestion.secondaryActionLabel && (
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {activeSuggestion.secondaryActionLabel}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
