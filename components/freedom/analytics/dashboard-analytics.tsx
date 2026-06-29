"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAppStore } from "@/lib/freedom/store/app-store";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export function DashboardAnalytics() {
  const { goals, habits } = useAppStore();

  // Goal completion data for pie
  const goalCompletions = [
    { name: "AI Engineer", value: Math.round((goals["ai-engineer"].projects.filter((p) => p.completed).length / 10) * 100) },
    { name: "AI Consultant", value: Math.round((goals["ai-consultant"].clients / 5) * 100) },
    { name: "Fitness", value: Math.max(0, Math.round(((80 - goals.fitness.currentWeight) / (80 - goals.fitness.goalWeight)) * 100)) },
    { name: "Swimming", value: Math.round((goals.swimming.levels.filter((l) => l.completed).length / 6) * 100) },
    { name: "Drone", value: Math.round((goals.drone.checklist.filter((d) => d.completed).length / 7) * 100) },
    { name: "Director", value: goals.director.promotionReadiness },
  ];

  const COLORS = ["#d4af37", "#22c55e", "#3b82f6", "#a855f7", "#f97316", "#ef4444"];

  // Weekly habit completion
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const habitsByDay = weekDays.map((day, i) => {
    const count = habits.filter((h) => {
      const d = new Date(h.date).getDay();
      const adjusted = d === 0 ? 6 : d - 1;
      return adjusted === i;
    }).reduce((sum, h) => {
      const keys = ["meditation", "reading", "workout", "deepWork", "water", "sleep", "journal"] as const;
      return sum + keys.filter((k) => h[k]).length;
    }, 0);
    return { day, habits: count };
  });

  // Income growth (wealth data)
  const incomeData = goals.wealth.monthlyHistory;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass border border-[#232329] rounded-xl p-3 text-xs">
        <p className="text-zinc-400 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.fill || p.stroke }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goal completion */}
        <div className="p-6 rounded-2xl border border-[#232329] bg-[#111113]">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-6">
            Goal Completion %
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={goalCompletions}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {goalCompletions.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#71717a" }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly habits */}
        <div className="p-6 rounded-2xl border border-[#232329] bg-[#111113]">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-6">
            Habits by Day of Week
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={habitsByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232329" />
              <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="habits" name="Habits" fill="#d4af37" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income growth */}
      <div className="p-6 rounded-2xl border border-[#232329] bg-[#111113]">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-6">
          Monthly Income Growth
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={incomeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232329" />
            <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="income" name="Income" stroke="#d4af37" strokeWidth={2} dot={{ fill: "#d4af37", r: 4 }} />
            <Line type="monotone" dataKey="savings" name="Savings" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 4 }} />
            <Line type="monotone" dataKey="investments" name="Investments" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
