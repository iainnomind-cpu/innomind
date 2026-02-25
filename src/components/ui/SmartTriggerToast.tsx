import { useState, useEffect } from 'react';
import { Lightbulb, X, Sparkles, TrendingUp } from 'lucide-react';

interface TriggerRule {
    id: string;
    triggerModule: string;
    condition: (modules: string[]) => boolean;
    title: string;
    description: string;
    modulesToAdd: string[];
    icon: 'lightbulb' | 'sparkles' | 'trend';
    primaryActionLabel: string;
    secondaryActionLabel: string;
}

export function SmartTriggerToast({
    selectedModules,
    lastAddedModule,
    onActivateModules
}: {
    selectedModules: string[],
    lastAddedModule: string | null,
    onActivateModules: (modules: string[]) => void
}) {
    const [activeSuggestion, setActiveSuggestion] = useState<TriggerRule | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [dismissed, setDismissed] = useState<string[]>([]);

    const rules: TriggerRule[] = [
        {
            id: 'rule-embudo',
            triggerModule: 'Embudo de Ventas',
            condition: (m) => !m.includes('Clientes') && !m.includes('Cotizaciones'),
            title: 'Sugerencia',
            description: 'Para convertir oportunidades en ventas, se recomienda activar Clientes y Cotizaciones.',
            modulesToAdd: ['Clientes', 'Cotizaciones'],
            icon: 'lightbulb',
            primaryActionLabel: 'Activar ambos',
            secondaryActionLabel: 'Mantener solo Embudo'
        },
        {
            id: 'rule-prospectos',
            triggerModule: 'Prospectos',
            condition: (m) => !m.includes('Clientes'),
            title: 'Sugerencia',
            description: 'Se recomienda activar Clientes para convertir prospectos en clientes.',
            modulesToAdd: ['Clientes'],
            icon: 'lightbulb',
            primaryActionLabel: 'Activar Clientes',
            secondaryActionLabel: 'Omitir'
        },
        {
            id: 'rule-cotizaciones',
            triggerModule: 'Cotizaciones',
            condition: (m) => !m.includes('Clientes'),
            title: 'Requisito',
            description: 'Cotizaciones requiere Clientes para funcionar correctamente.',
            modulesToAdd: ['Clientes'],
            icon: 'lightbulb',
            primaryActionLabel: 'Activar Clientes',
            secondaryActionLabel: 'Continuar sin activar'
        },
        {
            id: 'rule-calendario',
            triggerModule: 'Calendario',
            condition: (m) => !m.includes('Prospectos') && !m.includes('Clientes'),
            title: 'Sugerencia',
            description: 'El Calendario funciona mejor con Prospectos o Clientes activos.',
            modulesToAdd: ['Prospectos'],
            icon: 'lightbulb',
            primaryActionLabel: 'Activar Prospectos',
            secondaryActionLabel: 'Omitir'
        },
        {
            id: 'rule-compras',
            triggerModule: 'Compras',
            condition: (m) => !m.includes('Finanzas'),
            title: 'Requisito',
            description: 'Compras necesita Finanzas para registrar egresos.',
            modulesToAdd: ['Finanzas'],
            icon: 'trend',
            primaryActionLabel: 'Activar Finanzas',
            secondaryActionLabel: 'Omitir'
        },
        {
            id: 'rule-inventario',
            triggerModule: 'Inventario',
            condition: (m) => !m.includes('Compras'),
            title: 'Sugerencia',
            description: 'Se recomienda activar Compras para gestionar entradas de inventario.',
            modulesToAdd: ['Compras'],
            icon: 'trend',
            primaryActionLabel: 'Activar Compras',
            secondaryActionLabel: 'Omitir'
        },
        {
            id: 'rule-nodo',
            triggerModule: 'Nodo',
            condition: (m) => !m.includes('Prospectos') && !m.includes('Clientes'),
            title: 'Sugerencia',
            description: 'Nodo se potencia al integrarse con Prospectos o Clientes.',
            modulesToAdd: ['Prospectos'],
            icon: 'sparkles',
            primaryActionLabel: 'Activar Prospectos',
            secondaryActionLabel: 'Omitir'
        }
    ];

    useEffect(() => {
        if (!lastAddedModule) return;

        console.log("[SmartTriggerToast] Evaluating rule for newly selected module:", lastAddedModule);

        // Check if any rule matches the newly added module
        const match = rules.find(r => {
            const isMatch = r.triggerModule === lastAddedModule && r.condition(selectedModules) && !dismissed.includes(r.id);
            if (isMatch) console.log(`[SmartTriggerToast] Matched rule for ${lastAddedModule}:`, r.title);
            return isMatch;
        });

        if (match) {
            // Instantly apply suggestion
            setIsVisible(false); // Quick hide if there was one
            // We use a tiny timeout just to allow React's batched render of the hide before showing the new one
            const timer = setTimeout(() => {
                setActiveSuggestion(match);
                setIsVisible(true);
            }, 10);

            return () => clearTimeout(timer);
        }
    }, [lastAddedModule, selectedModules]);

    if (!activeSuggestion || !isVisible) return null;

    const Icon = activeSuggestion.icon === 'sparkles' ? Sparkles : activeSuggestion.icon === 'trend' ? TrendingUp : Lightbulb;
    const iconColor = activeSuggestion.icon === 'sparkles' ? 'text-purple-600 bg-purple-100' : activeSuggestion.icon === 'trend' ? 'text-blue-600 bg-blue-100' : 'text-amber-600 bg-amber-100';

    return (
        <div className="absolute bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 relative overflow-hidden ring-1 ring-slate-900/5">

                {/* Close Button */}
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setDismissed(prev => [...prev, activeSuggestion.id]);
                    }}
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

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => {
                                    onActivateModules(activeSuggestion.modulesToAdd);
                                    setIsVisible(false);
                                    setDismissed(prev => [...prev, activeSuggestion.id]);
                                }}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
                            >
                                {activeSuggestion.primaryActionLabel}
                            </button>
                            <button
                                onClick={() => {
                                    setIsVisible(false);
                                    setDismissed(prev => [...prev, activeSuggestion.id]);
                                }}
                                className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors py-2 px-1 text-left"
                            >
                                {activeSuggestion.secondaryActionLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
