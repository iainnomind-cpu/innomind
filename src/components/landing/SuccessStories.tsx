
import React from 'react';
import { Star, ArrowRight, Quote, Cloud, Layers, Box, Database, Shield, Lock } from 'lucide-react';

export default function SuccessStories() {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4">
                        Empresas que confían en Innomind
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Desde startups hasta corporativos, nuestras soluciones impulsan el crecimiento de cientos de negocios.
                    </p>
                </div>

                {/* Client Logos */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500 mb-20">
                    <LogoItem icon={<Cloud size={32} />} name="CloudScale" />
                    <LogoItem icon={<Layers size={32} />} name="Nexus" />
                    <LogoItem icon={<Box size={32} />} name="Vertex" />
                    <LogoItem icon={<Database size={32} />} name="Dataflow" />
                    <LogoItem icon={<Shield size={32} />} name="SecureNet" />
                    <LogoItem icon={<Lock size={32} />} name="IronClad" />
                </div>

                {/* Testimonials */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <TestimonialCard
                        quote="Redujimos nuestros tiempos operativos en un 45% en solo 3 meses. El ROI fue evidente desde el primer trimestre."
                        author="Juan Pérez"
                        role="CEO, Empresa XYZ"
                        initials="JP"
                        color="bg-blue-500"
                    />
                    <TestimonialCard
                        quote="El ERP a medida de Innomind se adaptó perfectamente a nuestros procesos únicos. Imposible volver atrás."
                        author="María González"
                        role="Directora de Operaciones, ABC Corp"
                        initials="MG"
                        color="bg-purple-500"
                    />
                    <TestimonialCard
                        quote="La integración con IA nos dio insights que nunca imaginamos posibles. Game changer total."
                        author="Carlos Ruiz"
                        role="CTO, Tech Solutions"
                        initials="CR"
                        color="bg-green-500"
                    />
                </div>

                {/* CTA */}
                <div className="text-center">
                    <a href="/casos-exito" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-bold hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Ver Todos los Casos de Éxito <ArrowRight size={18} />
                    </a>
                </div>
            </div>
        </section>
    );
}

function LogoItem({ icon, name }: { icon: React.ReactNode, name: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 group cursor-default">
            <div className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {icon}
            </div>
            <span className="font-bold text-lg text-slate-700 dark:text-slate-300">{name}</span>
        </div>
    );
}

function TestimonialCard({ quote, author, role, initials, color }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full relative group hover:shadow-lg transition-shadow">
            <Quote size={40} className="text-slate-100 dark:text-slate-700 absolute top-6 right-6" />

            <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                ))}
            </div>

            <blockquote className="text-slate-700 dark:text-slate-300 mb-8 text-lg font-medium leading-relaxed italic flex-grow">
                "{quote}"
            </blockquote>

            <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-50 dark:border-slate-700/50">
                <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                    {initials}
                </div>
                <div>
                    <div className="font-bold text-slate-900 dark:text-white">{author}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{role}</div>
                </div>
            </div>
        </div>
    );
}
