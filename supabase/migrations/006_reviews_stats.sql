-- Recalcular rating y fiabilidad del staff/local a partir de reviews
create or replace function update_profile_stats()
returns trigger as $$
declare
  v_avg_rating numeric;
  v_reviews_count integer;
begin
  select
    coalesce(avg(rating), 0),
    count(*)
  into v_avg_rating, v_reviews_count
  from reviews
  where reviewed_id = new.reviewed_id;

  update profiles
  set
    rating = v_avg_rating,
    total_reviews = v_reviews_count,
    reliability_score = case
      when v_reviews_count > 0 then round(v_avg_rating * 20)
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

-- Backfill inicial por si ya hay reviews cargadas
do $$
begin
  update profiles p
  set
    rating = sub.avg_rating,
    total_reviews = sub.total_reviews,
    reliability_score = case
      when sub.total_reviews > 0 then round(sub.avg_rating * 20)
      else coalesce(p.reliability_score, 100)
    end
  from (
    select reviewed_id, avg(rating) as avg_rating, count(*) as total_reviews
    from reviews
    group by reviewed_id
  ) sub
  where p.id = sub.reviewed_id;
end $$;
