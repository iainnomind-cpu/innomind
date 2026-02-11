
import React from 'react';
import { Rocket, Settings, Check, ArrowRight } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

export default function ComparisonSection() {
    const { openFreeTrial } = useModal();
    return (
        <section className="py-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4">
                        ¿Qué modalidad es para ti?
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Innomind es su socio de transformación digital. Elija entre nuestra plataforma SaaS lista para implementar en días, o un ERP diseñado completamente a la medida de sus procesos únicos. Ambas opciones incluyen CRM, gestión de proyectos e inteligencia artificial integrada.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                    {/* SaaS Card */}
                    <div className="flex flex-col p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Rocket size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Plataforma SaaS</h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Lista para usar</p>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8 flex-grow relative z-10">
                            <ListItem text="Implementación rápida (30 días)" />
                            <ListItem text="Suscripción mensual desde $XXX" />
                            <ListItem text="Actualizaciones automáticas incluidas" />
                            <ListItem text="Soporte técnico 24/7" />
                            <ListItem text="Sin costos de infraestructura" />
                            <ListItem text="Escalable según crece tu equipo" />
                        </ul>

                        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700 relative z-10">
                            <button onClick={openFreeTrial} className="w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-blue-600/20">
                                Comenzar Prueba Gratuita
                            </button>
                            <a href="/planes" className="block text-center text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1">
                                Ver Planes <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>

                    {/* Custom Dev Card */}
                    <div className="flex flex-col p-8 rounded-2xl bg-slate-900 dark:bg-black border border-slate-800 shadow-2xl relative overflow-hidden group text-white">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-50"></div>
                        <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                                <Settings size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Desarrollo a Medida</h3>
                                <p className="text-sm font-medium text-slate-400">100% personalizado</p>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8 flex-grow relative z-10">
                            <ListItem text="100% adaptado a sus procesos" dark />
                            <ListItem text="Propiedad total del código" dark />
                            <ListItem text="Sin límites de usuarios" dark />
                            <ListItem text="Integraciones con cualquier sistema" dark />
                            <ListItem text="Control completo de datos" dark />
                            <ListItem text="Escalabilidad ilimitada" dark />
                        </ul>

                        <div className="mt-auto pt-6 border-t border-white/10 relative z-10">
                            <button className="w-full mb-3 bg-white text-slate-900 hover:bg-slate-100 font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                                Solicitar Cotización
                            </button>
                            <a href="/casos-exito" className="block text-center text-sm font-semibold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1">
                                Ver Casos de Éxito <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ListItem({ text, dark = false }: { text: string, dark?: boolean }) {
    return (
        <li className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-full p-0.5 ${dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                <Check size={14} strokeWidth={3} />
            </div>
            <span className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>{text}</span>
        </li>
    );
}
