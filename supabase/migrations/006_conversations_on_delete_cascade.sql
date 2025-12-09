-- Limpieza de conversaciones sin job (evita conflictos en índice único al borrar jobs)
delete from conversations where job_id is null;

-- Ajustar FK de conversations.job_id para que elimine en cascada al borrar un job
alter table conversations drop constraint if exists conversations_job_id_fkey;
alter table conversations
  add constraint conversations_job_id_fkey
  foreign key (job_id) references jobs(id)
  on delete cascade;
