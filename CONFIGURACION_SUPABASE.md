# Configuración de Supabase Storage - Bucket de Avatars

## Resumen

La app permite subir avatares de perfil. Con soporte **multi‑local**, una misma cuenta puede gestionar los avatares de varios locales, por lo que las policies deben validar la propiedad del perfil del archivo.

## Opción 1: Crear bucket con SQL (recomendado)

### Paso 1: Ejecutar SQL
1. Ve a tu proyecto en Supabase Dashboard
2. En el menú lateral, selecciona **SQL Editor**
3. Crea una nueva query
4. Copia y pega:

```sql
-- Crear el bucket 'avatars'
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- MULTI-LOCAL: policies recomendadas
-- (No hace falta ALTER TABLE; storage.objects ya tiene RLS activado.)

-- Lectura pública
drop policy if exists "public read avatars" on storage.objects;
create policy "public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Escritura solo por dueño del perfil (uuid inicial del nombre del archivo)
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
```

5. Haz clic en **Run**.

### Paso 2: Verificar

```sql
select * from storage.buckets where id = 'avatars';
```

Debes ver:
- **id**: avatars
- **public**: true

## Opción 2: Crear bucket desde la interfaz

### Paso 1: Crear el bucket
1. **Storage → New bucket**
2. **Name**: `avatars`
3. **Public bucket**: sí
4. Crear.

### Paso 2: Policies
En **Storage > avatars > Policies**, crea:

#### Policy 1: Lectura pública
```
Policy name: public read avatars
Operation: SELECT
Target roles: public
USING expression: bucket_id = 'avatars'
```

#### Policy 2: Gestión (ALL) por dueños
```
Policy name: owners manage avatars
Operation: ALL
Target roles: authenticated
USING expression:
bucket_id = 'avatars' AND (
  auth.uid() = (regexp_match(name, '^([0-9a-fA-F-]{36})[\\/_-]'))[1]::uuid
  OR public.is_local_owner((regexp_match(name, '^([0-9a-fA-F-]{36})[\\/_-]'))[1]::uuid)
)
WITH CHECK expression:
bucket_id = 'avatars' AND (
  auth.uid() = (regexp_match(name, '^([0-9a-fA-F-]{36})[\\/_-]'))[1]::uuid
  OR public.is_local_owner((regexp_match(name, '^([0-9a-fA-F-]{36})[\\/_-]'))[1]::uuid)
)
```

## Verificación rápida
1. Inicia sesión como local.
2. Cambia de local activo y sube un avatar distinto en cada uno.
3. En **Storage > avatars** deben aparecer archivos con prefijo del UUID de cada perfil.

## Notas
- El bucket `cvs` no requiere cambios para multi‑local (los CV pertenecen a staff).
- Estas policies están también versionadas en `supabase/migrations/014_storage_multi_local.sql`.
- Si el SQL Editor te da `must be owner of table objects`, ejecuta la query con rol **postgres** (selector arriba a la derecha) o aplica las migraciones con `supabase db push`.
