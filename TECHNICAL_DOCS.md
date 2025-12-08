# ExtraHostelero - Documentación Técnica de Implementación.

## Índice
1. [Arquitectura General](#1-arquitectura-general)
2. [Base de Datos Supabase](#2-base-de-datos-supabase)
3. [Lógica del Alta Flash](#3-lógica-del-alta-flash)
4. [Monetización con Stripe](#4-monetización-con-stripe)
5. [Despliegue en Vercel](#5-despliegue-en-vercel)
6. [Nuevas Funcionalidades v2.0](#6-nuevas-funcionalidades-v20)

---

## 6. Nuevas Funcionalidades v2.0

### 6.1 Tipos de Oferta: Extra vs Prueba

La app ahora diferencia entre dos tipos de ofertas:

| Tipo | Descripción | Flujo |
|------|-------------|-------|
| **EXTRA** | Cubrir un hueco puntual | Swipe rápido para aplicar |
| **PRUEBA** | Proceso de selección con posible contratación | Formulario completo de candidatura |

#### Campos nuevos en tabla `jobs`:
```sql
job_type job_type DEFAULT 'extra'  -- 'extra' o 'prueba'
evaluation_criteria TEXT[]         -- Criterios de evaluación para pruebas
possible_hire BOOLEAN              -- Si hay posibilidad de contratación
deleted_at TIMESTAMPTZ             -- Soft delete para ofertas
```

### 6.2 Sistema de Aplicaciones Mejorado

Cuando un candidato aplica a una oferta:
1. Se guarda en tabla `applications` con todos sus datos
2. Se envía notificación automática al local (trigger)
3. El local puede ver, aceptar o rechazar candidatos
4. Al aceptar: se notifica al candidato y se rechaza al resto

#### Campos nuevos en tabla `applications`:
```sql
cover_letter TEXT          -- Carta de presentación
cv_snapshot_url TEXT       -- URL del CV
phone_number TEXT          -- Teléfono de contacto
photo_url TEXT             -- Foto del candidato
experience_summary TEXT    -- Resumen de experiencia
availability_note TEXT     -- Notas de disponibilidad
```

### 6.3 Sistema de Chat

Nueva tabla `messages` para comunicación directa local-candidato:
- Chat en tiempo real via Supabase Realtime
- Mensajes vinculados a job específico (opcional)
- Estado de lectura
- Tabla auxiliar `conversations` para agrupar chats

### 6.4 Pool de Favoritos

Los locales pueden marcar staff como "favorito":
- Se actualiza automáticamente al completar turnos
- Contador de veces trabajados juntos
- Los favoritos aparecen primero en búsquedas

```sql
CREATE TABLE favorites (
  local_id UUID,
  staff_id UUID,
  times_worked_together INTEGER DEFAULT 1,
  last_worked_together TIMESTAMPTZ
);
```

### 6.5 Carnet Digital de Hostelería

Cada staff tiene un carnet digital verificable:
- ID único generado automáticamente
- QR escaneable para verificación
- Muestra: turnos, rating, fiabilidad, certificaciones
- Indica si es favorito de X locales

#### Campos en `profiles`:
```sql
carnet_digital_id TEXT     -- Ej: "EH-ABC12345-2411"
carnet_qr_code TEXT        -- URL de verificación
verified_skills TEXT[]     -- Habilidades verificadas
certifications TEXT[]      -- Certificaciones
```

### 6.6 Sistema de Certificaciones

Staff puede subir y verificar certificaciones:
- Manipulador de alimentos
- Alérgenos
- PRL Hostelería
- Sommelier, Barista, etc.

```sql
CREATE TABLE staff_certifications (
  staff_id UUID,
  certification_type TEXT,
  document_url TEXT,
  verified BOOLEAN,
  expires_at DATE
);
```

### 6.7 Edición de Perfil Completa

Staff puede editar:
- Datos personales
- Habilidades
- CV en texto
- Bio
- Tarifa mínima

### 6.8 Eliminación de Ofertas

Los locales pueden eliminar ofertas (soft delete):
- Se marca `deleted_at` con timestamp
- Se cambia status a 'cancelled'
- No aparece en búsquedas pero se mantiene historial

---

## Migración a v2.0

Ejecutar el script SQL de migración:
```
supabase/migrations/002_enhanced_features.sql
```

Este script añade:
- Nuevos campos a tablas existentes
- Nuevas tablas (messages, favorites, certifications, etc.)
- Triggers para notificaciones automáticas
- Funciones RPC para estadísticas del carnet
- Políticas RLS para nuevas tablas

---

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React + Vite + TailwindCSS (PWA en Vercel)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Auth        │  │  Postgres    │  │  Realtime    │       │
│  │  (Magic Link)│  │  (RLS)       │  │  (WebSocket) │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  Storage     │  │  Edge        │                         │
│  │  (DNI/Docs)  │  │  Functions   │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ Stripe   │ │ API      │ │ Twilio   │
   │ Connect  │ │ Gestoría │ │ SMS      │
   └──────────┘ └──────────┘ └──────────┘
```

---

## 2. Base de Datos Supabase

### 2.1 Script SQL Completo

```sql
-- =============================================
-- EXTRAHOSTELERO - SCHEMA DE BASE DE DATOS
-- =============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('local', 'staff');

CREATE TYPE staff_role AS ENUM (
  'jefe_cocina',
  'cocinero',
  'encargado',
  'segundo_encargado',
  'camarero',
  'ayudante_cocina'
);

CREATE TYPE job_status AS ENUM (
  'open',           -- Buscando candidatos
  'pending',        -- Esperando confirmación del staff
  'matched',        -- Match confirmado, procesando alta
  'alta_processing',-- Alta SS en proceso
  'active',         -- Turno en curso
  'completed',      -- Turno finalizado
  'cancelled',      -- Cancelado
  'disputed'        -- En disputa
);

CREATE TYPE application_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'withdrawn'
);

CREATE TYPE verification_status AS ENUM (
  'pending',
  'verified',
  'rejected',
  'expired'
);

-- =============================================
-- TABLA: PROFILES (Usuarios)
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Datos básicos
  user_type user_role NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,

  -- Ubicación (para geolocalización)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  city TEXT,

  -- Solo para STAFF
  staff_role staff_role,
  skills TEXT[] DEFAULT '{}',
  hourly_rate_min DECIMAL(5,2),
  hourly_rate_max DECIMAL(5,2),
  bio TEXT,
  available BOOLEAN DEFAULT true,

  -- Solo para LOCAL (negocio)
  business_name TEXT,
  business_type TEXT,
  cif TEXT,

  -- Estadísticas
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  reliability_score INTEGER DEFAULT 100,
  total_shifts INTEGER DEFAULT 0,

  -- Verificación
  verification_status verification_status DEFAULT 'pending',
  verified_at TIMESTAMPTZ,

  -- DATOS SENSIBLES (Encriptados a nivel de aplicación)
  -- Estos campos almacenan datos encriptados con AES-256
  dni_encrypted BYTEA,                    -- DNI encriptado
  social_security_encrypted BYTEA,        -- Nº SS encriptado
  bank_account_encrypted BYTEA,           -- IBAN encriptado

  -- Referencias a documentos en Storage (con RLS)
  dni_front_path TEXT,                    -- Path en Supabase Storage
  dni_back_path TEXT,

  -- Stripe Connect (para pagos)
  stripe_customer_id TEXT,
  stripe_connect_account_id TEXT,         -- Solo staff
  stripe_connect_onboarded BOOLEAN DEFAULT false,

  -- Metadata
  fcm_token TEXT,                         -- Push notifications
  last_location_update TIMESTAMPTZ,

  CONSTRAINT valid_staff_data CHECK (
    (user_type = 'staff' AND staff_role IS NOT NULL) OR
    (user_type = 'local' AND business_name IS NOT NULL)
  )
);

-- Índices para búsquedas geoespaciales
CREATE INDEX idx_profiles_location ON profiles (latitude, longitude);
CREATE INDEX idx_profiles_staff_available ON profiles (user_type, available) WHERE user_type = 'staff';
CREATE INDEX idx_profiles_staff_role ON profiles (staff_role) WHERE user_type = 'staff';

-- =============================================
-- TABLA: JOBS (Ofertas de trabajo)
-- =============================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Relación con el local
  local_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Detalles del turno
  role_required staff_role NOT NULL,
  skills_required TEXT[] DEFAULT '{}',

  -- Horario
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Compensación
  hourly_rate DECIMAL(5,2) NOT NULL,
  total_hours DECIMAL(4,2) GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
  ) STORED,
  total_pay DECIMAL(7,2) GENERATED ALWAYS AS (
    hourly_rate * (EXTRACT(EPOCH FROM (end_time - start_time)) / 3600)
  ) STORED,

  -- Gestión SS automática
  auto_alta BOOLEAN DEFAULT true,
  alta_fee DECIMAL(5,2) DEFAULT 2.00,

  -- Estado y urgencia
  status job_status DEFAULT 'open',
  is_urgent BOOLEAN DEFAULT false,
  urgency_level TEXT CHECK (urgency_level IN ('normal', 'high', 'critical')),
  expires_at TIMESTAMPTZ,

  -- Match
  matched_staff_id UUID REFERENCES profiles(id),
  matched_at TIMESTAMPTZ,

  -- Tracking del turno
  staff_arrived_at TIMESTAMPTZ,
  shift_started_at TIMESTAMPTZ,
  shift_ended_at TIMESTAMPTZ,

  -- Alta/Baja SS
  alta_requested_at TIMESTAMPTZ,
  alta_confirmed_at TIMESTAMPTZ,
  alta_reference TEXT,
  baja_requested_at TIMESTAMPTZ,
  baja_confirmed_at TIMESTAMPTZ,

  -- Pagos
  payment_intent_id TEXT,
  payment_status TEXT,
  payment_released_at TIMESTAMPTZ,

  -- Ubicación del trabajo
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,

  -- Notas
  notes TEXT,
  cancellation_reason TEXT
);

-- Índices para búsquedas
CREATE INDEX idx_jobs_local ON jobs (local_id);
CREATE INDEX idx_jobs_status ON jobs (status);
CREATE INDEX idx_jobs_date ON jobs (shift_date);
CREATE INDEX idx_jobs_location ON jobs (latitude, longitude);
CREATE INDEX idx_jobs_urgent ON jobs (is_urgent, status) WHERE status = 'open';
CREATE INDEX idx_jobs_matched_staff ON jobs (matched_staff_id) WHERE matched_staff_id IS NOT NULL;

-- =============================================
-- TABLA: APPLICATIONS (Candidaturas)
-- =============================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  status application_status DEFAULT 'pending',

  -- Puntuación de match (calculada)
  match_score INTEGER,
  distance_km DECIMAL(5,2),

  -- Respuesta
  responded_at TIMESTAMPTZ,
  response_time_seconds INTEGER,

  -- Notas
  staff_note TEXT,
  local_note TEXT,

  UNIQUE(job_id, staff_id)
);

CREATE INDEX idx_applications_job ON applications (job_id);
CREATE INDEX idx_applications_staff ON applications (staff_id);
CREATE INDEX idx_applications_status ON applications (status);

-- =============================================
-- TABLA: REVIEWS (Valoraciones)
-- =============================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Quién valora a quién
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewed_id UUID NOT NULL REFERENCES profiles(id),

  -- Valoración
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  -- Métricas específicas (1-5)
  punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
  professionalism INTEGER CHECK (professionalism >= 1 AND professionalism <= 5),
  skills INTEGER CHECK (skills >= 1 AND skills <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),

  -- Para locales valorando staff
  would_hire_again BOOLEAN,

  -- Para staff valorando locales
  fair_treatment BOOLEAN,

  comment TEXT,

  -- Una review por job por persona
  UNIQUE(job_id, reviewer_id)
);

