-- =============================================
-- EXTRAHOSTELERO - MIGRACION: STORAGE MULTI-LOCAL
-- Ajusta policies de storage.objects para permitir
-- que una misma cuenta gestione avatares de varios locales.
--
-- Nota: para aplicar estas policies necesitas ejecutar la migración
-- como owner (rol postgres/supabase_admin). En Supabase Dashboard
-- usa el SQL Editor con rol postgres, o aplica via `supabase db push`.
-- =============================================

-- Bucket avatars: lectura pública (bucket es public), escritura solo dueños
drop policy if exists "public read avatars" on storage.objects;
create policy "public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "owners manage avatars" on storage.objects;
create policy "owners manage avatars"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'avatars'
    and (
      auth.uid() = (regexp_match(name, '^([0-9a-fA-F-]{36})[\\/_-]'))[1]::uuid
      or public.is_local_owner((regexp_match(name, '^([0-9a-fA-F-]{36})[\\/_-]'))[1]::uuid)
    )
  )
  with check (
    bucket_id = 'avatars'
    and (
      auth.uid() = (regexp_match(name, '^([0-9a-fA-F-]{36})[\\/_-]'))[1]::uuid
      or public.is_local_owner((regexp_match(name, '^([0-9a-fA-F-]{36})[\\/_-]'))[1]::uuid)
    )
  );

-- Bucket cvs: sin cambios (los CV pertenecen al staff y siguen con id=auth.uid()).
