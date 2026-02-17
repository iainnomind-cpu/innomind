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
