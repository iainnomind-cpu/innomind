import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    targetMenuId: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        title: '¡Bienvenido a Innomind Corē!',
        description: 'Soy tu asistente de Inteligencia Artificial. Te guiaré brevemente para configurar tu espacio de trabajo y que puedas empezar a generar valor hoy mismo.',
        targetMenuId: 'dashboard'
    },
    {
        id: 'team',
        title: 'Paso 1: Tu Empresa y Equipo',
        description: 'Ve a la sección "Mi Empresa". Aquí puedes actualizar el logo de tu negocio, colores corporativos y, lo más importante, invitar a otros miembros de tu equipo a colaborar contigo.',
        targetMenuId: 'settings'
    },
    {
        id: 'inventory',
        title: 'Paso 2: Agrega tus Productos',
        description: 'Para poder vender, necesitas qué vender. Dirígete a "Inventario" y registra tu primer producto o servicio con su precio base.',
        targetMenuId: 'inventory'
    },
    {
        id: 'quotes',
        title: 'Paso 3: Crea una Cotización',
        description: 'Ahora que tienes un producto, ve a "Cotizaciones". Podrás generar un presupuesto profesional en PDF en segundos para enviárselo a un prospecto.',
        targetMenuId: 'quotes'
    },
    {
        id: 'finance',
        title: 'Paso 4: Registra una Cuenta',
        description: 'Finalmente, ve a "Finanzas" y añade una cuenta bancaria o caja chica. Esto te permitirá registrar cobros cuando tus cotizaciones se conviertan en ventas.',
        targetMenuId: 'finance'
    },
    {
        id: 'done',
        title: '¡Todo listo!',
        description: 'Has completado los pasos básicos. Ahora estás listo para explorar la plataforma por tu cuenta. ¡Mucho éxito!',
        targetMenuId: 'dashboard'
    }
];

interface OnboardingContextType {
    isActive: boolean;
    currentStepIndex: number;
    currentStep: OnboardingStep;
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
                // Short delay so the UI loads first before showing the pop-up
                setTimeout(() => {
                    setIsActive(true);
                }, 1500);
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
            const storageKey = `inno_onboarding_completed_${user.id}`;
            localStorage.setItem(storageKey, 'true');
        }
        setIsActive(false);
    };

    const reset = () => {
        if (user) {
            const storageKey = `inno_onboarding_completed_${user.id}`;
            localStorage.removeItem(storageKey);
        }
        setCurrentStepIndex(0);
        setIsActive(true);
    };

    return (
        <OnboardingContext.Provider value={{
            isActive,
            currentStepIndex,
            currentStep: ONBOARDING_STEPS[currentStepIndex],
            nextStep,
            prevStep,
            dismiss,
            reset
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
