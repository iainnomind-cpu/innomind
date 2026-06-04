import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    Bell,
    CalendarClock,
    Check,
    CheckSquare,
    ChevronRight,
    CircleDollarSign,
    Clock,
    Package,
    Receipt,
    RotateCcw,
    ShoppingCart,
    Users,
    X
} from 'lucide-react';
import { useAccountsPayable } from '@/context/AccountsPayableContext';
import { useAccountsReceivable } from '@/context/AccountsReceivableContext';
import { useCRM } from '@/context/CRMContext';
import { useFinance } from '@/context/FinanceContext';
import { useInventory } from '@/context/InventoryContext';
import { useProcurement } from '@/context/ProcurementContext';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';

type NotificationSeverity = 'critical' | 'warning' | 'info';
type NotificationCategory = 'finance' | 'crm' | 'workspace' | 'inventory' | 'procurement';
type NotificationFilter = 'all' | 'critical' | NotificationCategory;

interface CoreNotification {
    id: string;
    title: string;
    message: string;
    severity: NotificationSeverity;
    category: NotificationCategory;
    sourceLabel: string;
    actionLabel: string;
    actionPath: string;
    dueAt?: Date;
    createdAt?: Date;
    score: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const STALE_LEAD_DAYS = 7;
const HOT_LEAD_DAYS = 3;
const URGENT_AMOUNT = 50000;
const LOW_CASH_THRESHOLD = 5000;

const categoryLabels: Record<NotificationCategory, string> = {
    finance: 'Finanzas',
    crm: 'CRM',
    workspace: 'Nodo',
    inventory: 'Inventario',
    procurement: 'Compras'
};

const severityRank: Record<NotificationSeverity, number> = {
    critical: 3,
    warning: 2,
    info: 1
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const toDate = (value: unknown): Date | undefined => {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value as string);
    return Number.isNaN(date.getTime()) ? undefined : date;
};

const daysUntil = (date: Date, today = startOfDay(new Date())) => {
    return Math.round((startOfDay(date).getTime() - today.getTime()) / MS_PER_DAY);
};

const daysSince = (date: Date, today = startOfDay(new Date())) => Math.max(0, -daysUntil(date, today));

const money = (amount: number | undefined | null) => {
    return `$${Number(amount || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
};

const dueBucket = (days: number) => {
    if (days < 0) return 'overdue';
    if (days === 0) return 'today';
    if (days <= 3) return 'soon';
    return 'upcoming';
};

const dueLabel = (dueAt?: Date) => {
    if (!dueAt) return 'Detectado ahora';
    const days = daysUntil(dueAt);
    if (days < 0) return `Vencio hace ${Math.abs(days)} dia${Math.abs(days) === 1 ? '' : 's'}`;
    if (days === 0) return 'Vence hoy';
    if (days === 1) return 'Vence manana';
    return `Vence en ${days} dias`;
};

const nextMonthlyDate = (dayOfPeriod: number) => {
    const today = startOfDay(new Date());
    const build = (year: number, month: number) => {
        const lastDay = new Date(year, month + 1, 0).getDate();
        return new Date(year, month, Math.min(dayOfPeriod, lastDay));
    };

    const current = build(today.getFullYear(), today.getMonth());
    if (current >= today) return current;
    return build(today.getFullYear(), today.getMonth() + 1);
};

const nextRecurringDate = (startValue: unknown, frequency: string, dayOfPeriod?: number, endValue?: unknown) => {
    const start = toDate(startValue);
    if (!start) return undefined;

    const today = startOfDay(new Date());
    const end = toDate(endValue);
    let next = startOfDay(start);

    if (frequency === 'monthly') {
        next = nextMonthlyDate(dayOfPeriod || start.getDate());
    } else {
        const step = frequency === 'biweekly' ? 14 : 7;
        while (next < today) {
            next = new Date(next.getTime() + step * MS_PER_DAY);
        }
    }

    if (end && next > startOfDay(end)) return undefined;
    return next;
};

const buildNotification = (notification: CoreNotification) => notification;

export default function CoreNotifications() {
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const workspaceData = useWorkspace();
    const { payables } = useAccountsPayable();
    const { chargeNotes, bankMovements } = useAccountsReceivable();
    const { prospects, quotes, calendarEvents } = useCRM();
    const { accounts, documents, expenses, recurringExpenses } = useFinance();
    const { products, getProductStock } = useInventory();
    const { purchaseOrders, purchaseRequests, budgets, recurringPurchases } = useProcurement();

    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<NotificationFilter>('all');
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    const storageKey = `core_notifications_seen_${workspaceData.workspace?.id || 'global'}`;

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(storageKey);
            setDismissedIds(raw ? JSON.parse(raw) : []);
        } catch {
            setDismissedIds([]);
        }
    }, [storageKey]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const notifications = useMemo(() => {
        const today = startOfDay(new Date());
        const generated: CoreNotification[] = [];

        (payables || []).forEach((payable) => {
            const status = String(payable.status || payable.estado || '').toLowerCase();
            if (['paid', 'cancelled'].includes(status) || Number(payable.balance_due || 0) <= 0) return;
            const dueAt = toDate(payable.due_date);
            if (!dueAt) return;

            const days = daysUntil(dueAt, today);
            if (days > 7) return;

            const bucket = dueBucket(days);
            generated.push(buildNotification({
                id: `ap-${payable.id}-${bucket}`,
                title: days < 0 ? 'Pago a proveedor vencido' : 'Pago a proveedor por vencer',
                message: `${payable.concept || 'Cuenta por pagar'} tiene saldo pendiente de ${money(payable.balance_due)}.`,
                severity: days <= 0 ? 'critical' : days <= 3 ? 'warning' : 'info',
                category: 'finance',
                sourceLabel: 'CxP',
                actionLabel: 'Pagar',
                actionPath: '/crm/finance/payables',
                dueAt,
                score: 95 + (days < 0 ? Math.abs(days) : 0)
            }));
        });

        (chargeNotes || []).forEach((note) => {
            const status = String(note.status || '').toLowerCase();
            if (['paid', 'cancelled'].includes(status) || Number(note.balance_due || 0) <= 0) return;
            const dueAt = toDate(note.due_date);
            if (!dueAt) return;

            const days = daysUntil(dueAt, today);
            if (days > 7) return;

            const bucket = dueBucket(days);
            generated.push(buildNotification({
                id: `ar-${note.id}-${bucket}`,
                title: days < 0 ? 'Cobro vencido' : 'Cobro por vencer',
                message: `${note.prospect?.empresa || note.prospect?.nombre || 'Cliente'} debe ${money(note.balance_due)} en la nota ${note.note_number || note.id.slice(0, 8)}.`,
                severity: days < 0 ? 'critical' : days <= 2 ? 'warning' : 'info',
                category: 'finance',
                sourceLabel: 'CxC',
                actionLabel: 'Cobrar',
                actionPath: '/crm/finance/receivables',
                dueAt,
                score: 92 + (days < 0 ? Math.abs(days) : 0)
            }));
        });

        (documents || []).forEach((document) => {
            const status = String(document.estado || '').toUpperCase();
            if (['PAGADO', 'CANCELADO', 'RECHAZADO'].includes(status) || Number(document.saldoPendiente || 0) <= 0) return;
            const dueAt = toDate(document.fechaVencimiento);
            if (!dueAt) return;

            const days = daysUntil(dueAt, today);
            if (days > 5) return;

            generated.push(buildNotification({
                id: `finance-doc-${document.id}-${dueBucket(days)}`,
                title: document.tipo === 'NOTA_CARGO' ? 'Documento por cobrar requiere atencion' : 'Documento financiero por vencer',
                message: `${document.concepto || document.numeroFolio || 'Documento'} mantiene ${money(document.saldoPendiente)} pendiente.`,
                severity: days <= 0 ? 'critical' : 'warning',
                category: 'finance',
                sourceLabel: 'Finanzas',
                actionLabel: 'Revisar',
                actionPath: '/crm/finance/treasury',
                dueAt,
                score: 82
            }));
        });

        (accounts || []).forEach((account) => {
            if (!account.activo || account.tipo === 'TARJETA_CREDITO') return;
            const balance = Number(account.saldoActual || 0);
            if (balance > LOW_CASH_THRESHOLD) return;

            generated.push(buildNotification({
                id: `cash-${account.id}-${balance <= 0 ? 'negative' : 'low'}`,
                title: balance <= 0 ? 'Cuenta sin liquidez' : 'Saldo bajo en cuenta',
                message: `${account.account_alias || account.nombre} tiene ${money(balance)} disponible.`,
                severity: balance <= 0 ? 'critical' : 'warning',
                category: 'finance',
                sourceLabel: 'Tesoreria',
                actionLabel: 'Ver caja',
                actionPath: '/crm/finance/treasury',
                score: balance <= 0 ? 91 : 72
            }));
        });

        (expenses || []).forEach((expense) => {
            if (String(expense.status) !== 'pending_approval') return;
            const createdAt = toDate(expense.created_at) || toDate(expense.expense_date);
            const age = createdAt ? daysSince(createdAt, today) : 0;
            if (age < 2 && Number(expense.amount || 0) < 10000) return;

            generated.push(buildNotification({
                id: `expense-${expense.id}-${age >= 2 ? 'stale' : 'high'}`,
                title: 'Gasto pendiente de aprobacion',
                message: `${expense.description || expense.category || 'Gasto'} espera aprobacion por ${money(expense.amount)}.`,
                severity: age >= 5 ? 'critical' : 'warning',
                category: 'finance',
                sourceLabel: 'Gastos',
                actionLabel: 'Aprobar',
                actionPath: '/crm/finance/expenses',
                createdAt,
                score: age >= 5 ? 88 : 65
            }));
        });

        (recurringExpenses || []).forEach((expense) => {
            if (!expense.active) return;
            const dueAt = nextRecurringDate(expense.start_date, expense.frequency, expense.day_of_period, expense.end_date);
            if (!dueAt) return;
            const days = daysUntil(dueAt, today);
            if (days > 7) return;

            generated.push(buildNotification({
                id: `rec-expense-${expense.id}-${dueAt.toISOString().slice(0, 10)}`,
                title: 'Gasto recurrente proximo',
                message: `${expense.concept || 'Gasto recurrente'} se programara por ${money(expense.amount)}.`,
                severity: days <= 1 ? 'warning' : 'info',
                category: 'finance',
                sourceLabel: 'Recurrente',
                actionLabel: 'Ver gastos',
                actionPath: '/crm/finance/expenses',
                dueAt,
                score: 58
            }));
        });

        (workspaceData.tasks || []).forEach((task) => {
            if (task.status === 'COMPLETADA') return;
            const dueAt = toDate(task.dueDate);
            if (!dueAt) return;
            const days = daysUntil(dueAt, today);
            if (days > 7) return;

            const isMine = task.assignedTo === user?.id;
            generated.push(buildNotification({
                id: `task-${task.id}-${dueBucket(days)}`,
                title: days < 0 ? 'Tarea vencida' : isMine ? 'Tu tarea esta por vencer' : 'Tarea por vencer',
                message: `${task.title || 'Tarea'} esta ${task.status?.toLowerCase?.() || 'pendiente'}${task.priority ? ` con prioridad ${task.priority}` : ''}.`,
                severity: days < 0 || task.priority === 'URGENTE' ? 'critical' : days <= 2 ? 'warning' : 'info',
                category: 'workspace',
                sourceLabel: 'Nodo',
                actionLabel: 'Ver tarea',
                actionPath: '/crm/calendar/tasks',
                dueAt,
                score: (isMine ? 82 : 68) + (days < 0 ? Math.abs(days) : 0)
            }));
        });

        (prospects || []).forEach((prospect) => {
            const status = String(prospect.estado || '');
            const isOpenLead = ['Nuevo', 'Contactado', 'En seguimiento', 'Cotizado'].includes(status);
            if (!isOpenLead) return;

            const followUpDueAt = toDate(prospect.fechaProximoSeguimiento);
            if (followUpDueAt) {
                const days = daysUntil(followUpDueAt, today);
                if (days <= 3) {
                    generated.push(buildNotification({
                        id: `lead-next-${prospect.id}-${dueBucket(days)}`,
                        title: days < 0 ? 'Seguimiento de lead vencido' : 'Seguimiento de lead proximo',
                        message: `${prospect.nombre || 'Prospecto'}${prospect.empresa ? ` (${prospect.empresa})` : ''} tiene seguimiento programado.`,
                        severity: days <= 0 ? 'critical' : 'warning',
                        category: 'crm',
                        sourceLabel: 'Leads',
                        actionLabel: 'Dar seguimiento',
                        actionPath: '/crm/prospectos',
                        dueAt: followUpDueAt,
                        score: 87
                    }));
                }
            } else {
                const lastTouch = toDate(prospect.ultimoSeguimiento) || toDate(prospect.fechaContacto);
                if (!lastTouch) return;

                const staleDays = daysSince(lastTouch, today);
                const threshold = prospect.nivelInteres === 'Alto' || prospect.urgencia === 'Inmediata' || Number(prospect.valorEstimado || 0) >= URGENT_AMOUNT
                    ? HOT_LEAD_DAYS
                    : status === 'Cotizado'
                        ? 5
                        : STALE_LEAD_DAYS;

                if (staleDays >= threshold) {
                    generated.push(buildNotification({
                        id: `lead-stale-${prospect.id}-${staleDays >= 14 ? 'critical' : 'warning'}`,
                        title: 'Lead sin seguimiento',
                        message: `${prospect.nombre || 'Prospecto'} lleva ${staleDays} dias sin contacto${prospect.valorEstimado ? ` y vale aprox. ${money(prospect.valorEstimado)}` : ''}.`,
                        severity: staleDays >= 14 || threshold === HOT_LEAD_DAYS ? 'critical' : 'warning',
                        category: 'crm',
                        sourceLabel: 'Leads',
                        actionLabel: 'Contactar',
                        actionPath: '/crm/prospectos',
                        createdAt: lastTouch,
                        score: 84 + Math.min(staleDays, 20)
                    }));
                }
            }

            (prospect.tareas || []).forEach((task) => {
                if (task.completada) return;
                const dueAt = toDate(task.fechaVencimiento);
                if (!dueAt) return;
                const days = daysUntil(dueAt, today);
                if (days > 5) return;

                generated.push(buildNotification({
                    id: `lead-task-${prospect.id}-${task.id}-${dueBucket(days)}`,
                    title: days < 0 ? 'Tarea comercial vencida' : 'Tarea comercial por vencer',
                    message: `${task.titulo || 'Tarea'} del prospecto ${prospect.nombre || 'sin nombre'} requiere accion.`,
                    severity: days <= 0 ? 'critical' : 'warning',
                    category: 'crm',
                    sourceLabel: 'Prospectos',
                    actionLabel: 'Revisar',
                    actionPath: '/crm/prospectos',
                    dueAt,
                    score: 80
                }));
            });
        });

        (quotes || []).forEach((quote) => {
            const status = String(quote.estado || '');
            if (['Aceptada', 'Rechazada', 'Vencida'].includes(status)) return;
            const dueAt = toDate(quote.vigencia);
            if (!dueAt) return;
            const days = daysUntil(dueAt, today);
            if (days > 5) return;

            generated.push(buildNotification({
                id: `quote-${quote.id}-${dueBucket(days)}`,
                title: days < 0 ? 'Cotizacion vencida' : 'Cotizacion por vencer',
                message: `${quote.numero || quote.id.slice(0, 8)} por ${money(quote.total)} necesita seguimiento comercial.`,
                severity: days < 0 ? 'critical' : days <= 2 ? 'warning' : 'info',
                category: 'crm',
                sourceLabel: 'Cotizaciones',
                actionLabel: 'Ver cotizacion',
                actionPath: `/crm/quotes/${quote.id}`,
                dueAt,
                score: 76
            }));
        });

        (calendarEvents || []).forEach((event) => {
            const startsAt = toDate(event.startTime);
            if (!startsAt) return;
            const hours = (startsAt.getTime() - new Date().getTime()) / (60 * 60 * 1000);
            if (hours < 0 || hours > 24) return;

            generated.push(buildNotification({
                id: `event-${event.id}-${startsAt.toISOString().slice(0, 10)}`,
                title: 'Evento proximo',
                message: `${event.title || 'Evento'} inicia ${hours <= 2 ? 'en menos de 2 horas' : 'dentro de 24 horas'}.`,
                severity: hours <= 2 ? 'warning' : 'info',
                category: 'crm',
                sourceLabel: 'Calendario',
                actionLabel: 'Abrir calendario',
                actionPath: '/crm/calendar',
                dueAt: startsAt,
                score: hours <= 2 ? 74 : 48
            }));
        });

        (products || []).forEach((product) => {
            if (!product.activo || !product.trackInventory || !product.stockMinimo) return;
            const stock = Number(getProductStock(product.id) || 0);
            const minimum = Number(product.stockMinimo || 0);
            if (stock > minimum) return;

            generated.push(buildNotification({
                id: `stock-${product.id}-${stock <= 0 ? 'empty' : 'low'}-${stock}`,
                title: stock <= 0 ? 'Producto sin stock' : 'Stock minimo alcanzado',
                message: `${product.nombre || 'Producto'} tiene ${stock} ${product.unidad || 'unidades'} disponibles; minimo configurado: ${minimum}.`,
                severity: stock <= 0 ? 'critical' : 'warning',
                category: 'inventory',
                sourceLabel: 'Stock',
                actionLabel: 'Reabastecer',
                actionPath: '/crm/inventory/stock',
                score: stock <= 0 ? 90 : 70
            }));
        });

        (purchaseRequests || []).forEach((request) => {
            const status = String(request.status || '');
            if (!['pending', 'reviewing', 'approved'].includes(status)) return;
            const dueAt = toDate(request.required_date);
            const isUrgent = request.priority === 'urgente' || request.priority === 'alta';
            if (!dueAt && !isUrgent) return;
            const days = dueAt ? daysUntil(dueAt, today) : 0;
            if (dueAt && days > 5 && !isUrgent) return;

            generated.push(buildNotification({
                id: `purchase-request-${request.id}-${dueAt ? dueBucket(days) : request.priority}`,
                title: dueAt && days < 0 ? 'Solicitud de compra vencida' : 'Solicitud de compra requiere revision',
                message: `${request.title || request.custom_item_name || 'Solicitud'} esta en estado ${status}.`,
                severity: (dueAt && days <= 0) || request.priority === 'urgente' ? 'critical' : 'warning',
                category: 'procurement',
                sourceLabel: 'Solicitudes',
                actionLabel: 'Revisar',
                actionPath: `/compras/solicitudes/${request.id}`,
                dueAt,
                score: 78
            }));
        });

        (purchaseOrders || []).forEach((order) => {
            const status = String(order.estado || '');
            const createdAt = toDate(order.created_at);
            const deliveryAt = toDate(order.estimated_delivery_date);

            if (status === 'pending') {
                const age = createdAt ? daysSince(createdAt, today) : 0;
                if (age >= 2 || Number(order.total_amount || 0) >= URGENT_AMOUNT) {
                    generated.push(buildNotification({
                        id: `purchase-order-pending-${order.id}-${age >= 5 ? 'stale' : 'pending'}`,
                        title: 'Orden de compra pendiente',
                        message: `${order.numero_orden || order.id.slice(0, 8)} espera aprobacion por ${money(order.total_amount)}.`,
                        severity: age >= 5 ? 'critical' : 'warning',
                        category: 'procurement',
                        sourceLabel: 'OC',
                        actionLabel: 'Aprobar',
                        actionPath: '/compras/aprobaciones',
                        createdAt,
                        score: 75 + age
                    }));
                }
            }

            if (deliveryAt && ['sent', 'approved'].includes(status)) {
                const days = daysUntil(deliveryAt, today);
                if (days <= 2) {
                    generated.push(buildNotification({
                        id: `purchase-order-delivery-${order.id}-${dueBucket(days)}`,
                        title: days < 0 ? 'Entrega de compra atrasada' : 'Entrega de compra proxima',
                        message: `${order.numero_orden || order.id.slice(0, 8)} tiene entrega estimada pendiente.`,
                        severity: days < 0 ? 'critical' : 'warning',
                        category: 'procurement',
                        sourceLabel: 'Recepcion',
                        actionLabel: 'Ver orden',
                        actionPath: `/compras/ordenes/${order.id}`,
                        dueAt: deliveryAt,
                        score: 73
                    }));
                }
            }
        });

        (recurringPurchases || []).forEach((purchase) => {
            if (!purchase.active) return;
            const dueAt = toDate(purchase.next_run_date);
            if (!dueAt) return;
            const days = daysUntil(dueAt, today);
            if (days > 7) return;

            generated.push(buildNotification({
                id: `rec-purchase-${purchase.id}-${dueAt.toISOString().slice(0, 10)}`,
                title: 'Compra recurrente proxima',
                message: `${purchase.title || 'Compra recurrente'} esta programada por aprox. ${money(purchase.total_estimated)}.`,
                severity: days <= 1 ? 'warning' : 'info',
                category: 'procurement',
                sourceLabel: 'Compras',
                actionLabel: 'Ver compras',
                actionPath: '/compras/ordenes',
                dueAt,
                score: 54
            }));
        });

        (budgets || []).forEach((budget) => {
            const limit = Number(budget.limit_amount || 0);
            const spent = Number(budget.spent_amount || 0);
            if (limit <= 0) return;
            const ratio = spent / limit;
            if (ratio < 0.85) return;

            generated.push(buildNotification({
                id: `budget-${budget.id}-${ratio >= 1 ? 'over' : 'near'}`,
                title: ratio >= 1 ? 'Presupuesto excedido' : 'Presupuesto cerca del limite',
                message: `${budget.category || 'Categoria'} ha usado ${money(spent)} de ${money(limit)}.`,
                severity: ratio >= 1 ? 'critical' : 'warning',
                category: 'procurement',
                sourceLabel: 'Presupuesto',
                actionLabel: 'Ver presupuesto',
                actionPath: '/compras/presupuestos',
                score: ratio >= 1 ? 86 : 62
            }));
        });

        (bankMovements || []).forEach((movement) => {
            if (movement.matched_payment_id || Number(movement.amount || 0) <= 0) return;
            const createdAt = toDate(movement.movement_date) || toDate(movement.imported_at);
            const age = createdAt ? daysSince(createdAt, today) : 0;
            if (age < 1 && Number(movement.amount || 0) < 10000) return;

            generated.push(buildNotification({
                id: `bank-unmatched-${movement.id}-${age >= 3 ? 'stale' : 'new'}`,
                title: 'Movimiento bancario sin conciliar',
                message: `${movement.description || 'Deposito'} por ${money(movement.amount)} aun no esta asociado a un cobro.`,
                severity: age >= 3 ? 'warning' : 'info',
                category: 'finance',
                sourceLabel: 'Banco',
                actionLabel: 'Conciliar',
                actionPath: '/crm/finance/receivables',
                createdAt,
                score: age >= 3 ? 64 : 42
            }));
        });

        return generated
            .sort((a, b) => {
                if (severityRank[b.severity] !== severityRank[a.severity]) {
                    return severityRank[b.severity] - severityRank[a.severity];
                }
                if (b.score !== a.score) return b.score - a.score;
                return (a.dueAt?.getTime() || Number.MAX_SAFE_INTEGER) - (b.dueAt?.getTime() || Number.MAX_SAFE_INTEGER);
            })
            .slice(0, 60);
    }, [
        payables,
        chargeNotes,
        documents,
        accounts,
        expenses,
        recurringExpenses,
        workspaceData.tasks,
        prospects,
        quotes,
        calendarEvents,
        products,
        getProductStock,
        purchaseRequests,
        purchaseOrders,
        recurringPurchases,
        budgets,
        bankMovements,
        user?.id
    ]);

    const visibleNotifications = useMemo(() => {
        return notifications.filter(notification => {
            if (dismissedIds.includes(notification.id)) return false;
            if (filter === 'all') return true;
            if (filter === 'critical') return notification.severity === 'critical';
            return notification.category === filter;
        });
    }, [dismissedIds, filter, notifications]);

    const criticalCount = notifications.filter(notification => !dismissedIds.includes(notification.id) && notification.severity === 'critical').length;
    const activeCount = notifications.filter(notification => !dismissedIds.includes(notification.id)).length;

    const persistDismissed = (ids: string[]) => {
        setDismissedIds(ids);
        window.localStorage.setItem(storageKey, JSON.stringify(ids));
    };

    const dismissNotification = (id: string) => {
        persistDismissed(Array.from(new Set([...dismissedIds, id])));
    };

    const dismissVisibleNotifications = () => {
        persistDismissed(Array.from(new Set([...dismissedIds, ...visibleNotifications.map(notification => notification.id)])));
    };

    const restoreDismissed = () => {
        persistDismissed([]);
    };

    const openNotification = (notification: CoreNotification) => {
        dismissNotification(notification.id);
        setIsOpen(false);
        navigate(notification.actionPath);
    };

    const getIcon = (notification: CoreNotification) => {
        const className = notification.severity === 'critical'
            ? 'text-red-600'
            : notification.severity === 'warning'
                ? 'text-amber-600'
                : 'text-blue-600';

        if (notification.category === 'finance') return <CircleDollarSign size={18} className={className} />;
        if (notification.category === 'crm') return <Users size={18} className={className} />;
        if (notification.category === 'workspace') return <CheckSquare size={18} className={className} />;
        if (notification.category === 'inventory') return <Package size={18} className={className} />;
        return <ShoppingCart size={18} className={className} />;
    };

    const filterOptions: Array<{ id: NotificationFilter; label: string }> = [
        { id: 'all', label: 'Todo' },
        { id: 'critical', label: 'Critico' },
        { id: 'finance', label: 'Finanzas' },
        { id: 'crm', label: 'CRM' },
        { id: 'workspace', label: 'Nodo' },
        { id: 'inventory', label: 'Stock' },
        { id: 'procurement', label: 'Compras' }
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Notificaciones inteligentes"
            >
                <Bell size={21} />
                {activeCount > 0 && (
                    <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white ${criticalCount > 0 ? 'bg-red-600' : 'bg-blue-600'}`}>
                        {activeCount > 9 ? '9+' : activeCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-[min(92vw,420px)] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col max-h-[82vh]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <AlertTriangle size={17} className={criticalCount > 0 ? 'text-red-600' : 'text-blue-600'} />
                                    Notificaciones inteligentes
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {activeCount} activas, {criticalCount} criticas
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                {dismissedIds.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={restoreDismissed}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Restaurar vistas"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Cerrar"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-1 mt-4 overflow-x-auto pb-1 hide-scrollbar">
                            {filterOptions.map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setFilter(option.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${filter === option.id
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {visibleNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell size={36} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-sm font-semibold text-gray-700">Sin alertas pendientes</p>
                                <p className="text-xs text-gray-500 mt-1">Cuando algo requiera accion, aparecera aqui.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {visibleNotifications.map(notification => (
                                    <li key={notification.id} className="group relative">
                                        <button
                                            type="button"
                                            onClick={() => openNotification(notification)}
                                            className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${notification.severity === 'critical'
                                                    ? 'bg-red-50'
                                                    : notification.severity === 'warning'
                                                        ? 'bg-amber-50'
                                                        : 'bg-blue-50'
                                                    }`}>
                                                    {getIcon(notification)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start gap-2">
                                                        <p className="text-sm font-bold text-gray-900 leading-snug flex-1">
                                                            {notification.title}
                                                        </p>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${notification.severity === 'critical'
                                                            ? 'bg-red-100 text-red-700'
                                                            : notification.severity === 'warning'
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {notification.sourceLabel}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between gap-3 mt-3">
                                                        <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                                                            {notification.dueAt ? <CalendarClock size={13} /> : <Clock size={13} />}
                                                            {dueLabel(notification.dueAt)}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                                                            {notification.actionLabel}
                                                            <ChevronRight size={13} />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => dismissNotification(notification.id)}
                                            className="absolute right-3 mt-[-54px] opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-green-700 hover:bg-green-50 transition-all"
                                            title="Marcar como visto"
                                        >
                                            <Check size={15} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {visibleNotifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                            <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Receipt size={13} />
                                {categoryLabels[visibleNotifications[0]?.category] || 'Core'} detecta prioridades operativas.
                            </div>
                            <button
                                type="button"
                                onClick={dismissVisibleNotifications}
                                className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Marcar vistas
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
