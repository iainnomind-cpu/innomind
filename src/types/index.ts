export type ProspectStatus = 'Nuevo' | 'Contactado' | 'En seguimiento' | 'Cotizado' | 'Venta cerrada' | 'Cliente Activo' | 'Cliente Inactivo' | 'Perdido';
export type Platform = 'WhatsApp' | 'Instagram' | 'Facebook';

export interface Prospect {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  servicioInteres: string;
  plataforma: Platform;
  estado: ProspectStatus;
  responsable: string; // userId
  fechaContacto?: Date;
  empresa?: string;
  cargo?: string;
  notasInternas?: string;
  ultimoSeguimiento?: Date;
  telefonoSecundario?: string;
  origen?: string;
  industria?: string;
  tamanoEmpresa?: string;
  nivelInteres?: 'Bajo' | 'Medio' | 'Alto';
  valorEstimado?: number;
  direccion?: string;
  fechaProximoSeguimiento?: Date;
  seguimientos: Array<{
    id: string;
    fecha: Date;
    usuario: string;
    nota: string;
  }>;
  cotizaciones: Array<{
    id: string;
    fecha: Date;
    total: number;
    estado: 'Pendiente' | 'Enviada' | 'Aceptada' | 'Rechazada';
  }>;
  tareas: Array<{
    id: string;
    titulo: string;
    fechaVencimiento: Date;
    completada: boolean;
  }>;
}

export interface QuoteItem {
  id: string;
  productId?: string;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  tipoDescuento?: 'porcentaje' | 'monto';
  total: number;
}

export interface Quote {
  id: string;
  prospectId: string;
  numero: string;
  fecha: Date;
  vigencia: Date;
  items: QuoteItem[];
  subtotal: number;
  descuento?: number;
  ivaPorcentaje: number;
  ivaTotal: number;
  total: number;
  estado: 'Borrador' | 'Enviada' | 'Aceptada' | 'Rechazada' | 'Vencida' | 'Actualizada';
  condicionesPago?: string;
  notasAdicionales?: string;
  terminosCondiciones?: string;
  metodosPagoAceptados?: string[];
}

export interface QuoteTemplateItem {
  id: string; // Add ID for local form management
  productId?: string;
  nombre: string;
  descripcion: string;
  descripcionDetallada?: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  tipoDescuento: 'porcentaje' | 'monto';
  subtotal: number;
}

export interface QuoteTemplate {
  id: string;
  workspace_id: string;
  created_by: string;
  nombre: string;
  descripcion: string;
  items: QuoteTemplateItem[];
  subtotal: number; // Sum of items before global adjustments if any
  totalEstimado: number;
  condicionesPago?: string;
  notasAdicionales?: string;
  terminosCondiciones?: string;
  metodosPagoAceptados?: string[];
  fechaCreacion: Date;
  updatedAt?: Date;
}

export interface Product {
  id: string;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  tipo?: 'fisico' | 'servicio' | 'suscripcion' | 'activo_digital' | 'paquete';
  precio: number;
  costoPromedio?: number;
  unidad?: string;
  stockMinimo?: number;
  trackInventory?: boolean;
  esPaqueteServicios?: boolean;
  activo: boolean;
  fechaActualizacion?: Date;
}

export interface InventoryLocation {
  id: string;
  nombre: string;
  direccion?: string;
  tipo: 'Principal' | 'Sucursal' | 'Tránsito';
  activo: boolean;
  fechaCreacion: Date;
}

export type MovementType = 'ENTRADA_COMPRA' | 'SALIDA_VENTA' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO' | 'TRANSFERENCIA';

export interface InventoryMovement {
  id: string;
  productId: string;
  locationId: string;
  tipoMovimiento: MovementType;
  cantidad: number; // Siempre positivo en frontend, el tipo define suma/resta
  costoUnitario: number;
  notas?: string;
  referenceId?: string; // OC o Cotización
  userId?: string;
  fechaMovimiento: Date;
}



export interface CompanyProfile {
  id?: string;
  nombreEmpresa: string;
  rfc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logoUrl?: string; // base64 or URL
  sitioWeb?: string;
  colorPrimario?: string; // for PDF accents
  enabledModules?: string[]; // sidebar module IDs selected during registration
}

