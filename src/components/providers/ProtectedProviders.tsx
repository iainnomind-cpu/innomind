import React from 'react';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { AccountsPayableProvider } from '@/context/AccountsPayableContext';
import { AccountsReceivableProvider } from '@/context/AccountsReceivableContext';
import { CRMProvider } from '@/context/CRMContext';
import { FinanceProvider } from '@/context/FinanceContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { ProcurementProvider } from '@/context/ProcurementContext';
import { TrakProvider } from '@/modules/trak/context/TrakContext';
import { AIProvider } from '@/modules/trak/context/AIContext';

interface ProtectedProvidersProps {
    children: React.ReactNode;
}

export const ProtectedProviders: React.FC<ProtectedProvidersProps> = ({ children }) => {
    return (
        <WorkspaceProvider>
            <AccountsPayableProvider>
                <AccountsReceivableProvider>
                    <CRMProvider>
                        <FinanceProvider>
                            <InventoryProvider>
                                <ProcurementProvider>
                                    <TrakProvider>
                                        <AIProvider>
                                            {children}
                                        </AIProvider>
                                    </TrakProvider>
                                </ProcurementProvider>
                            </InventoryProvider>
                        </FinanceProvider>
                    </CRMProvider>
                </AccountsReceivableProvider>
            </AccountsPayableProvider>
        </WorkspaceProvider>
    );
};
