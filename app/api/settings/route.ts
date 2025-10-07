import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { auth } from "@/auth";

// GET → Fetch user settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        notificationsEnabled: true,
        dailyNotificationTime: true,
        timeZone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      notificationsEnabled: user.notificationsEnabled,
      notificationTime: user.dailyNotificationTime || "09:00",
      timeZone:
        user.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch (error) {
    console.error("[SETTINGS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST → Update user settings
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { notificationsEnabled, notificationTime, timeZone } = body;

    if (
      typeof notificationsEnabled !== "boolean" ||
      !notificationTime ||
      !timeZone
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        notificationsEnabled,
        dailyNotificationTime: notificationTime,
        timeZone,
      },
    });

    return NextResponse.json(
      { message: "Settings updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SETTINGS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
