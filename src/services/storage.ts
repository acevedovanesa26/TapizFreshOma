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

// Initial Default Administrator
const INITIAL_ADMINS: Administrador[] = [
  {
    id: 'a001-omaira-owner',
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
      descripcion: 'Tratamiento anti-ácaros a 90°C con neutralización de olores de mascota.',
      fotoAntes: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80',
      fotoDespues: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
      categoria: 'Colchones',
    },
    {
      id: 'c-3',
      titulo: 'Sillas de Comedor en Terciopelo',
      descripcion: 'Desengrasado textil y aplicación de película impermeabilizante nano-repelente.',
      fotoAntes: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=600&q=80',
      fotoDespues: 'https://images.unsplash.com/photo-1519947486513-ce62b99f2162?auto=format&fit=crop&w=600&q=80',
      categoria: 'Sillas Comedor',
    },
  ],
  fotoEquipo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  smtpBrevoConfig: {
    host: 'smtp-relay.brevo.com',
    port: 587,
    senderEmail: 'tapizoma2026@gmail.com',
    senderName: 'Tapiz Fresh - Omaira Motato',
    isConfigured: true,
  },
};

// Seed Clients
const INITIAL_CLIENTS: Cliente[] = [
  {
    id: 'cli-001',
    nombre: 'Carolina Restrepo',
    telefono: '3157894120',
    correo: 'carolina.restrepo@example.com',
    direccion: 'Calle 140 # 15-22, Apto 502',
    barrio: 'Cedritos',
    ciudad: 'Bogotá',
    origen: 'Instagram',
    notas: 'Tiene 2 perros de raza pequeña. Priorizar desodorización y producto hipoalergénico.',
    etiquetas: ['Mascotas', 'VIP', 'Recurrente'],
    estado: 'agendado',
    creado_en: '2026-10-18T14:30:00.000Z',
    actualizado_en: '2026-10-19T09:15:00.000Z',
  },
  {
    id: 'cli-002',
    nombre: 'Andrés Felipe Morales',
    telefono: '3206541892',
    correo: 'andres.felipe.m@example.com',
    direccion: 'Carrera 7 # 120-45',
    barrio: 'Usaquén',
    ciudad: 'Bogotá',
    origen: 'WhatsApp',
    notas: 'Sofá en L con mancha de vino tinto reciente.',
    etiquetas: ['Mancha difícil', 'Urgente'],
    estado: 'cotizado',
    creado_en: '2026-10-19T11:20:00.000Z',
    actualizado_en: '2026-10-19T11:20:00.000Z',
  },
  {
    id: 'cli-003',
    nombre: 'Mariana Gómez Lozano',
    telefono: '3109873421',
    correo: 'mariana.gomez@example.com',
    direccion: 'Transversal 38 # 128-10',
    barrio: 'Colina Campestre',
    ciudad: 'Bogotá',
    origen: 'Recomendación',
    notas: 'Recomendada por la Sra. Beatriz. Quiere lavado de colchón King y 4 sillas.',
    etiquetas: ['Referido'],
    estado: 'nuevo',
    creado_en: '2026-10-20T08:10:00.000Z',
    actualizado_en: '2026-10-20T08:10:00.000Z',
  },
  {
    id: 'cli-004',
    nombre: 'Carlos Eduardo Peña',
    telefono: '3182349081',
    correo: 'carlos.pena@example.com',
    direccion: 'Calle 80 # 68D-12',
    barrio: 'Pontevedra',
    ciudad: 'Bogotá',
    origen: 'Facebook',
    notas: 'Servicio realizado con éxito. Pidió recordatorio para dentro de 6 meses.',
    etiquetas: ['Satisfecho', 'Recordatorio 6M'],
    estado: 'realizado',
    creado_en: '2026-10-12T10:00:00.000Z',
    actualizado_en: '2026-10-15T16:00:00.000Z',
  },
];

