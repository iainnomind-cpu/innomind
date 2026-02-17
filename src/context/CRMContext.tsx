import React, { createContext, useContext, useState } from 'react';
import { Prospect, ProspectStatus } from '@/types';

interface CRMContextType {
    prospects: Prospect[];
    selectedProspect: Prospect | null;
    selectProspect: (prospect: Prospect | null) => void;
    deleteProspect: (id: string) => void;
    addProspect: (prospect: Prospect) => void;
    updateProspect: (id: string, data: Partial<Prospect>) => void;
    addFollowUp: (prospectId: string, note: string, userId: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [prospects, setProspects] = useState<Prospect[]>([
        {
            id: '1',
            nombre: 'Juan Perez',
            empresa: 'Consultoría JP',
            cargo: 'Director General',
            telefono: '+525555555555',
            correo: 'juan@example.com',
            servicioInteres: 'Consultoría Web',
            plataforma: 'WhatsApp',
            estado: 'Nuevo',
            responsable: '1', // Ana Silva
            fechaContacto: new Date(),
            seguimientos: [],
            cotizaciones: [],
            tareas: []
        },
        {
            id: '2',
            nombre: 'Empresa XYZ',
            empresa: 'XYZ Corp',
            cargo: 'Gerente de Compras',
            telefono: '+525512345678',
            correo: 'contacto@xyz.com',
            servicioInteres: 'Desarrollo App',
            plataforma: 'Facebook',
            estado: 'Cotizado',
            responsable: '2', // Carlos Ruiz
            fechaContacto: new Date(Date.now() - 86400000 * 2),
            seguimientos: [
                {
                    id: 's1',
                    fecha: new Date(Date.now() - 86400000),
                    usuario: '2',
                    nota: 'Se envió propuesta inicial'
                }
            ],
            cotizaciones: [
                {
                    id: 'c1',
                    fecha: new Date(Date.now() - 86400000),
                    total: 15000,
                    estado: 'Enviada'
                }
            ],
            tareas: [
                {
                    id: 't1',
                    titulo: 'Enviar catálogo actualizado',
                    fechaVencimiento: new Date(Date.now() + 86400000),
                    completada: false
                }
            ]
        }
    ]);

    const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

    const selectProspect = (prospect: Prospect | null) => {
        setSelectedProspect(prospect);
    };

    const deleteProspect = (id: string) => {
        setProspects(prev => prev.filter(p => p.id !== id));
        if (selectedProspect?.id === id) {
            setSelectedProspect(null);
        }
    };

    const addProspect = (prospect: Prospect) => {
        setProspects(prev => [prospect, ...prev]);
    };

    const updateProspect = (id: string, data: Partial<Prospect>) => {
        setProspects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
        if (selectedProspect?.id === id) {
            setSelectedProspect(prev => prev ? { ...prev, ...data } : null);
        }
    };

    const addFollowUp = (prospectId: string, note: string, userId: string) => {
        const newFollowUp = {
            id: Math.random().toString(36).substr(2, 9),
            fecha: new Date(),
            usuario: userId,
            nota: note
        };

        updateProspect(prospectId, {
            ultimoSeguimiento: new Date(),
            seguimientos: [...(prospects.find(p => p.id === prospectId)?.seguimientos || []), newFollowUp]
        });
    };

    return (
        <CRMContext.Provider value={{
            prospects,
            selectedProspect,
            selectProspect,
            deleteProspect,
            addProspect,
            updateProspect,
            addFollowUp
        }}>
            {children}
        </CRMContext.Provider>
    );
};

export const useCRM = () => {
    const context = useContext(CRMContext);
    if (context === undefined) {
        throw new Error('useCRM must be used within a CRMProvider');
    }
    return context;
};
