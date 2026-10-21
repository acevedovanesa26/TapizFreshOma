import {
  Administrador,
  Cliente,
  Cotizacion,
  Cita,
  Seguimiento,
  ConfiguracionApp,
  NotificacionSistema,
  TareaHoy,
} from '../types';
import {
  supabase,
  isSupabaseConfigured,
  initSupabaseFromServer,
  subscribeSupabaseConfig,
} from './supabase';

const STORAGE_KEYS = {
  ADMINS: 'tapiz_fresh_admins_v1',
  CLIENTS: 'tapiz_fresh_clients_v1',
  QUOTES: 'tapiz_fresh_quotes_v1',
  APPOINTMENTS: 'tapiz_fresh_appointments_v1',
  FOLLOWUPS: 'tapiz_fresh_followups_v1',
  CONFIG: 'tapiz_fresh_config_v1',
  NOTIFICATIONS: 'tapiz_fresh_notifications_v1',
  TASKS: 'tapiz_fresh_tasks_v1',
};

// Generates valid RFC4122 v4 UUIDs for PostgreSQL compatibility
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Initial Default Administrator
const INITIAL_ADMINS: Administrador[] = [
  {
    id: '11111111-2222-4333-8444-555555555555',
    correo: 'tapizoma2026@gmail.com',
    nombre: 'Omaira Motato',
    rol: 'propietaria',
    activo: true,
    creado_en: '2026-01-15T10:00:00.000Z',
    ha_creado_password: false, // will complete on first OTP flow
  },
];

// Initial Realistic Configuration
const INITIAL_CONFIG: ConfiguracionApp = {
  id: 'cfg-default',
  nombreNegocio: 'Tapiz Fresh',
  nombrePropietaria: 'Omaira Motato',
  telefonoPrincipal: '+57 321 991 8147',
  whatsappNumero: '573219918147',
  correoNotificaciones: 'tapizoma2026@gmail.com',
  ciudadesCobertura: ['Bogotá'],
  horarios: {
    dias: 'Lunes a Sábado',
    horaInicio: '08:00',
    horaFin: '18:00',
    duracionEstimadaMinutos: 120,
  },
  fotoHeroPrincipal: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  fotosMuebles: {
    'sofa-l': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
    'sofa-3': 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80',
    'sofa-2': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    'colchon-king': 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&w=400&q=80',
    'colchon-doble': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
    'sillas-comedor': 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=400&q=80',
  },
  servicios: [
    {
      id: 'srv-1',
      nombre: 'Lavado de Sofás (2 y 3 Puestos, En L o Seccional)',
      descripcion: 'Lavado profundo a domicilio con máquina de inyección y extracción. Retiro de suciedad acumulada y manchas.',
      precioBase: 0,
      tiempoEstimado: 'A convenir',
      popular: true,
    },
    {
      id: 'srv-2',
      nombre: 'Lavado y Desinfección de Colchones',
      descripcion: 'Limpieza profunda de colchones sencillos, dobles, queen y king size a domicilio en Bogotá.',
      precioBase: 0,
      tiempoEstimado: 'A convenir',
      popular: true,
    },
    {
      id: 'srv-3',
      nombre: 'Lavado de Sillas de Comedor y Poltronas',
      descripcion: 'Cuidado y limpieza de tapicería en tela o microfibra para sillas de comedor y butacas.',
      precioBase: 0,
      tiempoEstimado: 'A convenir',
      popular: true,
    },
    {
      id: 'srv-4',
      nombre: 'Cojines y Tapicería Complementaria',
      descripcion: 'Lavado de cojines decorativos y piezas especiales de sala.',
      precioBase: 0,
      tiempoEstimado: 'A convenir',
    },
  ],
  plantillas: {
    whatsapp_primer_contacto:
      '¡Hola {nombre}! 👋 Te saluda Omaira de Tapiz Fresh en Bogotá. Recibí la foto de tu mueble en {barrio}. Con gusto te doy la cotización exacta.',
    whatsapp_cotizacion:
      '¡Hola {nombre}! 👋 Revisé la foto de tu mueble en {barrio}. El valor del lavado para tu {servicio} es de ${valor} a domicilio en Bogotá. ¿Te gustaría agendar la visita?',
    whatsapp_confirmacion_cita:
      '¡Hola {nombre}! ✨ Tu visita con Tapiz Fresh en Bogotá está confirmada para el {fecha} a las {hora} en {direccion}, {barrio}. ¡Nos vemos!',
    whatsapp_recordatorio_24h:
      '¡Hola {nombre}! Te recordamos tu cita de lavado de muebles con Tapiz Fresh mañana a las {hora} en {direccion}, {barrio}. ¡Feliz día!',
    whatsapp_agradecimiento:
      '¡Hola {nombre}! Gracias por confiar en Tapiz Fresh para el lavado de tus muebles en Bogotá. ¿Cómo quedaron tus muebles?',
    correo_otp_brevo:
      'Tu código de acceso a Tapiz Fresh es: {codigo}. Vence en 10 minutos.\n\nSi no solicitaste este código, por favor ignora este mensaje.',
    correo_recordatorio:
      'Recordatorio de visita Tapiz Fresh en Bogotá: Mañana {fecha} a las {hora} estaremos en tu domicilio.',
  },
  carrusel: [
    {
      id: 'c-1',
      titulo: 'Restauración Sofá Chenille Gris',
      descripcion: 'Eliminación total de manchas de café y acumulación de polvo por 3 años de uso continuo.',
      fotoAntes: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
      fotoDespues: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
      categoria: 'Sofás',
    },
    {
      id: 'c-2',
      titulo: 'Desinfección Profunda Colchón King',
      descripcion: 'Tratamiento a fondo con neutralización de suciedad y olores en Bogotá.',
      fotoAntes: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80',
      fotoDespues: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
      categoria: 'Colchones',
    },
    {
      id: 'c-3',
      titulo: 'Sillas de Comedor en Terciopelo',
      descripcion: 'Lavado especializado con inyección suave para no dañar las fibras delicadas.',
      fotoAntes: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=600&q=80',
      fotoDespues: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&w=600&q=80',
      categoria: 'Comedores',
    },
  ],
};

