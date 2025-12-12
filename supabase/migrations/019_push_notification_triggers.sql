-- ============================================
-- Enhanced Triggers for Push Notifications
-- ============================================
-- Enhances existing notification triggers to also send push notifications via Edge Functions
-- IMPORTANTE: Antes de ejecutar este archivo, reemplaza:
--   'https://oknpgpencszibnmndyzm.supabase.co/functions/v1' con tu URL de Supabase Functions
--   'eyJhbG...' con tu SUPABASE_ANON_KEY (Settings → API → anon public)

-- Enhanced function to notify staff on new job AND send push notification
create or replace function notify_staff_on_new_job()
returns trigger as $$
declare
  v_staff_ids uuid[];
  v_job_type_label text;
begin
  -- Determine job type label for notification
  v_job_type_label := case
    when NEW.job_type = 'prueba' then 'prueba'
    else 'extra'
  end;

  -- Create in-app notifications (existing behavior)
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

  -- Collect staff IDs for push notification
  select array_agg(p.id) into v_staff_ids
  from profiles p
  where p.user_type = 'staff'
    and p.staff_role = NEW.role_required;

  -- Call edge function to send push notifications (async, non-blocking)
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

-- Enhanced function for message notifications with push
create or replace function notify_on_message()
returns trigger as $$
declare
  v_sender_name text;
begin
  -- Get sender name for notification
  select coalesce(business_name, full_name) into v_sender_name
  from profiles
  where id = NEW.sender_id;

  -- Create in-app notification
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

  -- Send push notification
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

-- Enhanced function for application status with push
create or replace function notify_on_application_status()
returns trigger as $$
declare
  v_job jobs%rowtype;
  v_local_name text;
begin
  if NEW.status = 'accepted' and coalesce(OLD.status, '') <> 'accepted' then
    select * into v_job from jobs where id = NEW.job_id;
    select coalesce(business_name, full_name) into v_local_name from profiles where id = v_job.local_id;

    -- In-app notification
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

    -- Push notification
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

    -- In-app notification for rejection
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

    -- Push notification for rejection
    perform net.http_post(
      'https://oknpgpencszibnmndyzm.supabase.co/functions/v1/send-push-notification',
      jsonb_build_object(
        'type', 'application_rejected',
        'user_ids', array[NEW.staff_id],
        'title', 'Candidatura no seleccionada',
        'body', 'Tu candidatura para ' || coalesce(v_local_name, 'el local') || ' no ha sido seleccionada',
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
  end if;

  return NEW;
end;
$$ language plpgsql;

-- Note: The triggers already exist from migration 004_local_profile_extensions.sql
-- They will automatically use these updated functions
-- No need to recreate the triggers themselves
