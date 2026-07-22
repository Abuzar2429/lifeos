import { getJournalEntries } from "@/lib/actions/journal";
import { JournalClient } from "@/components/journal/journal-client";

export const revalidate = 0;

export default async function JournalPage() {
  const entries = await getJournalEntries();

  // Convert Date objects to ISO strings for RSC boundary transmission
  const serializedEntries = entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));

  return <JournalClient initialEntries={serializedEntries} />;
}
