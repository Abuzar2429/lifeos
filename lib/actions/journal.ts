"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrCreateDemoUser } from "./check-in";
import { analyzeSentiment } from "@/lib/sentiment";

export interface CreateJournalInput {
  title: string;
  content: string; // rich-text (HTML)
  moodTag?: string | null;
  tags?: string[];
}

/**
 * Strips HTML tags from rich text content to return clean plain text.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

/**
 * Creates a new journal entry for the demo user, calculating sentiment and handling tags.
 */
export async function createJournalEntry(input: CreateJournalInput) {
  try {
    const user = await getOrCreateDemoUser();

    // Strip HTML and calculate sentiment score
    const plainText = stripHtml(input.content);
    const sentimentScore = analyzeSentiment(plainText);

    // Build the Prisma connectOrCreate array for tags
    const tagConnectOrCreate = input.tags
      ? input.tags
          .filter((t) => t.trim() !== "")
          .map((t) => {
            const name = t.trim().toLowerCase().replace("#", "");
            return {
              where: { name },
              create: { name },
            };
          })
      : [];

    const entry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        title: input.title,
        content: input.content,
        moodTag: input.moodTag || null,
        sentimentScore,
        tags: {
          connectOrCreate: tagConnectOrCreate,
        },
      },
      include: {
        tags: true,
      },
    });

    revalidatePath("/journal");
    revalidatePath("/");
    return { success: true, entry };
  } catch (error) {
    console.error("Error creating journal entry:", error);
    return { success: false, error: "Failed to save journal entry." };
  }
}

/**
 * Fetches all journal entries for the demo user.
 */
export async function getJournalEntries() {
  try {
    const user = await getOrCreateDemoUser();

    const entries = await prisma.journalEntry.findMany({
      where: {
        userId: user.id,
      },
      include: {
        tags: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return entries;
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return [];
  }
}

/**
 * Updates an existing journal entry.
 */
export async function updateJournalEntry(entryId: string, input: CreateJournalInput) {
  try {
    const plainText = stripHtml(input.content);
    const sentimentScore = analyzeSentiment(plainText);

    const tagConnectOrCreate = input.tags
      ? input.tags
          .filter((t) => t.trim() !== "")
          .map((t) => {
            const name = t.trim().toLowerCase().replace("#", "");
            return {
              where: { name },
              create: { name },
            };
          })
      : [];

    const entry = await prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        title: input.title,
        content: input.content,
        moodTag: input.moodTag || null,
        sentimentScore,
        tags: {
          set: [], // clear existing relations
          connectOrCreate: tagConnectOrCreate,
        },
      },
      include: {
        tags: true,
      },
    });

    revalidatePath("/journal");
    revalidatePath("/");
    return { success: true, entry };
  } catch (error) {
    console.error("Error updating journal entry:", error);
    return { success: false, error: "Failed to update journal entry." };
  }
}

/**
 * Deletes a journal entry.
 */
export async function deleteJournalEntry(entryId: string) {
  try {
    await prisma.journalEntry.delete({
      where: { id: entryId },
    });

    revalidatePath("/journal");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return { success: false, error: "Failed to delete journal entry." };
  }
}