CREATE INDEX idx_reviews_reviewed ON reviews (reviewed_id);
CREATE INDEX idx_reviews_job ON reviews (job_id);

-- =============================================
-- TABLA: NOTIFICATIONS (Notificaciones)
-- =============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',

  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE read_at IS NULL;

-- =============================================
-- TABLA: ALTA_LOGS (Registro de Altas/Bajas SS)
-- =============================================

CREATE TABLE alta_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  job_id UUID NOT NULL REFERENCES jobs(id),
  staff_id UUID NOT NULL REFERENCES profiles(id),
  local_id UUID NOT NULL REFERENCES profiles(id),

  action_type TEXT NOT NULL CHECK (action_type IN ('alta', 'baja')),

  -- Request a la API externa
  request_payload JSONB,

  -- Response de la API
  response_status INTEGER,
  response_payload JSONB,

  -- Estado
  success BOOLEAN,
  error_message TEXT,

  -- Referencia externa
  external_reference TEXT,

  -- Timestamps
  processed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ
);

CREATE INDEX idx_alta_logs_job ON alta_logs (job_id);
CREATE INDEX idx_alta_logs_staff ON alta_logs (staff_id);

-- =============================================
-- TABLA: PAYMENTS (Registro de pagos)
-- =============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  job_id UUID NOT NULL REFERENCES jobs(id),
  local_id UUID NOT NULL REFERENCES profiles(id),
  staff_id UUID NOT NULL REFERENCES profiles(id),

  -- Stripe
  payment_intent_id TEXT NOT NULL,
  transfer_id TEXT,

  -- Montos
  amount_gross DECIMAL(7,2) NOT NULL,      -- Total cobrado al local
  amount_staff DECIMAL(7,2) NOT NULL,       -- Pago al staff
  amount_alta_fee DECIMAL(5,2) DEFAULT 0,   -- Fee gestión SS
  amount_platform_fee DECIMAL(5,2) NOT NULL,-- Comisión plataforma

  -- Estado
  status TEXT NOT NULL,
  captured_at TIMESTAMPTZ,
  transferred_at TIMESTAMPTZ,

  -- Metadata
  stripe_metadata JSONB
);

