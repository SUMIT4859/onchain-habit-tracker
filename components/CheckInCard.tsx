"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Check, Sparkles, Target } from "lucide-react";
import { useAccount } from "wagmi";

interface CheckInCardProps {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  onCheckIn?: () => void;
}

export function CheckInCard({ 
  totalHabits, 
  completedToday, 
  currentStreak,
  onCheckIn 
}: CheckInCardProps) {
  const { address } = useAccount();
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkInStreak, setCheckInStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const storageKey = `habitTracker_checkIn_${address}`;

  useEffect(() => {
    if (!address) return;

    // Load check-in state from localStorage
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const lastDate = new Date(data.lastCheckIn);
        const today = new Date();
        const isToday = lastDate.toDateString() === today.toDateString();
        setCheckedInToday(isToday);

        // Check if streak should reset (missed a day)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = lastDate.toDateString() === yesterday.toDateString();

        if (isToday || wasYesterday) {
          setCheckInStreak(data.streak || 0);
        } else if (!isToday) {
          // Streak broken
          setCheckInStreak(0);
          localStorage.setItem(storageKey, JSON.stringify({ ...data, streak: 0 }));
        }
      } catch {
        setCheckedInToday(false);
        setCheckInStreak(0);
      }
    }
  }, [address, storageKey]);

  const handleCheckIn = () => {
    if (checkedInToday || !address) return;

    const newStreak = checkInStreak + 1;
    setCheckInStreak(newStreak);
    setCheckedInToday(true);
    setShowConfetti(true);

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        lastCheckIn: new Date().toISOString(),
        streak: newStreak,
      })
    );

    setTimeout(() => setShowConfetti(false), 2000);
    onCheckIn?.();
  };

  const completionRate = totalHabits > 0 
    ? Math.round((completedToday / totalHabits) * 100) 
    : 0;

  // Use the higher streak (check-in streak or habit completion streak)
  const displayStreak = Math.max(checkInStreak, currentStreak);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl glass neu-shadow"
    >
      {/* Confetti effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  y: -20,
                  x: Math.random() * 100 + "%",
                  opacity: 1,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  y: "100%",
                  opacity: 0,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: Math.random() * 1 + 1,
                  delay: Math.random() * 0.3,
                }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ["#4ade80", "#38bdf8", "#f97316", "#eab308"][
                    Math.floor(Math.random() * 4)
                  ],
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Daily Progress
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {totalHabits > 0 
                ? `${completedToday}/${totalHabits} habits completed today`
                : "Add habits to start tracking"
              }
            </p>
          </div>

          {/* Streak Counter */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 rounded-full bg-orange-500/20 px-4 py-2"
          >
            <motion.div
              animate={{
                scale: displayStreak > 0 ? [1, 1.2, 1] : 1,
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                repeatDelay: 0.5,
              }}
            >
              <Flame className="h-5 w-5 text-orange-400" />
            </motion.div>
            <span className="text-xl font-bold text-orange-400">{displayStreak}</span>
          </motion.div>
        </div>

        {/* Progress Bar */}
        {totalHabits > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Today&apos;s progress</span>
              <span>{completionRate}%</span>
            </div>
            <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              />
            </div>
          </div>
        )}

        <motion.button
          onClick={handleCheckIn}
          disabled={checkedInToday}
          whileHover={!checkedInToday ? { scale: 1.02 } : {}}
          whileTap={!checkedInToday ? { scale: 0.98 } : {}}
          className={`relative w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all overflow-hidden ${
            checkedInToday
              ? "bg-primary/20 text-primary cursor-default"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {/* Pulse animation for unchecked state */}
          {!checkedInToday && (
            <motion.div
              className="absolute inset-0 bg-primary/30 rounded-lg"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          <span className="relative z-10 flex items-center gap-2">
            {checkedInToday ? (
              <>
                <Check className="h-5 w-5" />
                Checked in today
              </>
            ) : (
              <>
                <Target className="h-5 w-5" />
                Check In Now
              </>
            )}
          </span>
        </motion.button>

        {checkedInToday && displayStreak > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center text-sm text-muted-foreground"
          >
            {displayStreak >= 100
              ? "Legendary! You&apos;re a habit master!"
              : displayStreak >= 30
              ? "Amazing! Silver badge unlocked!"
              : displayStreak >= 7
              ? "Great work! Bronze badge earned!"
              : `${7 - displayStreak} more days until Bronze Badge!`}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

export function CheckInCardSkeleton() {
  return (
    <div className="rounded-xl glass neu-shadow p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className="h-5 bg-secondary/30 rounded w-32" />
          <div className="h-4 bg-secondary/20 rounded w-40" />
        </div>
        <div className="h-10 w-20 bg-secondary/30 rounded-full" />
      </div>
      <div className="h-2 bg-secondary/30 rounded-full mb-4" />
      <div className="h-12 bg-secondary/30 rounded-lg" />
    </div>
  );
}
