"use client";

import { useState, useCallback, useEffect } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CONTRACT_ADDRESSES, HABIT_TRACKER_ABI } from "@/utils/contract";
import {
  calculateStreak,
  isCompletedToday,
  calculateBestStreak,
} from "@/utils/helpers";
import { toast } from "sonner";

export interface Habit {
  title: string;
  description: string;
  createdAt: bigint;
}

export interface HabitWithCompletions extends Habit {
  id: number;
  completions: bigint[];
}

export function useHabitContract() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = CONTRACT_ADDRESSES[chainId];

  const [habits, setHabits] = useState<HabitWithCompletions[]>([]);
  const [isLoadingHabits, setIsLoadingHabits] = useState(false);
  const [pendingHabitId, setPendingHabitId] = useState<number | null>(null);
  const [isAddingHabit, setIsAddingHabit] = useState(false);

  // Write contract hooks
  const {
    writeContractAsync: addHabitWrite,
    data: addHabitHash,
    isPending: isAddHabitPending,
  } = useWriteContract();

  const {
    writeContractAsync: markCompleteWrite,
    data: markCompleteHash,
    isPending: isMarkCompletePending,
  } = useWriteContract();

  // Wait for transaction confirmations
  const { isSuccess: isAddHabitSuccess } = useWaitForTransactionReceipt({
    hash: addHabitHash,
  });

  const { isSuccess: isMarkCompleteSuccess } = useWaitForTransactionReceipt({
    hash: markCompleteHash,
  });

  // Read habits from contract
  const {
    data: habitsData,
    refetch: refetchHabits,
    isLoading: isReadingHabits,
  } = useReadContract({
    address: contractAddress,
    abi: HABIT_TRACKER_ABI,
    functionName: "getHabits",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  // Fetch completions for each habit
  const fetchCompletions = useCallback(
    async (habitId: number): Promise<bigint[]> => {
      if (!address || !contractAddress) return [];

      try {
        const response = await fetch(
          `/api/completions?address=${address}&habitId=${habitId}&chainId=${chainId}`
        );
        if (response.ok) {
          const data = await response.json();
          return data.completions.map((c: string) => BigInt(c));
        }
      } catch {
        // If API fails, return empty array
      }
      return [];
    },
    [address, contractAddress, chainId]
  );

  // Load habits with completions
  const loadHabits = useCallback(async () => {
    if (!habitsData || !address) {
      setHabits([]);
      return;
    }

    setIsLoadingHabits(true);
    try {
      const habitsWithCompletions: HabitWithCompletions[] = await Promise.all(
        (habitsData as Habit[]).map(async (habit, index) => {
          const completions = await fetchCompletions(index);
          return {
            ...habit,
            id: index,
            completions,
          };
        })
      );
      setHabits(habitsWithCompletions);
    } catch (error) {
      console.error("Error loading habits:", error);
      toast.error("Failed to load habit completions");
    } finally {
      setIsLoadingHabits(false);
    }
  }, [habitsData, address, fetchCompletions]);

  // Load habits when data changes
  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  // Refresh after successful add
  useEffect(() => {
    if (isAddHabitSuccess) {
      setIsAddingHabit(false);
      toast.success("Habit created successfully!");
      refetchHabits();
    }
  }, [isAddHabitSuccess, refetchHabits]);

  // Refresh after successful completion
  useEffect(() => {
    if (isMarkCompleteSuccess) {
      setPendingHabitId(null);
      toast.success("Habit completed!");
      loadHabits();
    }
  }, [isMarkCompleteSuccess, loadHabits]);

  // Add a new habit
  const addHabit = useCallback(
    async (
      title: string,
      description: string
    ): Promise<{ hash?: string; error?: string }> => {
      if (!contractAddress || !address) {
        return { error: "Please connect your wallet" };
      }

      setIsAddingHabit(true);
      try {
        const hash = await addHabitWrite({
          address: contractAddress,
          abi: HABIT_TRACKER_ABI,
          functionName: "addHabit",
          args: [title, description],
        });
        toast.info("Transaction submitted, waiting for confirmation...");
        return { hash };
      } catch (error: unknown) {
        setIsAddingHabit(false);
        const message =
          error instanceof Error ? error.message : "Transaction failed";
        if (message.includes("User rejected")) {
          toast.error("Transaction rejected");
          return { error: "Transaction rejected" };
        }
        toast.error("Failed to create habit");
        return { error: message };
      }
    },
    [contractAddress, address, addHabitWrite]
  );

  // Mark habit as complete
  const markComplete = useCallback(
    async (habitId: number): Promise<{ hash?: string; error?: string }> => {
      if (!contractAddress || !address) {
        return { error: "Please connect your wallet" };
      }

      // Check if already completed today (frontend check)
      const habit = habits.find((h) => h.id === habitId);
      if (habit && isCompletedToday(habit.completions)) {
        toast.error("Already completed today");
        return { error: "Already completed today" };
      }

      setPendingHabitId(habitId);
      try {
        const hash = await markCompleteWrite({
          address: contractAddress,
          abi: HABIT_TRACKER_ABI,
          functionName: "markComplete",
          args: [BigInt(habitId)],
        });
        toast.info("Transaction submitted, waiting for confirmation...");
        return { hash };
      } catch (error: unknown) {
        setPendingHabitId(null);
        const message =
          error instanceof Error ? error.message : "Transaction failed";
        if (message.includes("User rejected")) {
          toast.error("Transaction rejected");
          return { error: "Transaction rejected" };
        }
        if (message.includes("Already completed today")) {
          toast.error("Already completed today");
          return { error: "Already completed today" };
        }
        toast.error("Failed to mark complete");
        return { error: message };
      }
    },
    [contractAddress, address, habits, markCompleteWrite]
  );

  // Calculate aggregated stats
  const stats = {
    totalHabits: habits.length,
    completedToday: habits.filter((h) => isCompletedToday(h.completions))
      .length,
    currentStreak: habits.reduce(
      (max, h) => Math.max(max, calculateStreak(h.completions)),
      0
    ),
    bestStreak: habits.reduce(
      (max, h) => Math.max(max, calculateBestStreak(h.completions)),
      0
    ),
  };

  return {
    habits,
    stats,
    isLoading: isReadingHabits || isLoadingHabits,
    isAddingHabit: isAddingHabit || isAddHabitPending,
    pendingHabitId,
    isMarkingComplete: isMarkCompletePending,
    addHabit,
    markComplete,
    refetchHabits,
    isConnected,
    contractAddress,
  };
}
