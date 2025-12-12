-- ============================================
-- CREAR BUCKET DE AVATARS EN SUPABASE
-- ============================================

-- OPCIÓN 1: Crear el bucket usando SQL
-- ============================================
-- Este código crea el bucket 'avatars' en Supabase Storage
-- Ejecuta esto en el SQL Editor de Supabase

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CONFIGURAR POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- 1. Permitir que cualquiera pueda VER los avatars (público)
CREATE POLICY "Avatars son públicos para ver"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 2. Permitir que usuarios autenticados suban sus propios avatars
CREATE POLICY "Usuarios pueden subir sus avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- 3. Permitir que usuarios autenticados actualicen sus propios avatars
CREATE POLICY "Usuarios pueden actualizar sus avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- 4. Permitir que usuarios autenticados eliminen sus propios avatars
CREATE POLICY "Usuarios pueden eliminar sus avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- ============================================
-- VERIFICAR QUE EL BUCKET SE CREÓ CORRECTAMENTE
-- ============================================
-- Ejecuta esta consulta para verificar:

SELECT * FROM storage.buckets WHERE id = 'avatars';

-- ============================================
-- INSTRUCCIONES ALTERNATIVAS (INTERFAZ WEB)
-- ============================================

/*
Si prefieres crear el bucket desde la interfaz web de Supabase:

1. Ve a tu proyecto en Supabase Dashboard
2. En el menú lateral, ve a "Storage"
3. Haz clic en "New bucket"
4. Configura así:
   - Name: avatars
   - Public bucket: SÍ (marcado)
   - File size limit: 5MB (opcional)
   - Allowed MIME types: image/jpeg, image/png, image/webp (opcional)
5. Haz clic en "Create bucket"
6. Una vez creado, ve a la pestaña "Policies" y añade las políticas de arriba

POLÍTICAS DESDE LA INTERFAZ:
Para añadir las políticas desde la interfaz web:
1. Ve a Storage > avatars > Policies
2. Haz clic en "New Policy"
3. Crea estas 4 políticas:

POLÍTICA 1: "Avatars son públicos para ver"
- Policy name: Avatars son públicos para ver
- Operation: SELECT
- Target roles: public
- USING expression: bucket_id = 'avatars'

POLÍTICA 2: "Usuarios pueden subir sus avatars"
- Policy name: Usuarios pueden subir sus avatars
- Operation: INSERT
- Target roles: authenticated
- WITH CHECK expression: bucket_id = 'avatars'

POLÍTICA 3: "Usuarios pueden actualizar sus avatars"
- Policy name: Usuarios pueden actualizar sus avatars
- Operation: UPDATE
- Target roles: authenticated
- USING expression: bucket_id = 'avatars'

POLÍTICA 4: "Usuarios pueden eliminar sus avatars"
- Policy name: Usuarios pueden eliminar sus avatars
- Operation: DELETE
- Target roles: authenticated
- USING expression: bucket_id = 'avatars'
*/

-- ============================================
-- CONFIGURACIÓN AVANZADA (OPCIONAL)
-- ============================================

-- Si quieres limitar el tamaño de archivo a 5MB:
-- Esto se hace desde la interfaz web en Storage > avatars > Settings > File size limit

-- Si quieres permitir solo ciertos tipos de imagen:
-- Esto se hace desde la interfaz web en Storage > avatars > Settings > Allowed MIME types
-- Valores recomendados: image/jpeg, image/png, image/webp, image/jpg

-- ============================================
-- TESTING
-- ============================================

-- Para probar que funciona correctamente:
-- 1. En tu aplicación, intenta subir un avatar
-- 2. Verifica que aparezca en Storage > avatars
-- 3. Verifica que la URL pública funciona

-- Ejemplo de URL pública de un avatar:
-- https://[tu-proyecto].supabase.co/storage/v1/object/public/avatars/[nombre-archivo].jpg
