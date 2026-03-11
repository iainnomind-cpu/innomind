import React, { createContext, useContext, useState, useEffect } from 'react';
import { Prospect, Quote, QuoteTemplate, CalendarEvent } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useWorkspace } from './WorkspaceContext';
import { useUsers } from './UserContext';
import { withWorkspace, validateWorkspace } from '@/lib/supabaseWorkspaceClient';

interface CRMContextType {
    prospects: Prospect[];
    quotes: Quote[];
    calendarEvents: CalendarEvent[];
    quoteTemplates: QuoteTemplate[];
    isLoadingCRM: boolean;
    refreshCRMData: () => Promise<void>;
    addProspect: (prospect: Prospect) => Promise<void>;
    updateProspect: (id: string, updates: Partial<Prospect>) => Promise<void>;
    deleteProspect: (id: string) => Promise<void>;
    selectedProspect: Prospect | null;
    selectProspect: (prospect: Prospect | null) => void;
    addQuote: (quote: Partial<Quote>) => Promise<void>;
    updateQuote: (id: string, updates: Partial<Quote>) => Promise<void>;
    deleteQuote: (id: string) => Promise<void>;
    addCalendarEvent: (event: Partial<CalendarEvent>) => Promise<void>;
    updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
    deleteCalendarEvent: (id: string) => Promise<void>;
    addFollowUp: (prospectId: string, note: string, userId: string) => Promise<void>;
    addQuoteTemplate: (template: any) => Promise<void>;
    updateQuoteTemplate: (id: string, updates: Partial<QuoteTemplate>) => Promise<void>;
    deleteQuoteTemplate: (id: string) => Promise<void>;
    duplicateQuoteTemplate: (id: string) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const { workspace } = useWorkspace();
    const { isLoadingProfile } = useUsers();

    const [isLoadingCRM, setIsLoadingCRM] = useState(true);
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [quoteTemplates, setQuoteTemplates] = useState<QuoteTemplate[]>([]);
    const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

    // Mappers
    const mapProspectFromDB = (row: any): Prospect => ({
        id: row.id,
        nombre: row.nombre,
        empresa: row.empresa || '',
        cargo: row.cargo || '',
        telefono: row.telefono || '',
        correo: row.correo || '',
        servicioInteres: row.servicio_interes || '',
        plataforma: row.plataforma || 'WhatsApp',
        estado: row.estado as any,
        responsable: row.responsable || '',
        fechaContacto: row.fecha_contacto ? new Date(row.fecha_contacto) : undefined,
        tamanoEmpresa: row.tamano_empresa || '',
        valorEstimado: Number(row.valor_estimado) || 0,
        telefonoSecundario: row.telefono_secundario || '',
        origen: row.origen || '',
        industria: row.industria || '',
        nivelInteres: row.nivel_interes || 'Medio',
        direccion: row.direccion || '',
        notasInternas: row.notas_internas || '',
        fechaProximoSeguimiento: row.fecha_proximo_seguimiento ? new Date(row.fecha_proximo_seguimiento) : undefined,
        ultimoSeguimiento: row.ultimo_seguimiento ? new Date(row.ultimo_seguimiento) : undefined,
        seguimientos: (row.seguimientos || []).map((s: any) => ({
            id: s.id,
            fecha: new Date(s.created_at || s.fecha),
            usuario: s.created_by || s.usuario,
            nota: s.nota
        })),
        cotizaciones: [],
        tareas: []
    });

    const mapQuoteFromDB = (row: any): Quote => ({
        id: row.id,
        prospectId: row.prospect_id,
        numero: row.numero,
        fecha: new Date(row.fecha),
        vigencia: row.vigencia ? new Date(row.vigencia) : new Date(),
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

    const mapQuoteTemplateFromDB = (row: any): QuoteTemplate => ({
        id: row.id,
        workspace_id: row.workspace_id,
        created_by: row.created_by,
        nombre: row.name,
        descripcion: row.description || '',
        items: row.items || [],
        subtotal: Number(row.items?.reduce((acc: number, item: any) => acc + (item.cantidad * item.precioUnitario), 0) || 0),
        totalEstimado: Number(row.items?.reduce((acc: number, item: any) => acc + item.subtotal, 0) || 0),
        condicionesPago: row.notes || '',
        notasAdicionales: row.notes || '',
        terminosCondiciones: row.terms || '',
        metodosPagoAceptados: [],
        fechaCreacion: new Date(row.created_at),
        updatedAt: row.updated_at ? new Date(row.updated_at) : undefined
    });

    const refreshCRMData = async () => {
        const workspaceId = workspace?.id;
        if (!workspaceId || !authUser) {
            setProspects([]);
            setQuotes([]);
            setCalendarEvents([]);
            setQuoteTemplates([]);
            setIsLoadingCRM(false);
            return;
        }

        setIsLoadingCRM(true);
        try {
            const [prosRes, quotesRes, eventsRes, templatesRes] = await Promise.all([
                supabase.from('prospects').select('*').eq('workspace', workspaceId).order('created_at', { ascending: false }),
                supabase.from('quotes').select('*').eq('workspace_id', workspaceId).order('fecha', { ascending: false }),
                supabase.from('calendar_events').select('*').eq('workspace_id', workspaceId).order('start_time', { ascending: true }),
                supabase.from('quote_templates').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false })
            ]);

            if (prosRes.data) setProspects(prosRes.data.map(mapProspectFromDB));
            if (quotesRes.data) setQuotes(quotesRes.data.map(mapQuoteFromDB));
            if (eventsRes.data) setCalendarEvents(eventsRes.data.map(mapCalendarEventFromDB));
            if (templatesRes.data) setQuoteTemplates(templatesRes.data.map(mapQuoteTemplateFromDB));

        } catch (error) {
            console.error("Error fetching CRM Data", error);
        } finally {
            setIsLoadingCRM(false);
        }
    };

