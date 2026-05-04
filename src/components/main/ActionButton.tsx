"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  color: string;
  activeColor?: string;
  label: string;
  isActive?: boolean;
  badgeCount?: number;
}

const formatBadge = (count: number) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return count.toString();
};

export function ActionButton({ icon: Icon, onClick, color, activeColor, label, isActive, badgeCount }: ActionButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex flex-col items-center gap-2 group cursor-pointer touch-manipulation active:opacity-50 transition-opacity outline-none"
    >
      <div className={`
        relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
        ${isActive ? (activeColor || "bg-accent text-black") : "bg-slate-900/80 backdrop-blur-md text-slate-400 border border-white/10"}
        ${!isActive && color}
      `}>
        <Icon size={28} />
        {badgeCount !== undefined && badgeCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-900 min-w-[24px] flex items-center justify-center shadow-lg">
            {formatBadge(badgeCount)}
          </div>
        )}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-tighter transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`}>
        {label}
      </span>
    </button>
  );
}
