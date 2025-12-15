# ⚡ Instrucciones Rápidas - Notificaciones Push

## 🎯 ¿Por qué no recibiste notificaciones?

**Los usuarios NO tienen suscripciones push activas en la base de datos.**

**NO puedes agregar suscripciones manualmente** - es una restricción de seguridad del navegador web. Cada usuario debe habilitar notificaciones desde su dispositivo.

---

## ✅ Lo que ya está implementado

✅ Push para nuevas ofertas (filtrado por rol)
✅ Push para mensajes de chat
✅ Push para aceptaciones de candidatura
✅ Push para rechazos de candidatura (**NUEVO**)
✅ Botón en el perfil para activar notificaciones (**NUEVO**)
✅ Selector de puesto en editor de perfil (**NUEVO**)

---

## 🚀 Pasos para activar

### 1. Ejecuta la migración actualizada

```bash
supabase migration up
```

O ejecuta manualmente en **Supabase Dashboard → SQL Editor**:
- Archivo: `supabase/migrations/019_push_notification_triggers.sql`

### 2. Deploy del frontend

```bash
npm run build
# Deploy a tu servidor
```

### 3. Cada usuario DEBE activar notificaciones

**Como Staff:**
1. Inicia sesión en la app
2. Click en **"Perfil"** (navegación inferior)
3. Verás un cuadro **naranja**: "⚠ Notificaciones Desactivadas"
4. Click en **"Activar Notificaciones"**
5. El navegador pide permiso → Click **"Permitir"**
6. El cuadro se pone **verde**: "✓ Notificaciones Activadas"

**Importante:**
- Cada usuario debe hacer esto desde SU dispositivo
- No se puede hacer manualmente desde la base de datos
- Es una restricción de seguridad del navegador web

---

## 🧪 Prueba

1. **Usuario 1 (Staff):** Activa notificaciones desde su perfil
2. **Usuario 2 (Local):** Publica oferta para el rol del staff
3. **Usuario 1:** Debería recibir notificación push ✅

Si no funciona, revisa:
- Permisos del navegador (no bloqueados)
- Logs de edge function: `supabase functions logs send-push-notification --tail`
- Suscripciones en DB: `SELECT * FROM push_subscriptions WHERE active = true;`

---

## 📝 Archivos modificados

- ✅ `supabase/migrations/019_push_notification_triggers.sql` - Push para rechazos habilitado
- ✅ `src/App.jsx` - Botón de notificaciones en perfil + selector de puesto

---

## 💡 Resumen

**No puedes agregar usuarios manualmente a push_subscriptions** porque:
- Requiere claves criptográficas que solo genera el navegador
- Requiere permiso explícito del usuario (restricción de seguridad)
- Cada dispositivo necesita su propia suscripción

**Solución:** Cada usuario activa notificaciones desde su perfil (1 click).

Lee `NOTIFICACIONES_PUSH_COMPLETO.md` para documentación completa.
