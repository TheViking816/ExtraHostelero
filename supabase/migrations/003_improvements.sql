-- =============================================
-- EXTRAHOSTELERO - MIGRACION: MEJORAS Y CORRECCIONES
-- =============================================

-- =============================================
-- MEJORAR SOPORTE DE CV EN APLICACIONES
-- =============================================

-- Crear tabla para almacenar CVs subidos por staff
CREATE TABLE IF NOT EXISTS cv_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Información del documento
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT, -- 'pdf', 'doc', 'docx', etc.
  file_url TEXT NOT NULL, -- URL en Supabase Storage

  -- Metadata
  is_current BOOLEAN DEFAULT true, -- Se usa en candidaturas
  version_number INTEGER DEFAULT 1,

  UNIQUE(staff_id, is_current)
);

CREATE INDEX IF NOT EXISTS idx_cv_documents_staff ON cv_documents (staff_id);

-- Mejorar tabla profiles para referencia al CV actual
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_document_id UUID REFERENCES cv_documents(id);

-- =============================================
-- MEJORAR TABLA NOTIFICACIONES CON TIPOS ESPECÍFICOS
-- =============================================

-- Agregar más información a notificaciones existentes
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS notification_type TEXT; -- 'job_matched', 'new_application', 'message_received', 'job_published', etc.
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT; -- URL a la que ir al hacer clic
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_required BOOLEAN DEFAULT false; -- Si requiere acción inmediata

-- =============================================
-- NUEVA TABLA: REVIEW/RATING - SISTEMA DE PUNTUACIÓN
-- =============================================

-- La tabla reviews ya existe pero necesitamos mejorar el flujo
-- Agregar campos para clarificar cuándo se puede puntuarse

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS review_opened_at TIMESTAMPTZ; -- Cuándo se abre la opción de review

-- Función para abrir período de revisión cuando un job se completa
CREATE OR REPLACE FUNCTION open_review_period()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE jobs
    SET review_opened_at = NOW()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER open_review_period_trigger
  AFTER UPDATE OF status ON jobs
  FOR EACH ROW EXECUTE FUNCTION open_review_period();

-- =============================================
-- TRIGGERS PARA NOTIFICACIONES DE CHAT
-- =============================================

-- Función para notificar cuando se recibe un mensaje
CREATE OR REPLACE FUNCTION notify_on_message()
RETURNS TRIGGER AS $$
DECLARE
  v_receiver_user RECORD;
  v_sender_user RECORD;
  v_job RECORD;
BEGIN
  -- Obtener datos del receptor y del remitente
  SELECT * INTO v_receiver_user FROM profiles WHERE id = NEW.receiver_id;
  SELECT * INTO v_sender_user FROM profiles WHERE id = NEW.sender_id;

  -- Si hay un job asociado, obtener su información
  IF NEW.job_id IS NOT NULL THEN
    SELECT * INTO v_job FROM jobs WHERE id = NEW.job_id;
  END IF;

  -- Crear notificación para el receptor
  INSERT INTO notifications (user_id, type, title, body, data, notification_type)
  VALUES (
    NEW.receiver_id,
    'message_received',
    'Nuevo mensaje de ' || v_sender_user.full_name,
    NEW.content,
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'sender_name', v_sender_user.full_name,
      'job_id', NEW.job_id,
      'job_role', CASE WHEN v_job.id IS NOT NULL THEN v_job.role_required ELSE NULL END
    ),
    'message_received'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para notificaciones de mensajes
CREATE OR REPLACE TRIGGER notify_on_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_on_message();

-- =============================================
-- TRIGGER MEJORADO PARA NOTIFICAR CUANDO SE PUBLICA OFERTA
-- =============================================

-- Función para notificar a staff cuando se publica una oferta que coincide su puesto
CREATE OR REPLACE FUNCTION notify_staff_on_job_published()
RETURNS TRIGGER AS $$
DECLARE
  v_staff_record RECORD;
  v_local RECORD;
BEGIN
  -- Solo notificar si se publica una oferta nueva
  IF NEW.status = 'open' AND OLD.status != 'open' THEN
    -- Obtener datos del local
    SELECT * INTO v_local FROM profiles WHERE id = NEW.local_id;

    -- Notificar a todos los staff cuyo puesto coincida
    INSERT INTO notifications (user_id, type, title, body, data, notification_type)
    SELECT
      p.id,
      'job_published',
      'Nueva oferta de ' || v_local.business_name || ' - ' || NEW.role_required,
      'Se ha publicado una oferta que coincide con tu puesto',
      jsonb_build_object(
        'job_id', NEW.id,
        'local_id', NEW.local_id,
        'local_name', v_local.business_name,
        'role_required', NEW.role_required,
        'job_type', NEW.job_type
      ),
      'job_published'
    FROM profiles p
    WHERE
      p.user_type = 'staff'
      AND p.staff_role = NEW.role_required
      AND p.available = true
      AND p.id != NEW.local_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER notify_staff_on_job_published_trigger
  AFTER UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION notify_staff_on_job_published();

-- =============================================
-- FUNCIÓN PARA MARCAR NOTIFICACIONES COMO LEÍDAS
-- =============================================

CREATE OR REPLACE FUNCTION mark_notifications_as_read(p_user_id UUID, p_notification_ids UUID[])
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET read_at = NOW()
  WHERE id = ANY(p_notification_ids)
    AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RLS PARA NUEVAS TABLAS Y MEJORADO
-- =============================================

-- CV Documents RLS
ALTER TABLE cv_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage their CVs"
  ON cv_documents FOR ALL
  USING (staff_id = auth.uid());

CREATE POLICY "Apps can see current staff CVs for matching"
  ON cv_documents FOR SELECT
  USING (is_current = true);

-- Notifications RLS mejorado
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_notifications_unread_by_user ON notifications (user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status_type ON jobs (status, job_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_applications_status_created ON applications (status, created_at DESC);
