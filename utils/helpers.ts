// Shorten address for display
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Calculate streak from completion timestamps
export function calculateStreak(completions: bigint[]): number {
  if (completions.length === 0) return 0;

  const sortedCompletions = [...completions]
    .map((t) => Number(t))
    .sort((a, b) => b - a);

  const now = Math.floor(Date.now() / 1000);
  const oneDayInSeconds = 86400;

  // Get the start of today (midnight UTC)
  const todayStart = Math.floor(now / oneDayInSeconds) * oneDayInSeconds;

  let streak = 0;
  let currentDayStart = todayStart;

  for (const timestamp of sortedCompletions) {
    const completionDayStart =
      Math.floor(timestamp / oneDayInSeconds) * oneDayInSeconds;

    if (completionDayStart === currentDayStart) {
      // Completion on the current day we're checking
      streak++;
      currentDayStart -= oneDayInSeconds;
    } else if (completionDayStart === currentDayStart - oneDayInSeconds) {
      // Completion on the previous day (if we haven't completed today yet)
      if (streak === 0) {
        streak++;
        currentDayStart = completionDayStart - oneDayInSeconds;
      } else {
        break;
      }
    } else if (completionDayStart < currentDayStart - oneDayInSeconds) {
      // Gap in streak
      break;
    }
  }

  return streak;
}

// Check if completed today
export function isCompletedToday(completions: bigint[]): boolean {
  if (completions.length === 0) return false;

  const now = Math.floor(Date.now() / 1000);
  const oneDayInSeconds = 86400;
  const todayStart = Math.floor(now / oneDayInSeconds) * oneDayInSeconds;

  const lastCompletion = Number(completions[completions.length - 1]);
  const lastCompletionDayStart =
    Math.floor(lastCompletion / oneDayInSeconds) * oneDayInSeconds;

  return lastCompletionDayStart === todayStart;
}

// Calculate best streak
export function calculateBestStreak(completions: bigint[]): number {
  if (completions.length === 0) return 0;

  const sortedCompletions = [...completions]
    .map((t) => Number(t))
    .sort((a, b) => a - b);

  const oneDayInSeconds = 86400;
  let bestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedCompletions.length; i++) {
    const prevDayStart =
      Math.floor(sortedCompletions[i - 1] / oneDayInSeconds) * oneDayInSeconds;
    const currDayStart =
      Math.floor(sortedCompletions[i] / oneDayInSeconds) * oneDayInSeconds;

    if (currDayStart === prevDayStart) {
      // Same day, continue
      continue;
    } else if (currDayStart === prevDayStart + oneDayInSeconds) {
      // Consecutive day
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      // Gap in streak
      currentStreak = 1;
    }
  }

  return bestStreak;
}

// Format timestamp to readable date
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Get network name from chain ID
export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 8453:
      return "Base";
    case 84532:
      return "Base Sepolia";
    default:
      return "Unknown";
  }
}

// Get network badge color
export function getNetworkColor(chainId: number): string {
  switch (chainId) {
    case 8453:
      return "bg-blue-500";
    case 84532:
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
}

// Get weekly data from completion timestamps
export function getWeeklyData(
  completions: bigint[]
): { day: string; completions: number }[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekData = days.map((day) => ({ day, completions: 0 }));

  completions.forEach((timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    if (date >= startOfWeek) {
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      if (dayIndex >= 0 && dayIndex < 7) {
        weekData[dayIndex].completions++;
      }
    }
  });

  return weekData;
}

// Get monthly stats from completion timestamps
export function getMonthlyStats(completions: bigint[]): {
  totalThisMonth: number;
  totalLastMonth: number;
  weeklyBreakdown: { week: string; completions: number }[];
} {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  let totalThisMonth = 0;
  let totalLastMonth = 0;

  // Weekly breakdown for current month
  const weeklyBreakdown = [
    { week: "Week 1", completions: 0 },
    { week: "Week 2", completions: 0 },
    { week: "Week 3", completions: 0 },
    { week: "Week 4", completions: 0 },
  ];

  completions.forEach((timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    const month = date.getMonth();
    const year = date.getFullYear();

    if (month === thisMonth && year === thisYear) {
      totalThisMonth++;
      const weekIndex = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
      weeklyBreakdown[weekIndex].completions++;
    } else if (month === lastMonth && year === lastMonthYear) {
      totalLastMonth++;
    }
  });

  return { totalThisMonth, totalLastMonth, weeklyBreakdown };
}

// Generate heatmap data from completion timestamps
export function generateHeatmapData(
  completions: bigint[]
): { date: string; value: number; dayOfWeek: number; week: number }[] {
  const data: {
    date: string;
    value: number;
    dayOfWeek: number;
    week: number;
  }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create a map of date -> completion count
  const completionMap = new Map<string, number>();
  completions.forEach((timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    const dateStr = date.toISOString().split("T")[0];
    completionMap.set(dateStr, (completionMap.get(dateStr) || 0) + 1);
  });

  // Generate last 12 weeks of data
  for (let week = 11; week >= 0; week--) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (week * 7 + (6 - day)));
      const dateStr = date.toISOString().split("T")[0];

      data.push({
        date: dateStr,
        value: Math.min(completionMap.get(dateStr) || 0, 4),
        dayOfWeek: day,
        week: 11 - week,
      });
    }
  }

  return data;
}

