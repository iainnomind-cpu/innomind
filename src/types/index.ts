export type ProspectStatus = 'Nuevo' | 'Contactado' | 'En seguimiento' | 'Cotizado' | 'Venta cerrada' | 'Perdido';
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
  fechaContacto: Date;
  empresa?: string;
  cargo?: string;
  notasInternas?: string;
  ultimoSeguimiento?: Date;
  telefonoSecundario?: string;
  origen?: string;
  industria?: string;
  tamanoEmpresa?: string;
  nivelInteres?: 'Bajo' | 'Medio' | 'Alto';
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
  nombre: string;
  descripcion: string;
  items: QuoteTemplateItem[];
  subtotal: number; // Sum of items before global adjustments if any
  totalEstimado: number;
  condicionesPago?: string;
  notasAdicionales?: string;
  terminosCondiciones?: string;
  metodosPagoAceptados?: string[];
  creadoPor: string;
  fechaCreacion: Date;
}

export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  unidad: string;
  estado: 'activo' | 'inactivo';
  fechaActualizacion: Date;
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  estado: 'prospecto' | 'activo' | 'inactivo';
  valor_estimado: number;
  notas: string;
  fecha_creacion: string;
  ultima_actualizacion: string;
}

export interface ClienteFormData {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  estado: 'prospecto' | 'activo' | 'inactivo';
  valor_estimado: number;
  notas: string;
}

export interface MetricasData {
  totalClientes: number;
  clientesActivos: number;
  valorTotal: number;
  nuevosMes: number;
}