CREATE INDEX idx_payments_job ON payments (job_id);
CREATE INDEX idx_payments_status ON payments (status);

-- =============================================
-- FUNCIONES
-- =============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Función para calcular distancia (Haversine)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL,
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  R CONSTANT DECIMAL := 6371; -- Radio de la Tierra en km
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := RADIANS(lat2 - lat1);
  dlon := RADIANS(lon2 - lon1);
  a := SIN(dlat/2) * SIN(dlat/2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dlon/2) * SIN(dlon/2);
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para actualizar estadísticas de rating
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE reviewed_id = NEW.reviewed_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewed_id = NEW.reviewed_id
    )
  WHERE id = NEW.reviewed_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_review
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_profile_stats();

-- Función para calcular fiabilidad
CREATE OR REPLACE FUNCTION update_reliability_score()
RETURNS TRIGGER AS $$
DECLARE
  total_jobs INTEGER;
  completed_jobs INTEGER;
  cancelled_jobs INTEGER;
  no_shows INTEGER;
BEGIN
  IF NEW.status = 'completed' OR NEW.status = 'cancelled' THEN
    SELECT
      COUNT(*),
      COUNT(*) FILTER (WHERE status = 'completed'),
      COUNT(*) FILTER (WHERE status = 'cancelled' AND cancellation_reason LIKE '%staff%')
    INTO total_jobs, completed_jobs, cancelled_jobs
    FROM jobs
    WHERE matched_staff_id = NEW.matched_staff_id;

    IF total_jobs > 0 THEN
      UPDATE profiles
      SET
        reliability_score = GREATEST(0, LEAST(100,
          100 - (cancelled_jobs::DECIMAL / total_jobs * 100)
        ))::INTEGER,
        total_shifts = completed_jobs
      WHERE id = NEW.matched_staff_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reliability_on_job_change
  AFTER UPDATE OF status ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_reliability_score();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE alta_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS RLS: PROFILES
