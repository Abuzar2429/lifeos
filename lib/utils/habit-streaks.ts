import { format, isWeekend, subDays, addDays } from "date-fns";

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: Date;
  completedAt: Date;
  status: boolean;
  value?: number;
  notes: string | null;
}

export interface HabitWithLogs {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string;
  frequency: string;
  customDays: string | null;
  targetValue: number;
  unit: string | null;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  logs: HabitLog[];
}

/**
 * Format a Date object to YYYY-MM-DD in the local timezone.
 */
export function formatDateLocal(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Normalizes day names to lowercase full names.
 */
function normalizeDayName(day: string): string {
  const d = day.toLowerCase().trim();
  if (d.startsWith("mon")) return "monday";
  if (d.startsWith("tue")) return "tuesday";
  if (d.startsWith("wed")) return "wednesday";
  if (d.startsWith("thu")) return "thursday";
  if (d.startsWith("fri")) return "friday";
  if (d.startsWith("sat")) return "saturday";
  if (d.startsWith("sun")) return "sunday";
  return d;
}

/**
 * Check if a habit is scheduled on a given Date.
 */
export function isHabitScheduled(habit: { frequency: string; customDays: string | null }, date: Date): boolean {
  const dayName = format(date, "eeee").toLowerCase();

  if (habit.frequency === "DAILY") {
    return true;
  }

  if (habit.frequency === "WEEKDAYS") {
    return !isWeekend(date);
  }

  if (habit.frequency === "CUSTOM" && habit.customDays) {
    try {
      const parsedDays: string[] = JSON.parse(habit.customDays);
      const normalizedParsed = parsedDays.map(normalizeDayName);
      return normalizedParsed.includes(dayName);
    } catch (e) {
      console.error("Error parsing customDays:", e);
      return false;
    }
  }

  return true;
}

/**
 * Calculates current streak, longest streak, and weekly history for a habit.
 */
export function calculateHabitStats(habit: HabitWithLogs) {
  const target = habit.targetValue || 1;

  // Map log values by YYYY-MM-DD date string
  const logMap = new Map<string, { val: number; completed: boolean }>();
  habit.logs.forEach((log) => {
    const dateStr = formatDateLocal(new Date(log.date));
    const val = log.value ?? (log.status ? target : 0);
    const isFullCompleted = log.status || val >= target;
    logMap.set(dateStr, { val, completed: isFullCompleted });
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oldestAllowed = new Date(habit.createdAt);
  oldestAllowed.setHours(0, 0, 0, 0);
  const capDate = subDays(new Date(), 365);
  const stopDate = oldestAllowed > capDate ? oldestAllowed : capDate;

  // 1. Calculate Current Streak (Full or Partial >= 50% maintains streak)
  let currentStreak = 0;
  let foundFirstCompleted = false;
  let checkDate = new Date(today);

  while (checkDate >= stopDate) {
    const dateStr = formatDateLocal(checkDate);
    const scheduled = isHabitScheduled(habit, checkDate);

    if (scheduled) {
      const logData = logMap.get(dateStr);
      const val = logData?.val ?? 0;
      const isOk = (logData?.completed ?? false) || (target > 0 && val / target >= 0.5);

      if (isOk) {
        currentStreak++;
        foundFirstCompleted = true;
      } else {
        const isCheckingToday = checkDate.getTime() === today.getTime();
        if (isCheckingToday && !foundFirstCompleted) {
          // Skip today if unlogged yet
        } else {
          break;
        }
      }
    }
    checkDate = subDays(checkDate, 1);
  }

  // 2. Calculate Longest Streak
  let longestStreak = 0;
  let runningStreak = 0;
  let forwardDate = new Date(stopDate);
  forwardDate.setHours(0, 0, 0, 0);

  while (forwardDate <= today) {
    const dateStr = formatDateLocal(forwardDate);
    const scheduled = isHabitScheduled(habit, forwardDate);

    if (scheduled) {
      const logData = logMap.get(dateStr);
      const val = logData?.val ?? 0;
      const isOk = (logData?.completed ?? false) || (target > 0 && val / target >= 0.5);

      if (isOk) {
        runningStreak++;
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      } else {
        const isCheckingToday = forwardDate.getTime() === today.getTime();
        if (!isCheckingToday) {
          runningStreak = 0;
        }
      }
    }
    forwardDate = addDays(forwardDate, 1);
  }

  // 3. Compute 7-day Weekly History (Full, Partial, Missed, Not-scheduled)
  const weeklyHistory: {
    dateStr: string;
    dayName: string;
    status: "completed" | "partial" | "missed" | "not-scheduled";
    loggedValue: number;
    targetValue: number;
    percent: number;
  }[] = [];
  const daysOfWeekShorthand = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    d.setHours(0, 0, 0, 0);

    const dateStr = formatDateLocal(d);
    const dayName = daysOfWeekShorthand[d.getDay()];
    const scheduled = isHabitScheduled(habit, d);
    const logData = logMap.get(dateStr);
    const val = logData?.val ?? 0;
    const isCompleted = (logData?.completed ?? false) || val >= target;
    const percent = Math.min(100, Math.round((val / target) * 100));

    let status: "completed" | "partial" | "missed" | "not-scheduled" = "not-scheduled";
    if (scheduled) {
      if (isCompleted) {
        status = "completed";
      } else if (val > 0) {
        status = "partial";
      } else {
        status = "missed";
      }
    }

    weeklyHistory.push({
      dateStr,
      dayName,
      status,
      loggedValue: val,
      targetValue: target,
      percent,
    });
  }

  // 4. Calculate Proportional Completion Rate
  let totalScheduled = 0;
  let totalFractionalProgress = 0;
  let rateCheck = new Date(stopDate);

  while (rateCheck <= today) {
    if (isHabitScheduled(habit, rateCheck)) {
      totalScheduled++;
      const dateStr = formatDateLocal(rateCheck);
      const logData = logMap.get(dateStr);
      if (logData) {
        if (logData.completed) {
          totalFractionalProgress += 1.0;
        } else if (logData.val > 0) {
          totalFractionalProgress += Math.min(1.0, logData.val / target);
        }
      }
    }
    rateCheck = addDays(rateCheck, 1);
  }

  const completionRate = totalScheduled > 0 ? Math.round((totalFractionalProgress / totalScheduled) * 100) : 0;

  return {
    currentStreak,
    longestStreak,
    weeklyHistory,
    completionRate,
    totalCompletions: logMap.size,
  };
}
