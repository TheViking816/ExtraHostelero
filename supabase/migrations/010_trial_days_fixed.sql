-- Guardar días libres fijos para ofertas de prueba
alter table jobs add column if not exists trial_days_off_fixed text[];
