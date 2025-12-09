-- Reviews de staff hacia local no requieren asistencia ni subratings
alter table reviews add column if not exists local_review boolean;
