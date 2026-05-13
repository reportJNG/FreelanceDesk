"use client";

import { AlertTriangle, Briefcase, CheckCircle, LifeBuoy, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { MoneyCard } from "../../components/common/MoneyCard";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { RevenueChart } from "../../components/charts/RevenueChart";
import { dashboardApi } from "./dashboardApi";

export function DashboardPage() {
  const query = useQuery({ queryKey: ["dashboard", "summary"], queryFn: dashboardApi.summary });
  if (query.isLoading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} />;
  const data = query.data!;
  return (
    <>
      <PageHeader title="Dashboard" description="Your client work, money, support, and reminders at a glance." />
      <section className="grid stats">
        <StatCard label="Total Clients" value={data.total_clients} icon={Users} />
        <StatCard label="Active Projects" value={data.active_projects} icon={Briefcase} />
        <StatCard label="Testing Projects" value={data.testing_projects} icon={CheckCircle} />
        <StatCard label="Open Fixes" value={data.open_support_requests} icon={LifeBuoy} />
        <MoneyCard label="Total Gained" value={data.total_paid} />
        <MoneyCard label="Total Unpaid" value={data.total_unpaid} />
        <MoneyCard label="Net Profit" value={data.net_profit} />
        <StatCard label="Reminders" value={data.reminders_count} icon={AlertTriangle} />
      </section>
      <div className="section-gap"><RevenueChart data={data.monthly_revenue} /></div>
    </>
  );
}
