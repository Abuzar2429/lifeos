export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: Date;
  completedAt: Date;
  status: boolean;
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayName = dayMap[date.getDay()];

  if (habit.frequency === "DAILY") {
    return true;
  }

  if (habit.frequency === "WEEKDAYS") {
    const dayNum = date.getDay();
    return dayNum >= 1 && dayNum <= 5; // Mon to Fri
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
  // Extract all completed log dates formatted as YYYY-MM-DD
  const completedDates = new Set<string>();
  habit.logs.forEach((log) => {
    if (log.status) {
      completedDates.add(formatDateLocal(new Date(log.date)));
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let foundFirstCompleted = false;
  const checkDate = new Date(today);

  // Walk backwards up to 365 days or habit creation date
  const oldestAllowed = new Date(habit.createdAt);
  oldestAllowed.setHours(0, 0, 0, 0);
  
  // Also guard against infinite loops by capping at 365 days
  const capDate = new Date();
  capDate.setDate(capDate.getDate() - 365);
  const stopDate = oldestAllowed > capDate ? oldestAllowed : capDate;

  while (checkDate >= stopDate) {
    const dateStr = formatDateLocal(checkDate);
    const scheduled = isHabitScheduled(habit, checkDate);

    if (scheduled) {
      const completed = completedDates.has(dateStr);

      if (completed) {
        currentStreak++;
        foundFirstCompleted = true;
      } else {
        // If today is scheduled and not completed, we can skip it without breaking
        // the streak, but only if we haven't found any completed day yet (i.e. starting from today).
        const isCheckingToday = checkDate.getTime() === today.getTime();
        if (isCheckingToday && !foundFirstCompleted) {
          // Do nothing, proceed to check yesterday
        } else {
          // We hit a scheduled day that was missed. Streak ends here.
          break;
        }
      }
    }
    // Go to previous day
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // 2. Calculate Longest Streak
  let longestStreak = 0;
  let runningStreak = 0;
  
  // Start from habit creation date or 365 days ago, whichever is later
  const forwardDate = new Date(stopDate);
  forwardDate.setHours(0, 0, 0, 0);

  while (forwardDate <= today) {
    const dateStr = formatDateLocal(forwardDate);
    const scheduled = isHabitScheduled(habit, forwardDate);

    if (scheduled) {
      const completed = completedDates.has(dateStr);
      if (completed) {
        runningStreak++;
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      } else {
        // If it is today and not completed, don't break the running streak yet
        const isCheckingToday = forwardDate.getTime() === today.getTime();
        if (!isCheckingToday) {
          runningStreak = 0;
        }
      }
    }

    forwardDate.setDate(forwardDate.getDate() + 1);
  }

  // 3. Compute 7-day Weekly History
  const weeklyHistory: { dateStr: string; dayName: string; status: "completed" | "missed" | "not-scheduled" }[] = [];
  const daysOfWeekShorthand = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const dateStr = formatDateLocal(d);
    const dayName = daysOfWeekShorthand[d.getDay()];
    const scheduled = isHabitScheduled(habit, d);
    const completed = completedDates.has(dateStr);

    let status: "completed" | "missed" | "not-scheduled" = "not-scheduled";
    if (scheduled) {
      status = completed ? "completed" : "missed";
    }

    weeklyHistory.push({
      dateStr,
      dayName,
      status,
    });
  }

  // 4. Calculate overall completion rate
  let totalScheduled = 0;
  let totalCompleted = 0;
  const rateCheck = new Date(stopDate);
  while (rateCheck <= today) {
    if (isHabitScheduled(habit, rateCheck)) {
      totalScheduled++;
      if (completedDates.has(formatDateLocal(rateCheck))) {
        totalCompleted++;
      }
    }
    rateCheck.setDate(rateCheck.getDate() + 1);
  }

  const completionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

  return {
    currentStreak,
    longestStreak,
    weeklyHistory,
    completionRate,
    totalCompletions: completedDates.size,
  };
}
