-- Campos adicionales para ofertas de prueba (condiciones laborales)
alter table jobs
  add column if not exists trial_shift_period text, -- 'manana' | 'tarde'
  add column if not exists trial_schedule text,
  add column if not exists trial_salary_month numeric,
  add column if not exists trial_contract_hours integer,
  add column if not exists trial_days_off text,
  add column if not exists trial_days_off_type text; -- 'fijos' | 'rotativos'