export type EventType = 'reunión' | 'llamada' | 'recordatorio';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: EventType;
  prospectId?: string; // Optional relation mapping
}

// --- FINANZAS Y TESORERÍA ---
export type FinanceAccountType = 'BANCO' | 'CAJA_CHICA' | 'TARJETA_CREDITO';

export interface FinanceAccount {
  id: string;
  nombre: string;
  tipo: FinanceAccountType;
  moneda: string;
  saldoInicial: number;
  saldoActual: number;
  activo: boolean;
  updatedAt: Date;
}

export type FinanceDocumentType = 'NOTA_CARGO' | 'CUENTA_PAGAR' | 'GASTO';
export type FinanceDocumentStatus = 'PENDIENTE' | 'PAGADO' | 'VENCIDO' | 'PENDIENTE_APROBACION' | 'RECHAZADO' | 'CANCELADO';

export interface FinanceDocument {
  id: string;
  tipo: FinanceDocumentType;
  estado: FinanceDocumentStatus;
  numeroFolio?: string;

  montoTotal: number;
  saldoPendiente: number;
  moneda: string;

  fechaEmision: Date;
  fechaVencimiento?: Date;

  prospectId?: string;
  quoteId?: string;
  proveedorNombre?: string;
  categoria?: string;
  concepto: string;

  evidenciaUrl?: string;
  createdAt: Date;
}

export type ExpenseStatus = 'pending_approval' | 'approved' | 'rejected' | 'paid';

export interface Expense {
  id: string;
  workspace_id: string;
  employee_id: string;

  amount: number;
  category: string;
  description: string;
  expense_date: Date;

  paid_by: 'employee' | 'company';
  status: ExpenseStatus;

