import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "@/components/freedom/layout/command-palette";
import { TooltipProvider } from "@/components/freedom/ui/tooltip";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OPERATION: FREEDOM 2026 — Abhinav Jha",
  description: "Personal Mission Control Dashboard — Build Skills. Build Wealth. Build Freedom.",
};

export default function FreedomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geist.variable} ${geistMono.variable} freedom-root`}>
      <TooltipProvider>
        {children}
        <CommandPalette />
      </TooltipProvider>
    </div>
  );
}
