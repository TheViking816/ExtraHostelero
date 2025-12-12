-- =============================================
-- EXTRAHOSTELERO - MIGRACION: FIX FK MULTI-LOCAL
-- profiles.id ya no debe referenciar auth.users(id).
-- Se mueve la FK a profiles.auth_user_id.
-- =============================================

-- Quitar FK legacy que obliga profiles.id = auth.users.id
alter table profiles
  drop constraint if exists profiles_id_fkey;

-- Añadir FK correcta sobre auth_user_id
alter table profiles
  add constraint profiles_auth_user_id_fkey
  foreign key (auth_user_id)
  references auth.users(id)
  on delete cascade;

