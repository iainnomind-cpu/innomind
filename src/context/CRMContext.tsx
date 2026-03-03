import React, { createContext, useContext, useState, useEffect } from 'react';
import { Prospect, Quote, QuoteTemplate, CalendarEvent } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useWorkspace } from './WorkspaceContext';
import { useUsers } from './UserContext';

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
    addQuoteTemplate: (template: Omit<QuoteTemplate, 'id' | 'workspace_id' | 'created_by' | 'fechaCreacion'>) => Promise<void>;
    updateQuoteTemplate: (id: string, data: Partial<QuoteTemplate>) => Promise<void>;
    deleteQuoteTemplate: (id: string) => Promise<void>;
    duplicateQuoteTemplate: (id: string) => Promise<void>;

    calendarEvents: CalendarEvent[];
    addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
    updateCalendarEvent: (id: string, data: Partial<CalendarEvent>) => Promise<void>;
    deleteCalendarEvent: (id: string) => Promise<void>;

    isLoadingCRM: boolean;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const { activeSpace } = useWorkspace();
    const { companyProfile, isLoadingProfile } = useUsers();
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
            fecha: new Date(s.created_at),
            usuario: s.created_by,
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

    // Master Fetch when Auth is ready
    useEffect(() => {
        // 🛡️ GUARD 1: Si la sesión no ha cargado, esperamos
        if (authUser === undefined) return;

        // 🛡️ GUARD 2: Si el usuario seguro no está autenticado, limpiamos seguro
        if (authUser === null) {
            setProspects([]);
            setQuotes([]);
            setCalendarEvents([]);
            setQuoteTemplates([]);
            setIsLoadingCRM(false);
            return;
        }

        // 🛡️ GUARD 3: Fundamental para Multi-Tenant Real
        // Esperamos a que UserContext resuelva el id de la compañía real de BD
        if (isLoadingProfile || !companyProfile?.id) {
            return;
        }

        const fetchAllData = async () => {
            setIsLoadingCRM(true);
            try {
                const tenantId = companyProfile.id;

                // Fetch Prospects (Safe)
                const { data: prosData, error: prosError } = await supabase
                    .from('prospects')
                    .select('*')
                    .eq('workspace', tenantId)
                    .order('created_at', { ascending: false });

                if (prosError) {
                    console.error("Error fetching prospects:", prosError.message);
                } else if (prosData) {
                    setProspects(prosData.map(mapProspectFromDB));
                }

                // Fetch Quotes
                const { data: qtData } = await supabase.from('quotes').select('*').order('fecha', { ascending: false });
                if (qtData) setQuotes(qtData.map(mapQuoteFromDB));

                // Fetch Calendar Events
                const { data: eventsData } = await supabase.from('calendar_events').select('*').order('start_time', { ascending: true });
                if (eventsData) setCalendarEvents(eventsData.map(mapCalendarEventFromDB));

                // Fetch Quote Templates
                const { data: templatesData } = await supabase
                    .from('quote_templates')
                    .select('*')
                    .eq('workspace_id', tenantId) // Asumiendo que quote templates también usa el tenant real
                    .order('created_at', { ascending: false });
                if (templatesData) setQuoteTemplates(templatesData.map(mapQuoteTemplateFromDB));

            } catch (error) {
                console.error("Error fetching CRM Data", error);
            } finally {
                setIsLoadingCRM(false);
            }
        };

        fetchAllData();
    }, [authUser, companyProfile?.id, isLoadingProfile]);

    const selectProspect = (prospect: Prospect | null) => setSelectedProspect(prospect);

    // PROSPECTS
    const deleteProspect = async (id: string) => {
        if (!companyProfile?.id) return;
        setProspects(prev => prev.filter(p => p.id !== id));
        if (selectedProspect?.id === id) setSelectedProspect(null);

        await supabase.from('prospects')
            .delete()
            .eq('id', id)
            .eq('workspace', companyProfile.id);
    };

    const addProspect = async (prospect: Prospect) => {
        if (!companyProfile?.id) {
            console.error("No active tenant selected");
            throw new Error("No active tenant selected");
        }

        // 🧠 Protección contra ENUM inválido
        const allowedStatus = ['Nuevo', 'Contactado', 'En seguimiento', 'Cotizado', 'Venta cerrada', 'Cliente Activo', 'Cliente Inactivo', 'Perdido'];
        const allowedPlatform = ['WhatsApp', 'Facebook', 'Instagram'];

        if (prospect.estado && !allowedStatus.includes(prospect.estado)) {
            throw new Error(`Invalid status value: ${prospect.estado}`);
        }
        if (prospect.plataforma && !allowedPlatform.includes(prospect.plataforma)) {
            throw new Error(`Invalid platform value: ${prospect.plataforma}`);
        }

        // Validaciones previas
        if (!prospect.nombre?.trim()) throw new Error("El nombre es requerido");
        if (!prospect.correo?.trim()) throw new Error("El correo es requerido");

        // Traducción controlada de camelCase a snake_case
        const rawPayload: any = { workspace: companyProfile.id };
        if (prospect.nombre !== undefined) rawPayload.nombre = prospect.nombre;
        if (prospect.empresa !== undefined) rawPayload.empresa = prospect.empresa;
        if (prospect.cargo !== undefined) rawPayload.cargo = prospect.cargo;
        if (prospect.telefono !== undefined) rawPayload.telefono = prospect.telefono;
        if (prospect.telefonoSecundario !== undefined) rawPayload.telefono_secundario = prospect.telefonoSecundario;
        if (prospect.correo !== undefined) rawPayload.correo = prospect.correo;
        if (prospect.origen !== undefined) rawPayload.origen = prospect.origen;
        if (prospect.servicioInteres !== undefined) rawPayload.servicio_interes = prospect.servicioInteres;
        if (prospect.industria !== undefined) rawPayload.industria = prospect.industria;
        if (prospect.tamanoEmpresa !== undefined) rawPayload.tamano_empresa = prospect.tamanoEmpresa;
        if (prospect.nivelInteres !== undefined) rawPayload.nivel_interes = prospect.nivelInteres;
        if (prospect.direccion !== undefined) rawPayload.direccion = prospect.direccion;
        if (prospect.notasInternas !== undefined) rawPayload.notas_internas = prospect.notasInternas;
        if (prospect.responsable !== undefined) rawPayload.responsable = prospect.responsable;
        if (prospect.estado !== undefined) rawPayload.estado = prospect.estado;
        if (prospect.plataforma !== undefined) rawPayload.plataforma = prospect.plataforma;
        if (prospect.valorEstimado !== undefined) rawPayload.valor_estimado = Number(prospect.valorEstimado) || 0;
        if (prospect.fechaProximoSeguimiento !== undefined) rawPayload.fecha_proximo_seguimiento = prospect.fechaProximoSeguimiento?.toISOString();
        if (prospect.ultimoSeguimiento !== undefined) rawPayload.ultimo_seguimiento = prospect.ultimoSeguimiento?.toISOString();
        if (prospect.fechaContacto !== undefined) rawPayload.fecha_contacto = prospect.fechaContacto?.toISOString();

        // 🔎 Validación antes del insert (Paso 2)
        const ALLOWED_PROSPECT_FIELDS = [
            'nombre', 'empresa', 'cargo', 'telefono', 'telefono_secundario', 'correo',
            'origen', 'servicio_interes', 'industria', 'tamano_empresa', 'nivel_interes',
            'direccion', 'notas_internas', 'responsable', 'estado', 'plataforma',
            'valor_estimado', 'fecha_proximo_seguimiento', 'ultimo_seguimiento', 'fecha_contacto',
            'workspace'
        ];

        const sanitizeInsertData = (payload: any, allowedFields: string[]) => {
            return Object.fromEntries(
                Object.entries(payload)
                    .filter(([key, value]) =>
                        allowedFields.includes(key) &&
                        value !== undefined &&
                        value !== '' && // Evitar nulos inesperados si la db lo exige nulo u omitido.
                        key !== 'id' &&
                        key !== 'created_at' &&
                        key !== 'updated_at'
                    )
            );
        };

        const cleanData = sanitizeInsertData(rawPayload, ALLOWED_PROSPECT_FIELDS);

        // 🔄 Insert Seguro (Paso 4)
        const { data, error } = await supabase.from('prospects')
            .insert(cleanData)
            .select()
            .limit(1)
            .maybeSingle();

        // 🔐 Manejo Avanzado de Error (Paso 5)
        if (error) {
            console.error("Supabase Error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw new Error(error.message);
        }

        if (!data) {
            console.warn("Prospect was created but not returned by the database. Likely due to RLS.");
            return;
        }

        setProspects(prev => [mapProspectFromDB(data), ...prev]);
    };

    const updateProspect = async (id: string, data: Partial<Prospect>) => {
        if (!activeSpace) return;

        // 🧠 Protección contra ENUM inválido
        const allowedStatus = ['Nuevo', 'Contactado', 'En seguimiento', 'Cotizado', 'Venta cerrada', 'Cliente Activo', 'Cliente Inactivo', 'Perdido'];
        const allowedPlatform = ['WhatsApp', 'Facebook', 'Instagram'];

        if (data.estado && !allowedStatus.includes(data.estado)) {
            throw new Error(`Invalid status value: ${data.estado}`);
        }
        if (data.plataforma && !allowedPlatform.includes(data.plataforma)) {
            throw new Error(`Invalid platform value: ${data.plataforma}`);
        }

        // Optimistic UI Update opcional
        setProspects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
        if (selectedProspect?.id === id) {
            setSelectedProspect(prev => prev ? { ...prev, ...data } : null);
        }

        // Traducción controlada de camelCase a snake_case 
        const rawPayload: any = {};
        if (data.nombre !== undefined) rawPayload.nombre = data.nombre;
        if (data.empresa !== undefined) rawPayload.empresa = data.empresa;
        if (data.cargo !== undefined) rawPayload.cargo = data.cargo;
        if (data.telefono !== undefined) rawPayload.telefono = data.telefono;
        if (data.telefonoSecundario !== undefined) rawPayload.telefono_secundario = data.telefonoSecundario;
        if (data.correo !== undefined) rawPayload.correo = data.correo;
        if (data.origen !== undefined) rawPayload.origen = data.origen;
        if (data.servicioInteres !== undefined) rawPayload.servicio_interes = data.servicioInteres;
        if (data.industria !== undefined) rawPayload.industria = data.industria;
        if (data.tamanoEmpresa !== undefined) rawPayload.tamano_empresa = data.tamanoEmpresa;
        if (data.nivelInteres !== undefined) rawPayload.nivel_interes = data.nivelInteres;
        if (data.direccion !== undefined) rawPayload.direccion = data.direccion;
        if (data.notasInternas !== undefined) rawPayload.notas_internas = data.notasInternas;
        if (data.responsable !== undefined) rawPayload.responsable = data.responsable;
        if (data.estado !== undefined) rawPayload.estado = data.estado;
        if (data.plataforma !== undefined) rawPayload.plataforma = data.plataforma;
        if (data.valorEstimado !== undefined) rawPayload.valor_estimado = Number(data.valorEstimado) || 0;
        if (data.fechaProximoSeguimiento !== undefined) rawPayload.fecha_proximo_seguimiento = data.fechaProximoSeguimiento?.toISOString();
        if (data.ultimoSeguimiento !== undefined) rawPayload.ultimo_seguimiento = data.ultimoSeguimiento?.toISOString();
        if (data.fechaContacto !== undefined) rawPayload.fecha_contacto = data.fechaContacto?.toISOString();

        // 🔎 Validación antes del update (Paso 2)
        const ALLOWED_PROSPECT_FIELDS = [
            'nombre', 'empresa', 'cargo', 'telefono', 'telefono_secundario', 'correo',
            'origen', 'servicio_interes', 'industria', 'tamano_empresa', 'nivel_interes',
            'direccion', 'notas_internas', 'responsable', 'estado', 'plataforma',
            'valor_estimado', 'fecha_proximo_seguimiento', 'ultimo_seguimiento', 'fecha_contacto'
        ];

        const sanitizeUpdateData = (payload: any, allowedFields: string[]) => {
            return Object.fromEntries(
                Object.entries(payload)
                    .filter(([key, value]) =>
                        allowedFields.includes(key) &&
                        value !== undefined &&
                        value !== '' && // Extra safety if DB expects nulls, though string is ok for most text fields. Keep empty strings for now.
                        key !== 'id' &&
                        key !== 'workspace' &&
                        key !== 'created_at' &&
                        key !== 'updated_at'
                    )
            );
        };

        const cleanData = sanitizeUpdateData(rawPayload, ALLOWED_PROSPECT_FIELDS);

        if (Object.keys(cleanData).length > 0) {
            // 🔄 Update Seguro (Paso 4)
            const { error } = await supabase.from('prospects')
                .update({ ...cleanData, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('workspace', companyProfile.id);

            // 🔐 Manejo Avanzado de Error (Paso 5)
            if (error) {
                console.error("Supabase Error:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });

                // Optional: Revert optimistic UI update if fails
                throw new Error(error.message);
            }

            // Refetch automático después de éxito (Paso 4 UX)
            const { data: updatedProspect, error: fetchError } = await supabase.from('prospects')
                .select('*')
                .eq('id', id)
                .eq('workspace', companyProfile.id)
                .limit(1)
                .maybeSingle();

            if (!updatedProspect) {
                console.warn("Prospect not found for this workspace after update.");
                return;
            }

            if (!fetchError) {
                const updated = mapProspectFromDB(updatedProspect);
                setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
                if (selectedProspect?.id === id) {
                    setSelectedProspect(prev => prev ? { ...prev, ...updated } : null);
                }
            }
        }
    };

    const addFollowUp = async (prospectId: string, note: string, userId: string) => {
        // Validar que exista el workspace o al menos el tenant activo
        const tenantId = activeSpace || companyProfile?.id;

        if (!tenantId || !authUser) {
            console.error("No active tenant selected or user not logged in for followup");
            throw new Error("Sesión o workspace no activos. Asegúrate de iniciar sesión.");
        }

        // Just update UI state instantly, no DB request is made by user's request
        const mappedFollowUp = {
            id: Math.random().toString(36).substr(2, 9),
            fecha: new Date(),
            usuario: userId || authUser.id,
            nota: note
        };

        setProspects(prev => prev.map(p =>
            p.id === prospectId
                ? { ...p, seguimientos: [mappedFollowUp, ...(p.seguimientos || [])] }
                : p
        ));

        if (selectedProspect?.id === prospectId) {
            setSelectedProspect(prev => prev ? { ...prev, seguimientos: [mappedFollowUp, ...(prev.seguimientos || [])] } : null);
        }
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

    // TEMPLATES / MIGRATED TO SUPABASE WITH MULTI-TENANT
    const addQuoteTemplate = async (templateData: Omit<QuoteTemplate, 'id' | 'workspace_id' | 'created_by' | 'fechaCreacion'>) => {
        // Asegurar que usamos el tenant y token más actual para evitar errores RLS
        const { data: { session } } = await supabase.auth.getSession();

        // Safe extraction of UUID (Handles cases where activeSpace is an object instead of string)
        let tenantId: string = '';
        if (activeSpace) {
            tenantId = typeof activeSpace === 'object' ? (activeSpace as any).id : activeSpace;
        } else if (companyProfile) {
            tenantId = typeof companyProfile === 'object' ? companyProfile.id : (companyProfile as any);
        }

        if (!tenantId || !session?.user) {
            console.error("No active tenant selected or user not logged in");
            throw new Error("Sesión o workspace no válidos. Refresca la página.");
        }

        const payload = {
            workspace_id: tenantId,
            created_by: session.user.id,
            name: templateData.nombre,
            description: templateData.descripcion,
            items: templateData.items,
            notes: templateData.notasAdicionales,
            terms: templateData.terminosCondiciones
        };

        const { data, error } = await supabase.from('quote_templates').insert(payload).select().single();

        if (error) {
            console.error("Error adding quote template:", error);
            throw error; // Lanza el error capturado (incluyendo 42501 RLS)
        }

        if (data) {
            setQuoteTemplates(prev => [mapQuoteTemplateFromDB(data), ...prev]);
        }
    };

    const updateQuoteTemplate = async (id: string, data: Partial<QuoteTemplate>) => {
        // Safe extraction of UUID
        let tenantId: string = '';
        if (activeSpace) {
            tenantId = typeof activeSpace === 'object' ? (activeSpace as any).id : activeSpace;
        } else if (companyProfile) {
            tenantId = typeof companyProfile === 'object' ? companyProfile.id : (companyProfile as any);
        }

        if (!tenantId) return;

        // Optimistic UI Update
        setQuoteTemplates(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));

        const payload: any = { updated_at: new Date().toISOString() };
        if (data.nombre !== undefined) payload.name = data.nombre;
        if (data.descripcion !== undefined) payload.description = data.descripcion;
        if (data.items !== undefined) payload.items = data.items;
        if (data.notasAdicionales !== undefined) payload.notes = data.notasAdicionales;
        if (data.terminosCondiciones !== undefined) payload.terms = data.terminosCondiciones;

        if (Object.keys(payload).length > 1) {
            const { error } = await supabase.from('quote_templates')
                .update(payload)
                .eq('id', id)
                .eq('workspace_id', tenantId);

            if (error) {
                console.error("Error updating quote template", error);
                // Optionally revert optimistic update here
                throw error;
            }
        }
    };

    const deleteQuoteTemplate = async (id: string) => {
        // Safe extraction of UUID
        let tenantId: string = '';
        if (activeSpace) {
            tenantId = typeof activeSpace === 'object' ? (activeSpace as any).id : activeSpace;
        } else if (companyProfile) {
            tenantId = typeof companyProfile === 'object' ? companyProfile.id : (companyProfile as any);
        }

        if (!tenantId) return;

        setQuoteTemplates(prev => prev.filter(t => t.id !== id));
        const { error } = await supabase.from('quote_templates')
            .delete()
            .eq('id', id)
            .eq('workspace_id', tenantId);

        if (error) console.error("Error deleting quote template", error);
    };

    const duplicateQuoteTemplate = async (id: string) => {
        const templateToDuplicate = quoteTemplates.find(t => t.id === id);
        if (templateToDuplicate) {
            try {
                await addQuoteTemplate({
                    ...templateToDuplicate,
                    nombre: `${templateToDuplicate.nombre} (Copia)`
                });
            } catch (error) {
                console.error("Error duplicating template", error);
            }
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
