"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Lock, Sparkles } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  requiredDays: number;
  icon: string;
  color: string;
  glowColor: string;
  bgGradient: string;
}

const badges: Badge[] = [
  {
    id: "bronze",
    name: "Bronze Warrior",
    description: "7 days streak achieved",
    requiredDays: 7,
    icon: "🥉",
    color: "text-orange-400",
    glowColor: "rgba(251, 146, 60, 0.4)",
    bgGradient: "from-orange-500/20 to-orange-700/20",
  },
  {
    id: "silver",
    name: "Silver Champion",
    description: "30 days streak achieved",
    requiredDays: 30,
    icon: "🥈",
    color: "text-slate-300",
    glowColor: "rgba(203, 213, 225, 0.4)",
    bgGradient: "from-slate-400/20 to-slate-600/20",
  },
  {
    id: "gold",
    name: "Gold Legend",
    description: "100 days streak achieved",
    requiredDays: 100,
    icon: "🥇",
    color: "text-yellow-400",
    glowColor: "rgba(250, 204, 21, 0.5)",
    bgGradient: "from-yellow-400/20 to-yellow-600/20",
  },
];

interface BadgeRewardsProps {
  currentStreak?: number;
}

export function BadgeRewards({ currentStreak = 0 }: BadgeRewardsProps) {
  const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null);
  const prevStreakRef = useRef(currentStreak);

  useEffect(() => {
    // Check for newly unlocked badges when streak changes
    if (currentStreak > prevStreakRef.current) {
      badges.forEach((badge) => {
        if (
          currentStreak >= badge.requiredDays &&
          prevStreakRef.current < badge.requiredDays
        ) {
          setNewlyUnlocked(badge.id);
          setTimeout(() => setNewlyUnlocked(null), 3000);
        }
      });
    }
    prevStreakRef.current = currentStreak;
  }, [currentStreak]);

  const isUnlocked = (badge: Badge) => currentStreak >= badge.requiredDays;
  const getProgress = (badge: Badge) =>
    Math.min((currentStreak / badge.requiredDays) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl glass neu-shadow p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-foreground">Streak Badges</h3>
        {currentStreak > 0 && (
          <span className="text-sm text-muted-foreground">
            ({currentStreak} day streak)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {badges.map((badge, index) => {
          const unlocked = isUnlocked(badge);
          const progress = getProgress(badge);
          const isNew = newlyUnlocked === badge.id;

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`relative overflow-hidden rounded-xl p-4 transition-all ${
                unlocked
                  ? `bg-gradient-to-br ${badge.bgGradient} border border-white/10`
                  : "bg-secondary/30 border border-border/50"
              }`}
              style={{
                boxShadow: unlocked ? `0 0 30px ${badge.glowColor}` : "none",
              }}
            >
              {/* Sparkle animation for newly unlocked */}
              <AnimatePresence>
                {isNew && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{
                          scale: 2,
                          opacity: 0,
                          x: (Math.random() - 0.5) * 100,
                          y: (Math.random() - 0.5) * 100,
                        }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="absolute top-1/2 left-1/2"
                      >
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col items-center text-center">
                {/* Badge Icon */}
                <motion.div
                  animate={
                    unlocked
                      ? {
                          rotateY: [0, 360],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  className={`relative text-4xl mb-3 ${
                    !unlocked && "opacity-30 grayscale"
                  }`}
                >
                  {badge.icon}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>

                {/* Badge Info */}
                <h4
                  className={`font-semibold ${
                    unlocked ? badge.color : "text-muted-foreground"
                  }`}
                >
                  {badge.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {badge.description}
                </p>

                {/* Progress Bar */}
                {!unlocked && (
                  <div className="w-full mt-3">
                    <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full bg-gradient-to-r ${badge.bgGradient.replace(
                          "/20",
                          ""
                        )}`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentStreak}/{badge.requiredDays} days
                    </p>
                  </div>
                )}

                {unlocked && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 text-xs font-medium text-primary"
                  >
                    UNLOCKED
                  </motion.span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
