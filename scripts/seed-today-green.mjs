import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🟢 Seeding database for today's Bright Green status...");

  // 1. Get or create demo user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Demo User",
        email: "demo@lifeos.app",
        isOnboarded: true,
      },
    });
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  console.log(`User ID: ${user.id}, Date: ${today.toISOString()}`);

  // 2. Create/Update Daily Check-In for Today (score 100)
  const existingCheckIn = await prisma.dailyCheckIn.findFirst({
    where: {
      userId: user.id,
      date: today,
    },
  });

  if (existingCheckIn) {
    await prisma.dailyCheckIn.update({
      where: { id: existingCheckIn.id },
      data: {
        dailyScore: 100,
        mood: 5,
        energy: 5,
        sleepHours: 8.5,
        waterGlasses: 8,
        workoutMins: 45,
        studyHours: 4.0,
        readingMins: 30,
        reflectionNote: "Today is a 100% Bright Green peak performance day! 🟢",
      },
    });
    console.log("✅ Updated today's DailyCheckIn to 100% score.");
  } else {
    await prisma.dailyCheckIn.create({
      data: {
        userId: user.id,
        date: today,
        dailyScore: 100,
        mood: 5,
        energy: 5,
        sleepHours: 8.5,
        waterGlasses: 8,
        workoutMins: 45,
        studyHours: 4.0,
        readingMins: 30,
        reflectionNote: "Today is a 100% Bright Green peak performance day! 🟢",
      },
    });
    console.log("✅ Created today's DailyCheckIn with 100% score.");
  }

  // 3. Ensure core habits exist and log completion for today
  const habitTitles = [
    { title: "Deep Work / Coding Session", category: "Career" },
    { title: "Morning Exercise & Workout", category: "Fitness" },
    { title: "30-Min Book Reading", category: "Reading" },
    { title: "Hydration Target (8 Glasses)", category: "Health" },
    { title: "Evening Journal Reflection", category: "Mindfulness" },
  ];

  for (const h of habitTitles) {
    let habit = await prisma.habit.findFirst({
      where: { userId: user.id, title: h.title },
    });

    if (!habit) {
      habit = await prisma.habit.create({
        data: {
          userId: user.id,
          title: h.title,
          category: h.category,
          frequency: "DAILY",
          targetValue: 1,
        },
      });
    }

    const existingLog = await prisma.habitLog.findFirst({
      where: {
        userId: user.id,
        habitId: habit.id,
        date: today,
      },
    });

    if (!existingLog) {
      await prisma.habitLog.create({
        data: {
          userId: user.id,
          habitId: habit.id,
          date: today,
          status: true,
          value: 1,
          notes: "Completed for Bright Green streak! 🟢",
        },
      });
    } else {
      await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { status: true, value: 1 },
      });
    }
  }

  console.log("✅ Logged 5 completed habits for today.");
  console.log("🎉 Today's Heatmap status is now 100% BRIGHT GREEN!");
}

main()
  .catch((e) => {
    console.error("Error seeding today green:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
