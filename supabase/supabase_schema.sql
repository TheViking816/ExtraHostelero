CREATE TABLE alta_logs (
  id uuid,
  created_at timestamp with time zone,
  job_id uuid,
  staff_id uuid,
  local_id uuid,
  action_type text,
  request_payload jsonb,
  response_status integer,
  response_payload jsonb,
  success boolean,
  error_message text,
  external_reference text,
  processed_at timestamp with time zone,
  confirmed_at timestamp with time zone
);

CREATE TABLE applications (
  id uuid,
  created_at timestamp with time zone,
  job_id uuid,
  staff_id uuid,
  status USER-DEFINED,
  match_score integer,
  distance_km numeric,
  responded_at timestamp with time zone,
  response_time_seconds integer,
  staff_note text,
  local_note text,
  cover_letter text,
  cv_snapshot_url text,
  phone_number text,
  photo_url text,
  experience_summary text,
  availability_note text
);

CREATE TABLE conversations (
  id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  local_id uuid,
  staff_id uuid,
  job_id uuid,
  last_message_at timestamp with time zone,
  local_unread_count integer,
  staff_unread_count integer,
  archived_by_local boolean,
  archived_by_staff boolean
);

CREATE TABLE cv_documents (
  id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  staff_id uuid,
  file_name text,
  file_size integer,
  file_type text,
  file_url text,
  is_current boolean,
  version_number integer
);

CREATE TABLE favorites (
  id uuid,
  created_at timestamp with time zone,
  local_id uuid,
  staff_id uuid,
  note text,
  last_worked_together timestamp with time zone,
  times_worked_together integer
);

CREATE TABLE jobs (
  id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  local_id uuid,
  role_required USER-DEFINED,
  skills_required ARRAY,
  shift_date date,
  start_time time without time zone,
  end_time time without time zone,
  hourly_rate numeric,
  total_hours numeric,
  total_pay numeric,
  auto_alta boolean,
  alta_fee numeric,
  status USER-DEFINED,
  is_urgent boolean,
  urgency_level text,
  expires_at timestamp with time zone,
  matched_staff_id uuid,
  matched_at timestamp with time zone,
  staff_arrived_at timestamp with time zone,
  shift_started_at timestamp with time zone,
  shift_ended_at timestamp with time zone,
  alta_requested_at timestamp with time zone,
  alta_confirmed_at timestamp with time zone,
  alta_reference text,
  baja_requested_at timestamp with time zone,
  baja_confirmed_at timestamp with time zone,
  payment_intent_id text,
  payment_status text,
  payment_released_at timestamp with time zone,
  latitude numeric,
  longitude numeric,
  address text,
  notes text,
  cancellation_reason text,
  job_type USER-DEFINED,
  evaluation_criteria ARRAY,
  possible_hire boolean,
  deleted_at timestamp with time zone,
  review_opened_at timestamp with time zone
);

CREATE TABLE messages (
  id uuid,
  created_at timestamp with time zone,
  sender_id uuid,
  receiver_id uuid,
  job_id uuid,
  application_id uuid,
  content text,
  message_type text,
  attachment_url text,
  read_at timestamp with time zone,
  deleted_by_sender boolean,
  deleted_by_receiver boolean
);

CREATE TABLE notifications (
  id uuid,
  created_at timestamp with time zone,
  user_id uuid,
  type text,
  title text,
  body text,
  data jsonb,
  read_at timestamp with time zone,
  sent_at timestamp with time zone,
  notification_type text,
  action_url text,
  action_required boolean
);

CREATE TABLE payments (
  id uuid,
  created_at timestamp with time zone,
  job_id uuid,
  local_id uuid,
  staff_id uuid,
  payment_intent_id text,
  transfer_id text,
  amount_gross numeric,
  amount_staff numeric,
  amount_alta_fee numeric,
  amount_platform_fee numeric,
  status text,
  captured_at timestamp with time zone,
  transferred_at timestamp with time zone,
  stripe_metadata jsonb
);

CREATE TABLE profiles (
  id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  user_type USER-DEFINED,
  full_name text,
  phone text,
  avatar_url text,
  latitude numeric,
  longitude numeric,
  address text,
  city text,
  staff_role USER-DEFINED,
  skills ARRAY,
  hourly_rate_min numeric,
  hourly_rate_max numeric,
  bio text,
  available boolean,
  business_name text,
  business_type text,
  cif text,
  rating numeric,
  total_reviews integer,
  reliability_score integer,
  total_shifts integer,
  verification_status USER-DEFINED,
  verified_at timestamp with time zone,
  dni_encrypted bytea,
  social_security_encrypted bytea,
  bank_account_encrypted bytea,
  dni_front_path text,
  dni_back_path text,
  stripe_customer_id text,
  stripe_connect_account_id text,
  stripe_connect_onboarded boolean,
  fcm_token text,
  last_location_update timestamp with time zone,
  cv_url text,
  cv_text text,
  video_intro_url text,
  certifications ARRAY,
  verified_skills ARRAY,
  carnet_digital_id text,
  carnet_qr_code text,
  cv_document_id uuid,
  menu_url text,
  service_description text
);

-- public_profiles es una vista derivada de profiles
-- create or replace view public_profiles as select ... from profiles;

CREATE TABLE reviews (
  id uuid,
  created_at timestamp with time zone,
  job_id uuid,
  reviewer_id uuid,
  reviewed_id uuid,
  rating integer,
  punctuality integer,
  professionalism integer,
  skills integer,
  communication integer,
  would_hire_again boolean,
  fair_treatment boolean,
  comment text
);

CREATE TABLE skill_videos (
  id uuid,
  created_at timestamp with time zone,
  staff_id uuid,
  skill_name text,
  video_url text,
  thumbnail_url text,
  duration_seconds integer,
  verified boolean,
  public boolean,
  views_count integer
);

CREATE TABLE staff_certifications (
  id uuid,
  created_at timestamp with time zone,
  staff_id uuid,
  certification_type text,
  document_url text,
  verified boolean,
  verified_at timestamp with time zone,
  verified_by text,
  expires_at date
);
