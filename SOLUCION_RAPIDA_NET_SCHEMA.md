# ⚠️ SOLUCIÓN RÁPIDA: Error "schema net does not exist"

## 🔥 Problema
Al intentar publicar una oferta (extra o prueba) como local, aparece el error:
```
Error: schema "net" does not exist
```

## ✅ Solución en 2 Pasos

### Paso 1: Habilitar la extensión pg_net

Ve a **Supabase Dashboard → SQL Editor** y ejecuta este SQL:

```sql
-- Habilitar la extensión pg_net
create extension if not exists pg_net with schema extensions;

-- Dar permisos necesarios
grant usage on schema net to postgres, anon, authenticated, service_role;
grant all on all tables in schema net to postgres, anon, authenticated, service_role;
grant all on all routines in schema net to postgres, anon, authenticated, service_role;
grant all on all sequences in schema net to postgres, anon, authenticated, service_role;

alter default privileges in schema net grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema net grant all on routines to postgres, anon, authenticated, service_role;
alter default privileges in schema net grant all on sequences to postgres, anon, authenticated, service_role;
```

**O ejecuta la migración completa:**
- Archivo: `supabase/migrations/016_enable_pg_net.sql`

### Paso 2: Prueba de nuevo

Intenta publicar una oferta (extra o prueba) como local. Ahora debería funcionar sin errores.

---

## 🔍 ¿Por qué sucede esto?

La extensión `pg_net` proporciona la función `net.http_post()` que utilizan los triggers de la base de datos para enviar notificaciones push a través de la Edge Function.

Sin esta extensión habilitada, los triggers fallan cuando intentan llamar a `net.http_post()`.

---

## ⚠️ Error Adicional: "Invalid Refresh Token"

Si también ves el error:
```
AuthApiError: Invalid Refresh Token: Refresh Token Not Found
```

**Solución simple:**
1. Cierra sesión en la app
2. Vuelve a iniciar sesión
3. Listo

Este es un error normal de autenticación que se resuelve reiniciando sesión.

---

## ✅ Verificación

Después de ejecutar el SQL, verifica que la extensión está habilitada:

```sql
-- Verifica que pg_net está habilitada
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- Debería devolver una fila con el nombre 'pg_net'
```

---

## 📋 Orden Correcto de Migraciones

Asegúrate de ejecutar las migraciones en este orden:

1. ✅ `016_enable_pg_net.sql` ← **PRIMERO** (habilita pg_net)
2. ✅ `017_push_notifications.sql` (tabla push_subscriptions)
3. ✅ `018_chat_attachments_storage.sql` (bucket adjuntos)
4. ✅ `019_push_notification_triggers.sql` (triggers con http_post)

Si ejecutaste las migraciones en desorden, no hay problema. Solo ejecuta la 016 ahora y todo funcionará.

---

## 🎯 Resumen

```bash
# 1. Ejecutar SQL en Supabase Dashboard
create extension if not exists pg_net with schema extensions;
grant usage on schema net to postgres, anon, authenticated, service_role;

# 2. Cerrar sesión y volver a iniciar en la app

# 3. Publicar oferta → Debería funcionar ✅
```

¡Listo! 🚀
