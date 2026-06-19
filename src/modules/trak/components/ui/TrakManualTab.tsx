import React from 'react';
import { BookOpen, CheckCircle, Lightbulb, LayoutDashboard, Users, FolderKanban, CheckSquare, FileText, CircleDollarSign, CalendarDays, BarChart3 } from 'lucide-react';

const TrakManualTab: React.FC = () => {
    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="bg-[#151D2E] rounded-2xl shadow-sm border border-white/10 p-8 space-y-8 animate-in fade-in max-h-[80vh] overflow-y-auto relative text-gray-300">
            <div className="pb-4 border-b border-white/10 flex items-start gap-4">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                    <BookOpen size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Manual de Usuario - Trak (Gestión de Proyectos)</h2>
                    <p className="text-sm text-gray-400 mt-1">Guía completa para operar tus proyectos, clientes y equipo en la plataforma.</p>
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4">Navegación Rápida</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <button onClick={() => scrollToSection('sec-dashboard')} className="text-left text-sm text-gray-400 hover:text-purple-400 font-medium">1. Dashboard</button>
                    <button onClick={() => scrollToSection('sec-clientes')} className="text-left text-sm text-gray-400 hover:text-purple-400 font-medium">2. Clientes</button>
                    <button onClick={() => scrollToSection('sec-proyectos')} className="text-left text-sm text-gray-400 hover:text-purple-400 font-medium">3. Proyectos</button>
                    <button onClick={() => scrollToSection('sec-tareas')} className="text-left text-sm text-gray-400 hover:text-purple-400 font-medium">4. Tareas y Tiempo</button>
                    <button onClick={() => scrollToSection('sec-cotizaciones')} className="text-left text-sm text-gray-400 hover:text-purple-400 font-medium">5. Cotizaciones</button>
                    <button onClick={() => scrollToSection('sec-finanzas')} className="text-left text-sm text-gray-400 hover:text-purple-400 font-medium">6. Finanzas</button>
                    <button onClick={() => scrollToSection('sec-calendario')} className="text-left text-sm text-gray-400 hover:text-purple-400 font-medium">7. Calendario</button>
                    <button onClick={() => scrollToSection('sec-reportes')} className="text-left text-sm text-gray-400 hover:text-purple-400 font-medium">8. Reportes</button>
                </div>
            </div>

            <div className="space-y-12">
                {/* 1. Dashboard */}
                <section id="sec-dashboard" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <LayoutDashboard className="text-purple-400" size={24} />
                        <h3 className="text-2xl font-bold text-white">1. Dashboard</h3>
                    </div>
                    <p className="text-gray-400 mb-4">El centro de mando de tus proyectos. Te brinda una vista de 360 grados sobre el rendimiento de tu agencia o consultoría.</p>
                    <ul className="space-y-2 list-disc list-inside text-gray-400 mb-4">
                        <li><strong>Métricas Clave:</strong> Muestra el total de clientes, proyectos activos, tareas pendientes y tareas vencidas.</li>
                        <li><strong>Proyectos Activos:</strong> Lista rápida de los proyectos en curso con su barra de progreso según las tareas completadas.</li>
                        <li><strong>Tareas Críticas:</strong> Acceso rápido a tareas vencidas que requieren tu atención inmediata.</li>
                    </ul>
                </section>

                <hr className="border-white/10" />

                {/* 2. Clientes */}
                <section id="sec-clientes" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="text-purple-400" size={24} />
                        <h3 className="text-2xl font-bold text-white">2. Clientes</h3>
                    </div>
                    <p className="text-gray-400 mb-4">A diferencia de un CRM de ventas, aquí administras a tus <strong>clientes activos</strong> y su historial de proyectos.</p>
                    
                    <h4 className="text-lg font-bold text-gray-200 mb-2">Administrar un Cliente</h4>
                    <ol className="list-decimal list-inside space-y-1 text-gray-400 mb-6">
                        <li>Da clic en el nombre del cliente para ver su perfil completo.</li>
                        <li>En el perfil encontrarás todos sus Proyectos Asociados, Cotizaciones y Facturas.</li>
                        <li>Puedes registrar notas de reuniones en la "Línea de Tiempo" específica del cliente.</li>
                    </ol>
                </section>

                <hr className="border-white/10" />

                {/* 3. Proyectos */}
                <section id="sec-proyectos" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <FolderKanban className="text-purple-400" size={24} />
                        <h3 className="text-2xl font-bold text-white">3. Proyectos</h3>
                    </div>
                    <p className="text-gray-400 mb-6">El módulo principal de Trak. Aquí planificas, ejecutas y cierras tus entregables.</p>
                    
                    <h4 className="text-lg font-bold text-gray-200 mb-2">Crear un Proyecto</h4>
                    <ol className="list-decimal list-inside space-y-1 text-gray-400 mb-6">
                        <li>Ve a Proyectos y haz clic en "Nuevo Proyecto".</li>
                        <li>Asigna un Cliente, establece fechas y un presupuesto.</li>
                    </ol>

                    <h4 className="text-lg font-bold text-gray-200 mb-2">Dentro de un Proyecto</h4>
                    <p className="text-gray-400 mb-4">Al abrir un proyecto, verás pestañas clave:</p>
                    <ul className="space-y-2 list-disc list-inside text-gray-400 mb-6">
                        <li><strong>Fases:</strong> Divide tu proyecto en etapas (Ej. Planificación, Diseño, Desarrollo).</li>
                        <li><strong>Tareas:</strong> Las acciones específicas a realizar.</li>
                        <li><strong>Equipo:</strong> Asigna miembros del equipo a este proyecto.</li>
                        <li><strong>Finanzas:</strong> Lleva el control de los gastos del proyecto vs. el presupuesto original.</li>
                        <li><strong>Archivos:</strong> Sube documentos compartidos con el equipo.</li>
                        <li><strong>Gantt:</strong> Visualiza tu cronograma de proyecto de forma interactiva.</li>
                    </ul>
                </section>

                <hr className="border-white/10" />

                {/* 4. Tareas */}
                <section id="sec-tareas" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckSquare className="text-purple-400" size={24} />
                        <h3 className="text-2xl font-bold text-white">4. Mis Tareas y Tiempo</h3>
                    </div>
                    <p className="text-gray-400 mb-4">Visualiza todas las tareas asignadas a ti en todos los proyectos.</p>
                    <ul className="space-y-2 list-disc list-inside text-gray-400 mb-4">
                        <li><strong>Modo Lista o Kanban:</strong> Puedes ver tus tareas como lista o como tarjetas en columnas (Pendiente, En Progreso, Completado).</li>
                        <li><strong>Registro de Tiempo (Time Tracking):</strong> Dentro de un proyecto o tarea, puedes "Iniciar Temporizador" para registrar exactamente cuántos minutos/horas inviertes en una tarea. Esto es crucial para calcular la rentabilidad en Reportes.</li>
                    </ul>
                    <div className="bg-purple-900/30 border-l-4 border-purple-500 p-4 rounded-r-lg flex items-start gap-3">
                        <Lightbulb className="text-purple-400 flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-purple-200"><strong>Tip:</strong> Si marcas la casilla "Facturable" al registrar tiempo, podrás ver cuánto dinero representa tu trabajo en las finanzas del proyecto.</p>
                    </div>
                </section>

                <hr className="border-white/10" />

                {/* 5. Cotizaciones */}
                <section id="sec-cotizaciones" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="text-purple-400" size={24} />
                        <h3 className="text-2xl font-bold text-white">5. Cotizaciones (Trak)</h3>
                    </div>
                    <p className="text-gray-400 mb-4">Genera presupuestos específicos para clientes. Si un cliente acepta la cotización, puedes usar esa misma información para definir el Presupuesto Total de un nuevo Proyecto.</p>
                </section>

                <hr className="border-white/10" />

                {/* 6. Finanzas */}
                <section id="sec-finanzas" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <CircleDollarSign className="text-purple-400" size={24} />
                        <h3 className="text-2xl font-bold text-white">6. Finanzas</h3>
                    </div>
                    <p className="text-gray-400 mb-4">Lleva el control del dinero. En Trak, las finanzas están altamente ligadas a los proyectos.</p>
                    <ul className="space-y-2 list-disc list-inside text-gray-400 mb-4">
                        <li>Podrás registrar Gastos del proyecto (ej: licencias, viáticos, pagos a proveedores externos).</li>
                        <li>Podrás registrar Ingresos (facturación enviada al cliente).</li>
                    </ul>
                </section>

                <hr className="border-white/10" />

                {/* 7. Calendario */}
                <section id="sec-calendario" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <CalendarDays className="text-purple-400" size={24} />
                        <h3 className="text-2xl font-bold text-white">7. Calendario</h3>
                    </div>
                    <p className="text-gray-400 mb-4">Vista mensual y semanal de las entregas de proyectos, tareas críticas y reuniones con clientes. Te ayuda a planificar la carga de trabajo de tu equipo.</p>
                </section>

                <hr className="border-white/10" />

                {/* 8. Reportes */}
                <section id="sec-reportes" className="scroll-mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="text-purple-400" size={24} />
                        <h3 className="text-2xl font-bold text-white">8. Reportes</h3>
                    </div>
                    <p className="text-gray-400 mb-4">Aquí es donde todo se une para tomar decisiones ejecutivas.</p>
                    <ul className="space-y-2 list-disc list-inside text-gray-400 mb-4">
                        <li><strong>Rentabilidad por Proyecto:</strong> Cruza los Ingresos vs Gastos + Costo por hora de tu equipo (tiempo invertido).</li>
                        <li><strong>Utilización del Equipo:</strong> ¿Quién está sobrecargado y quién tiene tiempo libre?</li>
                        <li><strong>Horas Registradas:</strong> Análisis de tiempo invertido por fases.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default TrakManualTab;
