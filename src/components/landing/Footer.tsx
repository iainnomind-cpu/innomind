
import React from 'react';
import { LayoutGrid, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2 lg:col-span-2 pr-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex size-6 items-center justify-center rounded bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                <LayoutGrid size={16} />
                            </div>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">Innomind</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                            Innomind es la plataforma líder en integración de ERP y CRM potenciada por IA.
                            Ayudamos a empresas a escalar operaciones de manera inteligente y segura.
                        </p>
                        <div className="flex gap-4">
                            <a className="text-slate-400 hover:text-blue-600 transition-colors" href="#">
                                <span className="sr-only">LinkedIn</span>
                                <Linkedin size={24} />
                            </a>
                            <a className="text-slate-400 hover:text-blue-400 transition-colors" href="#">
                                <span className="sr-only">Twitter</span>
                                <Twitter size={24} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
                            Producto
                        </h3>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Características</a></li>
                            <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Integraciones</a></li>
                            <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Precios</a></li>
                            <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Actualizaciones</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
                            Compañía
                        </h3>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Sobre Nosotros</a></li>
                            <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Carreras</a></li>
                            <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Blog</a></li>
                            <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Contacto</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
                            Legal
                        </h3>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Privacidad</a></li>
                            <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Términos</a></li>
                            <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Seguridad</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500">© 2024 Innomind Inc. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-6">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Todos los sistemas operativos
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
