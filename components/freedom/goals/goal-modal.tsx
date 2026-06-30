"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { GoalId } from "@/lib/freedom/types";
import { AIEngineerModal } from "./ai-engineer";
import { AIConsultantModal } from "./ai-consultant";
import { WealthModal } from "./wealth";
import { FitnessModal } from "./fitness";
import { SwimmingModal } from "./swimming";
import { BadmintonModal } from "./badminton";
import { DroneModal } from "./drone";
import { DirectorModal } from "./director";
import { DecemberTripModal } from "./december-trip";
import { SideHustleModal } from "./side-hustle";
import { BookReadingModal } from "./book-reading";

const MODAL_MAP: Record<GoalId, React.ComponentType<{ onClose: () => void }>> = {
  "ai-engineer": AIEngineerModal,
  "ai-consultant": AIConsultantModal,
  wealth: WealthModal,
  fitness: FitnessModal,
  swimming: SwimmingModal,
  badminton: BadmintonModal,
  drone: DroneModal,
  director: DirectorModal,
  "december-trip": DecemberTripModal,
  "side-hustle": SideHustleModal,
  "book-reading": BookReadingModal,
};

interface GoalModalProps {
  goalId: GoalId | null;
  onClose: () => void;
}

export function GoalModal({ goalId, onClose }: GoalModalProps) {
  const ModalContent = goalId ? MODAL_MAP[goalId] : null;

  return (
    <AnimatePresence>
      {goalId && ModalContent && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-8 pb-8 px-4"
            onClick={onClose}
          >
            <div
              className="relative w-full max-w-3xl rounded-3xl border border-[#232329] bg-[#0d0d0f] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-[#232329] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <ModalContent onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
