"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  getWeeklyData,
  getMonthlyStats,
  generateHeatmapData,
} from "@/utils/helpers";

interface AnalyticsProps {
  completions: bigint[];
}

const getHeatmapColor = (value: number) => {
  if (value === 0) return "bg-secondary/30";
  if (value === 1) return "bg-primary/30";
  if (value === 2) return "bg-primary/50";
  if (value === 3) return "bg-primary/70";
  return "bg-primary";
};

export function Analytics({ completions }: AnalyticsProps) {
  const weeklyData = useMemo(() => getWeeklyData(completions), [completions]);
  const monthlyStats = useMemo(() => getMonthlyStats(completions), [completions]);
  const heatmapData = useMemo(() => generateHeatmapData(completions), [completions]);

  const totalThisWeek = weeklyData.reduce((sum, d) => sum + d.completions, 0);
  const { totalThisMonth, totalLastMonth } = monthlyStats;
  const monthlyChange = totalLastMonth > 0 
    ? Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100) 
    : totalThisMonth > 0 ? 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-xl glass neu-shadow-sm p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">This Week</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalThisWeek}</p>
          <p className="text-xs text-muted-foreground">completions</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-xl glass neu-shadow-sm p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="text-xs text-muted-foreground">This Month</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalThisMonth}</p>
          <div className="flex items-center gap-1">
            {monthlyChange !== 0 && (
              <>
                {monthlyChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span className={`text-xs ${monthlyChange > 0 ? "text-green-400" : "text-red-400"}`}>
                  {monthlyChange > 0 ? "+" : ""}{monthlyChange}%
                </span>
              </>
            )}
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </motion.div>
      </div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl glass neu-shadow p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Weekly Activity
          </h3>
        </div>

        {totalThisWeek === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No activity this week yet</p>
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis
                  dataKey="day"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(30, 30, 50, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                />
                <Bar
                  dataKey="completions"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                >
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`oklch(0.72 0.22 145 / ${0.4 + (entry.completions / 10) * 0.6})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* GitHub-style Heatmap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl glass neu-shadow p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">
              Activity Heatmap
            </h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded-sm bg-secondary/30" />
              <div className="w-3 h-3 rounded-sm bg-primary/30" />
              <div className="w-3 h-3 rounded-sm bg-primary/50" />
              <div className="w-3 h-3 rounded-sm bg-primary/70" />
              <div className="w-3 h-3 rounded-sm bg-primary" />
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="grid grid-rows-7 grid-flow-col gap-1 min-w-fit">
            {heatmapData.map((cell, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.002 }}
                whileHover={{ scale: 1.3 }}
                className={`w-3 h-3 rounded-sm ${getHeatmapColor(cell.value)} transition-colors cursor-pointer`}
                title={`${cell.date}: ${cell.value} completions`}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Last 12 weeks of activity
        </p>
      </motion.div>
    </motion.div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl glass neu-shadow-sm p-4 h-24" />
        <div className="rounded-xl glass neu-shadow-sm p-4 h-24" />
      </div>
      <div className="rounded-xl glass neu-shadow p-5 h-64" />
      <div className="rounded-xl glass neu-shadow p-5 h-48" />
    </div>
  );
}
