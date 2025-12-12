-- =============================================
-- EXTRAHOSTELERO - MIGRACION: CONVERSATIONS INSERT POLICY
-- Permite crear conversaciones para chat directo (job_id opcional).
-- =============================================

alter table conversations enable row level security;

drop policy if exists "participants can create conversations" on conversations;
create policy "participants can create conversations"
  on conversations for insert
  to authenticated
  with check (
    staff_id = auth.uid()
    or public.is_local_owner(local_id)
  );

