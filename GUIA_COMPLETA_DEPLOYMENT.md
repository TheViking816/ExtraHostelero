# 🚀 Guía Completa de Deployment - Notificaciones Push

## 📋 Resumen

Has implementado un sistema completo de notificaciones push con:
- ✅ Backend Node.js en Vercel (maneja el envío real de push)
- ✅ Edge Function en Supabase (relay/proxy a Vercel)
- ✅ Frontend con botones para habilitar/deshabilitar notificaciones
- ✅ Triggers DB que disparan notificaciones automáticamente

---

## 🔥 IMPORTANTE: Por Qué Necesitas el Backend Separado

La librería `web-push` **NO funciona en Supabase Edge Functions (Deno)** porque usa módulos de Node.js.

**Solución:** Backend Node.js en Vercel → Funciona perfectamente.

---

## 📦 Parte 1: Deploy del Backend Node.js en Vercel

### Paso 1.1: Crear Repositorio en GitHub

```bash
# Navega a la carpeta del backend
cd backend-push

# Inicializa git
git init
git add .
git commit -m "Initial commit - Push notification backend"
git branch -M main

# Crea un nuevo repositorio en GitHub (https://github.com/new)
# Nombre sugerido: extrahostelero-push-backend

# Conecta con GitHub
git remote add origin https://github.com/TU_USUARIO/extrahostelero-push-backend.git
git push -u origin main
```

### Paso 1.2: Conectar Repositorio con Vercel

1. Ve a https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. **"Import Git Repository"**
4. Selecciona tu repositorio `extrahostelero-push-backend`
5. Click **"Import"**
6. Vercel detectará automáticamente que es un proyecto Node.js

### Paso 1.3: Configurar Variables de Entorno en Vercel

**MUY IMPORTANTE:** Antes de deployar, configura las variables de entorno:

1. En Vercel, click en **"Settings"** → **"Environment Variables"**
2. Agrega las siguientes variables:

| Variable Name | Value |
|---------------|-------|
| `VAPID_PUBLIC_KEY` | `BFD3EPrf6t6d-TVypeh-KHOvRsamoYwihZ9Ilb7uB20D5xlVQYVgfEoXgMT47g1arT0mOwvK-sgiuVsnKyDnylw` |
| `VAPID_PRIVATE_KEY` | `RocoMB4HBNhjV3N6Rwena8SGmA1XMVbIcNMqcYjZk9Y` |
| `SUPABASE_URL` | `https://oknpgpencszibnmndyzm.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Tu service_role key** (⚠️ Ve a Supabase Dashboard → Settings → API → service_role) |
| `APP_URL` | Tu URL de producción (ej: `https://tudominio.com`) |

3. Click **"Save"** en cada variable

### Paso 1.4: Deploy

1. Click **"Deploy"**
2. Espera ~1 minuto
3. Verás **"Deployment Successful"**
4. **Copia la URL del deployment** (ejemplo: `https://extrahostelero-push-backend.vercel.app`)

**⚠️ GUARDA ESTA URL - la necesitarás en el siguiente paso**

---

## 🔧 Parte 2: Configurar Supabase Edge Function

### Paso 2.1: Agregar Secret en Supabase

1. Ve a **Supabase Dashboard** → **Settings** → **Edge Functions** → **Secrets**
2. Click **"Add Secret"**
3. Nombre: `PUSH_BACKEND_URL`
4. Valor: `https://TU-PROYECTO.vercel.app/api/send-push`
   - ⚠️ **Reemplaza `TU-PROYECTO`** con tu URL de Vercel del paso anterior
   - ⚠️ **IMPORTANTE:** Asegúrate de que termine en `/api/send-push`
5. Click **"Save"**

### Paso 2.2: Redesplegar Edge Function

```bash
# Desde la raíz del proyecto ExtraHostelero
supabase functions deploy send-push-notification
```

**Verifica los logs:**
```bash
supabase functions logs send-push-notification --tail
```

Deberías ver: `[Edge Relay] Forwarding job_posted to X user(s)`

---

## 📱 Parte 3: Deploy del Frontend

### Paso 3.1: Build de Producción

```bash
# Desde la raíz del proyecto
npm run build
```

### Paso 3.2: Probar Localmente

```bash
npm run preview
```

Abre http://localhost:4173 y:
1. Inicia sesión como staff
2. Ve a **Perfil**
3. Click en **"Activar Notificaciones"**
4. Acepta el permiso del navegador
5. Debería mostrar **"✓ Notificaciones Activadas"** (verde)

### Paso 3.3: Deploy a Producción

Según dónde tengas desplegada tu app:

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

**Otro:**
- Sube la carpeta `dist/` a tu servidor

---

## ✅ Parte 4: Verificación Completa

### Test 1: Verificar Backend Vercel

```bash
curl -X POST https://TU-PROYECTO.vercel.app/api/send-push \
  -H "Content-Type: application/json" \
  -d '{
    "type": "job_posted",
    "user_ids": ["USER_ID_PRUEBA"],
    "title": "Test",
    "body": "Prueba de notificación",
    "data": {"job_id": "123"}
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "sent": 0,
  "expired": 0,
  "errors": 0
}
```

Si `sent` es 0, es normal si el usuario no tiene notificaciones habilitadas.

### Test 2: Habilitar Notificaciones (Staff)

1. Abre la app como **Staff**
2. Ve a **Perfil**
3. Click en **"Activar Notificaciones"**
4. Acepta el permiso del navegador
5. Verifica que el cuadro se pone **verde**

### Test 3: Verificar en Supabase

```sql
-- Deberías ver una fila con active = true
SELECT * FROM push_subscriptions WHERE user_id = 'TU_USER_ID';
```

### Test 4: Publicar Oferta (Local)

