export type RolAdmin = 'propietaria' | 'admin';

export interface Administrador {
  id: string;
  correo: string;
  nombre: string;
  rol: RolAdmin;
  activo: boolean;
  creado_en: string;
  password_hash?: string;
  ultimo_acceso?: string;
  ha_creado_password?: boolean;
}

export type OrigenCliente = 'WhatsApp' | 'Instagram' | 'Facebook' | 'Recomendación' | 'Google' | 'Otro';

export type EstadoCliente = 'nuevo' | 'cotizado' | 'agendado' | 'realizado' | 'cancelado';

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
  barrio: string;
  ciudad: string;
  origen: OrigenCliente;
  notas: string;
  etiquetas: string[];
  estado: EstadoCliente;
  creado_en: string;
  actualizado_en: string;
}

export interface CotizacionItem {
  id: string;
  mueble: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  detalles?: string;
}

export type EstadoCotizacion = 'pendiente' | 'aprobada' | 'rechazada' | 'agendada' | 'completada';

export interface Cotizacion {
  id: string;
  cliente_id: string;
  cliente_nombre?: string;
  cliente_telefono?: string;
  cliente_barrio?: string;
  cliente_ciudad?: string;
  items: CotizacionItem[];
  valor_cotizado: number;
  estado: EstadoCotizacion;
  notas_internas: string;
  fotos: string[];
  creado_en: string;
  es_nuevo?: boolean;
}

export type EstadoCita = 'pendiente' | 'confirmada' | 'en_camino' | 'realizada' | 'cancelada';

export interface Cita {
  id: string;
  cliente_id: string;
  titulo: string;
  servicio: string;
  direccion: string;
  barrio: string;
  ciudad: string;
  fecha_inicio: string; // ISO 8601
  fecha_fin: string; // ISO 8601
  estado: EstadoCita;
  valor: number;
  notas: string;
  recordatorio_enviado: boolean;
  creado_en: string;
}

export type TipoSeguimiento = 'llamada' | 'WhatsApp' | 'correo' | 'visita';

export interface Seguimiento {
  id: string;
  cliente_id: string;
  tipo: TipoSeguimiento;
  nota: string;
  fecha: string;
  creado_por?: string;
}

export interface HorarioAtencion {
  dias: string;
  horaInicio: string;
  horaFin: string;
  duracionEstimadaMinutos: number;
}

export interface ServicioCatalogo {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  tiempoEstimado: string;
  icono?: string;
  popular?: boolean;
}

export interface ItemCarrusel {
  id: string;
  titulo: string;
  descripcion: string;
  fotoAntes: string;
  fotoDespues: string;
  categoria: string;
}

export interface PlantillasMensaje {
  whatsapp_primer_contacto: string;
  whatsapp_cotizacion: string;
  whatsapp_confirmacion_cita: string;
  whatsapp_recordatorio_24h: string;
  whatsapp_agradecimiento: string;
  correo_otp_brevo: string;
  correo_recordatorio: string;
}

export interface ConfiguracionApp {
  id: string;
  nombreNegocio: string;
  telefonoPrincipal: string;
  whatsappNumero: string;
  correoNotificaciones: string;
  ciudadesCobertura: string[];
  horarios: HorarioAtencion;
  servicios: ServicioCatalogo[];
  plantillas: PlantillasMensaje;
  carrusel: ItemCarrusel[];
  fotoEquipo?: string;
  nombrePropietaria: string;
  smtpBrevoConfig: {
    host: string;
    port: number;
    senderEmail: string;
    senderName: string;
    isConfigured: boolean;
  };
}

export interface NotificacionSistema {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'solicitud' | 'cita' | 'sistema';
  leida: boolean;
  fecha: string;
  cliente_id?: string;
}

export interface TareaHoy {
  id: string;
  titulo: string;
  detalle: string;
  tipo: 'cita' | 'seguimiento' | 'cotizacion';
  completada: boolean;
  hora?: string;
  cliente_id?: string;
  cliente_nombre?: string;
}
