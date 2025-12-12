-- ============================================
-- Confirmar email de usuario Mireia manualmente
-- ============================================
-- INSTRUCCIONES:
-- 1. Ir al Supabase Dashboard > SQL Editor
-- 2. Copiar y pegar este script
-- 3. Reemplazar 'mireia@example.com' con el email EXACTO de Mireia
-- 4. Ejecutar el script

-- Confirmar email de Mireia
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmation_token = NULL,
  confirmed_at = NOW()
WHERE email = 'mireia@example.com';

-- Verificar que se actualizó correctamente
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email = 'mireia@example.com';
