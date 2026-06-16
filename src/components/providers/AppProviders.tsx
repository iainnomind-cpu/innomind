import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';
import { ModalProvider } from '@/context/ModalContext';

interface AppProvidersProps {
    children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    return (
        <AuthProvider>
            <UserProvider>
                <ModalProvider>
                    {children}
                </ModalProvider>
            </UserProvider>
        </AuthProvider>
    );
};