-- =============================================

-- Cualquiera puede ver perfiles públicos (sin datos sensibles)
CREATE POLICY "Perfiles públicos visibles"
  ON profiles FOR SELECT
  USING (true);

-- Solo el usuario puede ver sus propios datos sensibles
CREATE POLICY "Usuario ve sus datos completos"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Solo el usuario puede actualizar su perfil
CREATE POLICY "Usuario actualiza su perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Insertar perfil al registrarse
CREATE POLICY "Insertar perfil propio"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- POLÍTICAS RLS: JOBS
-- =============================================

-- Staff puede ver jobs abiertos
CREATE POLICY "Staff ve jobs abiertos"
  ON jobs FOR SELECT
  USING (
    status = 'open' OR
    local_id = auth.uid() OR
    matched_staff_id = auth.uid()
  );

-- Locales crean sus propios jobs
CREATE POLICY "Local crea jobs"
  ON jobs FOR INSERT
  WITH CHECK (local_id = auth.uid());

-- Locales actualizan sus jobs
CREATE POLICY "Local actualiza sus jobs"
  ON jobs FOR UPDATE
  USING (local_id = auth.uid());

-- Staff puede actualizar jobs donde está matched (para confirmar llegada, etc.)
CREATE POLICY "Staff actualiza job matched"
  ON jobs FOR UPDATE
  USING (matched_staff_id = auth.uid());

-- =============================================
-- POLÍTICAS RLS: APPLICATIONS
-- =============================================

-- Staff ve sus propias aplicaciones
CREATE POLICY "Staff ve sus aplicaciones"
  ON applications FOR SELECT
  USING (staff_id = auth.uid());

-- Local ve aplicaciones a sus jobs
CREATE POLICY "Local ve aplicaciones a sus jobs"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.local_id = auth.uid()
    )
  );

-- Staff crea aplicaciones
CREATE POLICY "Staff aplica a jobs"
  ON applications FOR INSERT
  WITH CHECK (staff_id = auth.uid());

-- Staff puede retirar aplicación
CREATE POLICY "Staff retira aplicación"
  ON applications FOR UPDATE
  USING (staff_id = auth.uid());

-- Local puede aceptar/rechazar
CREATE POLICY "Local gestiona aplicaciones"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.local_id = auth.uid()
    )
  );

-- =============================================
-- POLÍTICAS RLS: REVIEWS
-- =============================================

-- Reviews son públicas
CREATE POLICY "Reviews públicas"
  ON reviews FOR SELECT
  USING (true);

-- Solo participantes del job pueden crear review
CREATE POLICY "Participantes crean reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = reviews.job_id
      AND (jobs.local_id = auth.uid() OR jobs.matched_staff_id = auth.uid())
      AND jobs.status = 'completed'
    )
  );

-- =============================================
-- POLÍTICAS RLS: NOTIFICATIONS
-- =============================================

-- Usuario solo ve sus notificaciones
CREATE POLICY "Usuario ve sus notificaciones"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuario actualiza sus notificaciones"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- =============================================
-- POLÍTICAS RLS: ALTA_LOGS
-- =============================================

-- Solo los participantes ven logs de alta
CREATE POLICY "Participantes ven alta logs"
  ON alta_logs FOR SELECT
  USING (
    staff_id = auth.uid() OR local_id = auth.uid()
  );

