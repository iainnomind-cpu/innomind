import { useState, useEffect } from 'react';
import { Lightbulb, Plus, X } from 'lucide-react';

interface Suggestion {
    id: string;
    text: string;
    moduleToAdd: string;
}

export function SmartSuggestion({ selectedModules, onAddModule }: { selectedModules: string[], onAddModule: (m: string) => void }) {
    const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
    const [dismissed, setDismissed] = useState<string[]>([]);

    useEffect(() => {
        // Defined Rules
        const rules = [
            {
                id: 'rule-finance-sales',
                condition: () => selectedModules.includes('Pipeline de Ventas') && !selectedModules.includes('Flujo de Caja Predictivo'),
                text: "Conecta tus ventas con tus finanzas para predecir tu flujo de caja automáticamente.",
                moduleToAdd: 'Flujo de Caja Predictivo'
            },
            {
                id: 'rule-marketing-leads',
                condition: () => selectedModules.includes('Leads y Prospección') && selectedModules.includes('Pipeline de Ventas') && !selectedModules.includes('Automatización de Marketing'),
                text: "Automatiza el seguimiento de tus leads calificados con campañas personalizadas.",
                moduleToAdd: 'Automatización de Marketing'
            },
            {
                id: 'rule-inventory-finance',
                condition: () => selectedModules.includes('Gestión de Inventario') && !selectedModules.includes('Flujo de Caja Predictivo'),
                text: "Controla el impacto financiero de tu stock en tiempo real.",
                moduleToAdd: 'Flujo de Caja Predictivo'
            }
        ];

        // Find first matching rule that hasn't been dismissed
        const match = rules.find(r => r.condition() && !dismissed.includes(r.id));

        if (match) {
            setSuggestion({ id: match.id, text: match.text, moduleToAdd: match.moduleToAdd });
        } else {
            setSuggestion(null);
        }
    }, [selectedModules, dismissed]);

    if (!suggestion) return null;

    return (
        <div className="mt-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                    <button
                        onClick={() => setDismissed(prev => [...prev, suggestion.id])}
                        className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="shrink-0 pt-1">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                        <Lightbulb size={16} />
                    </div>
                </div>

                <div className="flex-1 pr-6">
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-2">
                        Sugerencia Innomind
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                            Smart
                        </span>
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-300/80 mb-3">
                        {suggestion.text}
                    </p>
                    <button
                        onClick={() => {
                            onAddModule(suggestion.moduleToAdd);
                            setDismissed(prev => [...prev, suggestion.id]);
                        }}
                        className="text-xs font-bold bg-amber-200 hover:bg-amber-300 dark:bg-amber-800 dark:hover:bg-amber-700 text-amber-900 dark:text-amber-100 py-1.5 px-3 rounded-md transition-colors flex items-center gap-1.5 w-fit"
                    >
                        <Plus size={12} strokeWidth={3} />
                        Agregar {suggestion.moduleToAdd}
                    </button>
                </div>
            </div>
        </div>
    );
}
