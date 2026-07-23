import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Create or Update Today's Check-In with 100/100 score
  const checkIn = await prisma.dailyCheckIn.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
    update: {
      mood: 5,
      energy: 5,
      sleepHours: 8,
      studyHours: 4,
      workoutMins: 60,
      waterGlasses: 8,
      dailyScore: 100,
      reflectionNote: "Achieved 100% daily goals! Perfect execution and habit streak active.",
    },
    create: {
      userId: user.id,
      date: today,
      mood: 5,
      energy: 5,
      sleepHours: 8,
      studyHours: 4,
      workoutMins: 60,
      waterGlasses: 8,
      dailyScore: 100,
      reflectionNote: "Achieved 100% daily goals! Perfect execution and habit streak active.",
    },
  });

  console.log("Today check-in created/updated with score 100:", checkIn.id);

  // 2. Mark all active habits completed for today
  const habits = await prisma.habit.findMany({
    where: { userId: user.id, archived: false },
  });

  for (const habit of habits) {
    await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId: habit.id,
          date: today,
        },
      },
      update: {
        completed: true,
        value: habit.targetValue || 1,
      },
      create: {
        habitId: habit.id,
        date: today,
        completed: true,
        value: habit.targetValue || 1,
      },
    });
  }

  console.log(`Successfully logged ${habits.length} habits as completed for today.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
