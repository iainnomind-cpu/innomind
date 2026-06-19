import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface OnboardingStep {
    id: string;
    module: string; // Grouping label
    title: string;
    description: string;
    actionHint: string; // Specific action the user should take
    targetMenuId: string;
    icon: string; // emoji for the step
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
    // ─── Welcome ───────────────────────────────────────────────────────
    {
        id: 'welcome',
        module: 'Bienvenida',
        title: '¡Bienvenido a Innomind Corē! 🎉',
        description: 'Soy tu Asistente IA. Te voy a guiar módulo por módulo para que en minutos tengas todo configurado y listo para trabajar. ¡Comencemos!',
        actionHint: 'Presiona "Siguiente" cuando estés listo para empezar.',
        targetMenuId: 'dashboard',
        icon: '👋',
    },

    // ─── Mi Empresa ────────────────────────────────────────────────────
    {
        id: 'empresa-logo',
        module: 'Mi Empresa',
        title: 'Sube el logo de tu empresa',
        description: 'En "Mi Empresa" puedes personalizar toda la identidad de tu workspace. Comienza subiendo tu logo, que aparecerá en tus cotizaciones en PDF y en el sistema.',
        actionHint: '① Haz clic en "Mi Empresa" en el menú lateral → ② Sube tu logo haciendo clic en la imagen circular.',
        targetMenuId: 'settings',
        icon: '🏢',
    },
    {
        id: 'empresa-invitar',
        module: 'Mi Empresa',
        title: 'Invita a tu equipo',
        description: 'Puedes invitar a compañeros de trabajo a tu workspace para que colaboren contigo. Cada usuario tendrá su propio acceso.',
        actionHint: '① Ve a la pestaña "Equipo" → ② Haz clic en "Invitar Miembro" → ③ Escribe el correo de tu colega.',
        targetMenuId: 'settings',
        icon: '👥',
    },

    // ─── CRM: Prospectos ───────────────────────────────────────────────
    {
        id: 'crm-prospecto',
        module: 'CRM · Prospectos',
        title: 'Registra tu primer prospecto',
        description: 'El CRM es el corazón del negocio. Aquí guardas a todas las personas o empresas con las que quieres hacer negocios, antes de que sean clientes.',
        actionHint: '① Ve a "Prospectos" en el menú → ② Haz clic en "Nuevo Prospecto" (esquina superior derecha) → ③ Llena el nombre, empresa y teléfono.',
        targetMenuId: 'prospectos',
        icon: '🧑‍💼',
    },
    {
        id: 'crm-timeline',
        module: 'CRM · Seguimiento',
        title: 'Registra un seguimiento',
        description: 'Al dar clic sobre un prospecto, verás su perfil con una Línea de Tiempo. Aquí registras cada interacción: llamadas, correos, reuniones. Así nunca pierdes el hilo de la conversación.',
        actionHint: '① Haz clic sobre el prospecto que acabas de crear → ② En su perfil, escribe una nota en el campo de seguimiento (ej: "Llamé, interesado") → ③ Guarda.',
        targetMenuId: 'prospectos',
        icon: '📞',
    },
    {
        id: 'crm-embudo',
        module: 'CRM · Embudo de Ventas',
        title: 'El Embudo de Ventas (Pipeline)',
        description: 'El Embudo es un tablero visual tipo Kanban donde ves todas tus oportunidades en columnas: Nuevo, Contactado, Propuesta Enviada, Ganado / Perdido.',
        actionHint: '① Ve a "Embudo" en el menú lateral → ② Arrastra tu prospecto de la columna "Nuevo" a "Contactado" para cambiar su etapa.',
        targetMenuId: 'embudo',
        icon: '🔀',
    },

    // ─── Inventario ────────────────────────────────────────────────────
    {
        id: 'inventario-producto',
        module: 'Inventario',
        title: 'Agrega tu primer producto o servicio',
        description: 'Para poder cotizar, necesitas productos registrados. Ve al módulo de Inventario y da de alta lo que vendes: puede ser un producto físico o un servicio.',
        actionHint: '① Ve a "Inventario" en el menú → ② Haz clic en "Nuevo Producto" → ③ Escribe el nombre, precio y unidad de medida → ④ Guarda.',
        targetMenuId: 'inventory',
        icon: '📦',
    },

    // ─── Cotizaciones ──────────────────────────────────────────────────
    {
        id: 'cotizacion-crear',
        module: 'Cotizaciones',
        title: 'Crea tu primera cotización',
        description: 'Con al menos un producto y un prospecto, ya puedes generar cotizaciones profesionales. El sistema las genera en PDF con el logo y colores de tu empresa.',
        actionHint: '① Ve a "Cotizaciones" → ② Clic en "Nueva Cotización" → ③ Selecciona el cliente, agrega los productos y guarda.',
        targetMenuId: 'quotes',
        icon: '📄',
    },
    {
        id: 'cotizacion-enviar',
        module: 'Cotizaciones',
        title: 'Envía la cotización por WhatsApp',
        description: 'Una vez creada la cotización, puedes compartirla directamente por WhatsApp o correo electrónico con un solo clic. El sistema genera un link único para el cliente.',
        actionHint: '① Abre la cotización que creaste → ② Usa el botón de WhatsApp o Correo en la parte superior para enviársela a tu cliente.',
        targetMenuId: 'quotes',
        icon: '📲',
    },

    // ─── Finanzas ──────────────────────────────────────────────────────
    {
        id: 'finanzas-cuenta',
        module: 'Finanzas',
        title: 'Registra una cuenta bancaria',
        description: 'En Finanzas controlas tu flujo de efectivo. Comienza registrando tus cuentas bancarias o caja chica para poder llevar el registro de ingresos y gastos.',
        actionHint: '① Ve a "Finanzas" en el menú → ② En la sección de Cuentas, haz clic en "Nueva Cuenta" → ③ Escribe el nombre del banco y el saldo inicial.',
        targetMenuId: 'finance',
        icon: '🏦',
    },
    {
        id: 'finanzas-ingreso',
        module: 'Finanzas',
        title: 'Registra un ingreso o gasto',
        description: 'Una vez que tienes una cuenta, puedes registrar movimientos: ingresos por ventas, pagos de clientes o gastos operativos. Todo queda categorizado y con fecha.',
        actionHint: '① En Finanzas, selecciona tu cuenta → ② Haz clic en "Nuevo Movimiento" → ③ Elige Ingreso o Gasto, el monto y la categoría.',
        targetMenuId: 'finance',
        icon: '💰',
    },

    // ─── ¡Listo! ───────────────────────────────────────────────────────
    {
        id: 'done',
        module: 'Finalizado',
        title: '¡Estás listo para trabajar! 🚀',
        description: 'Has completado la configuración básica de Innomind Corē. Ahora tienes: empresa configurada, prospectos, inventario, cotizaciones y finanzas listos. ¡Mucho éxito!',
        actionHint: 'Recuerda: puedes consultar el Manual de Usuario completo en el módulo de "Soporte" del menú lateral.',
        targetMenuId: 'dashboard',
        icon: '🎯',
    },
];

