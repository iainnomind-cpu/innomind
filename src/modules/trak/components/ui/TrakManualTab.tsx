import React from 'react';
import {
    BookOpen, Lightbulb, LayoutDashboard, Users, FolderKanban,
    CheckSquare, FileText, CircleDollarSign, CalendarDays, BarChart3,
    Clock, Package, Settings, AlertTriangle, Target, MessageSquare,
    FolderOpen, GitCommit, Play, Pause
} from 'lucide-react';

const Section: React.FC<{ id: string; icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ id, icon, title, children }) => (
    <section id={id} className="scroll-mt-6">
        <div className="flex items-center gap-3 mb-4">
            <div className="text-purple-400">{icon}</div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
        {children}
    </section>
);

const Tip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-purple-900/30 border-l-4 border-purple-500 p-4 rounded-r-lg flex items-start gap-3 my-4">
        <Lightbulb className="text-purple-400 flex-shrink-0 mt-0.5" size={18} />
        <p className="text-sm text-purple-200">{children}</p>
    </div>
);

const Warning: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3 my-4">
        <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
        <p className="text-sm text-amber-200">{children}</p>
    </div>
);

const StepList: React.FC<{ steps: string[] }> = ({ steps }) => (
    <ol className="list-decimal list-inside space-y-1.5 text-gray-400 mb-4">
        {steps.map((s, i) => <li key={i}>{s}</li>)}
    </ol>
);

const BulletList: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
    <ul className="space-y-2 list-disc list-inside text-gray-400 mb-4">
        {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
);

