import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "./errors";
import {
  beforeToday,
  cleanPayload,
  ensureFirst,
  ensureWritten,
  execQuery,
  getPagination,
  listResponse,
  money,
  nowIso,
  rowsById,
  rowsToCsv,
  todayIso,
  uniqueValues,
  withinDays,
} from "./utils";

type Db = SupabaseClient;
type Row = Record<string, unknown>;

async function getOwned(client: Db, table: string, ownerId: string, id: string) {
  const { data } = await execQuery<Row>(client.from(table).select("*").eq("owner_id", ownerId).eq("id", id).limit(1));
  return ensureFirst(data);
}

async function createOwned(client: Db, table: string, ownerId: string, payload: Row) {
  const data = cleanPayload(payload);
  data.owner_id = ownerId;
  const { data: rows } = await execQuery<Row>(client.from(table).insert(data).select("*"));
  return ensureWritten(rows);
}

async function updateOwned(client: Db, table: string, ownerId: string, id: string, payload: Row) {
  await getOwned(client, table, ownerId, id);
  const data = cleanPayload(payload);
  if (!Object.keys(data).length) return getOwned(client, table, ownerId, id);
  const { data: rows } = await execQuery<Row>(client.from(table).update(data).eq("owner_id", ownerId).eq("id", id).select("*"));
  return ensureWritten(rows);
}

async function deleteOwned(client: Db, table: string, ownerId: string, id: string) {
  await getOwned(client, table, ownerId, id);
  await execQuery<Row>(client.from(table).delete().eq("owner_id", ownerId).eq("id", id).select("id"));
}

async function lookupRows(client: Db, ownerId: string, table: string, columns: string, ids: string[]) {
  if (!ids.length) return [];
  const { data } = await execQuery<Row>(client.from(table).select(columns).eq("owner_id", ownerId).in("id", ids));
  return data;
}

export async function listClients(client: Db, ownerId: string, searchParams: URLSearchParams) {
  const pagination = getPagination(searchParams.get("page"), searchParams.get("page_size"));
  let query = client.from("clients").select("*", { count: "exact" }).eq("owner_id", ownerId);
  if (searchParams.get("archived") !== "true") query = query.is("archived_at", null);
  if (searchParams.get("status")) query = query.eq("status", searchParams.get("status"));
  if (searchParams.get("search")) {
    const pattern = `%${searchParams.get("search")}%`;
    query = query.or(`name.ilike.${pattern},company_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},whatsapp.ilike.${pattern},notes.ilike.${pattern}`);
  }
  const { data, count } = await execQuery<Row>(query.order("created_at", { ascending: false }).range(pagination.start, pagination.end));
  return listResponse(await enrichClients(client, ownerId, data), count, pagination.page, pagination.pageSize);
}

export async function getClient(client: Db, ownerId: string, id: string) {
  return (await enrichClients(client, ownerId, [await getOwned(client, "clients", ownerId, id)]))[0];
}

export async function createClientRow(client: Db, ownerId: string, payload: Row) {
  const created = await createOwned(client, "clients", ownerId, payload);
  return getClient(client, ownerId, String(created.id));
}

export async function updateClientRow(client: Db, ownerId: string, id: string, payload: Row) {
  await updateOwned(client, "clients", ownerId, id, payload);
  return getClient(client, ownerId, id);
}

export async function archiveClient(client: Db, ownerId: string, id: string) {
  await updateOwned(client, "clients", ownerId, id, { status: "archived", archived_at: nowIso() });
  return getClient(client, ownerId, id);
}

async function enrichClients(client: Db, ownerId: string, clients: Row[]) {
  const clientIds = uniqueValues(clients, "id");
  if (!clientIds.length) return clients;
  const [{ data: projects }, { data: financials }] = await Promise.all([
    execQuery<Row>(client.from("projects").select("id,client_id").eq("owner_id", ownerId).is("archived_at", null).in("client_id", clientIds)),
    execQuery<Row>(client.from("client_financials").select("client_id,paid_amount,remaining_amount").eq("owner_id", ownerId).in("client_id", clientIds)),
  ]);
  const counts: Record<string, number> = {};
  for (const project of projects) counts[String(project.client_id)] = (counts[String(project.client_id)] ?? 0) + 1;
  const financialsByClient = rowsById(financials, "client_id");
  return clients.map((row) => {
    const financial = financialsByClient[String(row.id)] ?? {};
    return { ...row, projects_count: counts[String(row.id)] ?? 0, total_paid: money(financial.paid_amount), remaining: money(financial.remaining_amount) };
  });
}

