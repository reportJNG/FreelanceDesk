create or replace view public.project_payment_totals as
select
  p.owner_id,
  p.id as project_id,
  coalesce(sum(pay.amount) filter (where pay.status = 'paid'), 0)::numeric(12,2) as paid_amount
from public.projects p
left join public.payments pay on pay.project_id = p.id and pay.owner_id = p.owner_id
group by p.owner_id, p.id;

create or replace view public.support_payment_totals as
select
  s.owner_id,
  s.id as support_request_id,
  coalesce(sum(pay.amount) filter (where pay.status = 'paid'), 0)::numeric(12,2) as paid_amount
from public.support_requests s
left join public.payments pay on pay.support_request_id = s.id and pay.owner_id = s.owner_id
group by s.owner_id, s.id;

