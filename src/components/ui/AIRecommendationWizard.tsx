import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Check, Bot, Loader2, ChevronRight, X } from 'lucide-react';

interface AIRecommendationWizardProps {
    onApplyRecommendation: (modules: string[]) => void;
    onCancel: () => void;
}

interface RecommendationResult {
    modulos_recomendados: string[];
    justificacion: string;
    tipo_negocio_detectado: string;
}

export function AIRecommendationWizard({ onApplyRecommendation, onCancel }: AIRecommendationWizardProps) {
    const [status, setStatus] = useState<'idle' | 'questionnaire' | 'analyzing' | 'result'>('idle');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [result, setResult] = useState<RecommendationResult | null>(null);

    const questions = [
        {
            id: 1,
            question: "¿Cuál es el principal reto actual de tu negocio?",
            options: [
                "Conseguir más clientes",
                "Organizar mis ventas",
                "Controlar mejor mis finanzas",
                "Gestionar mejor a mi equipo",
                "Tengo varios de estos problemas"
            ]
        },
        {
            id: 2,
            question: "¿Tu negocio maneja inventario o productos físicos?",
            options: ["Sí", "No", "A veces"]
        },
        {
            id: 3,
            question: "¿Tienes actualmente un proceso formal de ventas?",
            options: ["Sí, usamos CRM", "Sí, pero es manual", "No tenemos proceso definido"]
        },
        {
            id: 4,
            question: "¿Cuántas personas trabajan en tu empresa?",
            options: ["Solo yo", "2 a 5 personas", "6 a 20 personas", "Más de 20"]
        }
    ];

    const handleStart = () => setStatus('questionnaire');

    const handleAnswer = (answer: string) => {
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));

        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 250); // Small delay for UX
        } else {
            setStatus('analyzing');
            processRecommendation();
        }
        // The useEffect will trigger processRecommendation
    }
    const generateRecommendationMock = () => {
        // Fallback Logic Engine based on User Rules
        const selectedModules = new Set<string>();
        let justification = "";
        let tipoNegocio = "";

        const ans1 = answers[0]; // Reto
        const ans2 = answers[1]; // Inventario
        const ans3 = answers[2]; // Proceso Ventas
        const ans4 = answers[3]; // Equipo

        // Rule 1: Reto
        if (ans1 === "Conseguir más clientes") {
            selectedModules.add("Leads y Prospección");
            selectedModules.add("Automatización de Marketing");
            selectedModules.add("Pipeline de Ventas"); // Often implied
        } else if (ans1 === "Organizar mis ventas") {
            selectedModules.add("Pipeline de Ventas");
        } else if (ans1 === "Controlar mejor mis finanzas") {
            selectedModules.add("Flujo de Caja Predictivo");
        } else if (ans1 === "Gestionar mejor a mi equipo") {
            selectedModules.add("Recursos Humanos (HRM)");
        } else if (ans1 === "Tengo varios de estos problemas") {
            selectedModules.add("Pipeline de Ventas");
            selectedModules.add("Flujo de Caja Predictivo");
        }

        // Rule 2: Inventario
        if (ans2 === "Sí" || ans2 === "A veces") {
            selectedModules.add("Gestión de Inventario");
            selectedModules.add("Gestión de Compras");
        }

        // Rule 3: Proceso Ventas
        if (ans3 === "No tenemos proceso definido") {
            selectedModules.add("Pipeline de Ventas");
        }

        // Rule 4: Equipo
        if (ans4 === "6 a 20 personas" || ans4 === "Más de 20") {
            selectedModules.add("Recursos Humanos (HRM)");
        }

        // Justification & Type Logic (Simplified)
        if (selectedModules.has("Gestión de Inventario")) {
            tipoNegocio = "Empresa de Productos / Retail";
            justification = "Basado en tu manejo de inventario y necesidades operativas, este paquete optimiza tu stock y flujo de caja.";
        } else if (selectedModules.has("Recursos Humanos (HRM)")) {
            tipoNegocio = "Empresa en Crecimiento";
            justification = "Para equipos en expansión, la gestión de talento y procesos definidos es clave.";
        } else {
            tipoNegocio = "Empresa de Servicios / Comercial";
            justification = "Este paquete centraliza tu gestión comercial para potenciar tus ventas y organización.";
        }

        setResult({
            modulos_recomendados: Array.from(selectedModules),
            justificacion: justification,
            tipo_negocio_detectado: tipoNegocio
        });
        setStatus('result');
    };

    const processRecommendation = async () => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

        if (!apiKey) {
            console.error("API Key no encontrada");
            // Fallback to mock logic if no key
            generateRecommendationMock();
            return;
        }

        try {
            const prompt = `
Eres un asesor experto en implementación de CRM-ERP para micro y pequeñas empresas.

Analiza las respuestas del negocio y recomienda un paquete IDEAL de módulos.
No recomiendes solo uno si hay múltiples necesidades.

MÓDULOS DISPONIBLES:

Gestión Comercial:
- Leads y Prospección
- Pipeline de Ventas
- Automatización de Marketing

Gestión Financiera:
- Flujo de Caja Predictivo
- Gestión de Inventario
- Gestión de Compras

Gestión de Talento:
- Recursos Humanos (HRM)

Respuestas del negocio:
- Reto principal: ${answers[0]}
- Maneja inventario: ${answers[1]}
- Proceso de ventas: ${answers[2]}
- Tamaño de empresa: ${answers[3]}

Devuelve respuesta en JSON con este formato:

{
  "modulos_recomendados": [
    "Nombre exacto del módulo",
    "Nombre exacto del módulo"
  ],
  "justificacion": "Explicación breve profesional y clara de por qué este paquete es ideal",
  "tipo_negocio_detectado": "Pequeña empresa comercial, empresa de servicios, etc"
}

Reglas:
- Si el reto es clientes → incluir módulos comerciales
- Si maneja inventario → incluir Gestión de Inventario
- Si no tiene proceso de ventas → incluir Pipeline
- Si tiene equipo mayor a 5 → considerar HRM
- Si menciona varios problemas → combinar Comercial + Financiero
`;

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini", // Or gpt-3.5-turbo if unavailable
                    messages: [
                        { role: "system", content: "Eres un asistente útil que responde siempre en JSON valid." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            // Clean markdown verify if it's wrapped in ```json
            const cleanContent = content.replace(/```json\n?|```/g, "").trim();
            const parsedResult = JSON.parse(cleanContent);

            setResult(parsedResult);
            setStatus('result');

        } catch (error) {
            console.error("Error fetching recommendation:", error);
            // Fallback to mock logic on error
            generateRecommendationMock();
        }
    };

    // Trigger analysis when status changes to analyzing (to ensure state is fresh if we wanted to rely on effect, 
    // but the timeout above is fine for this mock). 
    // Actually, to overlap the last setAnswers update, let's use an effect.
    // Trigger analysis when status changes to analyzing
    useEffect(() => {
        if (status === 'analyzing') {
            // Start the process
            processRecommendation();
        }
    }, [status]);


    if (status === 'idle') {
        return (
            <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-0.5 shadow-xl shadow-indigo-500/20">
                    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-6 relative overflow-hidden group">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                        ¿No sabes qué módulos son ideales?
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                                        Deja que nuestra IA analice tu negocio y te recomiende el paquete ideal en menos de 1 minuto.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleStart}
                                className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2 group-hover:scale-105"
                            >
                                <Sparkles size={18} />
                                Recomendar con IA
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'analyzing') {
        return (
            <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-300 min-h-[300px]">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
                    <Loader2 size={48} className="text-indigo-600 animate-spin relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analizando tu negocio...</h3>
                <p className="text-slate-500 dark:text-slate-400">Nuestra IA está diseñando tu arquitectura ideal.</p>
            </div>
        );
    }

    if (status === 'result' && result) {
        return (
            <div className="mt-8 animate-in zoom-in-95 duration-300">
                <div className="bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 rounded-xl overflow-hidden shadow-2xl">
                    <div className="bg-indigo-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                            <Sparkles size={20} />
                            <span className="font-bold">Recomendación IA</span>
                        </div>
                        <button
                            onClick={() => {
                                if (onCancel) onCancel();
                                setStatus('idle');
                            }}
                            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                                    {result.tipo_negocio_detectado}
                                </span>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    Paquete recomendado para tu negocio
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                    {result.justificacion}
                                </p>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => {
                                            onApplyRecommendation(result.modulos_recomendados);
                                            setStatus('idle'); // Reset to start
                                            setCurrentQuestionIndex(0); // Reset questionnaire
                                            setAnswers({}); // Clear answers
                                            setResult(null); // Clear result
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center gap-2"
                                    >
                                        Continuar con este paquete
                                        <ArrowRight size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (onCancel) onCancel();
                                            setStatus('idle'); // Back to banner
                                            setCurrentQuestionIndex(0);
                                            setAnswers({});
                                            setResult(null);
                                        }}
                                        className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Elegir manualmente
                                    </button>
                                </div>
                            </div>

                            <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-4 tracking-wider">
                                    Módulos Incluidos
                                </h4>
                                <ul className="space-y-3">
                                    {result.modulos_recomendados.map((modulo, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-200 text-sm font-medium animate-in slide-in-from-left-2 fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                                            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            {modulo}
                                        </li>
                                    ))}
                                    <li className="flex items-start gap-3 text-slate-400 dark:text-slate-500 text-sm italic pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                            <Check size={12} />
                                        </div>
                                        + Funciones Core CRM-ERP
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Questionnaire View
    const currentQ = questions[currentQuestionIndex];

    return (
        <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Asistente IA · Paso {currentQuestionIndex + 1} de {questions.length}
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 mt-2 rounded-full w-32 overflow-hidden">
                        <div
                            className="bg-indigo-600 h-full transition-all duration-300"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (onCancel) onCancel(); // Optional prop usage
                        setStatus('idle');
                        setCurrentQuestionIndex(0);
                        setAnswers({});
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-8">
                {currentQ.question}
            </h3>

            <div className="grid gap-3">
                {currentQ.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        className="w-full text-left p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all flex items-center justify-between group"
                    >
                        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:font-semibold">
                            {option}
                        </span>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </button>
                ))}
            </div>
        </div>
    );
}