async function assertClient(client: Db, ownerId: string, clientId: unknown) {
  if (!clientId) throw new ApiError(400, "Client does not exist");
  const { data } = await execQuery<Row>(client.from("clients").select("id").eq("owner_id", ownerId).eq("id", clientId).limit(1));
  ensureFirst(data, 400, "Client does not exist");
}

export async function listProjects(client: Db, ownerId: string, searchParams: URLSearchParams) {
  const pagination = getPagination(searchParams.get("page"), searchParams.get("page_size"));
  let query = client.from("projects").select("*", { count: "exact" }).eq("owner_id", ownerId);
  if (searchParams.get("archived") !== "true") query = query.is("archived_at", null);
  for (const key of ["status", "client_id"]) if (searchParams.get(key)) query = query.eq(key, searchParams.get(key));
  if (searchParams.get("search")) {
    const pattern = `%${searchParams.get("search")}%`;
    query = query.or(`name.ilike.${pattern},domain.ilike.${pattern},repository_url.ilike.${pattern},production_url.ilike.${pattern},notes.ilike.${pattern}`);
  }
  const { data, count } = await execQuery<Row>(query.order("created_at", { ascending: false }).range(pagination.start, pagination.end));
  return listResponse(await enrichProjects(client, ownerId, data), count, pagination.page, pagination.pageSize);
}

export async function getProject(client: Db, ownerId: string, id: string) {
  return (await enrichProjects(client, ownerId, [await getOwned(client, "projects", ownerId, id)]))[0];
}

export async function createProject(client: Db, ownerId: string, payload: Row) {
  await assertClient(client, ownerId, payload.client_id);
  const created = await createOwned(client, "projects", ownerId, payload);
  return getProject(client, ownerId, String(created.id));
}

export async function updateProject(client: Db, ownerId: string, id: string, payload: Row) {
  if (payload.client_id) await assertClient(client, ownerId, payload.client_id);
  await updateOwned(client, "projects", ownerId, id, payload);
  return getProject(client, ownerId, id);
}

export async function archiveProject(client: Db, ownerId: string, id: string) {
  await updateOwned(client, "projects", ownerId, id, { status: "archived", archived_at: nowIso() });
  return getProject(client, ownerId, id);
}

async function enrichProjects(client: Db, ownerId: string, projects: Row[]) {
  const projectIds = uniqueValues(projects, "id");
  if (!projectIds.length) return projects;
  const [clients, financials] = await Promise.all([
    lookupRows(client, ownerId, "clients", "id,name", uniqueValues(projects, "client_id")),
    execQuery<Row>(client.from("project_financials").select("project_id,paid_amount,remaining_amount,net_profit").eq("owner_id", ownerId).in("project_id", projectIds)).then((r) => r.data),
  ]);
  const clientsById = rowsById(clients);
  const financialsByProject = rowsById(financials, "project_id");
  return projects.map((row) => {
    const financial = financialsByProject[String(row.id)] ?? {};
    return {
      ...row,
      client_name: clientsById[String(row.client_id)]?.name ?? null,
      paid_amount: money(financial.paid_amount),
      remaining_amount: money(financial.remaining_amount),
      net_profit: money(financial.net_profit),
    };
  });
}

