"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  isLoading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  isLoading,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-accent text-slate-900 hover:bg-accent/90 shadow-[0_0_15px_rgba(212,175,55,0.3)]",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
    outline: "border border-accent/50 text-accent hover:bg-accent/10",
    ghost: "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex h-12 items-center justify-center rounded-xl px-6 py-2 text-base font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      ) : (
        children
      )}
    </motion.button>
  );
}
