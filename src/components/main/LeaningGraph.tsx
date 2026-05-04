"use client";

import { motion } from "framer-motion";

interface LeaningGraphProps {
  leaning: {
    red: number;
    blue: number;
    orange: number;
  };
  reactionCount: number;
}

export function LeaningGraph({ leaning, reactionCount }: LeaningGraphProps) {
  const safeLeaning = leaning || { red: 0, blue: 0, orange: 0 };
  const total = safeLeaning.red + safeLeaning.blue + safeLeaning.orange;
  
  const isPending = reactionCount === 0;
  
  const redWidth = isPending ? 0 : (safeLeaning.red / total) * 100;
  const blueWidth = isPending ? 0 : (safeLeaning.blue / total) * 100;
  const orangeWidth = isPending ? 0 : (safeLeaning.orange / total) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="h-4 w-full flex overflow-hidden bg-slate-800">
        {isPending ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            className="bg-slate-700 h-full shadow-[inset_0_0_10px_rgba(0,0,0,0.3)] flex items-center justify-center"
          >
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Awaiting Community Feedback</span>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${redWidth}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="bg-leaning-red h-full shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${blueWidth}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="bg-leaning-blue h-full shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${orangeWidth}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="bg-leaning-orange h-full shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]"
            />
          </>
        )}
      </div>
      
      {/* Label Overlay */}
      <div className="flex justify-between px-4 py-1 text-[10px] font-bold tracking-tighter text-slate-500 uppercase">
        <span>{isPending ? "Community Consensus Pending" : "Community Sentiment Analysis"}</span>
        {!isPending && (
          <div className="flex gap-3">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-leaning-red"/> CONSERVATIVE</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-leaning-blue"/> LIBERAL</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-leaning-orange"/> NEUTRAL</span>
          </div>
        )}
      </div>
    </div>
  );
}
