import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface ModalContextType {
    isFreeTrialOpen: boolean;
    inviteEmail: string | null;
    openFreeTrial: (email?: string) => void;
    closeFreeTrial: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isFreeTrialOpen, setIsFreeTrialOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState<string | null>(null);

    const openFreeTrial = (email?: string) => {
        if (email) setInviteEmail(email);
        setIsFreeTrialOpen(true);
    };

    const closeFreeTrial = () => {
        setIsFreeTrialOpen(false);
        setInviteEmail(null);
    };

    const location = useLocation();

    // Auto-open modal if ?invite= is in the URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const invite = params.get('invite');
        if (invite) {
            setInviteEmail(invite);
            setIsFreeTrialOpen(true);
        }
    }, [location.search]);

    return (
        <ModalContext.Provider value={{ isFreeTrialOpen, inviteEmail, openFreeTrial, closeFreeTrial }}>
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
