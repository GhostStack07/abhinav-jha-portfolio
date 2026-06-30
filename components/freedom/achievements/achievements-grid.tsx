"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { format } from "date-fns";
import { useAppStore } from "@/lib/freedom/store/app-store";

export function AchievementsGrid() {
  const { achievements } = useAppStore();
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🏆</span>
        <div>
          <h3 className="text-sm font-semibold text-white">Achievements</h3>
          <p className="text-xs text-zinc-500">
            {unlocked} / {achievements.length} unlocked
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {achievements.map((achievement, i) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={`relative p-4 sm:p-5 rounded-2xl border text-center transition-all duration-200 ${
              achievement.unlocked
                ? "border-[#d4af37]/40 bg-[#d4af37]/5 gold-glow"
                : "border-[#232329] bg-[#111113] opacity-60"
            }`}
          >
            {!achievement.unlocked && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#09090b]/60 backdrop-blur-sm">
                <Lock className="w-5 h-5 text-zinc-600" />
              </div>
            )}

            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{achievement.icon}</div>
            <h4 className="text-xs sm:text-sm font-bold text-white mb-1 leading-tight">{achievement.title}</h4>
            <p className="text-[10px] sm:text-xs text-zinc-500 leading-snug">{achievement.description}</p>

            {achievement.unlocked && achievement.unlockedAt && (
              <p className="text-[10px] sm:text-xs text-[#d4af37] mt-2">
                ✓ {format(new Date(achievement.unlockedAt), "MMM d")}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