async function assertPaymentLinks(client: Db, ownerId: string, payload: Row) {
  const clientId = payload.client_id;
  if (clientId) await assertClient(client, ownerId, clientId);
  let project: Row | null = null;
  if (payload.project_id) {
    const { data } = await execQuery<Row>(client.from("projects").select("id,client_id").eq("owner_id", ownerId).eq("id", payload.project_id).limit(1));
    project = ensureFirst(data, 400, "Project does not exist");
    if (clientId && project.client_id !== clientId) throw new ApiError(400, "Project belongs to another client");
  }
  if (payload.support_request_id) {
    const { data } = await execQuery<Row>(client.from("support_requests").select("id,client_id,project_id").eq("owner_id", ownerId).eq("id", payload.support_request_id).limit(1));
    const support = ensureFirst(data, 400, "Support request does not exist");
    if (clientId && support.client_id !== clientId) throw new ApiError(400, "Support request belongs to another client");
    if (project && support.project_id && support.project_id !== project.id) throw new ApiError(400, "Payment project must match support request project");
  }
}

export async function listPayments(client: Db, ownerId: string, searchParams: URLSearchParams) {
  const pagination = getPagination(searchParams.get("page"), searchParams.get("page_size"));
  let query = client.from("payments").select("*", { count: "exact" }).eq("owner_id", ownerId);
  for (const key of ["client_id", "project_id", "support_request_id", "method", "status"]) if (searchParams.get(key)) query = query.eq(key, searchParams.get(key));
  if (searchParams.get("from_date")) query = query.gte("paid_at", searchParams.get("from_date"));
  if (searchParams.get("to_date")) query = query.lte("paid_at", searchParams.get("to_date"));
  const { data, count } = await execQuery<Row>(query.order("created_at", { ascending: false }).range(pagination.start, pagination.end));
  return listResponse(await enrichPayments(client, ownerId, data), count, pagination.page, pagination.pageSize);
}

export async function createPayment(client: Db, ownerId: string, payload: Row) {
  if (payload.status === "paid" && !payload.paid_at) payload.paid_at = todayIso();
  await assertPaymentLinks(client, ownerId, payload);
  const created = await createOwned(client, "payments", ownerId, payload);
  return getPayment(client, ownerId, String(created.id));
}

export async function getPayment(client: Db, ownerId: string, id: string) {
  return (await enrichPayments(client, ownerId, [await getOwned(client, "payments", ownerId, id)]))[0];
}

export async function updatePayment(client: Db, ownerId: string, id: string, payload: Row) {
  const current = await getOwned(client, "payments", ownerId, id);
  const merged = { ...current, ...payload };
  if (merged.status === "paid" && !merged.paid_at) payload.paid_at = todayIso();
  await assertPaymentLinks(client, ownerId, merged);
  await updateOwned(client, "payments", ownerId, id, payload);
  return getPayment(client, ownerId, id);
}

export async function deletePayment(client: Db, ownerId: string, id: string) {
  await deleteOwned(client, "payments", ownerId, id);
  return { detail: "Payment deleted" };
}

async function enrichPayments(client: Db, ownerId: string, payments: Row[]) {
  if (!payments.length) return payments;
  const [clients, projects, support] = await Promise.all([
    lookupRows(client, ownerId, "clients", "id,name", uniqueValues(payments, "client_id")),
    lookupRows(client, ownerId, "projects", "id,name", uniqueValues(payments, "project_id")),
    lookupRows(client, ownerId, "support_requests", "id,title", uniqueValues(payments, "support_request_id")),
  ]);
  const clientsById = rowsById(clients);
  const projectsById = rowsById(projects);
  const supportById = rowsById(support);
  return payments.map((row) => ({
    ...row,
    client_name: clientsById[String(row.client_id)]?.name ?? null,
    project_name: projectsById[String(row.project_id)]?.name ?? null,
    support_title: supportById[String(row.support_request_id)]?.title ?? null,
  }));
}

async function assertSupportLinks(client: Db, ownerId: string, payload: Row) {
  const clientId = payload.client_id;
  if (clientId) await assertClient(client, ownerId, clientId);
  if (payload.project_id) {
    const { data } = await execQuery<Row>(client.from("projects").select("id,client_id").eq("owner_id", ownerId).eq("id", payload.project_id).limit(1));
    const project = ensureFirst(data, 400, "Project does not exist");
    if (clientId && project.client_id !== clientId) throw new ApiError(400, "Project belongs to another client");
  }
}

