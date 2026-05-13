alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.support_requests enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;

create policy profiles_select_own on public.profiles for select using (id = auth.uid());
create policy profiles_insert_own on public.profiles for insert with check (id = auth.uid());
create policy profiles_update_own on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy app_settings_select_own on public.app_settings for select using (owner_id = auth.uid());
create policy app_settings_insert_own on public.app_settings for insert with check (owner_id = auth.uid());
create policy app_settings_update_own on public.app_settings for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy app_settings_delete_own on public.app_settings for delete using (owner_id = auth.uid());

create policy clients_select_own on public.clients for select using (owner_id = auth.uid());
create policy clients_insert_own on public.clients for insert with check (owner_id = auth.uid());
create policy clients_update_own on public.clients for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy clients_delete_own on public.clients for delete using (owner_id = auth.uid());

create policy projects_select_own on public.projects for select using (owner_id = auth.uid());
create policy projects_insert_own on public.projects for insert with check (owner_id = auth.uid());
create policy projects_update_own on public.projects for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy projects_delete_own on public.projects for delete using (owner_id = auth.uid());

create policy support_requests_select_own on public.support_requests for select using (owner_id = auth.uid());
create policy support_requests_insert_own on public.support_requests for insert with check (owner_id = auth.uid());
create policy support_requests_update_own on public.support_requests for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy support_requests_delete_own on public.support_requests for delete using (owner_id = auth.uid());

create policy payments_select_own on public.payments for select using (owner_id = auth.uid());
create policy payments_insert_own on public.payments for insert with check (owner_id = auth.uid());
create policy payments_update_own on public.payments for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy payments_delete_own on public.payments for delete using (owner_id = auth.uid());

create policy activity_logs_select_own on public.activity_logs for select using (owner_id = auth.uid());
create policy activity_logs_insert_own on public.activity_logs for insert with check (owner_id = auth.uid());
create policy activity_logs_update_own on public.activity_logs for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy activity_logs_delete_own on public.activity_logs for delete using (owner_id = auth.uid());

