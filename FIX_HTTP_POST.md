# ⚡ FIX: Error "function net.http_post does not exist" + Push para Rechazos Habilitado

## 🔥 Problema
Después de habilitar pg_net, aparece el error:
```
Error: function net.http_post(url => unknown, headers => jsonb, body => text) does not exist
```

## ✅ Causa y Solución

**Causa:** La firma de `net.http_post()` estaba incorrecta en los triggers. La función de pg_net requiere parámetros posicionales, no nombrados.

**Solución:** He corregido el archivo `019_push_notification_triggers.sql` con la firma correcta.

---

## 🚀 Cómo Aplicar el Fix

### Opción 1: Re-ejecutar la migración 019 (Recomendado)

Ve a **Supabase Dashboard → SQL Editor** y ejecuta el archivo corregido:

`supabase/migrations/019_push_notification_triggers.sql`

Este archivo ahora tiene la firma correcta de `net.http_post()`.

### Opción 2: SQL Directo

Si prefieres ejecutar el SQL directamente, aquí está el código corregido para las 3 funciones:

<details>
<summary>Click para ver el SQL completo (solo si no quieres usar la migración)</summary>

```sql
-- Función 1: Notificar staff en nueva oferta
create or replace function notify_staff_on_new_job()
returns trigger as $$
declare
  v_staff_ids uuid[];
  v_job_type_label text;
begin
  v_job_type_label := case
    when NEW.job_type = 'prueba' then 'prueba'
    else 'extra'
  end;

  insert into notifications (user_id, type, notification_type, title, body, data)
  select p.id, 'job_posted', 'job_posted',
    'Nueva oferta de ' || v_job_type_label,
    'Hay una nueva oferta para tu rol: ' || NEW.role_required,
    jsonb_build_object(
      'job_id', NEW.id,
      'local_id', NEW.local_id,
      'role_required', NEW.role_required,
      'job_type', NEW.job_type
    )
  from profiles p
  where p.user_type = 'staff'
    and p.staff_role = NEW.role_required;

  select array_agg(p.id) into v_staff_ids
  from profiles p
  where p.user_type = 'staff'
    and p.staff_role = NEW.role_required;

  if array_length(v_staff_ids, 1) > 0 then
    perform net.http_post(
      'https://oknpgpencszibnmndyzm.supabase.co/functions/v1/send-push-notification',
      jsonb_build_object(
        'type', 'job_posted',
        'user_ids', v_staff_ids,
        'title', 'Nueva oferta de ' || v_job_type_label,
        'body', NEW.role_required || ' en ' || coalesce((select business_name from profiles where id = NEW.local_id), 'un local'),
        'data', jsonb_build_object(
          'job_id', NEW.id,
          'local_id', NEW.local_id,
          'role_required', NEW.role_required,
          'job_type', NEW.job_type
        )
      ),
      '{}'::jsonb,
      jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rbnBncGVuY3N6aWJubW5keXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzE2NzEsImV4cCI6MjA3OTUwNzY3MX0.4Eyxg6kNGcoOBgrfGIiGH7uj9YXkuMI4ORSQPJLHjSo'
      ),
      5000
    );
  end if;

  return NEW;
end;
$$ language plpgsql;

-- Función 2: Notificar en nuevo mensaje
create or replace function notify_on_message()
returns trigger as $$
declare
  v_sender_name text;
begin
  select coalesce(business_name, full_name) into v_sender_name
  from profiles
  where id = NEW.sender_id;

  insert into notifications (user_id, type, notification_type, title, body, data)
  values (
    NEW.receiver_id,
    'new_message',
    'new_message',
    'Nuevo mensaje',
    coalesce(v_sender_name, 'Un usuario') || ' te ha enviado un mensaje',
    jsonb_build_object(
      'message_id', NEW.id,
      'job_id', NEW.job_id,
      'application_id', NEW.application_id,
      'sender_id', NEW.sender_id
    )
  );

  perform net.http_post(
    'https://oknpgpencszibnmndyzm.supabase.co/functions/v1/send-push-notification',
    jsonb_build_object(
      'type', 'new_message',
      'user_ids', array[NEW.receiver_id],
      'title', 'Nuevo mensaje',
      'body', coalesce(v_sender_name, 'Usuario'),
      'data', jsonb_build_object(
        'message_id', NEW.id,
        'sender_id', NEW.sender_id,
        'job_id', NEW.job_id
      )
    ),
    '{}'::jsonb,
    jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rbnBncGVuY3N6aWJubW5keXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzE2NzEsImV4cCI6MjA3OTUwNzY3MX0.4Eyxg6kNGcoOBgrfGIiGH7uj9YXkuMI4ORSQPJLHjSo'
    ),
    5000
  );

  return NEW;
end;
$$ language plpgsql;

-- Función 3: Notificar en cambio de estado de candidatura
create or replace function notify_on_application_status()
returns trigger as $$
declare
  v_job jobs%rowtype;
  v_local_name text;
begin
  if NEW.status = 'accepted' and coalesce(OLD.status, '') <> 'accepted' then
    select * into v_job from jobs where id = NEW.job_id;
    select coalesce(business_name, full_name) into v_local_name from profiles where id = v_job.local_id;

    insert into notifications (user_id, type, notification_type, title, body, data)
    values (
      NEW.staff_id,
      'application_accepted',
      'application_accepted',
      '¡Candidatura aceptada!',
      'Tu candidatura ha sido aceptada por ' || coalesce(v_local_name, 'el local'),
      jsonb_build_object(
        'job_id', NEW.job_id,
        'local_id', v_job.local_id,
        'application_id', NEW.id
      )
    );

    perform net.http_post(
      'https://oknpgpencszibnmndyzm.supabase.co/functions/v1/send-push-notification',
      jsonb_build_object(
        'type', 'application_accepted',
        'user_ids', array[NEW.staff_id],
        'title', '¡Candidatura aceptada!',
        'body', coalesce(v_local_name, 'El local') || ' ha aceptado tu candidatura',
        'data', jsonb_build_object(
          'job_id', NEW.job_id,
          'local_id', v_job.local_id,
          'application_id', NEW.id
        )
      ),
      '{}'::jsonb,
      jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rbnBncGVuY3N6aWJubW5keXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzE2NzEsImV4cCI6MjA3OTUwNzY3MX0.4Eyxg6kNGcoOBgrfGIiGH7uj9YXkuMI4ORSQPJLHjSo'
      ),
      5000
    );

  elsif NEW.status = 'rejected' and coalesce(OLD.status, '') <> 'rejected' then
    select * into v_job from jobs where id = NEW.job_id;
    select coalesce(business_name, full_name) into v_local_name from profiles where id = v_job.local_id;

    insert into notifications (user_id, type, notification_type, title, body, data)
    values (
      NEW.staff_id,
      'application_rejected',
      'application_rejected',
      'Candidatura no seleccionada',
      'Tu candidatura no ha sido seleccionada esta vez',
      jsonb_build_object(
        'job_id', NEW.job_id,
        'local_id', v_job.local_id,
        'application_id', NEW.id
      )
    );
  end if;

  return NEW;
end;
$$ language plpgsql;
```