// Initial Realistic CRM Seed Clients (Strictly Bogotá)
const INITIAL_CLIENTS: Cliente[] = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    nombre: 'Carolina Restrepo Vargas',
    telefono: '3157892341',
    correo: 'carolina.restrepo@gmail.com',
    direccion: 'Calle 140 # 15-22, Apto 502',
    barrio: 'Cedritos',
    ciudad: 'Bogotá',
    origen: 'WhatsApp',
    notas: 'Tiene un gato persa blanco. Pidió especial cuidado con pelos.',
    etiquetas: ['Mascotas', 'Cliente Frecuente', 'Cedritos'],
    estado: 'agendado',
    creado_en: '2026-10-18T14:32:00.000Z',
    actualizado_en: '2026-10-18T14:32:00.000Z',
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    nombre: 'Andrés Felipe Morales',
    telefono: '3206541892',
    correo: 'andres.morales@outlook.com',
    direccion: 'Carrera 7 # 120-45',
    barrio: 'Usaquén',
    ciudad: 'Bogotá',
    origen: 'Instagram',
    notas: 'Sofá en L manchado con vino tinto en la esquina izquierda.',
    etiquetas: ['Desmanchado', 'Sofá en L'],
    estado: 'cotizado',
    creado_en: '2026-10-19T09:15:00.000Z',
    actualizado_en: '2026-10-19T09:15:00.000Z',
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    nombre: 'Mariana Gómez Lozano',
    telefono: '3109873421',
    correo: 'mariana.gomez@hotmail.com',
    direccion: 'Transversal 54 # 134-20',
    barrio: 'Colina Campestre',
    ciudad: 'Bogotá',
    origen: 'Recomendación',
    notas: 'Quiere lavar colchón king y 4 sillas de comedor.',
    etiquetas: ['Colchón King', 'Comedor'],
    estado: 'nuevo',
    creado_en: '2026-10-20T08:10:00.000Z',
    actualizado_en: '2026-10-20T08:10:00.000Z',
  },
];

