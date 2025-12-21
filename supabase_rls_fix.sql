-- Enable RLS on tables
alter table public.cvs enable row level security;
alter table public.scans enable row level security;

-- CVS Table Policies
drop policy if exists "Users can insert their own cvs" on public.cvs;
create policy "Users can insert their own cvs"
on public.cvs for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can view their own cvs" on public.cvs;
create policy "Users can view their own cvs"
on public.cvs for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete their own cvs" on public.cvs;
create policy "Users can delete their own cvs"
on public.cvs for delete
to authenticated
using (auth.uid() = user_id);

-- SCANS Table Policies
drop policy if exists "Users can insert their own scans" on public.scans;
create policy "Users can insert their own scans"
on public.scans for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can view their own scans" on public.scans;
create policy "Users can view their own scans"
on public.scans for select
to authenticated
using (auth.uid() = user_id);

-- Storage Policies (Bucket 'cvs')
-- Ensure bucket exists
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', true)
on conflict (id) do nothing;

-- Note: Storage policies are on storage.objects
drop policy if exists "Users can upload their own cvs" on storage.objects;
create policy "Users can upload their own cvs"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1] );

drop policy if exists "Users can view their own cvs" on storage.objects;
create policy "Users can view their own cvs"
on storage.objects for select
to authenticated
using ( bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1] );

drop policy if exists "Users can delete their own cvs" on storage.objects;
create policy "Users can delete their own cvs"
on storage.objects for delete
to authenticated
using ( bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1] );