interface OnboardingContextType {
    isActive: boolean;
    currentStepIndex: number;
    currentStep: OnboardingStep;
    totalSteps: number;
    nextStep: () => void;
    prevStep: () => void;
    dismiss: () => void;
    reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (user && !isInitialized) {
            const storageKey = `inno_onboarding_completed_${user.id}`;
            const isCompleted = localStorage.getItem(storageKey) === 'true';
            if (!isCompleted) {
                setTimeout(() => setIsActive(true), 1500);
            }
            setIsInitialized(true);
        }
    }, [user, isInitialized]);

    const nextStep = () => {
        if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            dismiss();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const dismiss = () => {
        if (user) {
            localStorage.setItem(`inno_onboarding_completed_${user.id}`, 'true');
        }
        setIsActive(false);
    };

    const reset = () => {
        if (user) {
            localStorage.removeItem(`inno_onboarding_completed_${user.id}`);
        }
        setCurrentStepIndex(0);
        setIsActive(true);
    };

    return (
        <OnboardingContext.Provider value={{
            isActive,
            currentStepIndex,
            currentStep: ONBOARDING_STEPS[currentStepIndex],
            totalSteps: ONBOARDING_STEPS.length,
            nextStep,
            prevStep,
            dismiss,
            reset,
        }}>
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
};
