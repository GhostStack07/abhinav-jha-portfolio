import type { Metadata } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "@/components/freedom/layout/command-palette";
import { TooltipProvider } from "@/components/freedom/ui/tooltip";

// Match the portfolio's exact font stack
const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const interTight = Inter_Tight({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "OPERATION: FREEDOM 2026 — Abhinav Jha",
  description: "Personal Mission Control Dashboard — Build Skills. Build Wealth. Build Freedom.",
};

export default function FreedomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${instrumentSerif.variable} ${interTight.variable} ${jetbrainsMono.variable} freedom-root`}>
      <TooltipProvider>
        {children}
        <CommandPalette />
      </TooltipProvider>
    </div>
  );
}