  receipt_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FinancePayment {
  id: string;
  documentId: string;
  accountId?: string;
  monto: number;
  fechaPago: Date;
  metodoPago: string;
  referencia?: string;
  comprobanteUrl?: string;
  notas?: string;
  createdAt: Date;
}

export interface RecurringExpense {
  id: string;
  workspace_id: string;
  concept: string;
  amount: number;
  category?: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  day_of_period: number;
  start_date: Date;
  end_date?: Date;
  active: boolean;
  created_at: Date;
}

export type TreasuryScenario = 'optimistic' | 'realistic' | 'pessimistic';

export interface TreasuryProjectionPoint {
  date: Date;
  balance: number;
  inflow: number;
  outflow: number;
}

export type TreasuryMovementType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'adjustment';

export interface TreasuryMovement {
  id: string;
  workspace_id: string;
  account_id: string;
  movement_type: TreasuryMovementType;
  amount: number;
  description: string;
  reference_id?: string;
  created_at: Date;
}

// ==========================================
// Módulo de Compras y Proveedores (Procurement)
// ==========================================

export interface Supplier {
  id: string;
  workspace: string;
  nombreComercial: string;
  razonSocial?: string;
  rfc?: string;
  email?: string;
  telefono?: string;
  condicionesPago: number; // Días de crédito
  calificacionDesempeno?: number; // 1 to 5
  notas?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PurchaseOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'received'
  | 'cancelled';

export interface PurchaseOrder {
  id: string;
  workspace_id: string;
  supplier_id: string;
  order_number: string;
  status: PurchaseOrderStatus;
  total_amount: number;
  currency: string;
  notes?: string;
  created_by?: string;
  created_at: Date;
  approved_by?: string;
  approved_at?: Date;
  updated_at: Date;
  // Campos mapeados para UI legado si es necesario
  proveedorId?: string;
  numeroOrden?: string;
  estado?: PurchaseOrderStatus;
  fechaCreacion?: Date;
  montoTotal?: number;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

export interface PurchaseApproval {
  id: string;
  purchase_order_id: string;
  approved_by: string;
  status: string;
  comments?: string;
  created_at: Date;
}

export interface WarehouseReceipt {
  id: string;
  purchase_order_id: string;
  workspace_id: string;
  supplier_id: string;
  receipt_date: Date;
  received_by: string;
  notes?: string;
  created_at: Date;
}

export interface WarehouseReceiptItem {
  id: string;
  receipt_id: string;
  product_id: string;
  quantity_received: number;
}

// --- CUENTAS POR PAGAR (Accounts Payable) ---
export type AccountsPayableStatus = 'pending' | 'scheduled' | 'paid' | 'overdue';

export interface AccountsPayable {
  id: string;
  workspace_id: string;
  supplier_id?: string;
  concept: string;
  amount: number;
  balance_due: number;
  due_date: Date;
  status: AccountsPayableStatus;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  created_at: Date;
  created_by?: string;
  paid_at?: Date;
  supplier?: Supplier;
  supplier_type?: 'supplier' | 'employee' | 'company_expense';
  employee_id?: string;
  reference_id?: string;
}

export interface AccountsPayablePayment {
  id: string;
  account_payable_id: string;
  workspace_id: string;
  payment_date: Date;
  amount: number;
  payment_method: string;
  reference_number?: string;
  evidence_file_url?: string;
  notes?: string;
  created_at: Date;
  created_by?: string;
}

// --- WORKSPACE / NODO ---

export type SpaceType = 'GENERAL' | 'TEAM' | 'CONTEXTUAL' | 'DIRECT_MESSAGE';
export type SpaceRole = 'ADMIN' | 'MEMBER' | 'OBSERVER';
export type TaskPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type TaskStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'BLOQUEADA' | 'COMPLETADA';

export interface WorkspaceSpace {
  id: string;
  workspace: string;
  name?: string;
  type: SpaceType;
  linkedObjectType?: string;
  linkedObjectId?: string;
  description?: string;
  isPrivate: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSpaceMember {
  spaceId: string;
  userId: string;
  role: SpaceRole;
  joinedAt: Date;
  // Relational helper optional
  userExt?: any;
}

export interface WorkspaceMessage {
  id: string;
  workspace: string;
  spaceId: string;
  senderId: string;
  content: string;
  parentId?: string;
  hasAttachments: boolean;
  isPinned: boolean;
  taskId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Optional relational helpers
  sender?: any;
}

export interface WorkspaceTask {
  id: string;
  workspace: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  spaceId?: string;
  linkedObjectType?: string;
  linkedObjectId?: string;
  createdFromMessageId?: string;
  createdBy: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceTaskComment {
  id: string;
  workspace: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceTaskChecklist {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceStandup {
  id: string;
  workspace: string;
  spaceId: string;
  userId: string;
  date: string; // ISO Date String YYYY-MM-DD
  completedYesterday?: string;
  workingToday?: string;
  blockers?: string;
  hasBlockerFlag: boolean;
  createdAt: Date;
}

export interface WorkspaceNote {
  id: string;
  workspace: string;
  spaceId: string;
  title: string;
  contentJson?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- CUENTAS POR COBRAR (Accounts Receivable) ---
export type ChargeNoteStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export interface ChargeNoteItem {
  id: string;
  charge_note_id: string;
  item_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ChargeNotePayment {
  id: string;
  charge_note_id: string;
  client_id: string;
  payment_method: string;
  amount: number;
  payment_date: string;
  reference: string;
  notes: string;
  created_at: string;
}

export interface ProspectData {
  id: string;
  nombre: string;
  correo: string;
  empresa: string;
}

export interface ChargeNote {
  id: string;
  workspace_id: string;
  client_id: string;
  prospect_id: string;
  note_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: ChargeNoteStatus;
  created_at: string;
  updated_at: string;
  prospect?: ProspectData;
  items?: ChargeNoteItem[];
  payments?: ChargeNotePayment[];
}

export interface BankMovement {
  id: string;
  workspace_id: string;
  account_id?: string; // Relation to finance_accounts
  movement_date: string;
  movement_type?: TreasuryMovementType;
  description: string;
  reference?: string;
  amount: number;
  created_by?: string;
  matched_payment_id?: string;
  imported_at?: string;
  suggested_match?: ChargeNotePayment; // For UI
}