export async function listSupportRequests(client: Db, ownerId: string, searchParams: URLSearchParams) {
  const pagination = getPagination(searchParams.get("page"), searchParams.get("page_size"));
  let query = client.from("support_requests").select("*", { count: "exact" }).eq("owner_id", ownerId);
  for (const key of ["client_id", "project_id", "status", "priority", "request_type"]) if (searchParams.get(key)) query = query.eq(key, searchParams.get(key));
  if (searchParams.get("search")) {
    const pattern = `%${searchParams.get("search")}%`;
    query = query.or(`title.ilike.${pattern},description.ilike.${pattern},notes.ilike.${pattern}`);
  }
  const { data, count } = await execQuery<Row>(query.order("created_at", { ascending: false }).range(pagination.start, pagination.end));
  return listResponse(await enrichSupportRequests(client, ownerId, data), count, pagination.page, pagination.pageSize);
}

export async function createSupportRequest(client: Db, ownerId: string, payload: Row) {
  if (payload.status === "done" && !payload.completed_at) payload.completed_at = todayIso();
  await assertSupportLinks(client, ownerId, payload);
  const created = await createOwned(client, "support_requests", ownerId, payload);
  return getSupportRequest(client, ownerId, String(created.id));
}

export async function getSupportRequest(client: Db, ownerId: string, id: string) {
  return (await enrichSupportRequests(client, ownerId, [await getOwned(client, "support_requests", ownerId, id)]))[0];
}

export async function updateSupportRequest(client: Db, ownerId: string, id: string, payload: Row) {
  const merged = { ...(await getOwned(client, "support_requests", ownerId, id)), ...payload };
  if (merged.status === "done" && !merged.completed_at) payload.completed_at = todayIso();
  await assertSupportLinks(client, ownerId, merged);
  await updateOwned(client, "support_requests", ownerId, id, payload);
  return getSupportRequest(client, ownerId, id);
}

export async function deleteSupportRequest(client: Db, ownerId: string, id: string) {
  await deleteOwned(client, "support_requests", ownerId, id);
  return { detail: "Support request deleted" };
}

async function enrichSupportRequests(client: Db, ownerId: string, requests: Row[]) {
  const requestIds = uniqueValues(requests, "id");
  if (!requestIds.length) return requests;
  const [clients, projects, financials] = await Promise.all([
    lookupRows(client, ownerId, "clients", "id,name", uniqueValues(requests, "client_id")),
    lookupRows(client, ownerId, "projects", "id,name", uniqueValues(requests, "project_id")),
    execQuery<Row>(client.from("support_request_financials").select("support_request_id,paid_amount,remaining_amount").eq("owner_id", ownerId).in("support_request_id", requestIds)).then((r) => r.data),
  ]);
  const clientsById = rowsById(clients);
  const projectsById = rowsById(projects);
  const financialsByRequest = rowsById(financials, "support_request_id");
  return requests.map((row) => {
    const financial = financialsByRequest[String(row.id)] ?? {};
    return {
      ...row,
      client_name: clientsById[String(row.client_id)]?.name ?? null,
      project_name: projectsById[String(row.project_id)]?.name ?? null,
      paid_amount: money(financial.paid_amount),
      remaining_amount: money(financial.remaining_amount),
    };
  });
}

