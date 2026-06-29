"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function CircularProgress({
  value,
  size = 220,
  strokeWidth = 12,
  label,
}: CircularProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background rings */}
      <svg width={size} height={size} className="absolute -rotate-90">
        {/* Outer glow track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1a1a1e"
          strokeWidth={strokeWidth}
        />
        {/* Gold progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#f5d97a" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="flex flex-col items-center gap-1 z-10">
        <motion.span
          className="text-5xl font-bold gold-gradient"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {Math.round(animatedValue)}%
        </motion.span>
        {label && (
          <span className="text-xs text-zinc-500 uppercase tracking-widest">{label}</span>
        )}
      </div>
    </div>
  );
}
