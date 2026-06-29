"use client";

import { useState } from "react";
import { Users, Globe, Briefcase, Mic, FileText, TrendingUp } from "lucide-react";
import { useAppStore } from "@/lib/freedom/store/app-store";
import { ModalHeader } from "./modal-header";
import { EditableMetric } from "./editable-metric";

export function AIConsultantModal({ onClose: _ }: { onClose: () => void }) {
  const { goals, updateGoalField } = useAppStore();
  const data = goals["ai-consultant"];
  const progress = Math.round((data.clients / data.targetClients) * 100);

  return (
    <div className="p-8">
      <ModalHeader
        icon={<Users className="w-6 h-6 text-[#d4af37]" />}
        title="AI Consultant"
        subtitle="Land 5 Paying Clients"
        progress={Math.min(progress, 100)}
        current={data.clients}
        target={data.targetClients}
        unit="clients"
      />

      <div className="mt-8 grid grid-cols-2 gap-4">
        <EditableMetric
          label="Paying Clients"
          value={data.clients}
          icon={<Briefcase className="w-4 h-4" />}
          color="#d4af37"
          onChange={(v) => updateGoalField("ai-consultant", "clients", v)}
          suffix="clients"
        />
        <EditableMetric
          label="Revenue Earned"
          value={data.revenue}
          icon={<TrendingUp className="w-4 h-4" />}
          color="#22c55e"
          onChange={(v) => updateGoalField("ai-consultant", "revenue", v)}
          prefix="₹"
        />
        <EditableMetric
          label="LinkedIn Followers"
          value={data.linkedinFollowers}
          icon={<Users className="w-4 h-4" />}
          color="#3b82f6"
          onChange={(v) => updateGoalField("ai-consultant", "linkedinFollowers", v)}
          suffix="followers"
        />
        <EditableMetric
          label="Speaking Sessions"
          value={data.speakingSessions}
          icon={<Mic className="w-4 h-4" />}
          color="#a855f7"
          onChange={(v) => updateGoalField("ai-consultant", "speakingSessions", v)}
          suffix="sessions"
        />
        <EditableMetric
          label="Case Studies"
          value={data.caseStudies}
          icon={<FileText className="w-4 h-4" />}
          color="#f97316"
          onChange={(v) => updateGoalField("ai-consultant", "caseStudies", v)}
          suffix="published"
        />
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-all duration-150"
          style={{
            borderColor: data.websiteComplete ? "#22c55e40" : "#23232940",
            background: data.websiteComplete ? "#22c55e08" : "#11111308",
          }}
          onClick={() => updateGoalField("ai-consultant", "websiteComplete", !data.websiteComplete)}
        >
          <Globe className="w-4 h-4" style={{ color: data.websiteComplete ? "#22c55e" : "#71717a" }} />
          <div>
            <p className="text-xs text-zinc-500">Website</p>
            <p className="text-sm font-semibold" style={{ color: data.websiteComplete ? "#22c55e" : "#ffffff" }}>
              {data.websiteComplete ? "Live ✓" : "In Progress"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