const INITIAL_QUOTES: Cotizacion[] = [
  {
    id: 'b1b2c3d4-0001-4000-8000-000000000001',
    cliente_id: 'a1b2c3d4-0003-4000-8000-000000000003',
    cliente_nombre: 'Mariana Gómez Lozano',
    cliente_telefono: '3109873421',
    cliente_barrio: 'Colina Campestre',
    cliente_ciudad: 'Bogotá',
    items: [
      {
        id: 'it-1',
        mueble: 'Colchón King Size',
        cantidad: 1,
        precioUnitario: 190000,
        subtotal: 190000,
        detalles: 'Ambas caras y desinfección profunda',
      },
      {
        id: 'it-2',
        mueble: 'Sillas de Comedor Tapizadas',
        cantidad: 4,
        precioUnitario: 25000,
        subtotal: 100000,
        detalles: 'Tela tipo lino claro',
      },
    ],
    valor_cotizado: 290000,
    estado: 'pendiente',
    notas_internas: 'Cliente nueva interesada en servicio para este fin de semana.',
    fotos: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=600&q=80',
    ],
    creado_en: '2026-10-20T08:10:00.000Z',
    es_nuevo: true,
  },
];

const today = new Date();
const todayYMD = today.toISOString().substring(0, 10);

const INITIAL_APPOINTMENTS: Cita[] = [
  {
    id: 'c1b2c3d4-0001-4000-8000-000000000001',
    cliente_id: 'a1b2c3d4-0001-4000-8000-000000000001',
    titulo: 'Lavado Sofá 3 Puestos + Cojines',
    servicio: 'Lavado Profundo con Extracción de Olores',
    direccion: 'Calle 140 # 15-22, Apto 502',
    barrio: 'Cedritos',
    ciudad: 'Bogotá',
    fecha_inicio: `${todayYMD}T10:00:00`,
    fecha_fin: `${todayYMD}T12:00:00`,
    estado: 'confirmada',
    valor: 160000,
    notas: 'Llevar máquina de extracción y producto para pelos de mascota.',
    recordatorio_enviado: true,
    creado_en: '2026-10-18T16:00:00.000Z',
  },
];

const INITIAL_FOLLOWUPS: Seguimiento[] = [
  {
    id: 'd1b2c3d4-0001-4000-8000-000000000001',
    cliente_id: 'a1b2c3d4-0001-4000-8000-000000000001',
    tipo: 'WhatsApp',
    nota: 'Se envió confirmación de visita con recordatorio de despejar área.',
    fecha: '2026-10-19T15:00:00.000Z',
    creado_por: 'Omaira Motato',
  },
];

const INITIAL_TASKS: TareaHoy[] = [
  {
    id: 't-1',
    titulo: 'Visita programada: Carolina Restrepo (Cedritos)',
    detalle: 'Lavado sofá 3 puestos - 10:00 AM',
    tipo: 'cita',
    completada: false,
    hora: '10:00 AM',
    cliente_id: 'a1b2c3d4-0001-4000-8000-000000000001',
    cliente_nombre: 'Carolina Restrepo',
  },
  {
    id: 't-2',
    titulo: 'Responder solicitud WhatsApp de Mariana Gómez',
    detalle: 'Cotización Colchón King y 4 sillas en Colina Campestre',
    tipo: 'cotizacion',
    completada: false,
    hora: 'Antes de mediodía',
    cliente_id: 'a1b2c3d4-0003-4000-8000-000000000003',
    cliente_nombre: 'Mariana Gómez',
  },
];