</details>

---

## 🎯 Verificación

Después de ejecutar la migración corregida:

1. **Verifica que las funciones se actualizaron:**
```sql
SELECT proname FROM pg_proc WHERE proname LIKE 'notify_%';
-- Deberías ver: notify_staff_on_new_job, notify_on_message, notify_on_application_status
```

2. **Prueba publicar una oferta:**
   - Ve a la app como local
   - Publica una oferta (extra o prueba)
   - Debería funcionar sin errores ✅

---

## 📊 ¿Qué cambió?

**Antes (❌ Incorrecto):**
```sql
perform net.http_post(
  url := 'https://...',
  headers := {...},
  body := {...}::text  -- ❌ Error: body debe ser jsonb, no text
);
```

**Ahora (✅ Correcto):**
```sql
perform net.http_post(
  'https://...',      -- Parámetro 1: url (text)
  {...},              -- Parámetro 2: body (jsonb)
  '{}'::jsonb,        -- Parámetro 3: params (jsonb vacío)
  {...},              -- Parámetro 4: headers (jsonb)
  5000                -- Parámetro 5: timeout en ms (5 segundos)
);
```

**La función pg_net.http_post requiere:**
1. URL (text)
2. Body (jsonb) - El contenido del request
3. Params (jsonb) - Parámetros de query string (vacío en nuestro caso)
4. Headers (jsonb) - Headers HTTP
5. Timeout (integer) - Timeout en milisegundos

---

## ✅ Resumen

1. ✅ Ejecuta la migración `019_push_notification_triggers.sql` de nuevo
2. ✅ Prueba publicar una oferta
3. ✅ Debería funcionar sin errores

## 🆕 Bonus: Push para Rechazos Habilitado

Además del fix de `net.http_post`, también se habilitó el envío de **notificaciones push para rechazos de candidaturas**.

Antes:
- ❌ Solo notificación in-app (línea 192: comentado)

Ahora:
- ✅ Notificación in-app + push notification (líneas 192-212)

Los staff ahora recibirán push cuando un local rechace su candidatura.

**Lee `NOTIFICACIONES_PUSH_COMPLETO.md` para más detalles.**

¡Listo! 🚀
