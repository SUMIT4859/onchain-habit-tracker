"use client";

import { motion } from "framer-motion";
import { Target, CheckCircle2, Flame, Trophy } from "lucide-react";

interface StatsDashboardProps {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  bestStreak: number;
}

const statVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

export function StatsDashboard({
  totalHabits,
  completedToday,
  currentStreak,
  bestStreak,
}: StatsDashboardProps) {
  const stats = [
    {
      label: "Total Habits",
      value: totalHabits,
      icon: Target,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Completed Today",
      value: completedToday,
      icon: CheckCircle2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Current Streak",
      value: currentStreak,
      icon: Flame,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
    {
      label: "Best Streak",
      value: bestStreak,
      icon: Trophy,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={statVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          className="group relative overflow-hidden rounded-xl glass neu-shadow-sm transition-all"
        >
          {/* Subtle gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {stat.label}
                </p>
                <motion.p
                  key={stat.value}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-2xl font-bold ${stat.color}`}
                >
                  {stat.value}
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Skeleton loader for stats
export function StatsDashboardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl glass neu-shadow-sm animate-pulse"
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-secondary/50" />
              <div className="flex-1">
                <div className="h-3 w-16 rounded bg-secondary/30" />
                <div className="mt-2 h-7 w-10 rounded bg-secondary/50" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
