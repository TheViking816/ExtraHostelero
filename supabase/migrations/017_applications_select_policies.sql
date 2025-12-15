-- =============================================
-- EXTRAHOSTELERO - FIX: permitir leer candidaturas
-- Problema: `applications` tiene RLS habilitado pero faltaban policies de SELECT,
-- lo que hacía que los locales no vieran candidatos aunque existieran notificaciones.
-- =============================================

-- Locales: pueden ver candidaturas de sus ofertas (por job.local_id)
drop policy if exists "locals can read applications for their jobs" on applications;
create policy "locals can read applications for their jobs"
  on applications for select
  using (
    exists (
      select 1
      from jobs j
      where j.id = applications.job_id
        and public.is_local_owner(j.local_id)
    )
  );

-- Staff: pueden ver sus propias candidaturas
drop policy if exists "staff can read their own applications" on applications;
create policy "staff can read their own applications"
  on applications for select
  using (staff_id = auth.uid());

