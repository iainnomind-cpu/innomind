import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
    isFreeTrialOpen: boolean;
    openFreeTrial: () => void;
    closeFreeTrial: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isFreeTrialOpen, setIsFreeTrialOpen] = useState(false);

    const openFreeTrial = () => setIsFreeTrialOpen(true);
    const closeFreeTrial = () => setIsFreeTrialOpen(false);

    return (
        <ModalContext.Provider value={{ isFreeTrialOpen, openFreeTrial, closeFreeTrial }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}