export async function dashboardSummary(client: Db, ownerId: string) {
  const [clients, projects, support, payments, projectFinancials, supportFinancials, monthlyRows] = await Promise.all([
    execQuery<Row>(client.from("clients").select("id").eq("owner_id", ownerId).is("archived_at", null)).then((r) => r.data),
    execQuery<Row>(client.from("projects").select("id,name,status,test_end_date,domain_renewal_date,hosting_renewal_date,maintenance_end_date,created_at").eq("owner_id", ownerId).is("archived_at", null).order("created_at", { ascending: false })).then((r) => r.data),
    execQuery<Row>(client.from("support_requests").select("id,status,due_date,price").eq("owner_id", ownerId)).then((r) => r.data),
    execQuery<Row>(client.from("payments").select("id,amount,status,paid_at,created_at").eq("owner_id", ownerId).order("created_at", { ascending: false })).then((r) => r.data),
    execQuery<Row>(client.from("project_financials").select("expected_amount,paid_amount,expenses").eq("owner_id", ownerId).is("archived_at", null)).then((r) => r.data),
    execQuery<Row>(client.from("support_request_financials").select("expected_amount").eq("owner_id", ownerId)).then((r) => r.data),
    execQuery<Row>(client.from("monthly_revenue").select("month,paid_amount").eq("owner_id", ownerId).order("month")).then((r) => r.data),
  ]);
  const paid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + money(p.amount), 0);
  const projectExpected = projectFinancials.reduce((sum, row) => sum + money(row.expected_amount), 0);
  const supportExpected = supportFinancials.reduce((sum, row) => sum + money(row.expected_amount), 0);
  const expected = projectExpected + supportExpected;
  const expenses = projectFinancials.reduce((sum, row) => sum + money(row.expenses), 0);
  const projectReminders = projects.filter((p) => withinDays(p.test_end_date, 7) || withinDays(p.domain_renewal_date, 30) || withinDays(p.hosting_renewal_date, 30) || withinDays(p.maintenance_end_date, 30)).length;
  const supportReminders = support.filter((s) => !["done", "cancelled"].includes(String(s.status)) && withinDays(s.due_date, 7)).length;
  return {
    total_clients: clients.length,
    total_projects: projects.length,
    active_projects: projects.filter((p) => p.status === "active").length,
    testing_projects: projects.filter((p) => p.status === "testing").length,
    delivered_projects: projects.filter((p) => p.status === "delivered").length,
    open_support_requests: support.filter((s) => !["done", "cancelled"].includes(String(s.status))).length,
    total_expected: expected,
    total_paid: paid,
    total_unpaid: expected - paid,
    total_expenses: expenses,
    net_profit: paid - expenses,
    reminders_count: projectReminders + supportReminders,
    recent_payments: payments.slice(0, 5),
    recent_projects: projects.slice(0, 5),
    monthly_revenue: monthlyRows.map((row) => ({ month: String(row.month).slice(0, 7), amount: money(row.paid_amount) })),
  };
}

export async function reminders(client: Db, ownerId: string) {
  const [projects, support, payments] = await Promise.all([
    execQuery<Row>(client.from("projects").select("id,client_id,name,status,test_end_date,domain_renewal_date,hosting_renewal_date,maintenance_end_date,total_price,expenses").eq("owner_id", ownerId).is("archived_at", null)).then((r) => r.data),
    execQuery<Row>(client.from("support_requests").select("id,client_id,project_id,title,status,priority,due_date,price").eq("owner_id", ownerId)).then((r) => r.data),
    execQuery<Row>(client.from("payments").select("amount,status").eq("owner_id", ownerId)).then((r) => r.data),
  ]);
  const paid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + money(p.amount), 0);
  const expected = projects.reduce((sum, p) => sum + money(p.total_price), 0) + support.reduce((sum, s) => sum + money(s.price), 0);
  return {
    overdue_tests: projects.filter((p) => beforeToday(p.test_end_date)),
    tests_ending_soon: projects.filter((p) => withinDays(p.test_end_date, 7)),
    domains_renewing_soon: projects.filter((p) => withinDays(p.domain_renewal_date, 30)),
    hosting_renewing_soon: projects.filter((p) => withinDays(p.hosting_renewal_date, 30)),
    maintenance_ending_soon: projects.filter((p) => withinDays(p.maintenance_end_date, 30)),
    support_due_soon: support.filter((s) => !["done", "cancelled"].includes(String(s.status)) && withinDays(s.due_date, 7)),
    unpaid_work: expected > paid ? [{ expected, paid, remaining: expected - paid }] : [],
  };
}

export async function getSettings(client: Db, ownerId: string) {
  const { data } = await execQuery<Row>(client.from("app_settings").select("*").eq("owner_id", ownerId).limit(1));
  if (data.length) return data[0];
  const { data: created } = await execQuery<Row>(client.from("app_settings").insert({ owner_id: ownerId }).select("*"));
  return ensureWritten(created);
}

