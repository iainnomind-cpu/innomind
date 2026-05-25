import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface ModalContextType {
    isFreeTrialOpen: boolean;
    inviteEmail: string | null;
    openFreeTrial: (email?: any) => void;
    closeFreeTrial: () => void;
    isDemoModalOpen: boolean;
    serviceOfInterest: string | null;
    openDemoModal: (service?: string | any) => void;
    closeDemoModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isFreeTrialOpen, setIsFreeTrialOpen] = useState(false);
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const [serviceOfInterest, setServiceOfInterest] = useState<string | null>(null);
    const [inviteEmail, setInviteEmail] = useState<string | null>(null);

    const openFreeTrial = (email?: any) => {
        if (typeof email === 'string') {
            setInviteEmail(email);
        } else {
            setInviteEmail(null);
        }
        setIsFreeTrialOpen(true);
    };

    const closeFreeTrial = () => {
        setIsFreeTrialOpen(false);
        setInviteEmail(null);
    };

    const openDemoModal = (service?: string | any) => {
        if (typeof service === 'string') {
            setServiceOfInterest(service);
        } else {
            setServiceOfInterest(null);
        }
        setIsDemoModalOpen(true);
    };
    const closeDemoModal = () => {
        setIsDemoModalOpen(false);
        setServiceOfInterest(null);
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
        <ModalContext.Provider value={{ 
            isFreeTrialOpen, inviteEmail, openFreeTrial, closeFreeTrial,
            isDemoModalOpen, serviceOfInterest, openDemoModal, closeDemoModal 
        }}>
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
