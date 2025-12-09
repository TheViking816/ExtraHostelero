-- Soluciona bloqueo por trigger: se elimina temporalmente antes de alterar el tipo

-- Guardar referencia del trigger y función de notificación
drop trigger if exists trg_notify_on_application_status on applications;

-- Alterar columna status a TEXT con default y constraint
alter table applications alter column status drop default;
alter table applications alter column status type text using status::text;
alter table applications alter column status set default 'pending';
alter table applications drop constraint if exists applications_status_not_empty;
alter table applications drop constraint if exists applications_status_allowed;
alter table applications
  add constraint applications_status_allowed
  check (status in ('pending','accepted','rejected','withdrawn'));

-- Limpiar datos fuera del set permitido
update applications
set status = 'pending'
where status not in ('pending','accepted','rejected','withdrawn');

-- Re-crear trigger de notificación de status
create trigger trg_notify_on_application_status
  after update of status on applications
  for each row execute function notify_on_application_status();
