-- ============================================
-- Push Notifications System
-- ============================================
-- Creates table to store Web Push subscription endpoints for each user device

-- Table to store Web Push subscriptions
create table if not exists push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,  -- public key for encryption
  auth text not null,     -- auth secret
  user_agent text,        -- for debugging/analytics
  active boolean default true,
  constraint push_subscriptions_user_endpoint_key unique(user_id, endpoint)
);

-- Enable Row Level Security
alter table push_subscriptions enable row level security;

-- RLS policies: Users can only view and manage their own push subscriptions
create policy "Users can view their own push subscriptions"
  on push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own push subscriptions"
  on push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own push subscriptions"
  on push_subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own push subscriptions"
  on push_subscriptions for delete
  using (auth.uid() = user_id);

-- Indexes for fast lookups
create index idx_push_subscriptions_user_id
  on push_subscriptions(user_id)
  where active = true;

create index idx_push_subscriptions_endpoint
  on push_subscriptions(endpoint);

create index idx_push_subscriptions_active
  on push_subscriptions(active)
  where active = true;

-- Function to auto-update updated_at timestamp
create or replace function update_push_subscription_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update timestamp on update
create trigger trg_update_push_subscription_timestamp
  before update on push_subscriptions
  for each row execute function update_push_subscription_updated_at();

-- Grant permissions
grant select, insert, update, delete on push_subscriptions to authenticated;