1. Abre otra sesión/navegador como **Local**
2. Publica una oferta de **"Encargado"** (o el rol que tenga el staff de prueba)
3. El staff debería recibir **notificación push** ✅

**Verifica los logs:**

**Supabase Edge Function:**
```bash
supabase functions logs send-push-notification --tail
```

Deberías ver: `[Edge Relay] Forwarding job_posted to 1 user(s)`

**Vercel Backend:**
Ve a Vercel Dashboard → tu proyecto → **Logs**

Deberías ver:
```
[Push Backend] Sending job_posted to 1 user(s)
[Push Backend] Sending to 1 subscription(s) for user xxx
[Push Backend] Results: 1 sent, 0 expired, 0 errors
```

### Test 5: Deshabilitar Notificaciones

1. Como staff, ve a **Perfil**
2. Click en **"Deshabilitar Notificaciones"**
3. Confirma en el diálogo
4. Verifica que el cuadro se pone **naranja**

**Verifica en Supabase:**
```sql
-- No debería haber filas (o todas con active = false)
SELECT * FROM push_subscriptions WHERE user_id = 'TU_USER_ID' AND active = true;
```

---

## 🎯 Checklist Final

- [ ] Backend Node.js desplegado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] URL del backend copiada y guardada
- [ ] Secret `PUSH_BACKEND_URL` agregado en Supabase
- [ ] Edge Function redesplegada en Supabase
- [ ] Frontend con build de producción (`npm run build`)
- [ ] Probado en modo preview (`npm run preview`)
- [ ] Frontend desplegado a producción
- [ ] Test: Usuario puede habilitar notificaciones
- [ ] Test: Usuario recibe push al publicar oferta
- [ ] Test: Usuario puede deshabilitar notificaciones
- [ ] Test: Logs de Vercel muestran envíos exitosos
- [ ] Migración 019 ejecutada en Supabase (triggers con push para rechazos)

---

## 📊 Arquitectura Final

```
┌─────────────────────────────────────────────────┐
│  Frontend (React PWA)                          │
│  - Botón: Activar/Deshabilitar Notificaciones │
│  - Service Worker registrado                   │
│  - VAPID_PUBLIC_KEY                            │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ (subscribe/unsubscribe)
┌─────────────────────────────────────────────────┐
│  Supabase Database                             │
│  - push_subscriptions table                    │
│  - RLS policies                                │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ (on INSERT/UPDATE en jobs/messages/applications)
┌─────────────────────────────────────────────────┐
│  Supabase Triggers (DB)                        │
│  - notify_staff_on_new_job()                   │
│  - notify_on_message()                         │
│  - notify_on_application_status()              │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ (HTTP POST via net.http_post)
┌─────────────────────────────────────────────────┐
│  Supabase Edge Function (Deno)                 │
│  - send-push-notification                      │
│  - RELAY/PROXY (no envía push directamente)    │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ (HTTP POST a Vercel)
┌─────────────────────────────────────────────────┐
│  Backend Node.js (Vercel)                      │
│  - /api/send-push                              │
│  - Usa web-push library                        │
│  - Lee subscriptions de Supabase               │
│  - Envía push con VAPID                        │
│  - Marca subscripciones expiradas              │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ (Web Push Protocol)
┌─────────────────────────────────────────────────┐
│  Navegador del Usuario                         │
│  - Service Worker recibe push                  │
│  - Muestra notificación                        │
│  - Deep linking al hacer click                 │
└─────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Error: "PUSH_BACKEND_URL is not defined"
**Solución:** Asegúrate de agregar el secret en Supabase Dashboard → Edge Functions → Secrets

### Error: "fetch failed" en Edge Function
**Solución:** Verifica que la URL del backend Vercel esté correcta y termine en `/api/send-push`

### Error: "VAPID_PUBLIC_KEY is not defined" en Vercel
**Solución:** Ve a Vercel Dashboard → Settings → Environment Variables y verifica que todas las variables estén configuradas

### Error: "No active subscriptions"
**Solución:** El usuario debe habilitar notificaciones desde su perfil primero

### Notificación no llega
1. Verifica logs de Supabase Edge Function
2. Verifica logs de Vercel Backend
3. Verifica que el usuario tiene `active = true` en `push_subscriptions`
4. Verifica que el navegador tiene permisos de notificación

### Build de frontend falla
**Solución:** Asegúrate de haber ejecutado `npm run build` (NO `npm run dev`) antes de desplegar

---

## 🎉 ¡Listo!

Ahora tienes un sistema completo de notificaciones push funcionando:

✅ Usuarios pueden habilitar/deshabilitar notificaciones desde su perfil
✅ Notificaciones se envían automáticamente cuando:
  - Un local publica una oferta
  - Llega un nuevo mensaje de chat
  - Una candidatura es aceptada
  - Una candidatura es rechazada
✅ Deep linking: Al hacer click en la notificación, se abre la app en la página correcta
✅ Subscripciones expiradas se marcan automáticamente como inactivas

---

## 📄 Archivos Creados/Modificados

### Nuevos:
- `backend-push/package.json`
- `backend-push/api/send-push.js`
- `backend-push/vercel.json`
- `backend-push/.env.example`
- `backend-push/README.md`

### Modificados:
- `supabase/functions/send-push-notification/index.ts` (ahora es relay)
- `supabase/migrations/019_push_notification_triggers.sql` (push para rechazos habilitado)
- `src/App.jsx` (botón habilitar/deshabilitar + logs mejorados)

---

**¿Problemas?** Revisa los logs:
- Vercel: https://vercel.com/TU-USUARIO/tu-proyecto/logs
- Supabase: `supabase functions logs send-push-notification --tail`
- Frontend: Consola del navegador (F12)
