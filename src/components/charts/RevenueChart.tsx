import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueChart({ data }: { data: { month?: string; period?: string; amount: number }[] }) {
  return (
    <div className="card" style={{ height: 320 }}>
      <h3 className="card-title">Monthly Revenue</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={(item) => item.month ?? item.period} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" fill="var(--primary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
