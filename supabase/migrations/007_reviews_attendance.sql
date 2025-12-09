-- Añadir asistencia en reviews y recalcular rating/fiabilidad usando asistencia
alter table reviews add column if not exists attendance_present boolean;

-- Marcar por defecto como presentado para reviews antiguas
update reviews set attendance_present = true where attendance_present is null;

create or replace function update_profile_stats()
returns trigger as $$
declare
  v_avg_rating numeric;
  v_reviews_count integer;
  v_attendance_count integer;
  v_attended integer;
begin
  select
    coalesce(avg(rating) filter (where attendance_present is true), 0),
    count(*),
    count(*) filter (where attendance_present is not null),
    count(*) filter (where attendance_present is true)
  into v_avg_rating, v_reviews_count, v_attendance_count, v_attended
  from reviews
  where reviewed_id = new.reviewed_id;

  update profiles
  set
    rating = v_avg_rating,
    total_reviews = v_reviews_count,
    reliability_score = case
      when v_attendance_count > 0 then round((v_attended::numeric / v_attendance_count) * 100)
      else 100
    end
  where id = new.reviewed_id;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists update_stats_on_review on reviews;
create trigger update_stats_on_review
  after insert or update on reviews
  for each row execute function update_profile_stats();

-- Backfill de perfiles con la nueva lógica
do $$
begin
  update profiles p
  set
    rating = sub.avg_rating,
    total_reviews = sub.total_reviews,
    reliability_score = case
      when sub.attendance_count > 0 then round((sub.attended::numeric / sub.attendance_count) * 100)
      else coalesce(p.reliability_score, 100)
    end
  from (
    select
      reviewed_id,
      coalesce(avg(rating) filter (where attendance_present is true), 0) as avg_rating,
      count(*) as total_reviews,
      count(*) filter (where attendance_present is not null) as attendance_count,
      count(*) filter (where attendance_present is true) as attended
    from reviews
    group by reviewed_id
  ) sub
  where p.id = sub.reviewed_id;
end $$;
