-- Extiende información pública de locales para mostrar perfil completo
alter table profiles add column if not exists menu_url text;
alter table profiles add column if not exists service_description text;

-- public_profiles es una vista en el entorno Supabase; recrear la vista con nuevos campos
drop view if exists public_profiles;
create or replace view public_profiles as
select
  id,
  user_type,
  full_name,
  avatar_url,
  city,
  staff_role,
  skills,
  bio,
  available,
  business_name,
  business_type,
  rating,
  total_reviews,
  reliability_score,
  total_shifts,
  verification_status,
  menu_url,
  service_description
from profiles;

-- Notificaciones automáticas por eventos clave

create or replace function notify_staff_on_new_job()
returns trigger as $$
begin
  insert into notifications (user_id, type, notification_type, title, body, data)
  select p.id, 'job_posted', 'job_posted',
    'Nueva oferta disponible',
    'Hay una nueva oferta para tu rol: ' || NEW.role_required,
    jsonb_build_object('job_id', NEW.id, 'local_id', NEW.local_id, 'role_required', NEW.role_required)
  from profiles p
  where p.user_type = 'staff'
    and p.staff_role = NEW.role_required;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_notify_staff_on_new_job on jobs;
create trigger trg_notify_staff_on_new_job
  after insert on jobs
  for each row execute function notify_staff_on_new_job();

create or replace function notify_on_message()
returns trigger as $$
begin
  insert into notifications (user_id, type, notification_type, title, body, data)
  values (
    NEW.receiver_id,
    'new_message',
    'new_message',
    'Nuevo mensaje',
    'Tienes un nuevo mensaje',
    jsonb_build_object('message_id', NEW.id, 'job_id', NEW.job_id, 'application_id', NEW.application_id, 'sender_id', NEW.sender_id)
  );

  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_notify_on_message on messages;
create trigger trg_notify_on_message
  after insert on messages
  for each row execute function notify_on_message();

create or replace function notify_on_application_status()
returns trigger as $$
declare
  v_job jobs%rowtype;
begin
  if NEW.status = 'accepted' and coalesce(OLD.status, '') <> 'accepted' then
    select * into v_job from jobs where id = NEW.job_id;

    insert into notifications (user_id, type, notification_type, title, body, data)
    values (
      NEW.staff_id,
      'application_accepted',
      'application_accepted',
      'Candidatura aceptada',
      'Tu candidatura ha sido aceptada por ' || coalesce(v_job.role_required::text, 'el local'),
      jsonb_build_object('job_id', NEW.job_id, 'local_id', v_job.local_id, 'application_id', NEW.id)
    );
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_notify_on_application_status on applications;
create trigger trg_notify_on_application_status
  after update of status on applications
  for each row execute function notify_on_application_status();