-- =============================================
-- POLÍTICAS RLS: PAYMENTS
-- =============================================

-- Solo los participantes ven pagos
CREATE POLICY "Participantes ven pagos"
  ON payments FOR SELECT
  USING (
    staff_id = auth.uid() OR local_id = auth.uid()
  );

-- =============================================
-- VISTA SEGURA PARA PERFILES PÚBLICOS
-- (Oculta datos sensibles)
-- =============================================

CREATE VIEW public_profiles AS
SELECT
  id,
  user_type,
  full_name,
  avatar_url,
  city,
  staff_role,
  skills,
  bio,
  available,
  business_name,
  business_type,
  rating,
  total_reviews,
  reliability_score,
  total_shifts,
  verification_status
FROM profiles;

-- =============================================
-- FUNCIONES RPC PARA BÚSQUEDAS
-- =============================================

-- Buscar staff cercano disponible
CREATE OR REPLACE FUNCTION find_nearby_staff(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_role staff_role,
  p_radius_km DECIMAL DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  staff_role staff_role,
  skills TEXT[],
  hourly_rate_min DECIMAL,
  rating DECIMAL,
  reliability_score INTEGER,
  total_reviews INTEGER,
  distance_km DECIMAL,
  avatar_url TEXT,
  verification_status verification_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.staff_role,
    p.skills,
    p.hourly_rate_min,
    p.rating,
    p.reliability_score,
    p.total_reviews,
    calculate_distance(p_latitude, p_longitude, p.latitude, p.longitude) as distance_km,
    p.avatar_url,
    p.verification_status
  FROM profiles p
  WHERE
    p.user_type = 'staff'
    AND p.available = true
    AND p.staff_role = p_role
    AND p.verification_status = 'verified'
    AND calculate_distance(p_latitude, p_longitude, p.latitude, p.longitude) <= p_radius_km
  ORDER BY
    p.reliability_score DESC,
    p.rating DESC,
    distance_km ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Buscar jobs cercanos para staff
CREATE OR REPLACE FUNCTION find_nearby_jobs(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_role staff_role,
  p_radius_km DECIMAL DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  local_id UUID,
  business_name TEXT,
  role_required staff_role,
  skills_required TEXT[],
  shift_date DATE,
  start_time TIME,
  end_time TIME,
  hourly_rate DECIMAL,
  total_pay DECIMAL,
  auto_alta BOOLEAN,
  is_urgent BOOLEAN,
  urgency_level TEXT,
  expires_at TIMESTAMPTZ,
  distance_km DECIMAL,
  address TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.local_id,
    p.business_name,
    j.role_required,
    j.skills_required,
    j.shift_date,
    j.start_time,
    j.end_time,
    j.hourly_rate,
    j.total_pay,
    j.auto_alta,
    j.is_urgent,
    j.urgency_level,
    j.expires_at,
    calculate_distance(p_latitude, p_longitude, j.latitude, j.longitude) as distance_km,
    j.address
  FROM jobs j
  JOIN profiles p ON p.id = j.local_id
  WHERE
    j.status = 'open'
    AND j.role_required = p_role
    AND j.shift_date >= CURRENT_DATE
    AND (j.expires_at IS NULL OR j.expires_at > NOW())
    AND calculate_distance(p_latitude, p_longitude, j.latitude, j.longitude) <= p_radius_km
  ORDER BY
    j.is_urgent DESC,
    CASE j.urgency_level
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      ELSE 3
    END,
    distance_km ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 3. Lógica del Alta Flash

### 3.1 Edge Function: `process-alta`

Esta Edge Function se ejecuta automáticamente cuando un job pasa a estado `matched`.

```typescript
// supabase/functions/process-alta/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cliente API de Gestoría (placeholder)
const LegalAPI = {
  async processAlta(data: {
    staffDni: string;
    staffSocialSecurity: string;
    staffName: string;
    businessCif: string;
    businessName: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    contractType: string;
    hourlyRate: number;
  }) {
    // PLACEHOLDER: Aquí iría la integración real con la API de gestoría
    // Ejemplos de APIs reales:
    // - A3 Software (Wolters Kluwer)
    // - Sage Despachos
    // - API de la Seguridad Social (RED)

    console.log('Procesando Alta SS:', data);

    // Simulación de respuesta exitosa
    return {
      success: true,
      reference: `ALTA-${Date.now()}`,
      confirmationNumber: `SS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      processedAt: new Date().toISOString()
    };
  },

  async processBaja(data: {
    altaReference: string;
    endDate: string;
    endTime: string;
  }) {
    console.log('Procesando Baja SS:', data);

    return {
      success: true,
      reference: `BAJA-${Date.now()}`,
      processedAt: new Date().toISOString()
    };
  }
}

