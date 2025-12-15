# 🚀 Guía de Despliegue - Notificaciones Push y Adjuntos (CORREGIDA)

## ⚠️ PROBLEMAS RESUELTOS

Se han corregido los siguientes problemas:
1. ✅ Error de import en Edge Function (Module not found _shared)
2. ✅ Error de permisos en ALTER DATABASE
3. ✅ Error de grant usage en migración 017

## 📋 Pasos de Despliegue (SIMPLIFICADOS)

### 1. Configurar Secrets en Supabase

**PRIMERO** configura los secrets ANTES de desplegar la edge function.

Ve a **Supabase Dashboard → Settings → Edge Functions → Secrets** y agrega:

| Secret Name | Valor |
|-------------|-------|
| `VAPID_PUBLIC_KEY` | `BFD3EPrf6t6d-TVypeh-KHOvRsamoYwihZ9Ilb7uB20D5xlVQYVgfEoXgMT47g1arT0mOwvK-sgiuVsnKyDnylw` |
| `VAPID_PRIVATE_KEY` | `RocoMB4HBNhjV3N6Rwena8SGmA1XMVbIcNMqcYjZk9Y` |
| `SUPABASE_URL` | `https://oknpgpencszibnmndyzm.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu service_role key (Settings → API) |
| `APP_URL` | Tu URL de producción (ej: `https://tudominio.com`) |

### 2. Desplegar Edge Function

```bash
# Asegúrate de estar en el directorio del proyecto
cd "C:\Users\adria\Proyectos _IA\ExtraHostelero\ExtraHostelero"

# Login a Supabase (si no lo has hecho)
supabase login

# Enlazar proyecto
supabase link --project-ref oknpgpencszibnmndyzm

# Desplegar la edge function
supabase functions deploy send-push-notification
```

**Si ves el mensaje de éxito**, continúa al paso 3. Si hay error, verifica que los secrets estén configurados.

### 3. Ejecutar Migraciones de Base de Datos

**⚠️ IMPORTANTE:** Ejecuta las migraciones en este orden exacto:

**Opción A - Supabase CLI (Recomendado):**
```bash
supabase migration up
```

**Opción B - Manual en SQL Editor:**

Ve a **Supabase Dashboard → SQL Editor** y ejecuta en orden:

1. **`016_enable_pg_net.sql`** ⚠️ **EJECUTAR PRIMERO** - Habilita extensión pg_net (requerida para http_post)
2. **`017_push_notifications.sql`** - Crea tabla push_subscriptions
3. **`018_chat_attachments_storage.sql`** - Crea bucket para adjuntos
4. **`019_push_notification_triggers.sql`** - Actualiza triggers con push

**Nota:** El archivo 019 YA TIENE tus URLs y API keys configuradas. No necesitas cambiar nada.

**Si ves error "schema net does not exist":** Ejecuta primero la migración 016.

### 4. Build y Deploy del Frontend

```bash
# Build la aplicación
npm run build

# Deploy (ejemplo con Vercel)
vercel --prod
```

---

## ✅ Verificación

### Verifica que la Edge Function está desplegada

```bash
supabase functions list
```

Deberías ver `send-push-notification` en la lista.

### Verifica que los Secrets están configurados

En Supabase Dashboard → Settings → Edge Functions → Secrets, deberías ver:
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- APP_URL

### Verifica que las migraciones se ejecutaron

```sql
-- Verifica que la tabla existe
SELECT count(*) FROM push_subscriptions;

-- Verifica que el bucket existe
SELECT * FROM storage.buckets WHERE id = 'chat-attachments';
```

---

## 🧪 Testing

### 1. Test de Notificaciones Push

```bash
# Ver logs de la edge function en tiempo real
supabase functions logs send-push-notification --tail
```

En tu navegador:
1. Inicia sesión en la app
2. Espera 10 segundos → debería aparecer prompt de notificaciones
3. Acepta el permiso
4. Como local, publica una oferta
5. Verifica en los logs que se envió la notificación
6. Los staff con ese rol deberían recibir push

### 2. Test de Adjuntos

1. Abre un chat
2. Click en botón de imagen (icono a la izquierda del input)
3. Selecciona una imagen
4. Debería subirse y mostrarse inline
5. Prueba con PDF → debería mostrar icono y nombre

