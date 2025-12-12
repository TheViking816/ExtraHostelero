-- =============================================
-- EXTRAHOSTELERO - MIGRACION: MULTI-LOCAL POR CUENTA
-- Permite varios perfiles de local para un mismo auth.user
-- =============================================

-- Añadir columna auth_user_id para desacoplar cuenta vs perfil
alter table profiles add column if not exists auth_user_id uuid;

-- Backfill para perfiles existentes (compatibilidad)
update profiles
set auth_user_id = id
where auth_user_id is null;

create index if not exists idx_profiles_auth_user_id on profiles(auth_user_id);

-- Helper: ¿la cuenta actual es dueña del perfil local?
create or replace function public.is_local_owner(p_local_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1
    from profiles p
    where p.id = p_local_id
      and p.user_type = 'local'
      and (p.auth_user_id = auth.uid() or p.id = auth.uid())
  );
$$;

grant execute on function public.is_local_owner(uuid) to authenticated;

-- =========================
-- PROFILES RLS
-- =========================
alter table profiles enable row level security;

drop policy if exists "Public can read public profiles" on profiles;
create policy "Public can read public profiles"
  on profiles for select
  using (true);

drop policy if exists "Users can manage their own profiles" on profiles;
create policy "Users can manage their own profiles"
  on profiles for all
  using (auth.uid() = id or auth.uid() = auth_user_id)
  with check (auth.uid() = id or auth.uid() = auth_user_id);

-- =========================
-- JOBS RLS (local_id es perfil de local)
-- =========================
alter table jobs enable row level security;

drop policy if exists "Locals manage their jobs" on jobs;
create policy "Locals manage their jobs"
  on jobs for all
  using (public.is_local_owner(local_id))
  with check (public.is_local_owner(local_id));

-- =========================
-- APPLICATIONS RLS
-- =========================
alter table applications enable row level security;

drop policy if exists "locals can update their job applications" on applications;
create policy "locals can update their job applications"
  on applications for update
  using (
    exists (
      select 1 from jobs j
      where j.id = applications.job_id
        and public.is_local_owner(j.local_id)
    )
  )
  with check (
    exists (
      select 1 from jobs j
      where j.id = applications.job_id
        and public.is_local_owner(j.local_id)
    )
  );

-- =========================
-- FAVORITES RLS
-- =========================
alter table favorites enable row level security;

drop policy if exists "Locals can manage their favorites" on favorites;
create policy "Locals can manage their favorites"
  on favorites for all
  using (public.is_local_owner(local_id))
  with check (public.is_local_owner(local_id));

drop policy if exists "Staff can see if they are favorited" on favorites;
create policy "Staff can see if they are favorited"
  on favorites for select
  using (staff_id = auth.uid());

-- =========================
-- CONVERSATIONS RLS
-- =========================
alter table conversations enable row level security;

drop policy if exists "Users can see their conversations" on conversations;
create policy "Users can see their conversations"
  on conversations for select
  using (public.is_local_owner(local_id) or staff_id = auth.uid());

drop policy if exists "Users can update their conversations" on conversations;
create policy "Users can update their conversations"
  on conversations for update
  using (public.is_local_owner(local_id) or staff_id = auth.uid())
  with check (public.is_local_owner(local_id) or staff_id = auth.uid());

drop policy if exists "participants can delete conversations" on conversations;
create policy "participants can delete conversations"
  on conversations for delete
  using (public.is_local_owner(local_id) or staff_id = auth.uid());

-- =========================
-- MESSAGES RLS
-- =========================
alter table messages enable row level security;

drop policy if exists "Users can see their own messages" on messages;
create policy "Users can see their own messages"
  on messages for select
  using (
    sender_id = auth.uid()
    or receiver_id = auth.uid()
    or public.is_local_owner(sender_id)
    or public.is_local_owner(receiver_id)
  );

drop policy if exists "Users can send messages" on messages;
create policy "Users can send messages"
  on messages for insert
  with check (
    sender_id = auth.uid()
    or public.is_local_owner(sender_id)
  );

drop policy if exists "Users can update their own messages" on messages;
create policy "Users can update their own messages"
  on messages for update
  using (
    sender_id = auth.uid()
    or receiver_id = auth.uid()
    or public.is_local_owner(sender_id)
    or public.is_local_owner(receiver_id)
  )
  with check (
    sender_id = auth.uid()
    or receiver_id = auth.uid()
    or public.is_local_owner(sender_id)
    or public.is_local_owner(receiver_id)
  );

drop policy if exists "participants can delete messages" on messages;
create policy "participants can delete messages"
  on messages for delete
  using (
    sender_id = auth.uid()
    or receiver_id = auth.uid()
    or public.is_local_owner(sender_id)
    or public.is_local_owner(receiver_id)
  );

-- =========================
-- REVIEWS RLS
-- =========================
alter table reviews enable row level security;

drop policy if exists "participants can insert reviews" on reviews;
create policy "participants can insert reviews"
  on reviews for insert
  with check (
    (auth.uid() = reviewer_id or public.is_local_owner(reviewer_id))
    and exists (
      select 1 from jobs j
      where j.id = reviews.job_id
        and (
          public.is_local_owner(j.local_id)
          or j.matched_staff_id = auth.uid()
        )
    )
  );

-- =========================
-- NOTIFICATIONS RLS
-- =========================
alter table notifications enable row level security;

drop policy if exists "Users can read their notifications" on notifications;
create policy "Users can read their notifications"
  on notifications for select
  using (
    user_id = auth.uid()
    or public.is_local_owner(user_id)
  );
