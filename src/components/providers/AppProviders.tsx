import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';
import { FinanceProvider } from '@/context/FinanceContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { AccountsPayableProvider } from '@/context/AccountsPayableContext';
import { ProcurementProvider } from '@/context/ProcurementContext';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { CRMProvider } from '@/context/CRMContext';
import { AccountsReceivableProvider } from '@/context/AccountsReceivableContext';
import { ModalProvider } from '@/context/ModalContext';

interface AppProvidersProps {
    children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    return (
        <AuthProvider>
            <UserProvider>
                <WorkspaceProvider>
                    <AccountsPayableProvider>
                        <AccountsReceivableProvider>
                            <CRMProvider>
                                <FinanceProvider>
                                    <InventoryProvider>
                                        <ProcurementProvider>
                                            <ModalProvider>
                                                {children}
                                            </ModalProvider>
                                        </ProcurementProvider>
                                    </InventoryProvider>
                                </FinanceProvider>
                            </CRMProvider>
                        </AccountsReceivableProvider>
                    </AccountsPayableProvider>
                </WorkspaceProvider>
            </UserProvider>
        </AuthProvider>
    );
};