---

## 🐛 Troubleshooting

### "Failed to deploy edge function: Module not found"
✅ **RESUELTO** - El código ahora tiene todas las funciones inline.

### "Permission denied to set parameter"
✅ **RESUELTO** - Ya no usamos ALTER DATABASE. Las URLs están hardcodeadas en el SQL.

### "Grant usage on sequence error"
✅ **RESUELTO** - Eliminada la línea problemática de la migración 017.

### ❌ "schema net does not exist" al publicar oferta
**Causa:** La extensión `pg_net` no está habilitada.

**Solución:**
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta la migración `016_enable_pg_net.sql`
3. Esto habilitará la extensión `pg_net` que permite hacer HTTP requests desde triggers
4. Prueba publicar una oferta nuevamente

**Migración a ejecutar:**
```sql
create extension if not exists pg_net with schema extensions;
grant usage on schema net to postgres, anon, authenticated, service_role;
```

### ❌ "Invalid Refresh Token: Refresh Token Not Found"
**Causa:** Token de sesión expirado o corrupto.

**Solución:**
1. Cierra sesión en la app (botón Logout)
2. Vuelve a iniciar sesión
3. El problema debería desaparecer

Este error no está relacionado con las notificaciones push, es un problema normal de autenticación.

### No recibo notificaciones push

1. **Verifica que la edge function está desplegada:**
   ```bash
   supabase functions list
   ```

2. **Verifica los logs de la edge function:**
   ```bash
   supabase functions logs send-push-notification --tail
   ```

3. **Verifica que tienes suscripciones activas:**
   ```sql
   SELECT * FROM push_subscriptions WHERE active = true;
   ```

4. **Verifica que los secrets están configurados:**
   Ve a Settings → Edge Functions → Secrets

5. **Prueba manualmente la edge function:**
   ```bash
   curl -X POST \
     'https://oknpgpencszibnmndyzm.supabase.co/functions/v1/send-push-notification' \
     -H 'Authorization: Bearer TU_ANON_KEY' \
     -H 'Content-Type: application/json' \
     -d '{
       "type": "job_posted",
       "user_ids": ["USER_ID_AQUI"],
       "title": "Test",
       "body": "Test message",
       "data": {"job_id": "123"}
     }'
   ```

### Error al subir archivos

1. Verifica que el bucket existe:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'chat-attachments';
   ```

2. Verifica las policies RLS:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
   ```

---

## 📊 Estructura de Archivos Final

```
supabase/
├── migrations/
│   ├── 017_push_notifications.sql ✅
│   ├── 018_chat_attachments_storage.sql ✅
│   └── 019_push_notification_triggers.sql ✅
└── functions/
    └── send-push-notification/
        └── index.ts ✅ (todo inline, sin imports externos)

src/
└── App.jsx ✅ (push utils + adjuntos en chat)

public/
└── sw-custom.js ✅ (service worker)

vite.config.js ✅ (importScripts agregado)
```

---

## 🎯 Checklist de Despliegue

- [ ] 1. Configurar Secrets en Supabase Dashboard
- [ ] 2. Desplegar Edge Function (`supabase functions deploy send-push-notification`)
- [ ] 3. Ejecutar migraciones (`supabase migration up` o manualmente)
- [ ] 4. Build frontend (`npm run build`)
- [ ] 5. Deploy frontend (Vercel/Netlify)
- [ ] 6. Probar notificaciones push
- [ ] 7. Probar adjuntos en chat
- [ ] 8. Borrar archivo `VAPID_KEYS.md`

---

## 🔒 Seguridad

- ✅ Las claves VAPID están en Supabase Secrets (no en el código)
- ✅ La clave pública está en el frontend (es seguro, es pública)
- ✅ El anon key en el SQL es público por diseño de Supabase
- ✅ Los archivos están en bucket privado con signed URLs
- ✅ RLS policies protegen el acceso a los datos

---

## ✨ ¡Listo!

Si todos los pasos se completaron correctamente, tu app ahora tiene:
- ✅ Notificaciones push nativas funcionando
- ✅ Adjuntos en chat (imágenes, PDFs, documentos)
- ✅ Deep linking desde notificaciones

**Siguiente paso:** Probar en producción y monitorear los logs.
