"use client";

import { Star, Users, TrendingUp, DollarSign, UserCheck, Heart } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { useAppStore } from "@/lib/freedom/store/app-store";
import { ModalHeader } from "./modal-header";
import { EditableMetric } from "./editable-metric";

export function DirectorModal({ onClose: _ }: { onClose: () => void }) {
  const { goals, updateGoalField } = useAppStore();
  const data = goals.director;

  const radarData = [
    { subject: "Trainings", value: Math.min(data.teamTrainings * 10, 100) },
    { subject: "AI Initiatives", value: Math.min(data.aiInitiatives * 20, 100) },
    { subject: "Revenue", value: Math.min((data.revenueGenerated / 1000000) * 10, 100) },
    { subject: "Clients", value: Math.min(data.clientsManaged * 10, 100) },
    { subject: "Team Sat.", value: data.teamSatisfaction },
    { subject: "Readiness", value: data.promotionReadiness },
  ];

  return (
    <div className="p-8">
      <ModalHeader
        icon={<Star className="w-6 h-6 text-[#d4af37]" />}
        title="Director"
        subtitle="Build leadership before the title"
        progress={data.promotionReadiness}
        current={`${data.promotionReadiness}%`}
        target="100%"
        unit="ready"
      />

      <div className="mt-8 grid grid-cols-2 gap-4">
        <EditableMetric
          label="Team Trainings"
          value={data.teamTrainings}
          icon={<Users className="w-4 h-4" />}
          color="#d4af37"
          onChange={(v) => updateGoalField("director", "teamTrainings", v)}
          suffix="sessions"
        />
        <EditableMetric
          label="AI Initiatives"
          value={data.aiInitiatives}
          icon={<TrendingUp className="w-4 h-4" />}
          color="#3b82f6"
          onChange={(v) => updateGoalField("director", "aiInitiatives", v)}
          suffix="launched"
        />
        <EditableMetric
          label="Revenue Generated"
          value={data.revenueGenerated}
          icon={<DollarSign className="w-4 h-4" />}
          color="#22c55e"
          onChange={(v) => updateGoalField("director", "revenueGenerated", v)}
          prefix="₹"
        />
        <EditableMetric
          label="Clients Managed"
          value={data.clientsManaged}
          icon={<UserCheck className="w-4 h-4" />}
          color="#a855f7"
          onChange={(v) => updateGoalField("director", "clientsManaged", v)}
          suffix="clients"
        />
        <EditableMetric
          label="Team Satisfaction"
          value={data.teamSatisfaction}
          icon={<Heart className="w-4 h-4" />}
          color="#ef4444"
          onChange={(v) => updateGoalField("director", "teamSatisfaction", Math.min(100, v))}
          suffix="%"
        />
        <EditableMetric
          label="Promotion Readiness"
          value={data.promotionReadiness}
          icon={<Star className="w-4 h-4" />}
          color="#d4af37"
          onChange={(v) => updateGoalField("director", "promotionReadiness", Math.min(100, v))}
          suffix="%"
        />
      </div>

      {/* Radar chart */}
      <div className="mt-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Leadership Radar</p>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#232329" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#71717a", fontSize: 11 }} />
            <Radar dataKey="value" stroke="#d4af37" fill="#d4af37" fillOpacity={0.1} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
