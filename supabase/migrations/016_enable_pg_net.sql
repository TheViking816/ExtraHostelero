-- ============================================
-- Enable pg_net Extension
-- ============================================
-- This extension is required for making HTTP requests from database triggers
-- It provides the net.http_post() function used for sending push notifications

-- Enable the pg_net extension
create extension if not exists pg_net with schema extensions;

-- Grant necessary permissions
grant usage on schema net to postgres, anon, authenticated, service_role;
grant all on all tables in schema net to postgres, anon, authenticated, service_role;
grant all on all routines in schema net to postgres, anon, authenticated, service_role;
grant all on all sequences in schema net to postgres, anon, authenticated, service_role;

alter default privileges in schema net grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema net grant all on routines to postgres, anon, authenticated, service_role;
alter default privileges in schema net grant all on sequences to postgres, anon, authenticated, service_role;
