"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Flame, Crown, Users } from "lucide-react";
import { useAccount } from "wagmi";
import { shortenAddress, getLeaderboard, type LeaderboardEntry } from "@/utils/helpers";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-400" />;
    case 2:
      return <Medal className="h-5 w-5 text-slate-300" />;
    case 3:
      return <Medal className="h-5 w-5 text-orange-400" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getRankStyles = (rank: number, isCurrentUser: boolean) => {
  if (isCurrentUser) {
    return "bg-gradient-to-r from-primary/30 to-primary/10 border-primary/50";
  }
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
    case 2:
      return "bg-gradient-to-r from-slate-400/20 to-slate-500/10 border-slate-400/30";
    case 3:
      return "bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/30";
    default:
      return "bg-secondary/20 border-border/50";
  }
};

interface LeaderboardProps {
  onRefresh?: () => void;
}

export function Leaderboard({ onRefresh }: LeaderboardProps) {
  const { address } = useAccount();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = () => {
      setIsLoading(true);
      const data = getLeaderboard();
      setLeaderboard(data);
      setIsLoading(false);
    };

    loadLeaderboard();
    
    // Listen for storage changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "habitTracker_leaderboard") {
        loadLeaderboard();
      }
    };
    
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [onRefresh]);

  const currentUserRank = address 
    ? leaderboard.findIndex(e => e.address.toLowerCase() === address.toLowerCase()) + 1
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl glass neu-shadow overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-foreground">Leaderboard</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {leaderboard.length > 0 
            ? `${leaderboard.length} habit builders competing`
            : "Be the first to join the leaderboard!"
          }
        </p>
        {currentUserRank > 0 && (
          <p className="text-sm text-primary mt-1">
            Your rank: #{currentUserRank}
          </p>
        )}
      </div>

      {/* Leaderboard List */}
      {isLoading ? (
        <LeaderboardSkeleton />
      ) : leaderboard.length === 0 ? (
        <EmptyLeaderboard />
      ) : (
        <div className="divide-y divide-border/20">
          {leaderboard.slice(0, 10).map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = address?.toLowerCase() === entry.address.toLowerCase();
            
            return (
              <motion.div
                key={entry.address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                className={`flex items-center gap-4 p-4 transition-all border-l-2 ${getRankStyles(rank, isCurrentUser)}`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(rank)}
                </div>

                {/* Address & Stats */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate flex items-center gap-2">
                    {shortenAddress(entry.address)}
                    {isCurrentUser && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.totalCompletions} completions
                  </p>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-1.5 rounded-full bg-orange-500/20 px-3 py-1.5">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-bold text-orange-400">
                    {entry.streak}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 bg-secondary/10 text-center">
        <p className="text-xs text-muted-foreground">
          Rankings update after each habit completion
        </p>
      </div>
    </motion.div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="divide-y divide-border/20">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-secondary/30" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-secondary/30 rounded w-24" />
            <div className="h-3 bg-secondary/20 rounded w-16" />
          </div>
          <div className="h-8 w-16 bg-secondary/30 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyLeaderboard() {
  return (
    <div className="p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      <h4 className="font-semibold text-foreground mb-2">No rankings yet</h4>
      <p className="text-sm text-muted-foreground">
        Complete habits to appear on the leaderboard!
      </p>
    </div>
  );
}
