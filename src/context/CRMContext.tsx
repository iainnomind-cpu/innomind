import React, { createContext, useContext, useState, useEffect } from 'react';
import { Prospect, Quote, QuoteTemplate, CalendarEvent } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface CRMContextType {
    prospects: Prospect[];
    selectedProspect: Prospect | null;
    selectProspect: (prospect: Prospect | null) => void;
    deleteProspect: (id: string) => Promise<void>;
    addProspect: (prospect: Prospect) => Promise<void>;
    updateProspect: (id: string, data: Partial<Prospect>) => Promise<void>;
    addFollowUp: (prospectId: string, note: string, userId: string) => Promise<void>;

    quotes: Quote[];
    addQuote: (quote: Omit<Quote, 'id'>) => Promise<void>;
    updateQuote: (id: string, data: Partial<Quote>) => Promise<void>;
    deleteQuote: (id: string) => Promise<void>;

    quoteTemplates: QuoteTemplate[];
    addQuoteTemplate: (template: Omit<QuoteTemplate, 'id'>) => void;
    updateQuoteTemplate: (id: string, data: Partial<QuoteTemplate>) => void;
    deleteQuoteTemplate: (id: string) => void;
    duplicateQuoteTemplate: (id: string) => void;

    calendarEvents: CalendarEvent[];
    addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
    updateCalendarEvent: (id: string, data: Partial<CalendarEvent>) => Promise<void>;
    deleteCalendarEvent: (id: string) => Promise<void>;

    isLoadingCRM: boolean;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const [isLoadingCRM, setIsLoadingCRM] = useState(true);

    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [quoteTemplates, setQuoteTemplates] = useState<QuoteTemplate[]>([]);

    const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

    // Formatter helpers mapping snake_case from DB to camelCase for UI
    const mapProspectFromDB = (row: any): Prospect => ({
        id: row.id,
        nombre: row.nombre,
        empresa: row.empresa || '',
        cargo: row.cargo || '',
        telefono: row.telefono || '',
        correo: row.correo || '',
        servicioInteres: row.servicio_interes || '',
        plataforma: row.plataforma || '',
        estado: row.estado as any,
        responsable: row.responsable || '',
        fechaContacto: row.fecha_contacto ? new Date(row.fecha_contacto) : undefined,
        tamanoEmpresa: row.tamano_empresa || '',
        valorEstimado: row.valor_estimado || 0,
        seguimientos: [],
        cotizaciones: [],
        tareas: []
    });

    const mapQuoteFromDB = (row: any): Quote => ({
        id: row.id,
        prospectId: row.prospect_id,
        numero: row.numero,
        fecha: new Date(row.fecha),
        vigencia: row.vigencia ? new Date(row.vigencia) : undefined,
        estado: row.estado as any,
        subtotal: Number(row.subtotal),
        descuento: Number(row.descuento),
        ivaPorcentaje: Number(row.iva_porcentaje),
        ivaTotal: Number(row.iva_total),
        total: Number(row.total),
        condicionesPago: row.condiciones_pago || '',
        metodosPagoAceptados: row.metodos_pago_aceptados || [],
        notasAdicionales: row.notas_adicionales || '',
        terminosCondiciones: row.terminos_condiciones || '',
        items: row.items || []
    });

    const mapCalendarEventFromDB = (row: any): CalendarEvent => ({
        id: row.id,
        title: row.title,
        description: row.description,
        startTime: new Date(row.start_time),
        endTime: new Date(row.end_time),
        type: row.type as any,
        prospectId: row.prospect_id || undefined,
    });

    // Master Fetch when Auth is ready
    useEffect(() => {
        if (!authUser) {
            setProspects([]);
            setQuotes([]);
            setCalendarEvents([]);
            setIsLoadingCRM(false);
            return;
        }

        const fetchAllData = async () => {
            setIsLoadingCRM(true);
            try {
                // Fetch Prospects
                const { data: prosData } = await supabase.from('prospects').select('*').order('created_at', { ascending: false });
                if (prosData) setProspects(prosData.map(mapProspectFromDB));

                // Fetch Quotes
                const { data: qtData } = await supabase.from('quotes').select('*').order('fecha', { ascending: false });
                if (qtData) setQuotes(qtData.map(mapQuoteFromDB));

                // Fetch Calendar Events
                const { data: eventsData } = await supabase.from('calendar_events').select('*').order('start_time', { ascending: true });
                if (eventsData) setCalendarEvents(eventsData.map(mapCalendarEventFromDB));

            } catch (error) {
                console.error("Error fetching CRM Data", error);
            } finally {
                setIsLoadingCRM(false);
            }
        };

        fetchAllData();
    }, [authUser]);

    const selectProspect = (prospect: Prospect | null) => setSelectedProspect(prospect);

    // PROSPECTS
    const deleteProspect = async (id: string) => {
        setProspects(prev => prev.filter(p => p.id !== id));
        if (selectedProspect?.id === id) setSelectedProspect(null);
        await supabase.from('prospects').delete().eq('id', id);
    };

    const addProspect = async (prospect: Prospect) => {
        const { data, error } = await supabase.from('prospects').insert({
            nombre: prospect.nombre,
            empresa: prospect.empresa,
            cargo: prospect.cargo,
            telefono: prospect.telefono,
            correo: prospect.correo,
            servicio_interes: prospect.servicioInteres,
            plataforma: prospect.plataforma,
            estado: prospect.estado,
            responsable: prospect.responsable,
            tamano_empresa: prospect.tamanoEmpresa,
            valor_estimado: prospect.valorEstimado || 0
        }).select().single();

        if (data && !error) {
            setProspects(prev => [mapProspectFromDB(data), ...prev]);
        } else {
            console.error("Error adding prospect", error);
        }
    };

    const updateProspect = async (id: string, data: Partial<Prospect>) => {
        setProspects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
        if (selectedProspect?.id === id) {
            setSelectedProspect(prev => prev ? { ...prev, ...data } : null);
        }

        const payload: any = {};
        if (data.nombre !== undefined) payload.nombre = data.nombre;
        if (data.empresa !== undefined) payload.empresa = data.empresa;
        if (data.cargo !== undefined) payload.cargo = data.cargo;
        if (data.telefono !== undefined) payload.telefono = data.telefono;
        if (data.correo !== undefined) payload.correo = data.correo;
        if (data.servicioInteres !== undefined) payload.servicio_interes = data.servicioInteres;
        if (data.plataforma !== undefined) payload.plataforma = data.plataforma;
        if (data.estado !== undefined) payload.estado = data.estado;
        if (data.responsable !== undefined) payload.responsable = data.responsable;
        if (data.tamanoEmpresa !== undefined) payload.tamano_empresa = data.tamanoEmpresa;
        if (data.valorEstimado !== undefined) payload.valor_estimado = data.valorEstimado;
        // if (data.fechaContacto !== undefined) payload.fecha_contacto = data.fechaContacto?.toISOString() || null;

        if (Object.keys(payload).length > 0) {
            await supabase.from('prospects').update(payload).eq('id', id);
        }
    };

    const addFollowUp = async (prospectId: string, note: string, userId: string) => {
        // Placeholder until followups table is used directly if needed. Notes are now usually added via Activity Engine
        console.log(prospectId, note, userId)
    };

    // QUOTES
    const addQuote = async (quoteData: Omit<Quote, 'id'>) => {
        const payload = {
            prospect_id: quoteData.prospectId,
            numero: quoteData.numero,
            fecha: quoteData.fecha.toISOString(),
            vigencia: quoteData.vigencia?.toISOString(),
            estado: quoteData.estado,
            subtotal: quoteData.subtotal,
            descuento: quoteData.descuento,
            iva_porcentaje: quoteData.ivaPorcentaje,
            iva_total: quoteData.ivaTotal,
            total: quoteData.total,
            condiciones_pago: quoteData.condicionesPago,
            metodos_pago_aceptados: quoteData.metodosPagoAceptados,
            notas_adicionales: quoteData.notasAdicionales,
            terminos_condiciones: quoteData.terminosCondiciones,
            items: quoteData.items
        };
        const { data, error } = await supabase.from('quotes').insert(payload).select().single();
        if (data && !error) {
            setQuotes(prev => [mapQuoteFromDB(data), ...prev]);
        }
    };

    const updateQuote = async (id: string, data: Partial<Quote>) => {
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...data } : q));

        const payload: any = {};
        if (data.estado !== undefined) payload.estado = data.estado;
        if (data.vigencia !== undefined) payload.vigencia = data.vigencia?.toISOString();

        if (Object.keys(payload).length > 0) {
            await supabase.from('quotes').update(payload).eq('id', id);
        }
    };

    const deleteQuote = async (id: string) => {
        setQuotes(prev => prev.filter(q => q.id !== id));
        await supabase.from('quotes').delete().eq('id', id);
    };

    // TEMPLATES / MEMORY ONLY (Since it wasn't requested strictly in SQL schema)
    const addQuoteTemplate = (templateData: Omit<QuoteTemplate, 'id'>) => {
        const newTemplate: QuoteTemplate = { ...templateData, id: Math.random().toString(36).substr(2, 9) };
        setQuoteTemplates(prev => [...prev, newTemplate]);
    };

    const updateQuoteTemplate = (id: string, data: Partial<QuoteTemplate>) => {
        setQuoteTemplates(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    };

    const deleteQuoteTemplate = (id: string) => {
        setQuoteTemplates(prev => prev.filter(t => t.id !== id));
    };

    const duplicateQuoteTemplate = (id: string) => {
        const templateToDuplicate = quoteTemplates.find(t => t.id === id);
        if (templateToDuplicate) {
            addQuoteTemplate({ ...templateToDuplicate, nombre: `${templateToDuplicate.nombre} (Copia)` });
        }
    };

    // CALENDAR EVENTS
    const addCalendarEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
        const payload = {
            title: eventData.title,
            description: eventData.description,
            start_time: eventData.startTime.toISOString(),
            end_time: eventData.endTime.toISOString(),
            type: eventData.type,
            prospect_id: eventData.prospectId || null,
        };
        const { data, error } = await supabase.from('calendar_events').insert(payload).select().single();
        if (data && !error) {
            setCalendarEvents(prev => [...prev, mapCalendarEventFromDB(data)]);
        }
    };

    const updateCalendarEvent = async (id: string, data: Partial<CalendarEvent>) => {
        setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));

        const payload: any = {};
        if (data.title !== undefined) payload.title = data.title;
        if (data.description !== undefined) payload.description = data.description;
        if (data.startTime !== undefined) payload.start_time = data.startTime.toISOString();
        if (data.endTime !== undefined) payload.end_time = data.endTime.toISOString();
        if (data.type !== undefined) payload.type = data.type;

        if (Object.keys(payload).length > 0) {
            await supabase.from('calendar_events').update(payload).eq('id', id);
        }
    };

    const deleteCalendarEvent = async (id: string) => {
        setCalendarEvents(prev => prev.filter(e => e.id !== id));
        await supabase.from('calendar_events').delete().eq('id', id);
    };

    return (
        <CRMContext.Provider value={{
            prospects, selectedProspect, selectProspect, deleteProspect, addProspect, updateProspect, addFollowUp,
            quotes, addQuote, updateQuote, deleteQuote,
            calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
            quoteTemplates, addQuoteTemplate, updateQuoteTemplate, deleteQuoteTemplate, duplicateQuoteTemplate,
            isLoadingCRM
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
