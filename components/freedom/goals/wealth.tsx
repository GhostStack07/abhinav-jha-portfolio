"use client";

import { DollarSign, TrendingUp, PiggyBank, Wallet } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { useAppStore } from "@/lib/freedom/store/app-store";
import { ModalHeader } from "./modal-header";
import { EditableMetric } from "./editable-metric";

export function WealthModal({ onClose: _ }: { onClose: () => void }) {
  const { goals, updateGoalField } = useAppStore();
  const data = goals.wealth;

  const totalWealth = data.salary + data.sideHustleRevenue + data.investmentGrowth + data.savings;
  const progress = Math.min(Math.round((totalWealth / data.targetAmount) * 100), 100);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass border border-[#232329] rounded-xl p-3 text-xs">
        <p className="text-zinc-400 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: ₹{p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8">
      <ModalHeader
        icon={<DollarSign className="w-6 h-6 text-[#d4af37]" />}
        title="₹30 Lakhs"
        subtitle="Financial Freedom Target"
        progress={progress}
        current={`₹${(totalWealth / 100000).toFixed(1)}L`}
        target="₹30L"
        unit=""
      />

      <div className="mt-8 grid grid-cols-2 gap-4">
        <EditableMetric
          label="Monthly Salary"
          value={data.salary}
          icon={<Wallet className="w-4 h-4" />}
          color="#d4af37"
          onChange={(v) => updateGoalField("wealth", "salary", v)}
          prefix="₹"
        />
        <EditableMetric
          label="Side Hustle Revenue"
          value={data.sideHustleRevenue}
          icon={<TrendingUp className="w-4 h-4" />}
          color="#22c55e"
          onChange={(v) => updateGoalField("wealth", "sideHustleRevenue", v)}
          prefix="₹"
        />
        <EditableMetric
          label="Investment Growth"
          value={data.investmentGrowth}
          icon={<TrendingUp className="w-4 h-4" />}
          color="#3b82f6"
          onChange={(v) => updateGoalField("wealth", "investmentGrowth", v)}
          prefix="₹"
        />
        <EditableMetric
          label="Savings"
          value={data.savings}
          icon={<PiggyBank className="w-4 h-4" />}
          color="#a855f7"
          onChange={(v) => updateGoalField("wealth", "savings", v)}
          prefix="₹"
        />
      </div>

      {/* Net worth bar */}
      <div className="mt-6 p-4 rounded-2xl bg-[#d4af37]/5 border border-[#d4af37]/20">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-zinc-500">Financial Freedom Progress</span>
          <span className="text-sm font-bold text-[#d4af37]">{progress}%</span>
        </div>
        <div className="h-3 rounded-full bg-[#1a1a1e] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#f5d97a] transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          ₹{totalWealth.toLocaleString()} of ₹30,00,000 target
        </p>
      </div>

      {/* Chart */}
      {data.monthlyHistory.some((m) => m.income > 0) && (
        <div className="mt-6">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Monthly Growth</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data.monthlyHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#232329" />
              <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#d4af37" fill="url(#incomeGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="savings" name="Savings" stroke="#22c55e" fill="url(#savingsGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
