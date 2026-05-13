export type DashboardSummary = {
  total_clients: number;
  total_projects: number;
  active_projects: number;
  testing_projects: number;
  delivered_projects: number;
  open_support_requests: number;
  total_expected: number;
  total_paid: number;
  total_unpaid: number;
  total_expenses: number;
  net_profit: number;
  reminders_count: number;
  monthly_revenue: { month: string; amount: number }[];
};

