"use client";

import { Dumbbell, Droplets, Flame, Scale } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAppStore } from "@/lib/freedom/store/app-store";
import { ModalHeader } from "./modal-header";
import { EditableMetric } from "./editable-metric";

export function FitnessModal({ onClose: _ }: { onClose: () => void }) {
  const { goals, updateGoalField } = useAppStore();
  const data = goals.fitness;

  const startWeight = 80;
  const weightLost = Math.max(startWeight - data.currentWeight, 0);
  const totalToLose = startWeight - data.goalWeight;
  const progress = totalToLose > 0 ? Math.min(Math.round((weightLost / totalToLose) * 100), 100) : 0;

  return (
    <div className="p-8">
      <ModalHeader
        icon={<Dumbbell className="w-6 h-6 text-[#d4af37]" />}
        title="Lean & Fit"
        subtitle="Transform your body"
        progress={progress}
        current={`${data.currentWeight}kg`}
        target={`${data.goalWeight}kg`}
        unit="goal"
      />

      <div className="mt-8 grid grid-cols-2 gap-4">
        <EditableMetric
          label="Current Weight"
          value={data.currentWeight}
          icon={<Scale className="w-4 h-4" />}
          color="#d4af37"
          onChange={(v) => updateGoalField("fitness", "currentWeight", v)}
          suffix="kg"
        />
        <EditableMetric
          label="Goal Weight"
          value={data.goalWeight}
          icon={<Scale className="w-4 h-4" />}
          color="#22c55e"
          onChange={(v) => updateGoalField("fitness", "goalWeight", v)}
          suffix="kg"
        />
        <EditableMetric
          label="Body Fat %"
          value={data.bodyFatPercent}
          icon={<Flame className="w-4 h-4" />}
          color="#f97316"
          onChange={(v) => updateGoalField("fitness", "bodyFatPercent", v)}
          suffix="%"
        />
        <EditableMetric
          label="Waist"
          value={data.waistCm}
          icon={<Scale className="w-4 h-4" />}
          color="#a855f7"
          onChange={(v) => updateGoalField("fitness", "waistCm", v)}
          suffix="cm"
        />
        <EditableMetric
          label="Gym Sessions"
          value={data.gymSessions}
          icon={<Dumbbell className="w-4 h-4" />}
          color="#3b82f6"
          onChange={(v) => updateGoalField("fitness", "gymSessions", v)}
          suffix="sessions"
        />
        <EditableMetric
          label="Protein Days"
          value={data.proteinDays}
          icon={<Flame className="w-4 h-4" />}
          color="#22c55e"
          onChange={(v) => updateGoalField("fitness", "proteinDays", v)}
          suffix="days"
        />
        <EditableMetric
          label="Water Intake"
          value={data.waterIntake}
          icon={<Droplets className="w-4 h-4" />}
          color="#06b6d4"
          onChange={(v) => updateGoalField("fitness", "waterIntake", v)}
          suffix="L/day"
        />
        <EditableMetric
          label="Workout Streak"
          value={data.workoutStreak}
          icon={<Flame className="w-4 h-4" />}
          color="#ef4444"
          onChange={(v) => updateGoalField("fitness", "workoutStreak", v)}
          suffix="days 🔥"
        />
      </div>

      {data.weightHistory.length > 1 && (
        <div className="mt-6">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Weight Trend</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data.weightHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#232329" />
              <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#111113", border: "1px solid #232329", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "#71717a" }}
              />
              <Area type="monotone" dataKey="weight" stroke="#d4af37" fill="url(#weightGrad)" strokeWidth={2} dot={{ fill: "#d4af37", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
