-- Normalizar estados de applications que estuvieran vacíos/null
update applications
set status = 'pending'
where status is null or status::text = '';

-- Permitir a locales actualizar candidaturas de sus ofertas (aceptar/rechazar/withdrawn)
drop policy if exists "locals can update their job applications" on applications;
create policy "locals can update their job applications"
  on applications for update
  using (
    exists (
      select 1 from jobs j
      where j.id = applications.job_id
      and j.local_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from jobs j
      where j.id = applications.job_id
      and j.local_id = auth.uid()
    )
  );

-- Permitir insertar reviews al participante (local o staff) de ese job
drop policy if exists "participants can insert reviews" on reviews;
create policy "participants can insert reviews"
  on reviews for insert
  with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from jobs j
      where j.id = reviews.job_id
      and (
        j.local_id = auth.uid()
        or j.matched_staff_id = auth.uid()
      )
    )
  );

-- Permitir borrar mensajes solo a participantes
drop policy if exists "participants can delete messages" on messages;
create policy "participants can delete messages"
  on messages for delete
  using (
    sender_id = auth.uid() or receiver_id = auth.uid()
  );

-- Permitir borrar conversaciones a participantes
drop policy if exists "participants can delete conversations" on conversations;
create policy "participants can delete conversations"
  on conversations for delete
  using (
    local_id = auth.uid() or staff_id = auth.uid()
  );