    useEffect(() => {
        if (!isLoadingProfile && workspace?.id) {
            refreshCRMData();
        }
    }, [authUser, workspace?.id, isLoadingProfile]);

    const selectProspect = (prospect: Prospect | null) => setSelectedProspect(prospect);

    // CRUD Methods
    const addProspect = async (prospect: Prospect) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { data, error } = await supabase.from('prospects').insert([{
            nombre: prospect.nombre,
            empresa: prospect.empresa,
            cargo: prospect.cargo,
            telefono: prospect.telefono,
            correo: prospect.correo,
            servicio_interes: prospect.servicioInteres,
            plataforma: prospect.plataforma,
            estado: prospect.estado,
            responsable: prospect.responsable,
            fecha_contacto: prospect.fechaContacto,
            tamano_empresa: prospect.tamanoEmpresa,
            valor_estimado: prospect.valorEstimado,
            telefono_secundario: prospect.telefonoSecundario,
            origen: prospect.origen,
            industria: prospect.industria,
            nivel_interes: prospect.nivelInteres,
            direccion: prospect.direccion,
            notas_internas: prospect.notasInternas,
            fecha_proximo_seguimiento: prospect.fechaProximoSeguimiento,
            workspace: workspaceId
        }]).select().single();

        if (error) throw error;
        setProspects(prev => [mapProspectFromDB(data), ...prev]);
    };

    const updateProspect = async (id: string, updates: Partial<Prospect>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const payload: any = { ...updates, updated_at: new Date().toISOString() };

        // Map camelCase to snake_case if necessary
        if (updates.servicioInteres !== undefined) payload.servicio_interes = updates.servicioInteres;
        if (updates.valorEstimado !== undefined) payload.valor_estimado = updates.valorEstimado;
        if (updates.telefonoSecundario !== undefined) payload.telefono_secundario = updates.telefonoSecundario;
        if (updates.notasInternas !== undefined) payload.notas_internas = updates.notasInternas;
        if (updates.nivelInteres !== undefined) payload.nivel_interes = updates.nivelInteres;
        if (updates.fechaProximoSeguimiento !== undefined) payload.fecha_proximo_seguimiento = updates.fechaProximoSeguimiento;
        if (updates.ultimoSeguimiento !== undefined) payload.ultimo_seguimiento = updates.ultimoSeguimiento;
        if (updates.fechaContacto !== undefined) payload.fecha_contacto = updates.fechaContacto;

        const { error } = await supabase.from('prospects')
            .update(payload)
            .eq('id', id)
            .eq('workspace', workspaceId);

        if (error) throw error;
        setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        if (selectedProspect?.id === id) setSelectedProspect(prev => prev ? { ...prev, ...updates } : null);
    };

    const deleteProspect = async (id: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { error } = await supabase.from('prospects')
            .delete()
            .eq('id', id)
            .eq('workspace', workspaceId);

        if (error) throw error;
        setProspects(prev => prev.filter(p => p.id !== id));
        if (selectedProspect?.id === id) setSelectedProspect(null);
    };

    const addFollowUp = async (prospectId: string, note: string, userId: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { data, error } = await supabase.from('prospect_followups').insert([{
            prospect_id: prospectId,
            nota: note,
            created_by: userId,
            workspace: workspaceId
        }]).select().single();

        if (error) throw error;

        const newFollowUp = {
            id: data.id,
            fecha: new Date(data.created_at),
            usuario: data.created_by,
            nota: data.nota
        };

        setProspects(prev => prev.map(p =>
            p.id === prospectId
                ? { ...p, seguimientos: [newFollowUp, ...(p.seguimientos || [])] }
                : p
        ));

        if (selectedProspect?.id === prospectId) {
            setSelectedProspect(prev => prev ? {
                ...prev,
                seguimientos: [newFollowUp, ...(prev.seguimientos || [])]
            } : null);
        }
    };

    const addQuote = async (quote: Partial<Quote>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { data, error } = await supabase.from('quotes').insert([{
            ...quote,
            workspace_id: workspaceId,
            prospect_id: quote.prospectId,
            notas_adicionales: quote.notasAdicionales,
            terminos_condiciones: quote.terminosCondiciones,
            metodos_pago_aceptados: quote.metodosPagoAceptados,
            iva_porcentaje: quote.ivaPorcentaje,
            iva_total: quote.ivaTotal,
            condiciones_pago: quote.condicionesPago
        }]).select().single();

        if (error) throw error;
        setQuotes(prev => [mapQuoteFromDB(data), ...prev]);
    };

    const updateQuote = async (id: string, updates: Partial<Quote>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const payload: any = { ...updates, updated_at: new Date().toISOString() };
        if (updates.notasAdicionales !== undefined) payload.notas_adicionales = updates.notasAdicionales;
        if (updates.terminosCondiciones !== undefined) payload.terminos_condiciones = updates.terminosCondiciones;
        if (updates.metodosPagoAceptados !== undefined) payload.metodos_pago_aceptados = updates.metodosPagoAceptados;
        if (updates.ivaPorcentaje !== undefined) payload.iva_porcentaje = updates.ivaPorcentaje;
        if (updates.ivaTotal !== undefined) payload.iva_total = updates.ivaTotal;
        if (updates.condicionesPago !== undefined) payload.condiciones_pago = updates.condicionesPago;

        const { error } = await supabase.from('quotes')
            .update(payload)
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const deleteQuote = async (id: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { error } = await supabase.from('quotes')
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        setQuotes(prev => prev.filter(q => q.id !== id));
    };

    const addQuoteTemplate = async (templateData: any) => {
        const workspaceId = validateWorkspace(workspace?.id);
        if (!authUser) throw new Error("No sesión activa");

        const payload = {
            workspace_id: workspaceId,
            created_by: authUser.id,
            name: templateData.nombre,
            description: templateData.descripcion,
            items: templateData.items,
            notes: templateData.notasAdicionales,
            terms: templateData.terminosCondiciones
        };

        const { data, error } = await supabase.from('quote_templates').insert(payload).select().single();
        if (error) throw error;
        setQuoteTemplates(prev => [mapQuoteTemplateFromDB(data), ...prev]);
    };

    const updateQuoteTemplate = async (id: string, updates: Partial<QuoteTemplate>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.nombre !== undefined) payload.name = updates.nombre;
        if (updates.descripcion !== undefined) payload.description = updates.descripcion;
        if (updates.items !== undefined) payload.items = updates.items;
        if (updates.notasAdicionales !== undefined) payload.notes = updates.notasAdicionales;
        if (updates.terminosCondiciones !== undefined) payload.terms = updates.terminosCondiciones;

        const { error } = await supabase.from('quote_templates')
            .update(payload)
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        setQuoteTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const deleteQuoteTemplate = async (id: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { error } = await supabase.from('quote_templates')
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        setQuoteTemplates(prev => prev.filter(t => t.id !== id));
    };

    const duplicateQuoteTemplate = async (id: string) => {
        const t = quoteTemplates.find(t => t.id === id);
        if (t) await addQuoteTemplate({ ...t, nombre: `${t.nombre} (Copia)` });
    };

    const addCalendarEvent = async (event: Partial<CalendarEvent>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { data, error } = await supabase.from('calendar_events').insert([{
            title: event.title,
            description: event.description,
            start_time: event.startTime?.toISOString(),
            end_time: event.endTime?.toISOString(),
            type: event.type,
            prospect_id: event.prospectId || null,
            workspace_id: workspaceId
        }]).select().single();

        if (error) throw error;
        setCalendarEvents(prev => [...prev, mapCalendarEventFromDB(data)]);
    };

    const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.startTime !== undefined) payload.start_time = updates.startTime.toISOString();
        if (updates.endTime !== undefined) payload.end_time = updates.endTime.toISOString();
        if (updates.type !== undefined) payload.type = updates.type;

        const { error } = await supabase.from('calendar_events')
            .update(payload)
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    };

    const deleteCalendarEvent = async (id: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { error } = await supabase.from('calendar_events')
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        setCalendarEvents(prev => prev.filter(e => e.id !== id));
    };

    return (
        <CRMContext.Provider value={{
            prospects, quotes, calendarEvents, quoteTemplates, isLoadingCRM,
            refreshCRMData, addProspect, updateProspect, deleteProspect,
            selectedProspect, selectProspect, addQuote, updateQuote, deleteQuote,
            addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, addFollowUp,
            addQuoteTemplate, updateQuoteTemplate, deleteQuoteTemplate, duplicateQuoteTemplate
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
