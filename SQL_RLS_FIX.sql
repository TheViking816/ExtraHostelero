-- =============================================
-- COMANDOS SQL PARA DESACTIVAR/ACTIVAR RLS
-- =============================================

-- Desactivar RLS en tabla messages (para que todos puedan enviar/leer mensajes)
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Desactivar RLS en tabla conversations
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- Desactivar RLS en tabla cv_documents
ALTER TABLE cv_documents DISABLE ROW LEVEL SECURITY;

-- =============================================
-- Si más adelante quieres reactivar RLS con políticas seguras:
-- =============================================

-- Reactivar RLS
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Crear políticas seguras para messages
-- CREATE POLICY "authenticated users can insert messages"
--   ON messages FOR INSERT TO authenticated
--   WITH CHECK (auth.uid() = sender_id);
--
-- CREATE POLICY "authenticated users can read their messages"
--   ON messages FOR SELECT TO authenticated
--   USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- =============================================
-- Ver estado actual de RLS
-- =============================================

SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- =============================================
-- Ver todas las policies en una tabla
-- =============================================

SELECT * FROM pg_policies 
WHERE tablename = 'messages' 
OR tablename = 'conversations' 
OR tablename = 'cv_documents';
