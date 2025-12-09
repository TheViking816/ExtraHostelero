# Flujo de notificaciones y eventos

## Resumen
- Se usan triggers SQL para insertar notificaciones en `notifications` y mantener contadores de unread en `conversations`.
- Frontend (staff/local) escucha con Supabase Realtime (`postgres_changes` sobre `notifications`) y muestra panel/badge.
- Los mensajes y las notificaciones quedan vinculados a `job_id` y `application_id` cuando aplica, para aislar conversaciones por oferta.

## Casos cubiertos

### Publicación de oferta (`jobs`)
- Trigger `trg_notify_staff_on_new_job` (`supabase/migrations/004_local_profile_extensions.sql`).
- Al insertar un job, se crean notificaciones para cada staff cuyo `profiles.staff_role` coincide con `jobs.role_required`.
- Datos extra en `notifications.data`: `job_id`, `local_id`, `role_required`.

### Nuevos mensajes (`messages`)
- Trigger `trg_notify_on_message`.
- Al insertar mensaje se:
  - Crea notificación para `receiver_id` con `data` (`message_id`, `job_id`, `application_id`, `sender_id`).
  - Actualiza contadores `local_unread_count` / `staff_unread_count` en `conversations` (mismo `local_id/staff_id/job_id`).
  - Mantiene `last_message_at`.
- Frontend filtra mensajes y chats por `job_id` para no mezclar ofertas.

### Cambios de estado en candidaturas (`applications`)
- Trigger `trg_notify_on_application_status`.
- Si `status` cambia a `accepted`, se crea notificación para el staff con `data` (`job_id`, `local_id`, `application_id`).

## Frontend (puntos clave)
- Staff:
  - Badge de no leídas y panel lateral (`src/App.jsx`, estado `unreadNotifications/showNotifications`).
  - Realtime: canal `notifications` recarga lista.
  - Chats exigen `job_id`; los botones de chat pasan siempre `jobId` de la oferta.
  - Vista de oferta abre detalle, perfil de local y chat contextual.
- Local:
  - En candidatos de una oferta, los chats pasan `jobId` seleccionado.
  - Contadores de unread se actualizan vía triggers cuando llegan mensajes.

## Realtime
- Suscripciones existentes a `notifications` por `user_id` en frontend.
- Cada inserción por trigger dispara el refresh automático y mantiene badge.