// Función para desencriptar datos sensibles
async function decryptSensitiveData(encrypted: Uint8Array, key: string): Promise<string> {
  // PLACEHOLDER: Implementar desencriptación AES-256
  // En producción, usar Web Crypto API
  return 'DECRYPTED_DATA';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { job_id, action } = await req.json()

    if (!job_id) {
      throw new Error('job_id is required')
    }

    // Obtener datos del job
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select(`
        *,
        local:profiles!jobs_local_id_fkey(
          id, business_name, cif
        ),
        staff:profiles!jobs_matched_staff_id_fkey(
          id, full_name, dni_encrypted, social_security_encrypted
        )
      `)
      .eq('id', job_id)
      .single()

    if (jobError || !job) {
      throw new Error(`Job not found: ${jobError?.message}`)
    }

    if (!job.auto_alta) {
      return new Response(
        JSON.stringify({ message: 'Auto-alta not enabled for this job' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const ENCRYPTION_KEY = Deno.env.get('DATA_ENCRYPTION_KEY') ?? ''

    if (action === 'alta') {
      // ========================================
      // PROCESO DE ALTA
      // ========================================

      // Actualizar estado del job
      await supabaseClient
        .from('jobs')
        .update({
          status: 'alta_processing',
          alta_requested_at: new Date().toISOString()
        })
        .eq('id', job_id)

      // Desencriptar datos sensibles del staff
      const staffDni = await decryptSensitiveData(
        job.staff.dni_encrypted,
        ENCRYPTION_KEY
      )
      const staffSocialSecurity = await decryptSensitiveData(
        job.staff.social_security_encrypted,
        ENCRYPTION_KEY
      )

      // Llamar a la API de gestoría
      const altaResult = await LegalAPI.processAlta({
        staffDni,
        staffSocialSecurity,
        staffName: job.staff.full_name,
        businessCif: job.local.cif,
        businessName: job.local.business_name,
        startDate: job.shift_date,
        startTime: job.start_time,
        endDate: job.shift_date,
        endTime: job.end_time,
        contractType: 'eventual_hosteleria',
        hourlyRate: job.hourly_rate
      })

      // Registrar en logs
      await supabaseClient
        .from('alta_logs')
        .insert({
          job_id,
          staff_id: job.matched_staff_id,
          local_id: job.local_id,
          action_type: 'alta',
          request_payload: { /* sanitized data */ },
          response_status: altaResult.success ? 200 : 500,
          response_payload: altaResult,
          success: altaResult.success,
          external_reference: altaResult.reference,
          processed_at: new Date().toISOString()
        })

      if (altaResult.success) {
        // Actualizar job con confirmación
        await supabaseClient
          .from('jobs')
          .update({
            status: 'active',
            alta_confirmed_at: new Date().toISOString(),
            alta_reference: altaResult.reference
          })
          .eq('id', job_id)

        // Notificar a ambas partes
        await supabaseClient
          .from('notifications')
          .insert([
            {
              user_id: job.matched_staff_id,
              type: 'alta_confirmed',
              title: 'Alta SS Confirmada',
              body: `Tu alta en ${job.local.business_name} ha sido procesada`,
              data: { job_id, reference: altaResult.confirmationNumber }
            },
            {
              user_id: job.local_id,
              type: 'alta_confirmed',
              title: 'Alta SS del Extra Confirmada',
              body: `El alta de ${job.staff.full_name} ha sido procesada`,
              data: { job_id, reference: altaResult.confirmationNumber }
            }
          ])
      }

      return new Response(
        JSON.stringify({ success: true, data: altaResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'baja') {
      // ========================================
      // PROCESO DE BAJA (Al finalizar turno)
      // ========================================

      if (!job.alta_reference) {
        throw new Error('No alta reference found for this job')
      }

      await supabaseClient
        .from('jobs')
        .update({
          baja_requested_at: new Date().toISOString()
        })
        .eq('id', job_id)

      const bajaResult = await LegalAPI.processBaja({
        altaReference: job.alta_reference,
        endDate: job.shift_date,
        endTime: job.shift_ended_at || job.end_time
      })

      // Registrar en logs
      await supabaseClient
        .from('alta_logs')
        .insert({
          job_id,
          staff_id: job.matched_staff_id,
          local_id: job.local_id,
          action_type: 'baja',
          request_payload: { altaReference: job.alta_reference },
          response_status: bajaResult.success ? 200 : 500,
          response_payload: bajaResult,
          success: bajaResult.success,
          external_reference: bajaResult.reference,
          processed_at: new Date().toISOString()
        })

      if (bajaResult.success) {
        await supabaseClient
          .from('jobs')
          .update({
            baja_confirmed_at: new Date().toISOString()
          })
          .eq('id', job_id)
      }

      return new Response(
        JSON.stringify({ success: true, data: bajaResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action. Use "alta" or "baja"')

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

### 3.2 Database Trigger para Auto-Ejecutar

```sql
-- Trigger que dispara la Edge Function cuando un job hace match
CREATE OR REPLACE FUNCTION trigger_alta_on_match()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'matched' AND OLD.status != 'matched' AND NEW.auto_alta = true THEN
    -- Llamar a la Edge Function via pg_net (extensión de Supabase)
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/process-alta',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'job_id', NEW.id,
        'action', 'alta'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_alta_on_match
  AFTER UPDATE OF status ON jobs
  FOR EACH ROW
  WHEN (NEW.status = 'matched')
  EXECUTE FUNCTION trigger_alta_on_match();
```

---

## 4. Monetización con Stripe

### 4.1 Arquitectura de Pagos

```
┌───────────────────────────────────────────────────────────────────┐
│                    FLUJO DE PAGO                                   │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  1. LOCAL crea oferta                                             │
│     └─> Se calcula: (horas × tarifa) + fee_alta + fee_plataforma  │
│                                                                    │
│  2. STAFF acepta                                                   │
│     └─> Se crea PaymentIntent con capture_method: 'manual'        │
│     └─> Se retiene el importe en tarjeta del LOCAL               │
│                                                                    │
│  3. TURNO completado                                               │
│     └─> LOCAL confirma finalización                               │
│     └─> Se captura el PaymentIntent                               │
│                                                                    │
│  4. DISTRIBUCIÓN (24-48h después)                                  │
│     └─> Staff recibe: (horas × tarifa) via Stripe Connect         │
│     └─> Plataforma retiene: fee_alta + fee_plataforma             │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

### 4.2 Edge Function: `create-payment`

```typescript
// supabase/functions/create-payment/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient()
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fee de la plataforma (porcentaje)
const PLATFORM_FEE_PERCENT = 0.10  // 10%
const ALTA_FEE = 2.00              // 2€ por gestión SS

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { job_id, action } = await req.json()

    // Obtener datos del job
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select(`
        *,
        local:profiles!jobs_local_id_fkey(
          id, stripe_customer_id
        ),
        staff:profiles!jobs_matched_staff_id_fkey(
          id, stripe_connect_account_id
        )
      `)
      .eq('id', job_id)
      .single()

    if (jobError || !job) {
      throw new Error(`Job not found: ${jobError?.message}`)
    }

    if (action === 'create_hold') {
      // ========================================
      // CREAR RETENCIÓN DE PAGO
      // ========================================

      // Calcular montos
      const staffPay = job.total_pay                     // Pago al staff
      const altaFee = job.auto_alta ? ALTA_FEE : 0       // Fee por Alta SS
      const platformFee = staffPay * PLATFORM_FEE_PERCENT // Comisión plataforma
      const totalCharge = staffPay + altaFee + platformFee

      // Crear PaymentIntent con captura manual
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalCharge * 100), // En céntimos
        currency: 'eur',
        customer: job.local.stripe_customer_id,
        capture_method: 'manual', // Retener, no cobrar aún
        metadata: {
          job_id: job.id,
          local_id: job.local_id,
          staff_id: job.matched_staff_id,
          staff_pay: staffPay.toString(),
          alta_fee: altaFee.toString(),
          platform_fee: platformFee.toString()
        },
        description: `ExtraHostelero - Turno ${job.shift_date}`,
        statement_descriptor_suffix: 'EXTRAHOSTELERO'
      })

      // Guardar referencia en job
      await supabaseClient
        .from('jobs')
        .update({
          payment_intent_id: paymentIntent.id,
          payment_status: 'held'
        })
        .eq('id', job_id)

      // Registrar pago
      await supabaseClient
        .from('payments')
        .insert({
          job_id,
          local_id: job.local_id,
          staff_id: job.matched_staff_id,
          payment_intent_id: paymentIntent.id,
          amount_gross: totalCharge,
          amount_staff: staffPay,
          amount_alta_fee: altaFee,
          amount_platform_fee: platformFee,
          status: 'held',
          stripe_metadata: {
            payment_intent_id: paymentIntent.id,
            client_secret: paymentIntent.client_secret
          }
        })

      return new Response(
        JSON.stringify({
          success: true,
          client_secret: paymentIntent.client_secret,
          amounts: {
            total: totalCharge,
            staff_pay: staffPay,
            alta_fee: altaFee,
            platform_fee: platformFee
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'capture') {
      // ========================================
      // CAPTURAR PAGO Y TRANSFERIR AL STAFF
      // ========================================

      if (!job.payment_intent_id) {
        throw new Error('No payment intent found for this job')
      }

      // Capturar el pago
      const paymentIntent = await stripe.paymentIntents.capture(
        job.payment_intent_id
      )

      // Obtener datos del pago
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('job_id', job_id)
        .single()

      // Transferir al staff via Stripe Connect
      const transfer = await stripe.transfers.create({
        amount: Math.round(payment.amount_staff * 100),
        currency: 'eur',
        destination: job.staff.stripe_connect_account_id,
        transfer_group: `JOB_${job_id}`,
        metadata: {
          job_id: job.id,
          payment_id: payment.id
        }
      })

      // Actualizar registros
      await supabaseClient
        .from('jobs')
        .update({
          payment_status: 'completed',
          payment_released_at: new Date().toISOString()
        })
        .eq('id', job_id)

      await supabaseClient
        .from('payments')
        .update({
          status: 'completed',
          transfer_id: transfer.id,
          captured_at: new Date().toISOString(),
          transferred_at: new Date().toISOString()
        })
        .eq('id', payment.id)

      // Notificar al staff
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: job.matched_staff_id,
          type: 'payment_received',
          title: 'Pago Recibido',
          body: `Has recibido ${payment.amount_staff}€ por tu turno`,
          data: { job_id, amount: payment.amount_staff }
        })

      return new Response(
        JSON.stringify({
          success: true,
          transfer_id: transfer.id,
          amount_transferred: payment.amount_staff
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'refund') {
      // ========================================
      // CANCELAR/REEMBOLSAR
      // ========================================

      if (!job.payment_intent_id) {
        throw new Error('No payment intent found')
      }

      // Si no se ha capturado, cancelar
      // Si se ha capturado, reembolsar
      const paymentIntent = await stripe.paymentIntents.retrieve(
        job.payment_intent_id
      )

      if (paymentIntent.status === 'requires_capture') {
        await stripe.paymentIntents.cancel(job.payment_intent_id)
      } else if (paymentIntent.status === 'succeeded') {
        await stripe.refunds.create({
          payment_intent: job.payment_intent_id,
          reason: 'requested_by_customer'
        })
      }

      await supabaseClient
        .from('jobs')
        .update({ payment_status: 'refunded' })
        .eq('id', job_id)

      await supabaseClient
        .from('payments')
        .update({ status: 'refunded' })
        .eq('job_id', job_id)

      return new Response(
        JSON.stringify({ success: true, action: 'refunded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

### 4.3 Stripe Connect Onboarding

```typescript
// supabase/functions/stripe-connect-onboard/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16'
})

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { user_id, return_url } = await req.json()

  // Crear cuenta Connect para el staff
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'ES',
    capabilities: {
      transfers: { requested: true }
    },
    business_type: 'individual',
    metadata: { user_id }
  })

  // Guardar ID de cuenta
  await supabaseClient
    .from('profiles')
    .update({ stripe_connect_account_id: account.id })
    .eq('id', user_id)

  // Crear link de onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${return_url}?refresh=true`,
    return_url: `${return_url}?success=true`,
    type: 'account_onboarding'
  })

  return new Response(
    JSON.stringify({ url: accountLink.url }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

---

## 5. Despliegue en Vercel

### 5.1 Configuración de Vercel

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    }
  ]
}
```

### 5.2 Variables de Entorno

```bash
# .env.local (NO commitear)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 5.3 Comandos de Despliegue

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Desplegar a Vercel
npx vercel --prod
```

### 5.4 Configuración de Supabase

```bash
# Instalar CLI de Supabase
npm install -g supabase

# Login
supabase login

# Iniciar proyecto
supabase init

# Vincular proyecto existente
supabase link --project-ref your-project-ref

# Aplicar migraciones
supabase db push

# Desplegar Edge Functions
supabase functions deploy process-alta
supabase functions deploy create-payment
supabase functions deploy stripe-connect-onboard

# Configurar secrets para Edge Functions
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set DATA_ENCRYPTION_KEY=your-256-bit-key
```

---

## Checklist de Implementación

### Fase 1: MVP Base
- [ ] Configurar proyecto Supabase
- [ ] Ejecutar script SQL de tablas
- [ ] Configurar Auth (Magic Link)
- [ ] Desplegar frontend en Vercel
- [ ] Probar flujo básico Local → Staff

### Fase 2: Pagos
- [ ] Crear cuenta Stripe
- [ ] Configurar Stripe Connect
- [ ] Implementar Edge Functions de pago
- [ ] Probar flujo de retención y captura

### Fase 3: Alta Flash
- [ ] Integrar con API de gestoría
- [ ] Implementar encriptación de datos sensibles
- [ ] Configurar Storage para documentos
- [ ] Probar flujo completo de Alta/Baja

### Fase 4: Producción
- [ ] Migrar a claves de producción Stripe
- [ ] Configurar dominio personalizado
- [ ] Implementar monitoreo (Sentry)
- [ ] Configurar backups automáticos
- [ ] Auditoría de seguridad

---

## Contacto y Soporte

Para dudas técnicas sobre la implementación, revisar:
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