const TrakManualTab: React.FC = () => {
    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const navItems = [
        { id: 'sec-dashboard', label: '1. Dashboard' },
        { id: 'sec-clientes', label: '2. Clientes' },
        { id: 'sec-proyectos', label: '3. Proyectos' },
        { id: 'sec-tareas', label: '4. Mis Tareas' },
        { id: 'sec-tiempo', label: '5. Registro de Tiempo' },
        { id: 'sec-cotizaciones', label: '6. Cotizaciones' },
        { id: 'sec-finanzas', label: '7. Finanzas' },
        { id: 'sec-calendario', label: '8. Calendario' },
        { id: 'sec-reportes', label: '9. Reportes' },
        { id: 'sec-rh', label: '10. RH (Equipo)' },
        { id: 'sec-inventario', label: '11. Inventario' },
        { id: 'sec-config', label: '12. Configuración' },
    ];

    return (
        <div className="bg-[#0F1624] rounded-2xl shadow-sm border border-white/10 p-8 space-y-8 max-h-[80vh] overflow-y-auto relative text-gray-300">

            {/* Header */}
            <div className="pb-4 border-b border-white/10 flex items-start gap-4">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                    <BookOpen size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Manual de Usuario — Innomind Trak</h2>
                    <p className="text-sm text-gray-400 mt-1">Guía completa de gestión de proyectos, clientes, equipo e inventario.</p>
                </div>
            </div>

            {/* Quick Nav */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4">Navegación Rápida</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {navItems.map(n => (
                        <button
                            key={n.id}
                            onClick={() => scrollToSection(n.id)}
                            className="text-left text-sm text-gray-400 hover:text-purple-400 font-medium transition-colors"
                        >
                            {n.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-12">

                {/* ─── 1. Dashboard ─────────────────────────────────────── */}
                <Section id="sec-dashboard" icon={<LayoutDashboard size={24} />} title="1. Dashboard">
                    <p className="text-gray-400 mb-4">La pantalla de inicio de Trak. Te da un resumen ejecutivo de toda la operación en tiempo real.</p>
                    <BulletList items={[
                        <><strong className="text-gray-200">Métricas principales:</strong> Clientes activos, proyectos activos, tareas pendientes y tareas vencidas.</>,
                        <><strong className="text-gray-200">Proyectos Activos:</strong> Listado con barra de progreso calculada por % de tareas completadas y días restantes a la entrega.</>,
                        <><strong className="text-gray-200">Tareas Críticas:</strong> Panel rápido con las tareas más urgentes del día, con prioridades codificadas por color.</>,
                    ]} />
                    <Tip>Comienza tu día revisando las tareas vencidas (en rojo). Son lo primero que necesita tu atención para no bloquear al equipo.</Tip>
                </Section>

                <hr className="border-white/10" />

                {/* ─── 2. Clientes ──────────────────────────────────────── */}
                <Section id="sec-clientes" icon={<Users size={24} />} title="2. Clientes">
                    <p className="text-gray-400 mb-4">En Trak, los clientes son las empresas o personas para las que ejecutas proyectos. A diferencia de un CRM, el foco está en la gestión operativa, no en la etapa de venta.</p>

                    <h4 className="text-lg font-bold text-gray-200 mb-2">¿Cómo dar de alta un cliente?</h4>
                    <StepList steps={[
                        'Ve al módulo "Clientes" en el menú lateral.',
                        'Haz clic en el botón "Nuevo Cliente" (esquina superior derecha).',
                        'Llena el formulario: Nombre de empresa, contacto principal, teléfono y correo.',
                        'Selecciona una etapa del pipeline (ej. "Prospecto", "Propuesta", "Ganado").',
                        'Guarda. El cliente quedará visible en tu lista.',
                    ]} />

                    <h4 className="text-lg font-bold text-gray-200 mb-2">Perfil del Cliente</h4>
                    <BulletList items={[
                        <><strong className="text-gray-200">Proyectos asociados:</strong> Todos los proyectos vinculados a ese cliente, con su estado actual.</>,
                        <><strong className="text-gray-200">Cotizaciones:</strong> Las propuestas económicas enviadas a ese cliente y su estado (enviada, aceptada, rechazada).</>,
                        <><strong className="text-gray-200">Línea de Tiempo:</strong> Registro cronológico de todas las interacciones, notas de reuniones y actualizaciones de estado.</>,
                    ]} />
                </Section>

                <hr className="border-white/10" />

                {/* ─── 3. Proyectos ─────────────────────────────────────── */}
                <Section id="sec-proyectos" icon={<FolderKanban size={24} />} title="3. Proyectos">
                    <p className="text-gray-400 mb-6">El corazón de Trak. Aquí vive toda la información operativa de cada entregable.</p>

                    <h4 className="text-lg font-bold text-gray-200 mb-2">Crear un Proyecto</h4>
                    <StepList steps={[
                        'Ve a "Proyectos" y haz clic en "Nuevo Proyecto".',
                        'Asigna un nombre, un cliente, fechas de inicio y entrega estimada.',
                        'Establece un presupuesto para controlar la rentabilidad.',
                        'El proyecto inicia en estado "Planificación". Cuando estés listo, abre el proyecto y presiona "Iniciar Proyecto".',
                    ]} />

                    <h4 className="text-lg font-bold text-gray-200 mb-2">Estados de un Proyecto</h4>
                    <BulletList items={[
                        <><span className="text-slate-300 font-semibold">Planificación:</span> El proyecto está siendo configurado. Aún no ha comenzado.</>,
                        <><span className="text-blue-400 font-semibold">Activo:</span> En ejecución. El equipo está trabajando en él.</>,
                        <><span className="text-amber-400 font-semibold">Pausado:</span> Temporalmente detenido (esperando al cliente, recursos, etc.).</>,
                        <><span className="text-emerald-400 font-semibold">Completado:</span> Entregado. Se ejecuta un cierre financiero automático.</>,
                    ]} />

                    <h4 className="text-lg font-bold text-gray-200 mb-2 mt-6">Pestañas dentro de un Proyecto</h4>
                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                        {[
                            { icon: <Target size={16} />, name: 'Fases', desc: 'Divide el proyecto en etapas (Diseño, Desarrollo, QA, Entrega). Cada fase tiene su propio progreso y se puede completar individualmente.' },
                            { icon: <CheckSquare size={16} />, name: 'Tareas', desc: 'Las actividades específicas del proyecto. Se asignan a miembros del equipo y tienen fechas límite y prioridades.' },
                            { icon: <MessageSquare size={16} />, name: 'Actividad', desc: 'Registro de cambios, comentarios e issues del proyecto. Aquí el equipo reporta bloqueos o actualizaciones.' },
                            { icon: <Users size={16} />, name: 'Equipo', desc: 'Asigna miembros del equipo (empleados de RH) con un rol específico dentro del proyecto.' },
                            { icon: <Clock size={16} />, name: 'Tiempo', desc: 'Resumen de todas las horas registradas en este proyecto, separadas por miembro y por si son facturables o no.' },
                            { icon: <CircleDollarSign size={16} />, name: 'Finanzas', desc: 'Control de gastos vs. presupuesto. Aquí se registran los pagos de proveedores o gastos del proyecto.' },
                            { icon: <FolderOpen size={16} />, name: 'Archivos', desc: 'Sube y comparte documentos, contratos, diseños y entregables directamente en el proyecto.' },
                            { icon: <GitCommit size={16} />, name: 'Cronograma (Gantt)', desc: 'Vista visual del timeline del proyecto. Muestra las fechas de cada fase y tarea de forma gráfica e interactiva.' },
                        ].map(tab => (
                            <div key={tab.name} className="bg-white/5 rounded-xl p-3 border border-white/10 flex gap-3">
                                <div className="text-purple-400 mt-0.5 flex-shrink-0">{tab.icon}</div>
                                <div>
                                    <p className="font-bold text-gray-200 text-sm">{tab.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{tab.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Tip>Al completar un proyecto, el sistema ejecuta un <strong>Cierre Financiero Automático</strong>: calcula la rentabilidad final cruzando ingresos, gastos y horas invertidas.</Tip>
                </Section>

                <hr className="border-white/10" />

                {/* ─── 4. Mis Tareas ────────────────────────────────────── */}
                <Section id="sec-tareas" icon={<CheckSquare size={24} />} title="4. Mis Tareas">
                    <p className="text-gray-400 mb-4">Vista personal de todas las tareas asignadas a ti en todos los proyectos.</p>
                    <BulletList items={[
                        <><strong className="text-gray-200">Vista Kanban:</strong> Columnas de Pendiente → En Progreso → Completado. Arrastra tareas entre columnas para actualizar su estado.</>,
                        <><strong className="text-gray-200">Vista Lista:</strong> Tabla con filtros por prioridad, proyecto y fecha límite.</>,
                        <><strong className="text-gray-200">Prioridades:</strong> Las tareas tienen 4 niveles — Baja (gris), Media (azul), Alta (naranja), Crítica (roja).</>,
                        <><strong className="text-gray-200">Sub-tareas:</strong> Dentro de cada tarea puedes crear tareas más pequeñas para desglosar el trabajo.</>,
                    ]} />

                    <h4 className="text-lg font-bold text-gray-200 mb-2">Crear una Tarea</h4>
                    <StepList steps={[
                        'Entra al proyecto correspondiente y ve a la pestaña "Tareas".',
                        'Haz clic en "Nueva Tarea".',
                        'Escribe el nombre, asigna un responsable, fecha límite y prioridad.',
                        'Opcionalmente, vincula la tarea a una Fase del proyecto.',
                        'Guarda. La tarea aparecerá en la lista del proyecto y en "Mis Tareas" del responsable.',
                    ]} />
                </Section>

                <hr className="border-white/10" />

                {/* ─── 5. Registro de Tiempo ────────────────────────────── */}
                <Section id="sec-tiempo" icon={<Clock size={24} />} title="5. Registro de Tiempo (Time Tracking)">
                    <p className="text-gray-400 mb-4">Una de las funciones más poderosas de Trak: el registro preciso de cuánto tiempo invierte cada miembro del equipo en cada proyecto.</p>

                    <h4 className="text-lg font-bold text-gray-200 mb-2">¿Cómo registrar tiempo?</h4>
                    <StepList steps={[
                        'Dentro de un proyecto, ve a la pestaña "Tiempo".',
                        'Haz clic en "Registrar Tiempo" o usa el botón de temporizador.',
                        'Selecciona la tarea o actividad específica.',
                        'Marca si el tiempo es "Facturable" (se cobrará al cliente) o no.',
                        'Puedes ingresar el tiempo manualmente (ej: 2h 30min) o usar el cronómetro en tiempo real.',
                    ]} />

                    <BulletList items={[
                        <><strong className="text-gray-200">Tiempo Facturable vs No Facturable:</strong> Úsalo para separar el trabajo que cobras al cliente de tareas internas (reuniones de planificación, correcciones, etc.).</>,
                        <><strong className="text-gray-200">Eficiencia de facturación:</strong> En Reportes verás el % de horas que son facturables vs. el total. Un negocio saludable debería estar por encima del 70%.</>,
                    ]} />
                    <Tip>El registro de tiempo es la base de los Reportes de Rentabilidad. Sin tiempo registrado, no sabrás si tu proyecto generó o perdió dinero.</Tip>
                </Section>

                <hr className="border-white/10" />

                {/* ─── 6. Cotizaciones ──────────────────────────────────── */}
                <Section id="sec-cotizaciones" icon={<FileText size={24} />} title="6. Cotizaciones">
                    <p className="text-gray-400 mb-4">Genera propuestas económicas profesionales para tus clientes.</p>

                    <h4 className="text-lg font-bold text-gray-200 mb-2">Crear una Cotización</h4>
                    <StepList steps={[
                        'Ve al módulo "Cotizaciones" en el menú.',
                        'Haz clic en "Nueva Cotización".',
                        'Selecciona el cliente y añade los servicios/productos con sus precios.',
                        'Agrega impuestos, descuentos o notas adicionales si aplica.',
                        'Guarda. Puedes enviarla por correo o compartir el link con el cliente.',
                    ]} />

                    <h4 className="text-lg font-bold text-gray-200 mb-2">Estados de Cotización</h4>
                    <BulletList items={[
                        <><span className="text-gray-400 font-semibold">Borrador:</span> En preparación, no enviada aún.</>,
                        <><span className="text-blue-400 font-semibold">Enviada:</span> El cliente la recibió y está en revisión.</>,
                        <><span className="text-emerald-400 font-semibold">Aceptada:</span> El cliente aprobó. Puedes convertirla en un Proyecto nuevo.</>,
                        <><span className="text-red-400 font-semibold">Rechazada:</span> El cliente no aprobó. Queda en historial para referencia.</>,
                    ]} />
                    <Tip>Cuando una cotización es aceptada, úsala como base para crear el Proyecto. El presupuesto del proyecto se pre-llenará automáticamente.</Tip>
                </Section>

                <hr className="border-white/10" />

                {/* ─── 7. Finanzas ──────────────────────────────────────── */}
                <Section id="sec-finanzas" icon={<CircleDollarSign size={24} />} title="7. Finanzas">
                    <p className="text-gray-400 mb-4">Control financiero de tu agencia o consultoría. Las finanzas en Trak están vinculadas a proyectos para una visión de rentabilidad real.</p>

                    <h4 className="text-lg font-bold text-gray-200 mb-2">Dashboard Financiero</h4>
                    <BulletList items={[
                        <><strong className="text-gray-200">Ingresos aprobados:</strong> Suma de las cotizaciones con estado "Aceptada".</>,
                        <><strong className="text-gray-200">Por facturar (pendiente):</strong> Cotizaciones enviadas que el cliente aún no aprueba.</>,
                        <><strong className="text-gray-200">Gastos de proyectos:</strong> Suma de todos los gastos registrados dentro de cada proyecto.</>,
                    ]} />

                    <h4 className="text-lg font-bold text-gray-200 mb-2">Gastos por Proyecto</h4>
                    <StepList steps={[
                        'Abre el proyecto deseado.',
                        'Ve a la pestaña "Finanzas".',
                        'Haz clic en "Nuevo Gasto".',
                        'Registra el concepto, monto y proveedor (opcional).',
                        'Este gasto se descuenta del presupuesto disponible del proyecto.',
                    ]} />
                    <Warning>El cierre financiero automático se ejecuta cuando marcas un proyecto como "Completado". Asegúrate de haber registrado todos los gastos y el tiempo facturable antes de completar.</Warning>
                </Section>

                <hr className="border-white/10" />

                {/* ─── 8. Calendario ────────────────────────────────────── */}
                <Section id="sec-calendario" icon={<CalendarDays size={24} />} title="8. Calendario">
                    <p className="text-gray-400 mb-4">Vista mensual y semanal que consolida entregas, tareas críticas y reuniones en un solo lugar.</p>
                    <BulletList items={[
                        <><strong className="text-gray-200">Fechas de entrega de proyectos</strong> aparecen marcadas en el calendario.</>,
                        <><strong className="text-gray-200">Tareas con fecha límite</strong> se muestran en el día correspondiente.</>,
                        <><strong className="text-gray-200">Vista de carga del equipo:</strong> Ideal para planificar quién tiene capacidad disponible antes de asignar nueva tarea.</>,
                    ]} />
                    <Tip>Usa el Calendario al inicio de cada semana para ver la carga del equipo y redistribuir tareas si alguien está sobrecargado.</Tip>
                </Section>

                <hr className="border-white/10" />

                {/* ─── 9. Reportes ──────────────────────────────────────── */}
                <Section id="sec-reportes" icon={<BarChart3 size={24} />} title="9. Reportes & Analytics">
                    <p className="text-gray-400 mb-4">El módulo de inteligencia de negocio. Toma decisiones estratégicas basadas en datos reales de los últimos 30 días.</p>

                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                        {[
                            { name: 'Ingresos Aprobados', desc: 'Cotizaciones aceptadas = dinero comprometido por el cliente.' },
                            { name: 'Por Facturar', desc: 'Pipeline económico: lo que puede convertirse en ingreso pronto.' },
                            { name: 'Horas Trabajadas', desc: 'Total de horas registradas en los últimos 30 días.' },
                            { name: 'Eficiencia de Facturación', desc: '% de horas registradas que son facturables. Meta: >70%.' },
                            { name: 'Proyectos Activos vs Completados', desc: 'Salud de la operación y velocidad de cierre.' },
                            { name: 'Progreso Promedio', desc: '% de avance promedio en todos los proyectos activos.' },
                        ].map(m => (
                            <div key={m.name} className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="font-bold text-gray-200 text-sm">{m.name}</p>
                                <p className="text-xs text-gray-400 mt-1">{m.desc}</p>
                            </div>
                        ))}
                    </div>
                    <Tip>La métrica más importante es la <strong>Eficiencia de Facturación</strong>. Si estás por debajo del 60%, tienes tiempo no cobrable que está erosionando tu margen.</Tip>
                </Section>

                <hr className="border-white/10" />

                {/* ─── 10. RH ───────────────────────────────────────────── */}
                <Section id="sec-rh" icon={<Users size={24} />} title="10. Recursos Humanos (RH / Equipo)">
                    <p className="text-gray-400 mb-4">Módulo opcional. Administra al personal interno: sus datos, salarios y nómina.</p>

                    <h4 className="text-lg font-bold text-gray-200 mb-2">Funcionalidades</h4>
                    <BulletList items={[
                        <><strong className="text-gray-200">Directorio de Empleados:</strong> Ficha de cada miembro del equipo (nombre, rol, correo, teléfono).</>,
                        <><strong className="text-gray-200">Tipo de Pago:</strong> Cada empleado puede tener pago Por Hora, Por Día o Mensual. Esto se usa para calcular el costo de sus horas en los proyectos.</>,
                        <><strong className="text-gray-200">Estatus:</strong> Activo / Permiso-Vacaciones / Inactivo.</>,
                        <><strong className="text-gray-200">Nómina:</strong> Dashboard de nómina que calcula automáticamente cuánto corresponde pagar a cada empleado según las horas registradas y su tarifa.</>,
                    ]} />

                    <h4 className="text-lg font-bold text-gray-200 mb-2">Dar de Alta un Empleado</h4>
                    <StepList steps={[
                        'Ve a "Equipo (RH)" en el menú lateral.',
                        'Haz clic en "Nuevo Empleado".',
                        'Llena nombre, correo, rol/puesto y tipo de pago (tarifa por hora, día o mensual).',
                        'Guarda. El empleado ahora puede ser asignado a proyectos.',
                    ]} />
                    <Tip>Al asignar un empleado a un proyecto y registrar su tiempo, el costo de ese tiempo se calcula automáticamente con su tarifa, permitiéndote saber la rentabilidad real del proyecto.</Tip>
                </Section>

                <hr className="border-white/10" />

                {/* ─── 11. Inventario ───────────────────────────────────── */}
                <Section id="sec-inventario" icon={<Package size={24} />} title="11. Inventario">
                    <p className="text-gray-400 mb-4">Módulo opcional. Controla materiales, herramientas y consumibles que utilizas en tus proyectos.</p>

                    <h4 className="text-lg font-bold text-gray-200 mb-2">Pestañas del Inventario</h4>
                    <BulletList items={[
                        <><strong className="text-gray-200">Inventario:</strong> Catálogo de todos tus artículos con su stock actual por almacén y alertas de mínimo de stock.</>,
                        <><strong className="text-gray-200">Almacenes:</strong> Crea ubicaciones físicas donde guardas los materiales (ej: "Almacén Central", "Bodega Obra A").</>,
                        <><strong className="text-gray-200">Movimientos:</strong> Historial completo de entradas (compras, devoluciones), salidas (uso en proyectos) y transferencias entre almacenes.</>,
                    ]} />

                    <h4 className="text-lg font-bold text-gray-200 mb-2">Registrar un Movimiento</h4>
                    <StepList steps={[
                        'Ve a Inventario → pestaña "Movimientos".',
                        'Haz clic en "Nuevo Movimiento".',
                        'Selecciona el tipo: Entrada (compra) | Salida (uso) | Transferencia.',
                        'Elige el artículo, almacén y cantidad.',
                        'Guarda. El stock se actualiza automáticamente.',
                    ]} />
                    <Warning>Si un artículo llega a su mínimo de stock, aparecerá con una alerta en rojo. Configura el mínimo al crear cada producto para recibir estas alertas a tiempo.</Warning>
                </Section>

                <hr className="border-white/10" />

                {/* ─── 12. Configuración ────────────────────────────────── */}
                <Section id="sec-config" icon={<Settings size={24} />} title="12. Configuración">
                    <p className="text-gray-400 mb-4">Personaliza Trak según las necesidades de tu negocio.</p>
                    <BulletList items={[
                        <><strong className="text-gray-200">Módulos activos:</strong> Habilita o deshabilita RH e Inventario si no los necesitas para mantener la interfaz limpia.</>,
                        <><strong className="text-gray-200">Información del Workspace:</strong> Nombre, logo y datos generales de tu empresa.</>,
                        <><strong className="text-gray-200">Integraciones:</strong> Configura notificaciones o conexiones con herramientas externas.</>,
                    ]} />
                </Section>

            </div>
        </div>
    );
};

export default TrakManualTab;
