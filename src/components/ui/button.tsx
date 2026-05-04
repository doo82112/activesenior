"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  children,
  ...props
}, ref) => {
  const variants = {
    primary: "bg-accent text-slate-900 hover:bg-accent/90 shadow-[0_0_15px_rgba(212,175,55,0.3)]",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
    outline: "border border-accent/50 text-accent hover:bg-accent/10",
    ghost: "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs rounded-lg",
    md: "h-12 px-6 text-base rounded-xl",
    lg: "h-14 px-8 text-lg rounded-2xl",
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex items-center justify-center font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
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
});

Button.displayName = "Button";