// Seed Quotes
const INITIAL_QUOTES: Cotizacion[] = [
  {
    id: 'cot-001',
    cliente_id: 'cli-003',
    cliente_nombre: 'Mariana Gómez Lozano',
    cliente_telefono: '3109873421',
    cliente_barrio: 'Colina Campestre',
    cliente_ciudad: 'Bogotá',
    items: [
      {
        id: 'it-1',
        mueble: 'Colchón King Size Sanitizado',
        cantidad: 1,
        precioUnitario: 190000,
        subtotal: 190000,
        detalles: 'Ambas caras y desinfección a vapor',
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
  {
    id: 'cot-002',
    cliente_id: 'cli-002',
    cliente_nombre: 'Andrés Felipe Morales',
    cliente_telefono: '3206541892',
    cliente_barrio: 'Usaquén',
    cliente_ciudad: 'Bogotá',
    items: [
      {
        id: 'it-3',
        mueble: 'Sofá en L / Seccional (4 módulos)',
        cantidad: 1,
        precioUnitario: 240000,
        subtotal: 240000,
        detalles: 'Tratamiento especial mancha de vino',
      },
    ],
    valor_cotizado: 240000,
    estado: 'pendiente',
    notas_internas: 'Se le ofreció aplicar Scotchgard por $70.000 adicionales.',
    fotos: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    ],
    creado_en: '2026-10-19T11:20:00.000Z',
    es_nuevo: false,
  },
];

// Helper to get local date ISO strings relative to today
const today = new Date();
const todayYMD = today.toISOString().substring(0, 10);

const INITIAL_APPOINTMENTS: Cita[] = [
  {
    id: 'cit-001',
    cliente_id: 'cli-001',
    titulo: 'Lavado Sofá 3 Puestos + Cojines',
    servicio: 'Lavado Profundo con Extracción de Olores',
    direccion: 'Calle 140 # 15-22, Apto 502',
    barrio: 'Cedritos',
    ciudad: 'Bogotá',
    fecha_inicio: `${todayYMD}T10:00:00`,
    fecha_fin: `${todayYMD}T12:00:00`,
    estado: 'confirmada',
    valor: 160000,
    notas: 'Llevar máquina Kärcher de extracción y químico bactericida para pelos de mascota.',
    recordatorio_enviado: true,
    creado_en: '2026-10-18T16:00:00.000Z',
  },
  {
    id: 'cit-002',
    cliente_id: 'cli-002',
    titulo: 'Evaluación y Desmanchado Sofá en L',
    servicio: 'Desmanchado Textil a Domicilio',
    direccion: 'Carrera 7 # 120-45',
    barrio: 'Usaquén',
    ciudad: 'Bogotá',
    fecha_inicio: `${todayYMD}T14:30:00`,
    fecha_fin: `${todayYMD}T16:30:00`,
    estado: 'pendiente',
    valor: 240000,
    notas: 'Pedir que no toquen la mancha con cloro.',
    recordatorio_enviado: false,
    creado_en: '2026-10-19T12:00:00.000Z',
  },
];

const INITIAL_FOLLOWUPS: Seguimiento[] = [
  {
    id: 'seg-001',
    cliente_id: 'cli-001',
    tipo: 'WhatsApp',
    nota: 'Se envió confirmación de visita con recordatorio de despejar área.',
    fecha: '2026-10-19T15:00:00.000Z',
    creado_por: 'Omaira Motato',
  },
  {
    id: 'seg-002',
    cliente_id: 'cli-003',
    tipo: 'llamada',
    nota: 'Llamó preguntando por tiempos de secado (aproximadamente 3 a 4 horas).',
    fecha: '2026-10-20T08:30:00.000Z',
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
    cliente_id: 'cli-001',
    cliente_nombre: 'Carolina Restrepo',
  },
  {
    id: 't-2',
    titulo: 'Responder solicitud WhatsApp de Mariana Gómez',
    detalle: 'Cotización Colchón King y 4 sillas en Colina Campestre',
    tipo: 'cotizacion',
    completada: false,
    hora: 'Antes de mediodía',
    cliente_id: 'cli-003',
    cliente_nombre: 'Mariana Gómez',
  },
  {
    id: 't-3',
    titulo: 'Visita programada: Andrés Morales (Usaquén)',
    detalle: 'Desmanchado sofá en L - 02:30 PM',
    tipo: 'cita',
    completada: false,
    hora: '02:30 PM',
    cliente_id: 'cli-002',
    cliente_nombre: 'Andrés Felipe Morales',
  },
  {
    id: 't-4',
    titulo: 'Enviar recordatorio WhatsApp para citas de mañana',
    detalle: 'Revisar agenda del día siguiente y enviar plantilla de 24h',
    tipo: 'seguimiento',
    completada: false,
    hora: '05:00 PM',
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
    cliente_id: 'cli-003',
  },
];

class StorageService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.ensureInitialized();
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
    const idx = list.findIndex((a) => a.id === admin.id || a.correo.toLowerCase() === admin.correo.toLowerCase());
    if (idx >= 0) {
      list[idx] = admin;
    } else {
      list.push(admin);
    }
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));
    this.notify();
  }

  public inviteAdmin(correo: string, nombre: string, rol: 'admin' | 'propietaria' = 'admin'): Administrador {
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
      id: `adm-${Date.now()}`,
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
  }

  public deleteCliente(id: string): void {
    let list = this.getClientes();
    list = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(list));
    this.notify();
  }

  /**
   * Deduplicates by phone or email. If found, updates client info; otherwise creates new.
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
      const matchPhone = cleanPhone && c.telefono.replace(/\D/g, '').endsWith(cleanPhone.slice(-7));
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
        notas: data.notas ? `${existing.notas ? existing.notas + '\n' : ''}${data.notas}` : existing.notas,
        actualizado_en: now,
      };
      list[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(list));
      this.notify();
      return updated;
    } else {
      const newClient: Cliente = {
        id: `cli-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
      return newClient;
    }
  }

  // --- COTIZACIONES ---
  public getCotizaciones(): Cotizacion[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTES);
    return raw ? JSON.parse(raw) : [];
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
  }

  public createCotizacionFromPublicForm(
    cliente: Cliente,
    items: Cotizacion['items'],
    valorCotizado: number,
    fotos: string[] = [],
    notas?: string
  ): Cotizacion {
    const cot: Cotizacion = {
      id: `cot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      cliente_id: cliente.id,
      cliente_nombre: cliente.nombre,
      cliente_telefono: cliente.telefono,
      cliente_barrio: cliente.barrio,
      cliente_ciudad: cliente.ciudad,
      items,
      valor_cotizado: valorCotizado,
      estado: 'pendiente',
      notas_internas: notas || `Cotización generada automáticamente desde formulario público. Origen: ${cliente.origen}`,
      fotos,
      creado_en: new Date().toISOString(),
      es_nuevo: true,
    };

    this.saveCotizacion(cot);

    // Update client status if needed
    if (cliente.estado === 'nuevo') {
      cliente.estado = 'cotizado';
      this.saveCliente(cliente);
    }

    // Add in-app notification for Omaira
    this.addNotification({
      titulo: '¡Nueva cotización recibida!',
      mensaje: `${cliente.nombre} (${cliente.barrio}) solicitó cotización por $${valorCotizado.toLocaleString('es-CO')}.`,
      tipo: 'solicitud',
      cliente_id: cliente.id,
    });

    // Add to daily tasks
    this.addTask({
      titulo: `Responder cotización de ${cliente.nombre}`,
      detalle: `${cliente.barrio} - Valor: $${valorCotizado.toLocaleString('es-CO')}`,
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
  }

  public deleteCita(id: string): void {
    let list = this.getCitas();
    list = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
    this.notify();
  }

  /**
   * Checks for schedule conflicts in appointments
   */
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

      // Check overlap
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
      id: `seg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fecha: new Date().toISOString(),
    };
    list.unshift(newSeg);
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(list));
    this.notify();
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
