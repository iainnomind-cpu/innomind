import React from 'react';
import { ArrowRight, Calendar, User, Clock, ChevronRight } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const BLOG_POSTS = [
    {
        id: 1,
        title: "Cómo la Inteligencia Artificial está transformando los ERP en 2024",
        excerpt: "Descubre cómo las nuevas capacidades predictivas de la IA dentro de los sistemas de gestión están ayudando a las empresas a reducir costos operativos.",
        category: "Tecnología",
        author: "Equipo Innomind",
        date: "15 Jun 2024",
        readTime: "5 min",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800&h=500"
    },
    {
        id: 2,
        title: "Chatbots vs. Atención Humana: El balance perfecto",
        excerpt: "Automatizar la atención al cliente no significa perder la empatía. Te mostramos cómo integrar chatbots de IA sin sacrificar la cercanía con tus clientes.",
        category: "Atención al Cliente",
        author: "María Fernández",
        date: "08 Jun 2024",
        readTime: "4 min",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800&h=500"
    },
    {
        id: 3,
        title: "5 señales de que tu empresa necesita un desarrollo a la medida",
        excerpt: "Si los SaaS tradicionales ya no se adaptan a tus procesos operativos, podría ser momento de pensar en una solución exclusiva para tu negocio.",
        category: "Desarrollo",
        author: "Carlos Ruiz",
        date: "01 Jun 2024",
        readTime: "7 min",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&h=500"
    },
    {
        id: 4,
        title: "Estrategias de WhatsApp Marketing con Mensajería Masiva",
        excerpt: "Aprende a crear campañas de WhatsApp que conviertan, manteniendo el cumplimiento de las políticas de Meta y evitando bloqueos.",
        category: "Marketing",
        author: "Laura Gómez",
        date: "24 May 2024",
        readTime: "6 min",
        image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=800&h=500"
    },
    {
        id: 5,
        title: "Por qué Corē y Trak son la combinación perfecta",
        excerpt: "Analizamos cómo la integración de nuestro ERP y sistema de gestión de proyectos potencia la productividad de cualquier equipo.",
        category: "Producto",
        author: "Equipo Innomind",
        date: "18 May 2024",
        readTime: "4 min",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=500"
    },
    {
        id: 6,
        title: "El futuro del SaaS: Suscripción vs. Licencias tradicionales",
        excerpt: "Un análisis profundo sobre por qué el modelo de suscripción sigue dominando la industria del software B2B en América Latina.",
        category: "Negocios",
        author: "Andrés Silva",
        date: "10 May 2024",
        readTime: "5 min",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800&h=500"
    }
];

export default function BlogPage() {
    return (
        <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased min-h-screen flex flex-col relative">
            <Navbar />

            {/* Header */}
            <div className="pt-32 pb-16 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 mb-6">
                        <span className="text-sm font-bold uppercase tracking-wider">Recursos</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Blog de Innomind
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Explora nuestros artículos, guías y consejos sobre tecnología, transformación digital, y cómo llevar tu negocio al siguiente nivel con ERP, CRM e IA.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 py-16 bg-white dark:bg-transparent relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Featured Post (First one) */}
                    <div className="mb-16">
                        <div className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid lg:grid-cols-2 gap-0 transition-all hover:shadow-2xl hover:border-blue-500/30">
                            <div className="aspect-video lg:aspect-auto overflow-hidden relative">
                                <img 
                                    src={BLOG_POSTS[0].image} 
                                    alt={BLOG_POSTS[0].title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                                        Destacado
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 md:p-12 flex flex-col justify-center">
                                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                                    <span className="text-blue-600 dark:text-blue-400">{BLOG_POSTS[0].category}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {BLOG_POSTS[0].date}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Clock size={14} /> {BLOG_POSTS[0].readTime}</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {BLOG_POSTS[0].title}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                    {BLOG_POSTS[0].excerpt}
                                </p>
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                            <User size={16} />
                                        </div>
                                        {BLOG_POSTS[0].author}
                                    </div>
                                    <button className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                        Leer Artículo <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posts Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {BLOG_POSTS.slice(1).map((post) => (
                            <div key={post.id} className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="aspect-video overflow-hidden relative">
                                    <img 
                                        src={post.image} 
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white text-xs font-bold rounded-full shadow-sm">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                            {post.author}
                                        </span>
                                        <button className="text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Leer <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination or Load More (Visual only) */}
                    <div className="mt-16 flex justify-center">
                        <button className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Cargar más artículos
                        </button>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
