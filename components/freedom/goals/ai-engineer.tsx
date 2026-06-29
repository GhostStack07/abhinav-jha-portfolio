"use client";

import { motion } from "framer-motion";
import { Bot, CheckCircle2, Circle } from "lucide-react";
import { useAppStore } from "@/lib/freedom/store/app-store";
import { ModalHeader } from "./modal-header";

export function AIEngineerModal({ onClose }: { onClose: () => void }) {
  const { goals, toggleChecklistItem } = useAppStore();
  const { projects } = goals["ai-engineer"];
  const completed = projects.filter((p) => p.completed).length;
  const progress = Math.round((completed / projects.length) * 100);

  return (
    <div className="p-8">
      <ModalHeader
        icon={<Bot className="w-6 h-6 text-[#d4af37]" />}
        title="AI Engineer"
        subtitle="Build 10 AI Projects"
        progress={progress}
        current={completed}
        target={projects.length}
        unit="projects"
      />

      <div className="mt-8 space-y-3">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Project Checklist</p>
        {projects.map((project, i) => (
          <motion.button
            key={project.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => toggleChecklistItem("ai-engineer", project.id)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-[#232329] bg-[#111113] hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 transition-all duration-150 group text-left"
          >
            <div className="shrink-0">
              {project.completed ? (
                <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-600 group-hover:text-[#d4af37] transition-colors" />
              )}
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                project.completed
                  ? "line-through text-zinc-500"
                  : "text-zinc-200 group-hover:text-white"
              }`}
            >
              {project.label}
            </span>
            {project.completed && (
              <span className="ml-auto text-xs text-[#22c55e] border border-[#22c55e]/30 rounded-full px-2 py-0.5 bg-[#22c55e]/10">
                Done
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-[#d4af37]/5 border border-[#d4af37]/20">
        <p className="text-xs text-zinc-400">
          <span className="text-[#d4af37] font-semibold">{completed}</span> of{" "}
          <span className="font-semibold text-white">10</span> projects shipped.{" "}
          {10 - completed > 0
            ? `${10 - completed} more to become an AI Engineer.`
            : "🎉 Mission accomplished!"}
        </p>
      </div>
    </div>
  );
}
