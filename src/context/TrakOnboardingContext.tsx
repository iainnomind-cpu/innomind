import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface TrakOnboardingStep {
    id: string;
    module: string;
    title: string;
    description: string;
    actionHint: string;
    targetMenuId: string; // matches TrakLayout menu item IDs
    icon: string;
}

export const TRAK_ONBOARDING_STEPS: TrakOnboardingStep[] = [
    // ─── Bienvenida ──────────────────────────────────────────
    {
        id: 'welcome',
        module: 'Bienvenida',
        title: '¡Bienvenido a Innomind Trak! 🎉',
        description: 'Soy tu Asistente IA. Trak es tu plataforma de gestión de proyectos y operaciones. Te llevaré por los módulos clave para que puedas comenzar hoy mismo.',
        actionHint: 'Presiona "Siguiente" cuando estés listo para el tour.',
        targetMenuId: 'dashboard',
        icon: '👋',
    },

    // ─── Dashboard ───────────────────────────────────────────
    {
        id: 'dashboard',
        module: 'Dashboard',
        title: 'Tu centro de mando',
        description: 'El Dashboard muestra en tiempo real tus proyectos activos, tareas pendientes y vencidas. Revísalo cada mañana para priorizar tu día.',
        actionHint: '① Observa las métricas principales arriba → ② Revisa la lista de proyectos activos → ③ Atiende primero las tareas marcadas en rojo (vencidas).',
        targetMenuId: 'dashboard',
        icon: '📊',
    },

    // ─── Clientes ────────────────────────────────────────────
    {
        id: 'clients-create',
        module: 'Clientes',
        title: 'Paso 1: Registra tu primer cliente',
        description: 'Antes de crear proyectos, necesitas un cliente. Los clientes son las empresas o personas para quienes trabajas.',
        actionHint: '① Ve a "Clientes" en el menú → ② Haz clic en "Nuevo Cliente" → ③ Llena el nombre de empresa, contacto y correo → ④ Selecciona la etapa del pipeline → ⑤ Guarda.',
        targetMenuId: 'clients',
        icon: '🏢',
    },

    // ─── Proyectos ───────────────────────────────────────────
    {
        id: 'project-create',
        module: 'Proyectos',
        title: 'Paso 2: Crea tu primer proyecto',
        description: 'Los proyectos son el núcleo de Trak. Aquí vive todo: tareas, equipo, archivos, finanzas y seguimiento de tiempo.',
        actionHint: '① Ve a "Proyectos" → ② Clic en "Nuevo Proyecto" → ③ Asigna el cliente que creaste, nombre, fechas y presupuesto → ④ Guarda → ⑤ Luego ábrelo y presiona "Iniciar Proyecto".',
        targetMenuId: 'projects',
        icon: '📁',
    },
    {
        id: 'project-phases',
        module: 'Proyectos · Fases',
        title: 'Organiza tu proyecto en Fases',
        description: 'Dentro del proyecto, la pestaña "Fases" te permite dividir el trabajo en etapas claras: Diseño, Desarrollo, Entrega, etc. Cada fase tiene su propio progreso.',
        actionHint: '① Abre el proyecto → ② Ve a la pestaña "Fases" → ③ Haz clic en "Nueva Fase" → ④ Escribe el nombre (ej: "Diseño UI") y guarda.',
        targetMenuId: 'projects',
        icon: '🗂️',
    },
    {
        id: 'project-tasks',
        module: 'Proyectos · Tareas',
        title: 'Agrega tareas al proyecto',
        description: 'Las tareas son las actividades concretas que el equipo debe ejecutar. Se asignan a una persona, tienen prioridad y fecha límite.',
        actionHint: '① En el proyecto, ve a "Tareas" → ② Clic en "Nueva Tarea" → ③ Escribe la descripción, asigna un responsable, establece la prioridad y la fecha límite → ④ Guarda.',
        targetMenuId: 'projects',
        icon: '✅',
    },

    // ─── Mis Tareas ──────────────────────────────────────────
    {
        id: 'my-tasks',
        module: 'Mis Tareas',
        title: 'Paso 3: Revisa tu bandeja de tareas',
        description: 'El módulo "Mis Tareas" consolida TODAS las tareas asignadas a ti en todos los proyectos. Puedes verlas en lista o en tablero Kanban.',
        actionHint: '① Ve a "Mis Tareas" en el menú → ② Cambia entre vista Lista y vista Kanban con los botones de arriba → ③ Arrastra tarjetas al siguiente estado para actualizarlas.',
        targetMenuId: 'tasks',
        icon: '📋',
    },

    // ─── Time Tracking ───────────────────────────────────────
    {
        id: 'time-tracking',
        module: 'Tiempo',
        title: 'Registra el tiempo que trabajas',
        description: 'El registro de tiempo es clave para saber la rentabilidad de cada proyecto. Marca si las horas son "facturables" para separar lo que cobras al cliente de las horas internas.',
        actionHint: '① Abre cualquier proyecto → ② Ve a la pestaña "Tiempo" → ③ Clic en "Registrar Tiempo" → ④ Elige la tarea, escribe la duración (ej: 2h 30min) → ⑤ Activa la casilla "Facturable" si corresponde.',
        targetMenuId: 'projects',
        icon: '⏱️',
    },

    // ─── Cotizaciones ────────────────────────────────────────
    {
        id: 'quotes',
        module: 'Cotizaciones',
        title: 'Paso 4: Genera una cotización',
        description: 'Crea propuestas económicas para tus clientes. Cuando un cliente acepte, puedes convertirla directamente en un proyecto con el presupuesto ya definido.',
        actionHint: '① Ve a "Cotizaciones" → ② Clic en "Nueva Cotización" → ③ Selecciona el cliente, agrega los servicios y sus precios → ④ Guarda y envíala al cliente.',
        targetMenuId: 'quotes',
        icon: '📄',
    },

    // ─── Finanzas ────────────────────────────────────────────
    {
        id: 'finance',
        module: 'Finanzas',
        title: 'Paso 5: Controla tus finanzas',
        description: 'En Finanzas puedes ver el resumen de ingresos aprobados, lo que está por facturar y los gastos de proyectos. Todo está vinculado a tus proyectos y cotizaciones.',
        actionHint: '① Ve a "Finanzas" → ② Revisa el dashboard de KPIs → ③ Para registrar un gasto, abre el proyecto correspondiente → pestaña "Finanzas" → "Nuevo Gasto".',
        targetMenuId: 'finance',
        icon: '💰',
    },

    // ─── Reportes ────────────────────────────────────────────
    {
        id: 'reports',
        module: 'Reportes',
        title: 'Analiza tu rendimiento',
        description: 'Los Reportes cruzan toda la información de proyectos, horas y cotizaciones para darte métricas reales. El indicador más importante es la Eficiencia de Facturación (meta: >70%).',
        actionHint: '① Ve a "Reportes" → ② Revisa el % de eficiencia de facturación → ③ Si está bajo 60%, hay demasiadas horas no facturables. Identifica cuáles proyectos las generan.',
        targetMenuId: 'reports',
        icon: '📈',
    },

    // ─── Listo ───────────────────────────────────────────────
    {
        id: 'done',
        module: 'Finalizado',
        title: '¡Todo listo para trabajar! 🚀',
        description: 'Has completado el tour de Trak. Tienes cliente, proyecto, tareas, tiempo y finanzas configurados. Recuerda: el Manual completo está en el módulo de Soporte.',
        actionHint: 'Ve a "Soporte" → pestaña "Manual de Usuario" para consultar guías detalladas de cada módulo en cualquier momento.',
        targetMenuId: 'support',
        icon: '🎯',
    },
];

