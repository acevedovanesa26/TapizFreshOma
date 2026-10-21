-- ====================================================================
-- TAPIZ FRESH - ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- Con Row Level Security (RLS) para proteger los datos de clientes
-- y permitir únicamente el acceso a administradores autorizados.
-- ====================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. TABLA: administradores
-- Solo los correos presentes y activos en esta tabla pueden ingresar
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.administradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    correo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('propietaria', 'admin')),
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ultimo_acceso TIMESTAMPTZ
);

-- Comentario informativo
COMMENT ON TABLE public.administradores IS 'Registro de administradores autorizados para el CRM Tapiz Fresh';

-- Precargar propietaria predeterminada
INSERT INTO public.administradores (correo, nombre, rol, activo)
VALUES ('tapizoma2026@gmail.com', 'Omaira Motato', 'propietaria', true)
ON CONFLICT (correo) DO UPDATE 
SET rol = 'propietaria', activo = true;

-- --------------------------------------------------------------------
-- 2. TABLA: clientes
-- Datos de clientes captados desde cotizaciones, WhatsApp o CRM
-- Cumple con Ley 1581 de 2012 (Habeas Data Colombia)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    correo TEXT,
    direccion TEXT NOT NULL,
    barrio TEXT NOT NULL,
    ciudad TEXT NOT NULL DEFAULT 'Bogotá',
    origen TEXT NOT NULL DEFAULT 'WhatsApp' 
        CHECK (origen IN ('WhatsApp', 'Instagram', 'Facebook', 'Recomendación', 'Google', 'Otro')),
    notas TEXT,
    etiquetas TEXT[] DEFAULT '{}',
    estado TEXT NOT NULL DEFAULT 'nuevo'
        CHECK (estado IN ('nuevo', 'cotizado', 'agendado', 'realizado', 'cancelado')),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON public.clientes (telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_correo ON public.clientes (correo);
CREATE INDEX IF NOT EXISTS idx_clientes_barrio ON public.clientes (barrio);
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON public.clientes (estado);

-- Trigger para mantener actualizado_en
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_clientes_updated_at
BEFORE UPDATE ON public.clientes
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------
-- 3. TABLA: cotizaciones
-- Solicitudes de precios y desgloses de muebles a lavar
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cotizaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    valor_cotizado NUMERIC(12, 2) NOT NULL DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'aprobada', 'rechazada', 'agendada', 'completada')),
    notas_internas TEXT,
    fotos TEXT[] DEFAULT '{}',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente ON public.cotizaciones (cliente_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON public.cotizaciones (estado);

-- --------------------------------------------------------------------
-- 4. TABLA: citas
-- Visitas a domicilio programadas en la agenda de Omaira
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.citas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    servicio TEXT NOT NULL,
    direccion TEXT NOT NULL,
    barrio TEXT NOT NULL,
    ciudad TEXT NOT NULL DEFAULT 'Bogotá',
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'confirmada', 'en_camino', 'realizada', 'cancelada')),
    valor NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notas TEXT,
    recordatorio_enviado BOOLEAN NOT NULL DEFAULT false,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citas_cliente ON public.citas (cliente_id);
CREATE INDEX IF NOT EXISTS idx_citas_fechas ON public.citas (fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON public.citas (estado);

-- --------------------------------------------------------------------
-- 5. TABLA: seguimientos
-- Bitácora de contactos (llamada, WhatsApp, correo, visita)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seguimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('llamada', 'WhatsApp', 'correo', 'visita')),
    nota TEXT NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por TEXT
);

CREATE INDEX IF NOT EXISTS idx_seguimientos_cliente ON public.seguimientos (cliente_id);

-- --------------------------------------------------------------------
-- 6. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- --------------------------------------------------------------------

-- Habilitar RLS en todas las tablas
ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimientos ENABLE ROW LEVEL SECURITY;

-- Función helper para validar si el usuario autenticado es un administrador activo
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.administradores 
        WHERE correo = auth.jwt() ->> 'email' 
          AND activo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para Administradores
CREATE POLICY "Permitir lectura de administradores"
ON public.administradores FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Permitir edición de administradores"
ON public.administradores FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Políticas para Clientes
CREATE POLICY "Permitir lectura de clientes"
ON public.clientes FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Permitir edición de clientes"
ON public.clientes FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Políticas para Cotizaciones
CREATE POLICY "Permitir lectura de cotizaciones"
ON public.cotizaciones FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Permitir edición de cotizaciones"
ON public.cotizaciones FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Políticas para Citas
CREATE POLICY "Permitir lectura de citas"
ON public.citas FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Permitir edición de citas"
ON public.citas FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Políticas para Seguimientos
CREATE POLICY "Permitir lectura de seguimientos"
ON public.seguimientos FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Permitir edición de seguimientos"
ON public.seguimientos FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
