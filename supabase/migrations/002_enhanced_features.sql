-- =============================================
-- EXTRAHOSTELERO - MIGRACION: FUNCIONALIDADES MEJORADAS
-- =============================================

-- =============================================
-- NUEVO ENUM: TIPO DE OFERTA
-- =============================================
DO $$ BEGIN
  CREATE TYPE job_type AS ENUM ('extra', 'prueba');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- MODIFICAR TABLA JOBS: Añadir tipo de oferta
-- =============================================
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type job_type DEFAULT 'extra';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS evaluation_criteria TEXT[] DEFAULT '{}';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS possible_hire BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Índice para ofertas no eliminadas
CREATE INDEX IF NOT EXISTS idx_jobs_not_deleted ON jobs (status) WHERE deleted_at IS NULL;

-- =============================================
-- MODIFICAR TABLA PROFILES: Añadir campos para CV y carnet digital
-- =============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_text TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_intro_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_skills TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS carnet_digital_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS carnet_qr_code TEXT;

-- =============================================
-- MODIFICAR TABLA APPLICATIONS: Añadir datos de candidatura
-- =============================================
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cover_letter TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cv_snapshot_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS experience_summary TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS availability_note TEXT;

-- =============================================
-- NUEVA TABLA: MESSAGES (Chat entre local y staff)
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Participantes
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Contexto (opcional - puede ser sobre un job específico)
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,

  -- Contenido
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  attachment_url TEXT,

  -- Estado
  read_at TIMESTAMPTZ,
  deleted_by_sender BOOLEAN DEFAULT false,
  deleted_by_receiver BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages (receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id),
  created_at DESC
);
CREATE INDEX IF NOT EXISTS idx_messages_job ON messages (job_id) WHERE job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (receiver_id) WHERE read_at IS NULL;

-- =============================================
-- NUEVA TABLA: FAVORITES (Pool de confianza)
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Relación: Local marca a Staff como favorito
  local_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Metadata
  note TEXT,
  last_worked_together TIMESTAMPTZ,
  times_worked_together INTEGER DEFAULT 1,

  UNIQUE(local_id, staff_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_local ON favorites (local_id);
CREATE INDEX IF NOT EXISTS idx_favorites_staff ON favorites (staff_id);

-- =============================================
-- NUEVA TABLA: CERTIFICATIONS (Certificaciones verificadas)
-- =============================================
CREATE TABLE IF NOT EXISTS staff_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Tipo de certificación
  certification_type TEXT NOT NULL CHECK (certification_type IN (
    'manipulador_alimentos',
    'alergenos',
    'prl_hosteleria',
    'sommelier',
    'barista',
    'cocteleria',
    'idioma_ingles',
    'idioma_frances',
    'idioma_aleman',
    'primeros_auxilios',
    'appcc'
  )),

  -- Verificación
  document_url TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,

  -- Caducidad
  expires_at DATE,

  UNIQUE(staff_id, certification_type)
);

CREATE INDEX IF NOT EXISTS idx_certifications_staff ON staff_certifications (staff_id);
CREATE INDEX IF NOT EXISTS idx_certifications_verified ON staff_certifications (verified) WHERE verified = true;

-- =============================================
-- NUEVA TABLA: SKILL_VIDEOS (Videos de demostración)
-- =============================================
CREATE TABLE IF NOT EXISTS skill_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Video
  skill_name TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,

  -- Verificación y visibilidad
  verified BOOLEAN DEFAULT false,
  public BOOLEAN DEFAULT true,

  -- Estadísticas
  views_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_skill_videos_staff ON skill_videos (staff_id);

-- =============================================
-- NUEVA TABLA: CONVERSATIONS (Para agrupar mensajes)
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Participantes
  local_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Contexto
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,

  -- Estado
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  local_unread_count INTEGER DEFAULT 0,
  staff_unread_count INTEGER DEFAULT 0,

  -- Archivado
  archived_by_local BOOLEAN DEFAULT false,
  archived_by_staff BOOLEAN DEFAULT false
);

