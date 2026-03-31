"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Flame, Heart, MessageCircle, Share2, Plus, Eye, EyeOff } from "lucide-react";
import { useAccount } from "wagmi";
import {
  shortenAddress,
  getPublicHabits,
  addPublicHabit,
  updatePublicHabitLikes,
  removePublicHabit,
  timeAgo,
  type PublicHabit,
} from "@/utils/helpers";

interface HabitWithCompletions {
  id: number;
  title: string;
  description: string;
  completions: bigint[];
}

interface PublicFeedProps {
  userHabits?: HabitWithCompletions[];
  currentStreak?: number;
}

export function PublicFeed({ userHabits = [], currentStreak = 0 }: PublicFeedProps) {
  const { address } = useAccount();
  const [publicHabits, setPublicHabits] = useState<PublicHabit[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [userPublicIds, setUserPublicIds] = useState<Set<string>>(new Set());

  // Load public habits and user's liked posts
  useEffect(() => {
    const loadData = () => {
      const habits = getPublicHabits();
      setPublicHabits(habits);

      // Load user's liked posts
      if (address) {
        const likedKey = `habitTracker_liked_${address}`;
        const stored = localStorage.getItem(likedKey);
        if (stored) {
          try {
            setLikedPosts(new Set(JSON.parse(stored)));
          } catch {
            setLikedPosts(new Set());
          }
        }

        // Track which habits the user has made public
        const userPublic = habits
          .filter((h) => h.userAddress.toLowerCase() === address.toLowerCase())
          .map((h) => h.id);
        setUserPublicIds(new Set(userPublic));
      }
    };

    loadData();

    // Listen for storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "habitTracker_publicHabits") {
        loadData();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [address]);

  const handleLike = (habitId: string) => {
    if (!address) return;

    const newLiked = new Set(likedPosts);
    const increment = newLiked.has(habitId) ? -1 : 1;

    if (newLiked.has(habitId)) {
      newLiked.delete(habitId);
    } else {
      newLiked.add(habitId);
    }

    setLikedPosts(newLiked);
    updatePublicHabitLikes(habitId, increment);

    // Update local state
    setPublicHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, likes: Math.max(0, h.likes + increment) } : h
      )
    );

    // Persist liked posts
    localStorage.setItem(
      `habitTracker_liked_${address}`,
      JSON.stringify([...newLiked])
    );
  };

  const toggleHabitPublic = (habit: HabitWithCompletions) => {
    if (!address) return;

    const habitId = `${address}-${habit.id}`;

    if (userPublicIds.has(habitId)) {
      // Remove from public feed
      removePublicHabit(habitId);
      setUserPublicIds((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
      setPublicHabits((prev) => prev.filter((h) => h.id !== habitId));
    } else {
      // Add to public feed
      const completionCount = habit.completions.length;
      const publicHabit: Omit<PublicHabit, "likes" | "comments"> = {
        id: habitId,
        title: habit.title,
        description: habit.description,
        streak: currentStreak,
        userAddress: address,
        createdAt: Date.now(),
        isPublic: true,
      };

      addPublicHabit(publicHabit);
      setUserPublicIds((prev) => new Set([...prev, habitId]));
      setPublicHabits((prev) => [
        { ...publicHabit, likes: 0, comments: 0 },
        ...prev.filter((h) => h.id !== habitId),
      ]);
    }
  };

  const handleShare = async (habit: PublicHabit) => {
    const text = `Check out my habit: "${habit.title}" - ${habit.streak} day streak! Built with Onchain Habit Tracker`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Share Your Habits Section */}
      {address && userHabits.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl glass neu-shadow p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Share Your Habits
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Make your habits public to inspire others and get support
          </p>
          <div className="space-y-2">
            {userHabits.map((habit) => {
              const habitId = `${address}-${habit.id}`;
              const isPublic = userPublicIds.has(habitId);

              return (
                <motion.button
                  key={habit.id}
                  onClick={() => toggleHabitPublic(habit)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    isPublic
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-secondary/20 border border-border/30 hover:bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isPublic ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {habit.title}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isPublic
                        ? "bg-primary/30 text-primary"
                        : "bg-secondary/30 text-muted-foreground"
                    }`}
                  >
                    {isPublic ? "Public" : "Private"}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Public Feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl glass neu-shadow overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">
              Public Habits
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {publicHabits.length > 0
              ? `${publicHabits.length} habits shared by the community`
              : "See what others are building"}
          </p>
        </div>

        {/* Feed */}
        {publicHabits.length === 0 ? (
          <EmptyFeed />
        ) : (
          <div className="divide-y divide-border/20">
            <AnimatePresence>
              {publicHabits.map((habit, index) => {
                const isOwn =
                  address?.toLowerCase() === habit.userAddress.toLowerCase();

                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-secondary/10 transition-colors ${
                      isOwn ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {habit.userAddress.slice(2, 4).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            {shortenAddress(habit.userAddress)}
                            {isOwn && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {timeAgo(habit.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Streak Badge */}
                      {habit.streak > 0 && (
                        <div className="flex items-center gap-1 rounded-full bg-orange-500/20 px-2.5 py-1">
                          <Flame className="h-3.5 w-3.5 text-orange-400" />
                          <span className="text-xs font-bold text-orange-400">
                            {habit.streak}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Habit Content */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-foreground">
                        {habit.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {habit.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLike(habit.id)}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          likedPosts.has(habit.id)
                            ? "text-red-400"
                            : "text-muted-foreground hover:text-red-400"
                        }`}
                      >
                        <motion.div
                          animate={
                            likedPosts.has(habit.id)
                              ? { scale: [1, 1.3, 1] }
                              : { scale: 1 }
                          }
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              likedPosts.has(habit.id) ? "fill-current" : ""
                            }`}
                          />
                        </motion.div>
                        <span>{habit.likes}</span>
                      </motion.button>

                      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>{habit.comments}</span>
                      </button>

                      <button 
                        onClick={() => handleShare(habit)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function EmptyFeed() {
  return (
    <div className="p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
          <Globe className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      <h4 className="font-semibold text-foreground mb-2">No public habits yet</h4>
      <p className="text-sm text-muted-foreground">
        Be the first to share your habits with the community!
      </p>
    </div>
  );
}
