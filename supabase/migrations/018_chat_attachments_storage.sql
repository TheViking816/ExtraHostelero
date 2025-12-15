-- ============================================
-- Chat Attachments Storage
-- ============================================
-- Creates storage bucket and policies for chat file attachments

-- Create chat-attachments bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-attachments',
  'chat-attachments',
  false, -- private bucket (files require authentication)
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

-- Storage policies for chat-attachments bucket

-- Policy: Users can upload attachments to their own folder
create policy "Users can upload their own attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can view attachments they sent or received
create policy "Users can view attachments from their conversations"
  on storage.objects for select
  using (
    bucket_id = 'chat-attachments'
    and (
      -- User is the owner (uploader) of the file
      auth.uid()::text = (storage.foldername(name))[1]
      or
      -- User is sender or receiver of a message that references this attachment
      exists (
        select 1 from messages
        where attachment_url like '%' || name || '%'
        and (sender_id = auth.uid() or receiver_id = auth.uid())
      )
    )
  );

-- Policy: Users can delete their own attachments
create policy "Users can delete their own attachments"
  on storage.objects for delete
  using (
    bucket_id = 'chat-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add attachment metadata columns to messages table (if not exist)
alter table messages add column if not exists attachment_name text;
alter table messages add column if not exists attachment_size integer; -- bytes
alter table messages add column if not exists attachment_mime_type text;

-- Create index for faster attachment queries
create index if not exists idx_messages_attachment_url
  on messages(attachment_url)
  where attachment_url is not null;