export async function updateSettings(client: Db, ownerId: string, payload: Row) {
  await getSettings(client, ownerId);
  const { data } = await execQuery<Row>(client.from("app_settings").update(cleanPayload(payload)).eq("owner_id", ownerId).select("*"));
  return ensureWritten(data);
}

async function owned(client: Db, ownerId: string, table: string) {
  const { data } = await execQuery<Row>(client.from(table).select("*").eq("owner_id", ownerId));
  return data;
}

export async function revenueReport(client: Db, ownerId: string) {
  const { data } = await execQuery<Row>(client.from("monthly_revenue").select("month,paid_amount").eq("owner_id", ownerId).order("month"));
  const yearly: Record<string, number> = {};
  const monthly = data.flatMap((row) => {
    const amount = money(row.paid_amount);
    if (!amount) return [];
    const period = String(row.month).slice(0, 7);
    yearly[period.slice(0, 4)] = (yearly[period.slice(0, 4)] ?? 0) + amount;
    return [{ period, amount }];
  });
  return { monthly, yearly: Object.entries(yearly).sort().map(([period, amount]) => ({ period, amount })) };
}

export async function projectsStatusReport(client: Db, ownerId: string) {
  const rows = await owned(client, ownerId, "projects");
  const counts: Record<string, number> = {};
  for (const row of rows) counts[String(row.status ?? "unknown")] = (counts[String(row.status ?? "unknown")] ?? 0) + 1;
  return Object.entries(counts).sort().map(([status, count]) => ({ status, count }));
}

export async function unpaidReport(client: Db, ownerId: string) {
  const [projects, support, payments] = await Promise.all([
    execQuery<Row>(client.from("project_financials").select("expected_amount").eq("owner_id", ownerId).is("archived_at", null)).then((r) => r.data),
    execQuery<Row>(client.from("support_request_financials").select("expected_amount,status").eq("owner_id", ownerId)).then((r) => r.data),
    execQuery<Row>(client.from("payments").select("amount,status").eq("owner_id", ownerId)).then((r) => r.data),
  ]);
  const paid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + money(p.amount), 0);
  const expected = projects.reduce((sum, p) => sum + money(p.expected_amount), 0) + support.filter((s) => s.status !== "cancelled").reduce((sum, s) => sum + money(s.expected_amount), 0);
  return { expected, paid, unpaid: expected - paid };
}

export async function clientValueReport(client: Db, ownerId: string) {
  const { data } = await execQuery<Row>(client.from("client_financials").select("client_id,name,paid_amount").eq("owner_id", ownerId));
  return data.map((c) => ({ client_id: c.client_id, name: c.name, total_paid: money(c.paid_amount) })).sort((a, b) => b.total_paid - a.total_paid);
}

export async function exportJson(client: Db, ownerId: string) {
  const [clients, projects, payments, supportRequests, settings] = await Promise.all([
    owned(client, ownerId, "clients"),
    owned(client, ownerId, "projects"),
    owned(client, ownerId, "payments"),
    owned(client, ownerId, "support_requests"),
    owned(client, ownerId, "app_settings"),
  ]);
  return {
    clients,
    projects: projects.map(({ admin_password_note: _secret, ...project }) => project),
    payments,
    support_requests: supportRequests,
    settings,
  };
}

export async function exportCsv(client: Db, ownerId: string, name: string) {
  const tableMap: Record<string, string> = { clients: "clients", projects: "projects", payments: "payments", "support-requests": "support_requests" };
  const table = tableMap[name];
  if (!table) throw new ApiError(404, "Unknown export");
  const rows = await owned(client, ownerId, table);
  const cleaned = table === "projects" ? rows.map(({ admin_password_note: _secret, ...row }) => row) : rows;
  const fieldnames = cleaned.length ? [...new Set(cleaned.flatMap((row) => Object.keys(row)))].sort() : ["id"];
  return rowsToCsv(cleaned, fieldnames);
}
