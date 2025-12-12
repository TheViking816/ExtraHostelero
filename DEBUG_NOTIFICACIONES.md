# 🔍 Debug - Notificaciones Push

## Problema Actual

Al hacer click en "Activar Notificaciones":
- Se queda pensando ~10 segundos
- Recarga la página
- No se registra en `push_subscriptions`
- No aparece en logs de edge function

## ✅ Cambios Aplicados

1. ✅ Corregido `checkPushSubscriptionStatus()` - ahora devuelve `.subscribed` correctamente
2. ✅ Agregados logs detallados en `subscribeToPushNotifications()`
3. ✅ Corregido `upsert` con `onConflict: 'endpoint'`
4. ✅ Agregados logs en `handleEnablePushNotifications()`

## 🧪 Pasos para Depurar

### 1. Build de Producción (IMPORTANTE)

**⚠️ El Service Worker NO funciona en modo desarrollo (`npm run dev`)**

Debes hacer build y servir en producción:

```bash
# Build
npm run build

# Previsualizar build localmente
npm run preview

# O deploy a producción
```

### 2. Abrir Consola del Navegador

1. Presiona **F12** (Chrome/Edge) o **Cmd+Option+I** (Mac)
2. Ve a la pestaña **"Console"**
3. Click en "Activar Notificaciones"
4. Observa los logs

**Deberías ver:**
```
[subscribeToPushNotifications] Starting for userId: xxxx
[subscribeToPushNotifications] Requesting notification permission...
[subscribeToPushNotifications] Permission result: granted
[subscribeToPushNotifications] Getting service worker registration...
[subscribeToPushNotifications] Service worker ready: [object]
[subscribeToPushNotifications] Subscribing to push manager...
[subscribeToPushNotifications] Push subscription created: [object]
[subscribeToPushNotifications] Subscription data: {endpoint: "...", keys: {...}}
[subscribeToPushNotifications] Saving to database...
[subscribeToPushNotifications] Saved to database: [...]
[subscribeToPushNotifications] SUCCESS!
```

### 3. Verificar Service Worker

En la consola del navegador:

**Pestaña "Application" (Chrome) o "Almacenamiento" (Firefox):**
1. Ve a **Service Workers** (panel izquierdo)
2. Deberías ver un service worker registrado para tu dominio
3. Estado: **activated and is running**

**Si no hay service worker:**
- Asegúrate de haber hecho `npm run build`
- Verifica que `vite.config.js` tenga `VitePWA` configurado
- El service worker solo funciona en HTTPS o localhost

### 4. Revisar Errores Comunes

#### Error: "Service worker registration failed"
**Causa:** No has hecho build o estás en modo desarrollo
**Solución:** `npm run build && npm run preview`

#### Error: "DOMException: Registration failed"
**Causa:** El navegador bloqueó el service worker
**Solución:**
1. Chrome: `chrome://settings/content/notifications`
2. Asegúrate de que el sitio NO esté bloqueado

#### Error: "Registration failed - no active Service Worker"
**Causa:** El archivo `sw-custom.js` no se encontró o no se importó
**Solución:**
- Verifica que `public/sw-custom.js` existe
- Verifica que `vite.config.js` tenga `importScripts: ['sw-custom.js']`

#### Error de base de datos: "new row violates row-level security"
**Causa:** Las RLS policies no permiten insert
**Solución:**
```sql
-- Verifica en Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'push_subscriptions';
```

### 5. Verificar en Supabase

**Tabla push_subscriptions:**
```sql
SELECT * FROM push_subscriptions WHERE user_id = 'TU_USER_ID';
```

Si no hay filas, el insert falló.

**Verificar RLS:**
```sql
-- Debe mostrar las 4 policies (select, insert, update, delete)
SELECT * FROM pg_policies WHERE tablename = 'push_subscriptions';
```

### 6. Probar Manualmente la Función

En la consola del navegador:

```javascript
// Test 1: Verificar VAPID key
console.log('VAPID Key:', VAPID_PUBLIC_KEY);

// Test 2: Verificar Service Worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Registrations:', registrations);
});

// Test 3: Verificar permisos
console.log('Notification permission:', Notification.permission);

// Test 4: Solicitar permiso manualmente
Notification.requestPermission().then(permission => {
  console.log('Permission:', permission);
});
```

## 🎯 Checklist de Verificación

Antes de probar notificaciones, asegúrate de que:

- [ ] Has ejecutado `npm run build` (NO `npm run dev`)
- [ ] Estás sirviendo desde `npm run preview` o producción
- [ ] El navegador está en HTTPS o localhost
- [ ] Las notificaciones NO están bloqueadas en el navegador
- [ ] La migración 017 se ejecutó correctamente en Supabase
- [ ] El archivo `public/sw-custom.js` existe
- [ ] El `vite.config.js` tiene `importScripts: ['sw-custom.js']`
- [ ] La VAPID_PUBLIC_KEY en App.jsx es correcta

## 🔧 Script de Test Completo

Copia y pega esto en la consola del navegador (después de hacer build):

```javascript
async function testPushNotifications() {
  console.log('=== PUSH NOTIFICATION TEST ===');

  // 1. Verificar soporte
  console.log('1. Service Worker supported:', 'serviceWorker' in navigator);
  console.log('2. Push Manager supported:', 'PushManager' in window);
  console.log('3. Notification API supported:', 'Notification' in window);

  // 2. Verificar permisos
  console.log('4. Current permission:', Notification.permission);

  // 3. Verificar service worker
  const registrations = await navigator.serviceWorker.getRegistrations();
  console.log('5. Service Worker registrations:', registrations);

  if (registrations.length === 0) {
    console.error('❌ NO SERVICE WORKER REGISTERED!');
    console.log('Solution: npm run build && npm run preview');
    return;
  }

  // 4. Verificar suscripción existente
  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();
  console.log('6. Existing subscription:', existingSubscription);

  // 5. Verificar VAPID key
  console.log('7. VAPID_PUBLIC_KEY defined:', typeof VAPID_PUBLIC_KEY !== 'undefined');

  console.log('=== TEST COMPLETE ===');
}

testPushNotifications();
```

## 📊 Resultado Esperado

Después de hacer build y probar:

**Consola del navegador:**
```
[subscribeToPushNotifications] SUCCESS!
✅ Notificaciones habilitadas! Recibirás alertas...
```

**Supabase (push_subscriptions):**
| user_id | endpoint | p256dh | auth | active |
|---------|----------|--------|------|--------|
| xxx-xxx | https://... | XXXX | XXXX | true |

**Application → Service Workers:**
- ✅ Service Worker: activated and is running
- ✅ Status: #1 is activated

## 🚨 Si Sigue Sin Funcionar

1. **Abre una ventana de incógnito** (Ctrl+Shift+N)
2. **Accede a la app en modo producción** (no dev)
3. **Abre la consola (F12)**
4. **Prueba de nuevo**

Esto eliminará cualquier caché o estado corrupto del service worker.

## 💡 Solución Rápida

```bash
# 1. Limpia todo
rm -rf node_modules dist .vite

# 2. Reinstala
npm install

# 3. Build
npm run build

# 4. Prueba localmente
npm run preview

# 5. Abre http://localhost:4173 en navegador
# 6. Abre consola (F12)
# 7. Click en "Activar Notificaciones"
# 8. Revisa los logs
```

---

**Si después de seguir TODOS estos pasos aún no funciona, copia los logs de la consola del navegador y compártelos.**
