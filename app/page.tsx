"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { Toaster } from "sonner";
import {
  Plus,
  Wallet,
  ArrowRight,
  LayoutDashboard,
  Trophy,
  BarChart3,
  Users,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { Navbar } from "@/components/Navbar";
import { HabitCard, HabitCardSkeleton } from "@/components/HabitCard";
import {
  StatsDashboard,
  StatsDashboardSkeleton,
} from "@/components/StatsDashboard";
import { AddHabitModal } from "@/components/AddHabitModal";
import { MobileNav } from "@/components/MobileNav";
import { CheckInCard, CheckInCardSkeleton } from "@/components/CheckInCard";
import { BadgeRewards } from "@/components/BadgeRewards";
import { Leaderboard } from "@/components/Leaderboard";
import { Analytics, AnalyticsSkeleton } from "@/components/Analytics";
import { PublicFeed } from "@/components/PublicFeed";
import { useHabitContract } from "@/hooks/useHabitContract";
import { updateLeaderboard } from "@/utils/helpers";

type TabType = "dashboard" | "leaderboard" | "analytics" | "social";

const tabs = [
  { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
  { id: "leaderboard" as TabType, label: "Leaderboard", icon: Trophy },
  { id: "analytics" as TabType, label: "Analytics", icon: BarChart3 },
  { id: "social" as TabType, label: "Social", icon: Users },
];

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);
  const { address, isConnected } = useAccount();
  const {
    habits,
    stats,
    isLoading,
    isAddingHabit,
    pendingHabitId,
    addHabit,
    markComplete,
  } = useHabitContract();

  // Aggregate all completions for analytics
  const allCompletions = useMemo(() => {
    return habits.flatMap((h) => h.completions);
  }, [habits]);

  // Update leaderboard when stats change
  useEffect(() => {
    if (address && stats.totalHabits > 0) {
      const totalCompletions = habits.reduce(
        (sum, h) => sum + h.completions.length,
        0
      );
      updateLeaderboard(address, stats.currentStreak, totalCompletions);
      setLeaderboardRefreshKey((k) => k + 1);
    }
  }, [address, stats, habits]);

  // Handle habit completion with leaderboard update
  const handleMarkComplete = async (habitId: number) => {
    const result = await markComplete(habitId);
    if (!result.error) {
      // Leaderboard will auto-update via useEffect when stats change
    }
    return result;
  };

  return (
    <div className="relative min-h-screen gradient-bg">
      <Toaster
        position="top-center"
        toastOptions={{
          className: "glass border-border/50",
          style: {
            background: "rgba(30, 30, 50, 0.9)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      />

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8 lg:px-8 md:pb-8">
        <AnimatePresence mode="wait">
          {!isConnected ? (
            <NotConnectedState />
          ) : (
            <motion.div
              key="connected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Tab Navigation */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-1 p-1 rounded-xl glass neu-shadow-sm overflow-x-auto">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-primary rounded-lg"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <tab.icon className="relative z-10 h-4 w-4" />
                      <span className="relative z-10 hidden sm:inline">
                        {tab.label}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Desktop Add Button */}
                {activeTab === "dashboard" && (
                  <motion.button
                    onClick={() => setIsModalOpen(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground neu-shadow-sm transition-all hover:bg-primary/90 glow-primary md:flex"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Habit</span>
                  </motion.button>
                )}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "dashboard" && (
                  <DashboardTab
                    key="dashboard"
                    habits={habits}
                    stats={stats}
                    isLoading={isLoading}
                    pendingHabitId={pendingHabitId}
                    markComplete={handleMarkComplete}
                    onAddClick={() => setIsModalOpen(true)}
                  />
                )}
                {activeTab === "leaderboard" && (
                  <motion.div
                    key="leaderboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Leaderboard key={leaderboardRefreshKey} />
                  </motion.div>
                )}
                {activeTab === "analytics" && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {isLoading ? (
                      <AnalyticsSkeleton />
                    ) : (
                      <Analytics completions={allCompletions} />
                    )}
                  </motion.div>
                )}
                {activeTab === "social" && (
                  <motion.div
                    key="social"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <PublicFeed
                      userHabits={habits}
                      currentStreak={stats.currentStreak}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      {isConnected && <MobileNav onAddClick={() => setIsModalOpen(true)} />}

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addHabit}
        isLoading={isAddingHabit}
      />
    </div>
  );
}

interface DashboardTabProps {
  habits: {
    id: number;
    title: string;
    description: string;
    completions: bigint[];
  }[];
  stats: {
    totalHabits: number;
    completedToday: number;
    currentStreak: number;
    bestStreak: number;
  };
  isLoading: boolean;
  pendingHabitId: number | null;
  markComplete: (habitId: number) => Promise<{ hash?: string; error?: string }>;
  onAddClick: () => void;
}

function DashboardTab({
  habits,
  stats,
  isLoading,
  pendingHabitId,
  markComplete,
  onAddClick,
}: DashboardTabProps) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Check-in Card with real data */}
      {isLoading ? (
        <CheckInCardSkeleton />
      ) : (
        <CheckInCard
          totalHabits={stats.totalHabits}
          completedToday={stats.completedToday}
          currentStreak={stats.currentStreak}
        />
      )}

      {/* Badge Rewards */}
      <BadgeRewards currentStreak={stats.currentStreak} />

      {/* Stats Dashboard */}
      {isLoading ? <StatsDashboardSkeleton /> : <StatsDashboard {...stats} />}

      {/* Habits Grid */}
      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Active Habits
        </motion.h2>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <HabitCardSkeleton key={i} />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <EmptyState onAddClick={onAddClick} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                id={habit.id}
                title={habit.title}
                description={habit.description}
                completions={habit.completions}
                onComplete={markComplete}
                isLoading={pendingHabitId === habit.id}
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function NotConnectedState() {
  return (
    <motion.div
      key="not-connected"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex min-h-[70vh] flex-col items-center justify-center text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl glass neu-shadow"
      >
        <Wallet className="h-10 w-10 text-primary" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-3 text-3xl font-bold text-foreground sm:text-4xl"
      >
        Onchain Habit Tracker
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 max-w-md text-muted-foreground"
      >
        Build better habits with blockchain accountability. Track your daily
        progress, maintain streaks, and prove your consistency onchain.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <motion.button
              onClick={openConnectModal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground neu-shadow glow-primary transition-all hover:bg-primary/90"
            >
              <Wallet className="h-5 w-5" />
              <span>Connect Wallet</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          )}
        </ConnectButton.Custom>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
      >
        <span className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Base Network
        </span>
        <span className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          Base Sepolia
        </span>
        <span className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          Gas Efficient
        </span>
      </motion.div>
    </motion.div>
  );
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl glass neu-shadow py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
        <Plus className="h-8 w-8 text-primary" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">
        No habits yet
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Create your first habit and start building consistency with blockchain
        accountability.
      </p>

      <motion.button
        onClick={onAddClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        <span>Create First Habit</span>
      </motion.button>
    </motion.div>
  );
}
