"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const AUTH_COOKIE = "lifeos_session_user";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionEmail = cookieStore.get(AUTH_COOKIE)?.value;

    if (sessionEmail) {
      const user = await prisma.user.findUnique({
        where: { email: sessionEmail },
      });
      if (user) return user;
    }

    // Fallback to demo user
    let demoUser = await prisma.user.findFirst({
      where: { email: "demo@lifeos.app" },
    });

    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          name: "Ashraf (Demo User)",
          email: "demo@lifeos.app",
          isOnboarded: true,
        },
      });
    }

    return demoUser;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function loginUser(formData: { email: string; password?: string }) {
  try {
    const { email } = formData;
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Create user if not exists
      const namePart = email.split("@")[0];
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      user = await prisma.user.create({
        data: {
          name: displayName,
          email: email.toLowerCase().trim(),
          isOnboarded: true,
        },
      });
    }

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, user.email || "demo@lifeos.app", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
    });

    revalidatePath("/");
    return { success: true, user };
  } catch (error) {
    console.error("Error in loginUser:", error);
    return { success: false, error: "Authentication failed. Please try again." };
  }
}

export async function registerUser(formData: { name: string; email: string; password?: string }) {
  try {
    const { name, email } = formData;
    if (!name || !name.trim()) {
      return { success: false, error: "Please enter your name." };
    }

    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        isOnboarded: true,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, user.email || "demo@lifeos.app", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
    });

    revalidatePath("/");
    return { success: true, user };
  } catch (error) {
    console.error("Error in registerUser:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}

export async function loginAsDemoUser() {
  try {
    let demoUser = await prisma.user.findFirst({
      where: { email: "demo@lifeos.app" },
    });

    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          name: "Ashraf (Demo User)",
          email: "demo@lifeos.app",
          isOnboarded: true,
        },
      });
    }

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, "demo@lifeos.app", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
    });

    revalidatePath("/");
    return { success: true, user: demoUser };
  } catch (error) {
    console.error("Error in loginAsDemoUser:", error);
    return { success: false, error: "Failed to login as demo user." };
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error in logoutUser:", error);
    return { success: false };
  }
}
