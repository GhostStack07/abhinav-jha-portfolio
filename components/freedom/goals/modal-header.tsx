"use client";

import { motion } from "framer-motion";

interface ModalHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  progress: number;
  current: number | string;
  target: number | string;
  unit: string;
}

export function ModalHeader({ icon, title, subtitle, progress, current, target, unit }: ModalHeaderProps) {
  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-zinc-500 text-sm mt-0.5">{subtitle}</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black gold-gradient">{progress}%</span>
          <p className="text-xs text-zinc-600 mt-0.5">
            {current} / {target} {unit}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="h-2 w-full rounded-full bg-[#1a1a1e] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#f5d97a]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
