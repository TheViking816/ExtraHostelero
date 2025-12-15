# ✅ Problemas Resueltos - Notificaciones Push

## 🔧 Cambios Aplicados

### 0. ❌ Error: "schema net does not exist" (NUEVO)
**Problema:** Al publicar una oferta como local, falla con error "schema net does not exist".

**Causa:** La extensión `pg_net` no estaba habilitada en Supabase.

**Solución:**
- ✅ Creado archivo de migración `016_enable_pg_net.sql`
- ✅ Esta migración habilita la extensión `pg_net` que proporciona `net.http_post()`
- ✅ **DEBE ejecutarse ANTES** que las otras migraciones

**Cómo aplicar:**
```sql
-- Ejecuta en Supabase Dashboard → SQL Editor
create extension if not exists pg_net with schema extensions;
grant usage on schema net to postgres, anon, authenticated, service_role;
```

**Ver:** `SOLUCION_RAPIDA_NET_SCHEMA.md` para instrucciones detalladas.

---

### 1. ❌ Error: "Module not found _shared/push-utils.ts"
**Problema:** Supabase Edge Functions no soporta imports desde carpetas `_shared`.

**Solución:**
- ✅ Movido todo el código de utilidades INLINE dentro de `send-push-notification/index.ts`
- ✅ Eliminado el directorio `supabase/functions/_shared`
- ✅ Ahora la edge function es un solo archivo autosuficiente

**Archivos modificados:**
- `supabase/functions/send-push-notification/index.ts` - Código completo inline

---

### 2. ❌ Error: "Permission denied to set parameter app.settings..."
**Problema:** No tienes permisos de superusuario para ejecutar `ALTER DATABASE` en Supabase.

**Solución:**
- ✅ **YA NO SE NECESITA** ejecutar `ALTER DATABASE`
- ✅ URLs y API keys están hardcodeadas directamente en el archivo SQL
- ✅ Tus valores ya están en `019_push_notification_triggers.sql`:
  - URL: `https://oknpgpencszibnmndyzm.supabase.co/functions/v1/send-push-notification`
  - Anon Key: `eyJhbGc...` (tu key completa)

**Archivos modificados:**
- `supabase/migrations/019_push_notification_triggers.sql` - URLs hardcodeadas

**Ya no necesitas ejecutar:**
```sql
-- ❌ ESTO YA NO ES NECESARIO
ALTER DATABASE postgres SET app.settings.supabase_functions_url = '...';
ALTER DATABASE postgres SET app.settings.supabase_anon_key = '...';
```

---

### 3. ❌ Error: "grant usage on sequence push_subscriptions_id_seq"
**Problema:** La tabla usa `uuid_generate_v4()` como default, no una secuencia serial, por lo que esa línea generaba error.

**Solución:**
- ✅ Eliminada la línea problemática de la migración 017
- ✅ La tabla funciona perfectamente sin esa línea

**Archivos modificados:**
- `supabase/migrations/017_push_notifications.sql` - Línea eliminada

**Antes (❌):**
```sql
grant select, insert, update, delete on push_subscriptions to authenticated;
grant usage on sequence push_subscriptions_id_seq to authenticated; -- ❌ Error
```

**Ahora (✅):**
```sql
grant select, insert, update, delete on push_subscriptions to authenticated;
-- Línea problemática eliminada ✅
```

---

## 📋 Nuevo Proceso de Despliegue

### Pasos simplificados (en orden):

1. **Configurar Secrets en Supabase**
   - Ve a Dashboard → Settings → Edge Functions → Secrets
   - Agrega: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, APP_URL

2. **Desplegar Edge Function**
   ```bash
   supabase functions deploy send-push-notification
   ```

3. **Ejecutar Migraciones** ⚠️ ORDEN IMPORTANTE
   ```bash
   supabase migration up
   ```
   O ejecuta manualmente en SQL Editor en este orden:
   - **016_enable_pg_net.sql** ← PRIMERO (habilita pg_net)
   - **017_push_notifications.sql**
   - **018_chat_attachments_storage.sql**
   - **019_push_notification_triggers.sql**

4. **Build y Deploy Frontend**
   ```bash
   npm run build
   vercel --prod  # o tu servicio de deploy
   ```

---

## 🎯 Verificación Rápida

### ✅ La Edge Function está corregida
```bash
supabase functions deploy send-push-notification
# Debería deployar sin errores
```

### ✅ Las Migraciones están corregidas
Ahora puedes ejecutar directamente en SQL Editor:
- `017_push_notifications.sql` ✅
- `018_chat_attachments_storage.sql` ✅
- `019_push_notification_triggers.sql` ✅

Sin errores de permisos ni de grant usage.

### ✅ No necesitas ALTER DATABASE
El archivo 019 ya tiene todo configurado con tus valores.

---

## 📄 Documentación Actualizada

Lee el archivo **`DEPLOYMENT_INSTRUCTIONS_FIXED.md`** para la guía completa y actualizada de despliegue.

---

## 🚀 Siguiente Paso

**Ahora puedes desplegar sin problemas:**

```bash
# 1. Configurar secrets en Supabase Dashboard (ver DEPLOYMENT_INSTRUCTIONS_FIXED.md)

# 2. Deploy edge function
supabase functions deploy send-push-notification

# 3. Ejecutar migraciones
supabase migration up

# 4. Build y deploy frontend
npm run build
```

¡Todo debería funcionar sin errores! 🎉
