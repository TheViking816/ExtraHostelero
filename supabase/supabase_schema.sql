[
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "job_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "staff_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "local_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "action_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "request_payload",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "response_status",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "response_payload",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "success",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "error_message",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "external_reference",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "processed_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "alta_logs",
    "column_name": "confirmed_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "job_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "staff_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'pending'::text"
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "match_score",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "distance_km",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "responded_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "response_time_seconds",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "staff_note",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "local_note",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "cover_letter",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "cv_snapshot_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "phone_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "photo_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "experience_summary",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "applications",
    "column_name": "availability_note",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "conversations",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_schema": "public",
    "table_name": "conversations",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "conversations",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "conversations",
    "column_name": "local_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "conversations",
    "column_name": "staff_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "conversations",
    "column_name": "job_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "conversations",
    "column_name": "last_message_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "conversations",
    "column_name": "local_unread_count",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_schema": "public",
    "table_name": "conversations",
    "column_name": "staff_unread_count",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_schema": "public",
    "table_name": "conversations",
    "column_name": "archived_by_local",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "public",
    "table_name": "conversations",
    "column_name": "archived_by_staff",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "public",
    "table_name": "cv_documents",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_schema": "public",
    "table_name": "cv_documents",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "cv_documents",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "cv_documents",
    "column_name": "staff_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "cv_documents",
    "column_name": "file_name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "cv_documents",
    "column_name": "file_size",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "cv_documents",
    "column_name": "file_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "cv_documents",
    "column_name": "file_url",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "cv_documents",
    "column_name": "is_current",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true"
  },
  {
    "table_schema": "public",
    "table_name": "cv_documents",
    "column_name": "version_number",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "1"
  },
  {
    "table_schema": "public",
    "table_name": "favorites",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_schema": "public",
    "table_name": "favorites",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "favorites",
    "column_name": "local_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "favorites",
    "column_name": "staff_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "favorites",
    "column_name": "note",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "favorites",
    "column_name": "last_worked_together",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "favorites",
    "column_name": "times_worked_together",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "1"
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "local_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "role_required",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "skills_required",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": "'{}'::text[]"
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "shift_date",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "start_time",
    "data_type": "time without time zone",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "end_time",
    "data_type": "time without time zone",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "hourly_rate",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "total_hours",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "total_pay",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "auto_alta",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true"
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "alta_fee",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": "2.00"
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "status",
    "data_type": "USER-DEFINED",
    "is_nullable": "YES",
    "column_default": "'open'::job_status"
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "is_urgent",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "urgency_level",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "expires_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "matched_staff_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "matched_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "staff_arrived_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "shift_started_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "shift_ended_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "alta_requested_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "alta_confirmed_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "alta_reference",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "baja_requested_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "baja_confirmed_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "payment_intent_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "payment_status",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "payment_released_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "latitude",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "longitude",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "notes",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "cancellation_reason",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "job_type",
    "data_type": "USER-DEFINED",
    "is_nullable": "YES",
    "column_default": "'extra'::job_type"
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "evaluation_criteria",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": "'{}'::text[]"
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "possible_hire",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "deleted_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "review_opened_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "trial_shift_period",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "trial_schedule",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "trial_salary_month",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "trial_contract_hours",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "trial_days_off",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "trial_days_off_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "jobs",
    "column_name": "trial_days_off_fixed",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "sender_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "receiver_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "job_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "application_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "content",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "message_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'text'::text"
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "attachment_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "read_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "deleted_by_sender",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "deleted_by_receiver",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "public",
    "table_name": "notifications",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_schema": "public",
    "table_name": "notifications",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "notifications",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "notifications",
    "column_name": "type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "notifications",
    "column_name": "title",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "notifications",
    "column_name": "body",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "notifications",
    "column_name": "data",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb"
  },
  {
    "table_schema": "public",
    "table_name": "notifications",
    "column_name": "read_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "notifications",
    "column_name": "sent_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "notifications",
    "column_name": "notification_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "notifications",
    "column_name": "action_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "notifications",
    "column_name": "action_required",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "job_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "local_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "staff_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "payment_intent_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "transfer_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "amount_gross",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "amount_staff",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "amount_alta_fee",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "amount_platform_fee",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "captured_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "transferred_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "column_name": "stripe_metadata",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "user_type",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "full_name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "phone",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "avatar_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "latitude",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "longitude",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "city",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "staff_role",
    "data_type": "USER-DEFINED",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "skills",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": "'{}'::text[]"
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "hourly_rate_min",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "hourly_rate_max",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "bio",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "available",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true"
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "business_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "business_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "cif",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "rating",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "total_reviews",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "reliability_score",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "100"
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "total_shifts",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "verification_status",
    "data_type": "USER-DEFINED",
    "is_nullable": "YES",
    "column_default": "'pending'::verification_status"
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "verified_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "dni_encrypted",
    "data_type": "bytea",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "social_security_encrypted",
    "data_type": "bytea",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "bank_account_encrypted",
    "data_type": "bytea",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "dni_front_path",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "dni_back_path",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "stripe_customer_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "stripe_connect_account_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "stripe_connect_onboarded",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "fcm_token",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "last_location_update",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "cv_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "cv_text",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "video_intro_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "certifications",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": "'{}'::text[]"
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "verified_skills",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": "'{}'::text[]"
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "carnet_digital_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "carnet_qr_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "cv_document_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "menu_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "service_description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "column_name": "auth_user_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "job_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "reviewer_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "reviewed_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "rating",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "punctuality",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "professionalism",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "skills",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "communication",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "would_hire_again",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "fair_treatment",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "comment",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "attendance_present",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "reviews",
    "column_name": "local_review",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "skill_videos",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_schema": "public",
    "table_name": "skill_videos",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "skill_videos",
    "column_name": "staff_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "skill_videos",
    "column_name": "skill_name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "skill_videos",
    "column_name": "video_url",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "skill_videos",
    "column_name": "thumbnail_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "skill_videos",
    "column_name": "duration_seconds",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "skill_videos",
    "column_name": "verified",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "public",
    "table_name": "skill_videos",
    "column_name": "public",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true"
  },
  {
    "table_schema": "public",
    "table_name": "skill_videos",
    "column_name": "views_count",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_schema": "public",
    "table_name": "staff_certifications",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_schema": "public",
    "table_name": "staff_certifications",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "staff_certifications",
    "column_name": "staff_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "staff_certifications",
    "column_name": "certification_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "staff_certifications",
    "column_name": "document_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "staff_certifications",
    "column_name": "verified",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "public",
    "table_name": "staff_certifications",
    "column_name": "verified_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "staff_certifications",
    "column_name": "verified_by",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "staff_certifications",
    "column_name": "expires_at",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages",
    "column_name": "topic",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages",
    "column_name": "extension",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages",
    "column_name": "payload",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages",
    "column_name": "event",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages",
    "column_name": "private",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages",
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages",
    "column_name": "inserted_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_09",
    "column_name": "topic",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_09",
    "column_name": "extension",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_09",
    "column_name": "payload",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_09",
    "column_name": "event",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_09",
    "column_name": "private",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_09",
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_09",
    "column_name": "inserted_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_09",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_10",
    "column_name": "topic",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_10",
    "column_name": "extension",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_10",
    "column_name": "payload",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_10",
    "column_name": "event",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_10",
    "column_name": "private",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_10",
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_10",
    "column_name": "inserted_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_10",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_11",
    "column_name": "topic",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_11",
    "column_name": "extension",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_11",
    "column_name": "payload",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_11",
    "column_name": "event",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_11",
    "column_name": "private",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_11",
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_11",
    "column_name": "inserted_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_11",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_12",
    "column_name": "topic",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_12",
    "column_name": "extension",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_12",
    "column_name": "payload",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_12",
    "column_name": "event",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_12",
    "column_name": "private",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_12",
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_12",
    "column_name": "inserted_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_12",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_13",
    "column_name": "topic",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_13",
    "column_name": "extension",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_13",
    "column_name": "payload",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_13",
    "column_name": "event",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_13",
    "column_name": "private",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_13",
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_13",
    "column_name": "inserted_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_13",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_14",
    "column_name": "topic",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_14",
    "column_name": "extension",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_14",
    "column_name": "payload",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_14",
    "column_name": "event",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_14",
    "column_name": "private",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_14",
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_14",
    "column_name": "inserted_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_14",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_15",
    "column_name": "topic",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_15",
    "column_name": "extension",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_15",
    "column_name": "payload",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_15",
    "column_name": "event",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_15",
    "column_name": "private",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_15",
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_15",
    "column_name": "inserted_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages_2025_12_15",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_schema": "realtime",
    "table_name": "schema_migrations",
    "column_name": "version",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "schema_migrations",
    "column_name": "inserted_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "subscription",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "subscription",
    "column_name": "subscription_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "subscription",
    "column_name": "entity",
    "data_type": "regclass",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "subscription",
    "column_name": "filters",
    "data_type": "ARRAY",
    "is_nullable": "NO",
    "column_default": "'{}'::realtime.user_defined_filter[]"
  },
  {
    "table_schema": "realtime",
    "table_name": "subscription",
    "column_name": "claims",
    "data_type": "jsonb",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "subscription",
    "column_name": "claims_role",
    "data_type": "regrole",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "realtime",
    "table_name": "subscription",
    "column_name": "created_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "timezone('utc'::text, now())"
  },
  {
    "table_schema": "vault",
    "table_name": "secrets",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_schema": "vault",
    "table_name": "secrets",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "vault",
    "table_name": "secrets",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "''::text"
  },
  {
    "table_schema": "vault",
    "table_name": "secrets",
    "column_name": "secret",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "vault",
    "table_name": "secrets",
    "column_name": "key_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "vault",
    "table_name": "secrets",
    "column_name": "nonce",
    "data_type": "bytea",
    "is_nullable": "YES",
    "column_default": "vault._crypto_aead_det_noncegen()"
  },
  {
    "table_schema": "vault",
    "table_name": "secrets",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_schema": "vault",
    "table_name": "secrets",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "CURRENT_TIMESTAMP"
  }
]