interface TrakOnboardingContextType {
    isActive: boolean;
    currentStepIndex: number;
    currentStep: TrakOnboardingStep;
    totalSteps: number;
    nextStep: () => void;
    prevStep: () => void;
    dismiss: () => void;
    reset: () => void;
}

const TrakOnboardingContext = createContext<TrakOnboardingContextType | undefined>(undefined);

export const TrakOnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (user && !isInitialized) {
            const storageKey = `trak_onboarding_completed_${user.id}`;
            const isCompleted = localStorage.getItem(storageKey) === 'true';
            if (!isCompleted) {
                setTimeout(() => setIsActive(true), 1500);
            }
            setIsInitialized(true);
        }
    }, [user, isInitialized]);

    const nextStep = () => {
        if (currentStepIndex < TRAK_ONBOARDING_STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            dismiss();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
    };

    const dismiss = () => {
        if (user) localStorage.setItem(`trak_onboarding_completed_${user.id}`, 'true');
        setIsActive(false);
    };

    const reset = () => {
        if (user) localStorage.removeItem(`trak_onboarding_completed_${user.id}`);
        setCurrentStepIndex(0);
        setIsActive(true);
    };

    return (
        <TrakOnboardingContext.Provider value={{
            isActive,
            currentStepIndex,
            currentStep: TRAK_ONBOARDING_STEPS[currentStepIndex],
            totalSteps: TRAK_ONBOARDING_STEPS.length,
            nextStep, prevStep, dismiss, reset,
        }}>
            {children}
        </TrakOnboardingContext.Provider>
    );
};

export const useTrakOnboarding = () => {
    const ctx = useContext(TrakOnboardingContext);
    if (!ctx) throw new Error('useTrakOnboarding must be used within TrakOnboardingProvider');
    return ctx;
};