const INITIAL_NOTIFICATIONS: NotificacionSistema[] = [
  {
    id: 'notif-1',
    titulo: '¡Nueva cotización recibida!',
    mensaje: 'Mariana Gómez solicitó cotización para Colchón King y Sillas en Colina Campestre.',
    tipo: 'solicitud',
    leida: false,
    fecha: '2026-10-20T08:10:00.000Z',
    cliente_id: 'a1b2c3d4-0003-4000-8000-000000000003',
  },
];

class StorageService {
  private listeners: (() => void)[] = [];
  private realtimeChannel: any = null;

  constructor() {
    this.ensureInitialized();
    this.syncWithServerBackup();
    initSupabaseFromServer().then((configured) => {
      if (configured) {
        this.syncFromSupabase();
        this.initRealtime();
      }
    });
    subscribeSupabaseConfig(() => {
      this.syncFromSupabase();
      this.initRealtime();
    });
  }

  public async syncWithServerBackup(): Promise<void> {
    try {
      const res = await fetch('/api/sync');
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      let changed = false;

      if (Array.isArray(data.clientes) && data.clientes.length > 0) {
        const local = this.getClientes();
        const map = new Map<string, Cliente>();
        local.forEach((c) => map.set(c.id, c));
        data.clientes.forEach((sc: any) => {
          if (sc && sc.id && !map.has(sc.id)) {
            map.set(sc.id, sc);
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(Array.from(map.values())));
        }
      }

      if (Array.isArray(data.cotizaciones) && data.cotizaciones.length > 0) {
        const localQ = this.getCotizaciones();
        const qMap = new Map<string, Cotizacion>();
        localQ.forEach((q) => qMap.set(q.id, q));
        data.cotizaciones.forEach((sq: any) => {
          if (sq && sq.id && !qMap.has(sq.id)) {
            qMap.set(sq.id, sq);
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(Array.from(qMap.values())));
        }
      }

      if (Array.isArray(data.citas) && data.citas.length > 0) {
        const localC = this.getCitas();
        const cMap = new Map<string, Cita>();
        localC.forEach((c) => cMap.set(c.id, c));
        data.citas.forEach((sc: any) => {
          if (sc && sc.id && !cMap.has(sc.id)) {
            cMap.set(sc.id, sc);
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(Array.from(cMap.values())));
        }
      }

      if (changed) {
        this.notify();
      }
    } catch (e) {
      console.warn('Server sync notice:', e);
    }
  }

  public pushToServerBackup(): void {
    try {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          clientes: this.getClientes(),
          cotizaciones: this.getCotizaciones(),
          citas: this.getCitas(),
        }),
      }).catch(() => {});
    } catch {}
  }

  private ensureInitialized(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.ADMINS)) {
      localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(INITIAL_ADMINS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUOTES)) {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(INITIAL_QUOTES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FOLLOWUPS)) {
      localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(INITIAL_FOLLOWUPS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
  }

  private initRealtime(): void {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      if (this.realtimeChannel) return;
      this.realtimeChannel = supabase
        .channel('tapiz_live_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => {
          this.syncFromSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cotizaciones' }, () => {
          this.syncFromSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'citas' }, () => {
          this.syncFromSupabase();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime init notice:', e);
    }
  }

  public async syncFromSupabase(): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      // 1. Sync Clientes
      const { data: dbClientes, error: errC } = await supabase.from('clientes').select('*');
      if (dbClientes && dbClientes.length > 0 && !errC) {
        const local = this.getClientes();
        const map = new Map<string, Cliente>();
        local.forEach((c) => map.set(c.id, c));
        dbClientes.forEach((dbC: any) => {
          map.set(dbC.id, {
            id: dbC.id,
            nombre: dbC.nombre,
            telefono: dbC.telefono,
            correo: dbC.correo || '',
            direccion: dbC.direccion,
            barrio: dbC.barrio,
            ciudad: dbC.ciudad || 'Bogotá',
            origen: dbC.origen || 'WhatsApp',
            notas: dbC.notas || '',
            etiquetas: dbC.etiquetas || [],
            estado: dbC.estado || 'nuevo',
            creado_en: dbC.creado_en || new Date().toISOString(),
            actualizado_en: dbC.actualizado_en || new Date().toISOString(),
          });
        });
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(Array.from(map.values())));
      }

      // 2. Sync Cotizaciones
      const { data: dbQuotes, error: errQ } = await supabase.from('cotizaciones').select('*');
      if (dbQuotes && dbQuotes.length > 0 && !errQ) {
        const localQuotes = this.getCotizaciones();
        const qMap = new Map<string, Cotizacion>();
        localQuotes.forEach((q) => qMap.set(q.id, q));
        dbQuotes.forEach((dq: any) => {
          const client = this.getClienteById(dq.cliente_id);
          qMap.set(dq.id, {
            id: dq.id,
            cliente_id: dq.cliente_id,
            cliente_nombre: client ? client.nombre : 'Cliente Web',
            cliente_telefono: client ? client.telefono : '',
            cliente_barrio: client ? client.barrio : 'Bogotá',
            cliente_ciudad: client ? client.ciudad : 'Bogotá',
            items: dq.items || [],
            valor_cotizado: Number(dq.valor_cotizado || 0),
            estado: dq.estado || 'pendiente',
            notas_internas: dq.notas_internas || '',
            fotos: dq.fotos || [],
            creado_en: dq.creado_en || new Date().toISOString(),
            es_nuevo: false,
          });
        });
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(Array.from(qMap.values())));
      }

      // 3. Sync Citas
      const { data: dbCitas, error: errCi } = await supabase.from('citas').select('*');
      if (dbCitas && dbCitas.length > 0 && !errCi) {
        const localCitas = this.getCitas();
        const ciMap = new Map<string, Cita>();
        localCitas.forEach((c) => ciMap.set(c.id, c));
        dbCitas.forEach((dc: any) => {
          ciMap.set(dc.id, {
            id: dc.id,
            cliente_id: dc.cliente_id,
            titulo: dc.titulo,
            servicio: dc.servicio,
            direccion: dc.direccion,
            barrio: dc.barrio,
            ciudad: dc.ciudad || 'Bogotá',
            fecha_inicio: dc.fecha_inicio,
            fecha_fin: dc.fecha_fin,
            estado: dc.estado || 'pendiente',
            valor: Number(dc.valor || 0),
            notas: dc.notas || '',
            recordatorio_enviado: Boolean(dc.recordatorio_enviado),
            creado_en: dc.creado_en || new Date().toISOString(),
          });
        });
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(Array.from(ciMap.values())));
      }

      this.notify();
    } catch (e) {
      console.warn('Supabase sync notice:', e);
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('Error in storage listener', e);
      }
    });
  }

  // --- ADMINISTRADORES ---
  public getAdministradores(): Administrador[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMINS);
    return raw ? JSON.parse(raw) : INITIAL_ADMINS;
  }

  public getAdminByEmail(correo: string): Administrador | null {
    const normalized = correo.trim().toLowerCase();
    const admins = this.getAdministradores();
    return admins.find((a) => a.correo.toLowerCase() === normalized && a.activo) || null;
  }

  public saveAdministrador(admin: Administrador): void {
    const list = this.getAdministradores();
    const idx = list.findIndex(
      (a) => a.id === admin.id || a.correo.toLowerCase() === admin.correo.toLowerCase()
    );
    if (idx >= 0) {
      list[idx] = admin;
    } else {
      list.push(admin);
    }
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));
    this.notify();
  }

  public inviteAdmin(
    correo: string,
    nombre: string,
    rol: 'admin' | 'propietaria' = 'admin'
  ): Administrador {
    const admins = this.getAdministradores();
    const normalized = correo.trim().toLowerCase();
    const existing = admins.find((a) => a.correo.toLowerCase() === normalized);
    if (existing) {
      existing.activo = true;
      existing.nombre = nombre || existing.nombre;
      existing.rol = rol;
      this.saveAdministrador(existing);
      return existing;
    }
    const newAdmin: Administrador = {
      id: generateUUID(),
      correo: normalized,
      nombre: nombre || 'Administrador Tapiz Fresh',
      rol,
      activo: true,
      creado_en: new Date().toISOString(),
      ha_creado_password: false,
    };
    admins.push(newAdmin);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
    this.notify();
    return newAdmin;
  }

  public deleteAdmin(id: string): void {
    let list = this.getAdministradores();
    // Cannot delete main owner
    list = list.filter((a) => a.id !== id || a.correo === 'tapizoma2026@gmail.com');
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));
    this.notify();
  }

  // --- CLIENTES (CRM) ---
  public getClientes(): Cliente[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return raw ? JSON.parse(raw) : [];
  }

  public getClienteById(id: string): Cliente | null {
    const list = this.getClientes();
    return list.find((c) => c.id === id) || null;
  }

  public async syncClienteToSupabase(cliente: Cliente): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      await supabase.from('clientes').upsert({
        id: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        correo: cliente.correo,
        direccion: cliente.direccion,
        barrio: cliente.barrio,
        ciudad: cliente.ciudad || 'Bogotá',
        origen: cliente.origen || 'WhatsApp',
        notas: cliente.notas || '',
        etiquetas: cliente.etiquetas || [],
        estado: cliente.estado || 'nuevo',
        actualizado_en: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Error syncClienteToSupabase:', err);
    }
  }

  public saveCliente(cliente: Cliente): void {
    const list = this.getClientes();
    const idx = list.findIndex((c) => c.id === cliente.id);
    cliente.actualizado_en = new Date().toISOString();
    if (idx >= 0) {
      list[idx] = cliente;
    } else {
      list.unshift(cliente);
    }
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(list));
    this.notify();

    // Sync to Supabase cloud immediately
    this.syncClienteToSupabase(cliente);
    this.pushToServerBackup();
  }

  public deleteCliente(id: string): void {
    let list = this.getClientes();
    list = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(list));
    this.notify();
    this.pushToServerBackup();

    if (isSupabaseConfigured() && supabase) {
      supabase.from('clientes').delete().eq('id', id).then(() => {});
    }
  }

  /**
   * Deduplicates by phone or email. If found, updates client info; otherwise creates new.
   * Immediately persists to local storage and syncs to Supabase.
   */
  public saveOrUpdateClienteFromForm(data: {
    nombre: string;
    telefono: string;
    correo: string;
    direccion: string;
    barrio: string;
    ciudad: string;
    origen?: Cliente['origen'];
    notas?: string;
  }): Cliente {
    const list = this.getClientes();
    const cleanPhone = data.telefono.replace(/\D/g, '');
    const cleanEmail = data.correo.trim().toLowerCase();

    const existingIndex = list.findIndex((c) => {
      const matchPhone =
        cleanPhone && c.telefono.replace(/\D/g, '').endsWith(cleanPhone.slice(-7));
      const matchEmail = cleanEmail && c.correo.trim().toLowerCase() === cleanEmail;
      return matchPhone || matchEmail;
    });

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      const updated: Cliente = {
        ...existing,
        nombre: data.nombre.trim() || existing.nombre,
        telefono: data.telefono.trim() || existing.telefono,
        correo: data.correo.trim() || existing.correo,
        direccion: data.direccion.trim() || existing.direccion,
        barrio: data.barrio.trim() || existing.barrio,
        ciudad: data.ciudad.trim() || existing.ciudad,
        origen: data.origen || existing.origen,
        notas: data.notas
          ? `${existing.notas ? existing.notas + '\n' : ''}${data.notas}`
          : existing.notas,
        actualizado_en: now,
      };
      list[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(list));
      this.notify();

      // Sync to cloud
      this.syncClienteToSupabase(updated);
      return updated;
    } else {
      const newClient: Cliente = {
        id: generateUUID(),
        nombre: data.nombre.trim(),
        telefono: data.telefono.trim(),
        correo: data.correo.trim(),
        direccion: data.direccion.trim(),
        barrio: data.barrio.trim(),
        ciudad: data.ciudad.trim() || 'Bogotá',
        origen: data.origen || 'WhatsApp',
        notas: data.notas || '',
        etiquetas: ['Nuevo contacto'],
        estado: 'nuevo',
        creado_en: now,
        actualizado_en: now,
      };
      list.unshift(newClient);
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(list));
      this.notify();

      // Sync to cloud
      this.syncClienteToSupabase(newClient);
      return newClient;
    }
  }

  // --- COTIZACIONES ---
  public getCotizaciones(): Cotizacion[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTES);
    return raw ? JSON.parse(raw) : [];
  }

  public async syncCotizacionToSupabase(cot: Cotizacion): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      await supabase.from('cotizaciones').upsert({
        id: cot.id,
        cliente_id: cot.cliente_id,
        items: cot.items,
        valor_cotizado: cot.valor_cotizado,
        estado: cot.estado,
        notas_internas: cot.notas_internas,
        fotos: cot.fotos || [],
        creado_en: cot.creado_en,
      });
    } catch (err) {
      console.warn('Error syncCotizacionToSupabase:', err);
    }
  }

  public saveCotizacion(cot: Cotizacion): void {
    const list = this.getCotizaciones();
    const idx = list.findIndex((q) => q.id === cot.id);
    if (idx >= 0) {
      list[idx] = cot;
    } else {
      list.unshift(cot);
    }
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(list));
    this.notify();

    // Sync to Supabase
    this.syncCotizacionToSupabase(cot);
    this.pushToServerBackup();
  }

  public createCotizacionFromPublicForm(
    cliente: Cliente,
    items: Cotizacion['items'],
    valorCotizado: number,
    fotos: string[] = [],
    notas?: string
  ): Cotizacion {
    const cot: Cotizacion = {
      id: generateUUID(),
      cliente_id: cliente.id,
      cliente_nombre: cliente.nombre,
      cliente_telefono: cliente.telefono,
      cliente_barrio: cliente.barrio,
      cliente_ciudad: cliente.ciudad,
      items,
      valor_cotizado: valorCotizado,
      estado: 'pendiente',
      notas_internas:
        notas ||
        `Cotización con foto de mueble desde formulario web. Origen: ${cliente.origen}`,
      fotos,
      creado_en: new Date().toISOString(),
      es_nuevo: true,
    };

    this.saveCotizacion(cot);

    // Update client status
    if (cliente.estado === 'nuevo') {
      cliente.estado = 'cotizado';
      this.saveCliente(cliente);
    }

    // Add in-app notification for Omaira
    this.addNotification({
      titulo: '¡Nueva solicitud con foto recibida!',
      mensaje: `${cliente.nombre} (${cliente.barrio}) envió foto para cotizar lavado de muebles.`,
      tipo: 'solicitud',
      cliente_id: cliente.id,
    });

    // Add to daily tasks
    this.addTask({
      titulo: `Cotizar por foto a ${cliente.nombre}`,
      detalle: `${cliente.barrio} - Tel: ${cliente.telefono}`,
      tipo: 'cotizacion',
      cliente_id: cliente.id,
      cliente_nombre: cliente.nombre,
    });

    return cot;
  }

  public markQuoteAsRead(quoteId: string): void {
    const quotes = this.getCotizaciones();
    const q = quotes.find((item) => item.id === quoteId);
    if (q && q.es_nuevo) {
      q.es_nuevo = false;
      this.saveCotizacion(q);
    }
  }

  // --- CITAS (AGENDA) ---
  public getCitas(): Cita[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return raw ? JSON.parse(raw) : [];
  }

  public async syncCitaToSupabase(cita: Cita): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      await supabase.from('citas').upsert({
        id: cita.id,
        cliente_id: cita.cliente_id,
        titulo: cita.titulo,
        servicio: cita.servicio,
        direccion: cita.direccion,
        barrio: cita.barrio,
        ciudad: cita.ciudad || 'Bogotá',
        fecha_inicio: cita.fecha_inicio,
        fecha_fin: cita.fecha_fin,
        estado: cita.estado,
        valor: cita.valor,
        notas: cita.notas,
        recordatorio_enviado: cita.recordatorio_enviado,
        creado_en: cita.creado_en,
      });
    } catch (err) {
      console.warn('Error syncCitaToSupabase:', err);
    }
  }

  public saveCita(cita: Cita): void {
    const list = this.getCitas();
    const idx = list.findIndex((c) => c.id === cita.id);
    if (idx >= 0) {
      list[idx] = cita;
    } else {
      list.push(cita);
    }
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
    this.notify();

    // Sync to Supabase
    this.syncCitaToSupabase(cita);
    this.pushToServerBackup();
  }

  public deleteCita(id: string): void {
    let list = this.getCitas();
    list = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
    this.notify();
    this.pushToServerBackup();

    if (isSupabaseConfigured() && supabase) {
      supabase.from('citas').delete().eq('id', id).then(() => {});
    }
  }

  public checkScheduleConflict(
    fechaInicio: string,
    fechaFin: string,
    excludeCitaId?: string
  ): { hasConflict: boolean; conflictingCita?: Cita } {
    const citas = this.getCitas().filter(
      (c) => c.id !== excludeCitaId && c.estado !== 'cancelada'
    );

    const start = new Date(fechaInicio).getTime();
    const end = new Date(fechaFin).getTime();

    for (const c of citas) {
      const cStart = new Date(c.fecha_inicio).getTime();
      const cEnd = new Date(c.fecha_fin).getTime();

      if (start < cEnd && end > cStart) {
        return { hasConflict: true, conflictingCita: c };
      }
    }

    return { hasConflict: false };
  }

  // --- SEGUIMIENTOS ---
  public getSeguimientos(): Seguimiento[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWUPS);
    return raw ? JSON.parse(raw) : [];
  }

  public getSeguimientosByCliente(clienteId: string): Seguimiento[] {
    return this.getSeguimientos().filter((s) => s.cliente_id === clienteId);
  }

  public addSeguimiento(seg: Omit<Seguimiento, 'id' | 'fecha'>): Seguimiento {
    const list = this.getSeguimientos();
    const newSeg: Seguimiento = {
      ...seg,
      id: generateUUID(),
      fecha: new Date().toISOString(),
    };
    list.unshift(newSeg);
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(list));
    this.notify();

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('seguimientos')
        .insert({
          id: newSeg.id,
          cliente_id: newSeg.cliente_id,
          tipo: newSeg.tipo,
          nota: newSeg.nota,
          fecha: newSeg.fecha,
          creado_por: newSeg.creado_por,
        })
        .then(() => {});
    }

    return newSeg;
  }

  // --- TAREAS HOY ---
  public getTasks(): TareaHoy[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    return raw ? JSON.parse(raw) : [];
  }

  public toggleTask(id: string): void {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completada = !task.completada;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      this.notify();
    }
  }

  public addTask(task: Omit<TareaHoy, 'id' | 'completada'>): void {
    const tasks = this.getTasks();
    tasks.unshift({
      ...task,
      id: `task-${Date.now()}`,
      completada: false,
    });
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.notify();
  }

  // --- NOTIFICACIONES ---
  public getNotifications(): NotificacionSistema[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  }

  public addNotification(n: Omit<NotificacionSistema, 'id' | 'fecha' | 'leida'>): void {
    const list = this.getNotifications();
    list.unshift({
      ...n,
      id: `notif-${Date.now()}`,
      fecha: new Date().toISOString(),
      leida: false,
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.notify();
  }

  public markNotificationsAsRead(): void {
    const list = this.getNotifications();
    list.forEach((n) => (n.leida = true));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.notify();
  }

  // --- CONFIGURACIÓN ---
  public getConfig(): ConfiguracionApp {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return raw ? JSON.parse(raw) : INITIAL_CONFIG;
  }

  public saveConfig(cfg: ConfiguracionApp): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cfg));
    this.notify();
  }
}

export const storage = new StorageService();
