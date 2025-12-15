# Instrucciones de Despliegue - Notificaciones Push y Adjuntos en Chat

## ✅ Implementación Completada

Se han implementado con éxito:
1. **Notificaciones Push del navegador** (Web Push API)
2. **Adjuntos de archivos en chat** (imágenes, PDFs, documentos)
3. **Deep linking** desde notificaciones
4. **Service Worker personalizado**

---

## 📋 Pasos de Despliegue

### 1. Ejecutar Migraciones de Base de Datos

En el Dashboard de Supabase, ve a **SQL Editor** y ejecuta en orden:

```bash
# Opción A: Desde Supabase CLI (recomendado)
supabase migration up

# Opción B: Ejecutar manualmente en SQL Editor
# Ejecuta los archivos en este orden:
```

1. `supabase/migrations/017_push_notifications.sql`
2. `supabase/migrations/018_chat_attachments_storage.sql`
3. `supabase/migrations/019_push_notification_triggers.sql`

### 2. Configurar Secrets en Supabase Edge Functions

Ve a **Supabase Dashboard → Settings → Edge Functions → Secrets** y agrega:

| Secret Name | Valor | Dónde obtenerlo |
|-------------|-------|-----------------|
| `VAPID_PUBLIC_KEY` | `BFD3EPrf6t6d-TVypeh-KHOvRsamoYwihZ9Ilb7uB20D5xlVQYVgfEoXgMT47g1arT0mOwvK-sgiuVsnKyDnylw` | Ya generado (ver VAPID_KEYS.md) |
| `VAPID_PRIVATE_KEY` | `RocoMB4HBNhjV3N6Rwena8SGmA1XMVbIcNMqcYjZk9Y` | Ya generado (ver VAPID_KEYS.md) |
| `SUPABASE_URL` | `https://tuproyecto.supabase.co` | Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `tu-service-role-key` | Settings → API → service_role key |
| `SUPABASE_ANON_KEY` | `tu-anon-key` | Settings → API → anon public key |
| `APP_URL` | `https://tudominio.com` | Tu URL de producción |

### 3. Configurar Variables de Base de Datos

Conecta a tu base de datos PostgreSQL en Supabase y ejecuta:

```sql
ALTER DATABASE postgres SET app.settings.supabase_functions_url = 'https://tuproyecto.supabase.co/functions/v1';
ALTER DATABASE postgres SET app.settings.supabase_anon_key = 'tu-anon-key';
```

Reemplaza `tuproyecto` y `tu-anon-key` con tus valores reales.

### 4. Desplegar Edge Functions

```bash
# Login a Supabase CLI (si no lo has hecho)
supabase login

# Enlazar proyecto
supabase link --project-ref tu-project-ref

# Desplegar la edge function
supabase functions deploy send-push-notification
```

### 5. Build y Deploy del Frontend

```bash
# Build la aplicación
npm run build

# Deploy a tu servicio (Vercel, Netlify, etc.)
# Por ejemplo, con Vercel:
vercel --prod
```

---

## 🧪 Testing

### Probar Notificaciones Push

1. **Registro de usuario:**
   - Inicia sesión en la app
   - Después de 10 segundos, debería aparecer un prompt pidiendo permiso para notificaciones
   - Acepta el permiso

2. **Probar nueva oferta de trabajo:**
   - Como local, publica un nuevo job
   - Los staff con el rol coincidente deberían recibir notificación push
   - Hacer click en la notificación debería abrir la app en esa oferta

3. **Probar mensajes de chat:**
   - Envía un mensaje desde un usuario a otro
   - El receptor debería recibir notificación push inmediata
   - Click en notificación abre el chat

4. **Probar aceptación de candidatura:**
   - Como local, acepta una solicitud de un staff
   - El staff debería recibir notificación push
   - Click abre la oferta aceptada

### Probar Adjuntos en Chat

1. **Imagen:**
   - Abre un chat
   - Click en el botón de imagen (icono de imagen a la izquierda)
   - Selecciona una imagen (JPG, PNG, WEBP)
   - La imagen debería subirse y mostrarse inline
   - Click en la imagen abre en nueva pestaña

2. **PDF/Documento:**
   - Selecciona un archivo PDF o Word (.docx)
   - Debería mostrarse con icono de archivo y tamaño
   - Click descarga el archivo

3. **Validaciones:**
   - Intenta subir archivo > 10MB → debería rechazarse
   - Intenta subir archivo no permitido (.exe, etc.) → debería rechazarse

---

## 🔍 Debugging

### Ver logs de Edge Functions

```bash
# Ver logs en tiempo real
supabase functions logs send-push-notification --tail
```

### Verificar push subscriptions en DB

```sql
SELECT * FROM push_subscriptions WHERE active = true;
```

### Verificar archivos subidos

```sql
SELECT * FROM messages WHERE message_type IN ('image', 'file') ORDER BY created_at DESC LIMIT 10;
```

### Problemas comunes

1. **No recibo notificaciones push:**
   - Verifica que los secrets están configurados correctamente
   - Verifica que la edge function está desplegada: `supabase functions list`
   - Verifica los logs: `supabase functions logs send-push-notification`
   - Asegúrate de que las variables de BD están configuradas (paso 3)

2. **Error al subir archivos:**
   - Verifica que el bucket `chat-attachments` existe en Storage
   - Verifica las policies RLS del bucket
   - Check los logs del navegador (F12 → Console)

3. **Deep linking no funciona:**
   - Verifica que el service worker está registrado (F12 → Application → Service Workers)
   - Verifica que `public/sw-custom.js` se está sirviendo correctamente

---

## 🔐 Seguridad

### ⚠️ IMPORTANTE:

1. **Borra el archivo `VAPID_KEYS.md`** después de configurar los secrets
2. **NO subas las claves privadas** a GitHub
3. Las claves ya están en el `.gitignore` implícito de Supabase Secrets
4. Si las claves se comprometen, regenera con: `npx web-push generate-vapid-keys`

---

## 📊 Monitoreo

### Métricas importantes a trackear:

1. **Push subscriptions activas:**
```sql
SELECT COUNT(*) FROM push_subscriptions WHERE active = true;
```

2. **Mensajes con adjuntos:**
```sql
SELECT
  message_type,
  COUNT(*) as count,
  AVG(attachment_size) as avg_size_bytes
FROM messages
WHERE message_type IN ('image', 'file')
GROUP BY message_type;
```

3. **Notificaciones enviadas (check edge function logs)**

---

## 📚 Archivos Modificados/Creados

### Nuevos archivos:
- `supabase/migrations/017_push_notifications.sql`
- `supabase/migrations/018_chat_attachments_storage.sql`
- `supabase/migrations/019_push_notification_triggers.sql`
- `supabase/functions/send-push-notification/index.ts`
- `supabase/functions/_shared/push-utils.ts`
- `public/sw-custom.js`
- `VAPID_KEYS.md` (BORRAR después de configurar)
- `DEPLOYMENT_INSTRUCTIONS.md` (este archivo)

### Archivos modificados:
- `src/App.jsx` - Push utils, prompt component, ChatView con adjuntos, deep linking
- `vite.config.js` - Importa service worker personalizado

---

## 🎉 ¡Listo!

Tu aplicación ahora tiene:
- ✅ Notificaciones push nativas del navegador
- ✅ Adjuntos de archivos en chat (imágenes, PDFs, documentos)
- ✅ Deep linking desde notificaciones
- ✅ Service Worker configurado

Si tienes problemas, revisa la sección de Debugging arriba.