// Leaderboard storage helpers
export interface LeaderboardEntry {
  address: string;
  streak: number;
  totalCompletions: number;
  lastUpdated: number;
}

const LEADERBOARD_KEY = "habitTracker_leaderboard";

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LEADERBOARD_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export function updateLeaderboard(
  address: string,
  streak: number,
  totalCompletions: number
): void {
  if (typeof window === "undefined") return;
  const leaderboard = getLeaderboard();
  const existingIndex = leaderboard.findIndex(
    (e) => e.address.toLowerCase() === address.toLowerCase()
  );

  const entry: LeaderboardEntry = {
    address,
    streak,
    totalCompletions,
    lastUpdated: Date.now(),
  };

  if (existingIndex >= 0) {
    leaderboard[existingIndex] = entry;
  } else {
    leaderboard.push(entry);
  }

  // Sort by streak first, then by totalCompletions
  leaderboard.sort((a, b) => {
    if (b.streak !== a.streak) return b.streak - a.streak;
    return b.totalCompletions - a.totalCompletions;
  });

  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

// Public habits storage helpers
export interface PublicHabit {
  id: string;
  title: string;
  description: string;
  streak: number;
  userAddress: string;
  likes: number;
  comments: number;
  createdAt: number;
  isPublic: boolean;
}

const PUBLIC_HABITS_KEY = "habitTracker_publicHabits";

export function getPublicHabits(): PublicHabit[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(PUBLIC_HABITS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as PublicHabit[];
  } catch {
    return [];
  }
}

export function addPublicHabit(habit: Omit<PublicHabit, "likes" | "comments">): void {
  if (typeof window === "undefined") return;
  const habits = getPublicHabits();
  const existingIndex = habits.findIndex((h) => h.id === habit.id);

  const newHabit: PublicHabit = {
    ...habit,
    likes: existingIndex >= 0 ? habits[existingIndex].likes : 0,
    comments: existingIndex >= 0 ? habits[existingIndex].comments : 0,
  };

  if (existingIndex >= 0) {
    habits[existingIndex] = newHabit;
  } else {
    habits.unshift(newHabit);
  }

  localStorage.setItem(PUBLIC_HABITS_KEY, JSON.stringify(habits));
}

export function updatePublicHabitLikes(habitId: string, increment: number): void {
  if (typeof window === "undefined") return;
  const habits = getPublicHabits();
  const index = habits.findIndex((h) => h.id === habitId);
  if (index >= 0) {
    habits[index].likes = Math.max(0, habits[index].likes + increment);
    localStorage.setItem(PUBLIC_HABITS_KEY, JSON.stringify(habits));
  }
}

export function removePublicHabit(habitId: string): void {
  if (typeof window === "undefined") return;
  const habits = getPublicHabits().filter((h) => h.id !== habitId);
  localStorage.setItem(PUBLIC_HABITS_KEY, JSON.stringify(habits));
}

// Time ago formatter
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 604800)} weeks ago`;
}
