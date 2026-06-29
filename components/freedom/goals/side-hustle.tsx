"use client";

import { Rocket, TrendingUp, Users, Globe, Mail, Play } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { useAppStore } from "@/lib/freedom/store/app-store";
import { ModalHeader } from "./modal-header";
import { EditableMetric } from "./editable-metric";

export function SideHustleModal({ onClose: _ }: { onClose: () => void }) {
  const { goals, updateGoalField, toggleChecklistItem } = useAppStore();
  const data = goals["side-hustle"];

  const completedChecklist = data.checklist.filter((c) => c.completed).length;
  const progress = Math.round((completedChecklist / data.checklist.length) * 100);

  return (
    <div className="p-8">
      <ModalHeader
        icon={<Rocket className="w-6 h-6 text-[#d4af37]" />}
        title="Side Hustle"
        subtitle="Build your own revenue engine"
        progress={progress}
        current={`₹${data.mrr.toLocaleString()}`}
        target="MRR"
        unit=""
      />

      <div className="mt-8 grid grid-cols-2 gap-4">
        <EditableMetric
          label="Monthly Revenue"
          value={data.monthlyRevenue}
          icon={<TrendingUp className="w-4 h-4" />}
          color="#d4af37"
          onChange={(v) => updateGoalField("side-hustle", "monthlyRevenue", v)}
          prefix="₹"
        />
        <EditableMetric
          label="MRR"
          value={data.mrr}
          icon={<TrendingUp className="w-4 h-4" />}
          color="#22c55e"
          onChange={(v) => updateGoalField("side-hustle", "mrr", v)}
          prefix="₹"
        />
        <EditableMetric
          label="LinkedIn Posts"
          value={data.linkedinPosts}
          icon={<Users className="w-4 h-4" />}
          color="#3b82f6"
          onChange={(v) => updateGoalField("side-hustle", "linkedinPosts", v)}
          suffix="posts"
        />
        <EditableMetric
          label="YouTube Videos"
          value={data.youtubeVideos}
          icon={<Play className="w-4 h-4" />}
          color="#ef4444"
          onChange={(v) => updateGoalField("side-hustle", "youtubeVideos", v)}
          suffix="videos"
        />
        <EditableMetric
          label="Newsletter Subscribers"
          value={data.newsletterSubscribers}
          icon={<Mail className="w-4 h-4" />}
          color="#a855f7"
          onChange={(v) => updateGoalField("side-hustle", "newsletterSubscribers", v)}
          suffix="subs"
        />
        <EditableMetric
          label="Email List"
          value={data.emailList}
          icon={<Mail className="w-4 h-4" />}
          color="#f97316"
          onChange={(v) => updateGoalField("side-hustle", "emailList", v)}
          suffix="contacts"
        />
        <EditableMetric
          label="Website Visitors"
          value={data.websiteVisitors}
          icon={<Globe className="w-4 h-4" />}
          color="#06b6d4"
          onChange={(v) => updateGoalField("side-hustle", "websiteVisitors", v)}
          suffix="/mo"
        />
      </div>

      {/* Launch checklist */}
      <div className="mt-6 space-y-3">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Launch Checklist</p>
        {data.checklist.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => toggleChecklistItem("side-hustle", item.id)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-[#232329] bg-[#111113] hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 transition-all group text-left"
          >
            {item.completed ? (
              <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-zinc-600 group-hover:text-[#d4af37] shrink-0 transition-colors" />
            )}
            <span className={`text-sm ${item.completed ? "line-through text-zinc-500" : "text-zinc-200"}`}>
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Revenue chart */}
      {data.revenueHistory.length > 1 && (
        <div className="mt-6">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Revenue Growth</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data.revenueHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#232329" />
              <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111113", border: "1px solid #232329", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#d4af37" fill="url(#revenueGrad)" strokeWidth={2} dot={{ fill: "#d4af37", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
