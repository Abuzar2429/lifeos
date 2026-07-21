export interface CheckInInput {
  mood: number;
  energy: number;
  sleepHours: number;
  waterGlasses: number;
  workoutMins: number;
  studyHours: number;
  readingMins: number;
  reflectionNote?: string | null;
}

/**
 * Calculates a 0-100 score based on wellness & productivity metrics.
 */
export function calculateDailyScore(input: Partial<CheckInInput>): number {
  const mood = input.mood ?? 3;
  const energy = input.energy ?? 3;
  const sleepHours = input.sleepHours ?? 7;
  const waterGlasses = input.waterGlasses ?? 8;
  const workoutMins = input.workoutMins ?? 0;
  const studyHours = input.studyHours ?? 0;
  const readingMins = input.readingMins ?? 0;

  // 1. Mood (max 15 pts): mood 1..5 -> 3..15
  const moodPts = Math.min(15, (mood / 5) * 15);

  // 2. Energy (max 15 pts): energy 1..5 -> 3..15
  const energyPts = Math.min(15, (energy / 5) * 15);

  // 3. Sleep (max 20 pts): optimal 7-9h
  let sleepPts = 10;
  if (sleepHours >= 7 && sleepHours <= 9) {
    sleepPts = 20;
  } else if (sleepHours === 6 || sleepHours === 10) {
    sleepPts = 15;
  } else if (sleepHours >= 5 && sleepHours <= 11) {
    sleepPts = 10;
  } else {
    sleepPts = 5;
  }

  // 4. Hydration (max 15 pts): target 8 glasses
  const waterPts = Math.min(15, (waterGlasses / 8) * 15);

  // 5. Physical activity (max 15 pts): target 30 mins workout
  const workoutPts = Math.min(15, (workoutMins / 30) * 15);

  // 6. Focus & Learning (max 20 pts): target 2h study or 30m reading
  const focusRatio = Math.min(1, studyHours / 2 + readingMins / 60);
  const focusPts = focusRatio * 20;

  const totalScore = Math.round(
    moodPts + energyPts + sleepPts + waterPts + workoutPts + focusPts
  );

  return Math.min(100, Math.max(0, totalScore));
}
