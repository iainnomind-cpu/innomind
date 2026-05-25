
import React from 'react';
import { Bot, MessageSquare, Zap, Brain, Send, Users, BarChart3, Clock, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

export default function ChatbotSection() {
    const { openFreeTrial, openDemoModal } = useModal();

    return (
        <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/3" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] translate-y-1/2 translate-x-1/3" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Nuevo Servicio
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4">
                        Chatbots con IA y Mensajería Masiva
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Automatiza la atención al cliente con chatbots inteligentes y llega a miles de clientes con campañas masivas por WhatsApp. Todo integrado con tu CRM.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                    {/* Chatbot Card */}
                    <div className="flex flex-col p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900/50 border border-slate-700/50 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-colors duration-500" />

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/20">
                                <Bot size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Chatbots con IA</h3>
                                <p className="text-sm font-medium text-slate-400">Atención 24/7 automatizada</p>
                            </div>
                        </div>

                        <p className="text-slate-300 mb-6 leading-relaxed relative z-10">
                            Desarrollamos chatbots inteligentes que entienden el contexto de tus clientes, responden preguntas, agendan citas, califican leads y escalan conversaciones complejas a tu equipo — todo de forma natural.
                        </p>

                        <ul className="space-y-3 mb-8 flex-grow relative z-10">
                            <FeatureItem icon={<Brain size={16} />} text="IA conversacional con GPT integrado" color="text-green-400" />
                            <FeatureItem icon={<MessageSquare size={16} />} text="WhatsApp, Instagram, Facebook y Web" color="text-green-400" />
                            <FeatureItem icon={<Users size={16} />} text="Calificación automática de prospectos" color="text-green-400" />
                            <FeatureItem icon={<Clock size={16} />} text="Respuesta instantánea 24/7" color="text-green-400" />
                            <FeatureItem icon={<Zap size={16} />} text="Integración directa con tu CRM" color="text-green-400" />
                        </ul>

                        {/* Chat mockup */}
                        <div className="bg-black/30 rounded-xl p-4 border border-white/10 mb-6 relative z-10">
                            <div className="space-y-3">
                                <div className="flex gap-2 items-end">
                                    <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white flex-shrink-0">C</div>
                                    <div className="bg-slate-700/50 rounded-lg rounded-bl-none px-3 py-2 max-w-[75%]">
                                        <p className="text-sm text-slate-300">Hola, quiero agendar una cita para mañana</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-end justify-end">
                                    <div className="bg-green-600/30 border border-green-500/20 rounded-lg rounded-br-none px-3 py-2 max-w-[75%]">
                                        <p className="text-sm text-green-100">¡Hola! 👋 Claro, tenemos disponibilidad mañana a las 10:00, 14:00 y 16:30. ¿Cuál te funciona mejor?</p>
                                    </div>
                                    <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                                        <Bot size={14} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-2 justify-end">
                                <Sparkles size={12} className="text-green-400" />
                                <span className="text-[10px] text-green-400 font-medium">Respuesta IA · 0.8s</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/10 relative z-10">
                            <button onClick={() => openDemoModal('Chatbots con IA')} className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-green-600/20">
                                Solicitar Cotización
                            </button>
                        </div>
                    </div>

                    {/* WhatsApp Mass Messaging Card */}
                    <div className="flex flex-col p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900/50 border border-slate-700/50 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-500" />

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                <Send size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Mensajería Masiva</h3>
                                <p className="text-sm font-medium text-slate-400">Campañas por WhatsApp</p>
                            </div>
                        </div>

                        <p className="text-slate-300 mb-6 leading-relaxed relative z-10">
                            Envía campañas masivas personalizadas a miles de contactos por WhatsApp. Promociones, recordatorios, lanzamientos y seguimiento post-venta — con métricas en tiempo real y cumplimiento de las políticas de Meta.
                        </p>

                        <ul className="space-y-3 mb-8 flex-grow relative z-10">
                            <FeatureItem icon={<Send size={16} />} text="Envíos masivos con personalización" color="text-emerald-400" />
                            <FeatureItem icon={<BarChart3 size={16} />} text="Métricas: apertura, clics y respuestas" color="text-emerald-400" />
                            <FeatureItem icon={<Users size={16} />} text="Segmentación avanzada de audiencias" color="text-emerald-400" />
                            <FeatureItem icon={<Zap size={16} />} text="Plantillas aprobadas por Meta" color="text-emerald-400" />
                            <FeatureItem icon={<Clock size={16} />} text="Programación y automatización de envíos" color="text-emerald-400" />
                        </ul>

                        {/* Stats mockup */}
                        <div className="bg-black/30 rounded-xl p-4 border border-white/10 mb-6 relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-white">Campaña: Promo Verano 2026</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">Completada</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-white">5,240</div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Enviados</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-emerald-400">94%</div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Entregados</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-green-400">38%</div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Respondieron</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/10 relative z-10">
                            <button onClick={() => openDemoModal('Mensajería Masiva por WhatsApp')} className="w-full mb-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-emerald-600/20">
                                Solicitar Cotización
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom highlight */}
                <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200/50 dark:border-green-800/30 rounded-2xl p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                <CheckCircle2 className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Todo conectado con tu CRM</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Cada conversación del chatbot y cada respuesta a tus campañas masivas se registra automáticamente en el CRM de Innomind. Leads calificados, historial de interacciones y seguimiento comercial — sin datos dispersos.
                            </p>
                        </div>
                        <button onClick={() => openDemoModal('Integración CRM y Chatbots')} className="flex-shrink-0 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-green-600/20 flex items-center gap-2">
                            Solicitar Info <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeatureItem({ icon, text, color }: { icon: React.ReactNode, text: string, color: string }) {
    return (
        <li className="flex items-center gap-3">
            <div className={`${color} flex-shrink-0`}>{icon}</div>
            <span className="text-sm text-slate-300">{text}</span>
        </li>
    );
}
