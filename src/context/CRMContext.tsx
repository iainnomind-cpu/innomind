import React, { createContext, useContext, useState } from 'react';
import { Prospect, ProspectStatus, Quote, QuoteTemplate, Product } from '@/types';

interface CRMContextType {
    prospects: Prospect[];
    selectedProspect: Prospect | null;
    selectProspect: (prospect: Prospect | null) => void;
    deleteProspect: (id: string) => void;
    addProspect: (prospect: Prospect) => void;
    updateProspect: (id: string, data: Partial<Prospect>) => void;
    addFollowUp: (prospectId: string, note: string, userId: string) => void;
    quotes: Quote[];
    addQuote: (quote: Omit<Quote, 'id'>) => void;
    updateQuote: (id: string, data: Partial<Quote>) => void;
    deleteQuote: (id: string) => void;

    products: Product[];
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (id: string, data: Partial<Product>) => void;
    deleteProduct: (id: string) => void;

    quoteTemplates: QuoteTemplate[];
    addQuoteTemplate: (template: Omit<QuoteTemplate, 'id'>) => void;
    updateQuoteTemplate: (id: string, data: Partial<QuoteTemplate>) => void;
    deleteQuoteTemplate: (id: string) => void;
    duplicateQuoteTemplate: (id: string) => void;
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

    const [quotes, setQuotes] = useState<Quote[]>([]);

    const addQuote = (quoteData: Omit<Quote, 'id'>) => {
        const newQuote: Quote = {
            ...quoteData,
            id: Math.random().toString(36).substr(2, 9)
        };
        setQuotes(prev => [newQuote, ...prev]);
    };

    const updateQuote = (id: string, data: Partial<Quote>) => {
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...data } : q));
    };

    const deleteQuote = (id: string) => {
        setQuotes(prev => prev.filter(q => q.id !== id));
    };

    const [products, setProducts] = useState<Product[]>([]);

    const addProduct = (productData: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            ...productData,
            id: Math.random().toString(36).substr(2, 9)
        };
        setProducts(prev => [newProduct, ...prev]);
    };

    const updateProduct = (id: string, data: Partial<Product>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    };

    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const [quoteTemplates, setQuoteTemplates] = useState<QuoteTemplate[]>([]);

    const addQuoteTemplate = (templateData: Omit<QuoteTemplate, 'id'>) => {
        const newTemplate: QuoteTemplate = {
            ...templateData,
            id: Math.random().toString(36).substr(2, 9)
        };
        setQuoteTemplates(prev => [newTemplate, ...prev]);
    }

    const updateQuoteTemplate = (id: string, data: Partial<QuoteTemplate>) => {
        setQuoteTemplates(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    }

    const deleteQuoteTemplate = (id: string) => {
        setQuoteTemplates(prev => prev.filter(t => t.id !== id));
    }

    const duplicateQuoteTemplate = (id: string) => {
        const templateToDuplicate = quoteTemplates.find(t => t.id === id);
        if (templateToDuplicate) {
            const newTemplate: QuoteTemplate = {
                ...templateToDuplicate,
                id: Math.random().toString(36).substr(2, 9),
                nombre: `${templateToDuplicate.nombre} (Copia)`
            };
            setQuoteTemplates(prev => [newTemplate, ...prev]);
        }
    }

    return (
        <CRMContext.Provider value={{
            prospects,
            selectedProspect,
            selectProspect,
            deleteProspect,
            addProspect,
            updateProspect,
            addFollowUp,
            quotes,
            addQuote,
            updateQuote,
            deleteQuote,
            products,
            addProduct,
            updateProduct,
            deleteProduct,
            quoteTemplates,
            addQuoteTemplate,
            updateQuoteTemplate,
            deleteQuoteTemplate,
            duplicateQuoteTemplate
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
