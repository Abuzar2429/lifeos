import { getTodayCheckIn, getCheckInHistory } from "@/lib/actions/check-in";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const revalidate = 0; // Disable static caching so dashboard reflects current date/check-ins

export default async function Home() {
  const todayCheckIn = await getTodayCheckIn();
  const history = await getCheckInHistory(7);

  const todayScore = todayCheckIn ? todayCheckIn.dailyScore : null;

  return (
    <DashboardClient
      todayCheckIn={todayCheckIn}
      history={history}
      todayScore={todayScore}
    />
  );
}
