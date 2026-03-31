"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Check, Flame, Loader2, ExternalLink } from "lucide-react";
import { useChainId } from "wagmi";
import { EXPLORER_URLS } from "@/utils/contract";
import {
  calculateStreak,
  isCompletedToday,
  calculateBestStreak,
} from "@/utils/helpers";

interface HabitCardProps {
  id: number;
  title: string;
  description: string;
  completions: bigint[];
  onComplete: (habitId: number) => Promise<{ hash?: string; error?: string }>;
  isLoading: boolean;
}

export function HabitCard({
  id,
  title,
  description,
  completions,
  onComplete,
  isLoading,
}: HabitCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const chainId = useChainId();

  const streak = calculateStreak(completions);
  const bestStreak = calculateBestStreak(completions);
  const completedToday = isCompletedToday(completions);

  const handleComplete = async () => {
    if (completedToday || isLoading) return;
    const result = await onComplete(id);
    if (result?.hash) {
      setTxHash(result.hash);
    }
  };

  const explorerUrl = EXPLORER_URLS[chainId] || EXPLORER_URLS[84532];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? "perspective(1000px) rotateX(2deg)" : "none",
      }}
      className="group relative overflow-hidden rounded-xl glass neu-shadow transition-all duration-300 hover:neu-shadow-sm"
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        animate={{ opacity: isHovered ? 1 : 0 }}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1">
              {title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>

          {/* Streak Badge */}
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-3 flex items-center gap-1 rounded-full bg-orange-500/20 px-2.5 py-1"
            >
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-bold text-orange-400">
                {streak}
              </span>
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>Total:</span>
            <span className="font-medium text-foreground">
              {completions.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>Best:</span>
            <span className="font-medium text-orange-400">{bestStreak}</span>
          </div>
        </div>

        {/* Complete Button */}
        <motion.button
          onClick={handleComplete}
          disabled={completedToday || isLoading}
          whileHover={!completedToday && !isLoading ? { scale: 1.02 } : {}}
          whileTap={!completedToday && !isLoading ? { scale: 0.98 } : {}}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            completedToday
              ? "bg-primary/20 text-primary cursor-default"
              : isLoading
                ? "bg-secondary/50 text-muted-foreground cursor-wait"
                : "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Confirming...</span>
            </>
          ) : completedToday ? (
            <>
              <Check className="h-4 w-4" />
              <span>Completed Today</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Mark Complete</span>
            </>
          )}
        </motion.button>

        {/* Transaction Link */}
        {txHash && (
          <motion.a
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            href={`${explorerUrl}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
          >
            <span>View Transaction</span>
            <ExternalLink className="h-3 w-3" />
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}

// Skeleton loader for habit card
export function HabitCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl glass neu-shadow animate-pulse">
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="h-5 w-3/4 rounded bg-secondary/50" />
            <div className="mt-2 h-4 w-full rounded bg-secondary/30" />
          </div>
          <div className="ml-3 h-6 w-12 rounded-full bg-secondary/50" />
        </div>
        <div className="mb-4 flex gap-4">
          <div className="h-4 w-16 rounded bg-secondary/30" />
          <div className="h-4 w-16 rounded bg-secondary/30" />
        </div>
        <div className="h-10 w-full rounded-lg bg-secondary/50" />
      </div>
    </div>
  );
}