-- Índice único funcional para conversaciones (permite múltiples conversaciones por job o sin job)
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique
  ON conversations (local_id, staff_id, COALESCE(job_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX IF NOT EXISTS idx_conversations_local ON conversations (local_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_staff ON conversations (staff_id, last_message_at DESC);

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función para actualizar conversación al enviar mensaje
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation_id UUID;
  v_local_id UUID;
  v_staff_id UUID;
BEGIN
  -- Determinar quién es local y quién es staff
  SELECT
    CASE WHEN p1.user_type = 'local' THEN NEW.sender_id ELSE NEW.receiver_id END,
    CASE WHEN p1.user_type = 'staff' THEN NEW.sender_id ELSE NEW.receiver_id END
  INTO v_local_id, v_staff_id
  FROM profiles p1
  WHERE p1.id = NEW.sender_id;

  -- Buscar conversación existente
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE local_id = v_local_id
    AND staff_id = v_staff_id
    AND (job_id = NEW.job_id OR (job_id IS NULL AND NEW.job_id IS NULL))
  LIMIT 1;

  -- Si no existe, crear nueva conversación
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (local_id, staff_id, job_id, last_message_at)
    VALUES (v_local_id, v_staff_id, NEW.job_id, NOW())
    RETURNING id INTO v_conversation_id;
  ELSE
    -- Actualizar timestamp
    UPDATE conversations
    SET last_message_at = NOW(), updated_at = NOW()
    WHERE id = v_conversation_id;
  END IF;

  -- Incrementar contador de no leídos para el receptor
  IF NEW.receiver_id = v_local_id THEN
    UPDATE conversations SET local_unread_count = local_unread_count + 1 WHERE id = v_conversation_id;
  ELSE
    UPDATE conversations SET staff_unread_count = staff_unread_count + 1 WHERE id = v_conversation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_conversation_trigger
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Función para notificar al local cuando alguien aplica
CREATE OR REPLACE FUNCTION notify_local_on_application()
RETURNS TRIGGER AS $$
DECLARE
  v_job RECORD;
  v_staff RECORD;
BEGIN
  -- Obtener datos del job y del staff
  SELECT * INTO v_job FROM jobs WHERE id = NEW.job_id;
  SELECT * INTO v_staff FROM profiles WHERE id = NEW.staff_id;

  -- Crear notificación para el local
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    v_job.local_id,
    'new_application',
    'Nueva candidatura',
    v_staff.full_name || ' ha aplicado a tu oferta de ' || v_job.role_required,
    jsonb_build_object(
      'job_id', NEW.job_id,
      'application_id', NEW.id,
      'staff_id', NEW.staff_id,
      'staff_name', v_staff.full_name
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER notify_on_application
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_local_on_application();

-- Función para actualizar favoritos después de completar un turno
CREATE OR REPLACE FUNCTION update_favorites_on_job_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.matched_staff_id IS NOT NULL THEN
    INSERT INTO favorites (local_id, staff_id, last_worked_together, times_worked_together)
    VALUES (NEW.local_id, NEW.matched_staff_id, NOW(), 1)
    ON CONFLICT (local_id, staff_id)
    DO UPDATE SET
      last_worked_together = NOW(),
      times_worked_together = favorites.times_worked_together + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_favorites_trigger
  AFTER UPDATE OF status ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_favorites_on_job_complete();

-- Función para generar carnet digital
CREATE OR REPLACE FUNCTION generate_carnet_digital(p_staff_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_carnet_id TEXT;
BEGIN
  v_carnet_id := 'EH-' || UPPER(SUBSTRING(p_staff_id::TEXT FROM 1 FOR 8)) || '-' || TO_CHAR(NOW(), 'YYMM');

  UPDATE profiles
  SET
    carnet_digital_id = v_carnet_id,
    carnet_qr_code = 'https://extrahostelero.com/verify/' || v_carnet_id
  WHERE id = p_staff_id;

  RETURN v_carnet_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- RLS PARA NUEVAS TABLAS
-- =============================================

-- Messages RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own messages"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Favorites RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locals can manage their favorites"
  ON favorites FOR ALL
  USING (local_id = auth.uid());

CREATE POLICY "Staff can see if they are favorited"
  ON favorites FOR SELECT
  USING (staff_id = auth.uid());

-- Conversations RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their conversations"
  ON conversations FOR SELECT
  USING (local_id = auth.uid() OR staff_id = auth.uid());

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (local_id = auth.uid() OR staff_id = auth.uid());

-- Certifications RLS
ALTER TABLE staff_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see verified certifications"
  ON staff_certifications FOR SELECT
  USING (verified = true OR staff_id = auth.uid());

CREATE POLICY "Staff can manage their certifications"
  ON staff_certifications FOR ALL
  USING (staff_id = auth.uid());

-- Skill Videos RLS
ALTER TABLE skill_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see public skill videos"
  ON skill_videos FOR SELECT
  USING (public = true OR staff_id = auth.uid());

CREATE POLICY "Staff can manage their skill videos"
  ON skill_videos FOR ALL
  USING (staff_id = auth.uid());

-- =============================================
-- FUNCIONES RPC ADICIONALES
-- =============================================

-- Obtener candidatos favoritos para una oferta
CREATE OR REPLACE FUNCTION get_favorite_candidates_for_job(
  p_local_id UUID,
  p_role staff_role
)
RETURNS TABLE (
  staff_id UUID,
  full_name TEXT,
  rating DECIMAL,
  reliability_score INTEGER,
  times_worked_together INTEGER,
  last_worked_together TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.staff_id,
    p.full_name,
    p.rating,
    p.reliability_score,
    f.times_worked_together,
    f.last_worked_together
  FROM favorites f
  JOIN profiles p ON p.id = f.staff_id
  WHERE
    f.local_id = p_local_id
    AND p.staff_role = p_role
    AND p.available = true
  ORDER BY f.times_worked_together DESC, p.rating DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obtener estadísticas del carnet digital
CREATE OR REPLACE FUNCTION get_carnet_stats(p_staff_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_shifts', p.total_shifts,
    'rating', p.rating,
    'reliability_score', p.reliability_score,
    'verified_skills', p.verified_skills,
    'certifications', (
      SELECT jsonb_agg(jsonb_build_object(
        'type', sc.certification_type,
        'verified', sc.verified,
        'expires_at', sc.expires_at
      ))
      FROM staff_certifications sc
      WHERE sc.staff_id = p_staff_id AND sc.verified = true
    ),
    'favorites_count', (
      SELECT COUNT(*) FROM favorites WHERE staff_id = p_staff_id
    ),
    'skill_videos_count', (
      SELECT COUNT(*) FROM skill_videos WHERE staff_id = p_staff_id AND public = true
    )
  )
  INTO v_stats
  FROM profiles p
  WHERE p.id = p_staff_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
