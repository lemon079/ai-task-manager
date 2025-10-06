// app/api/user/settings/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma/prisma";

export async function GET() {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch only relevant fields
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      notificationsEnabled: true,
      dailyNotificationTime: true,
    },
  });

  // Provide sensible defaults if not yet configured
  return NextResponse.json({
    notificationsEnabled: user?.notificationsEnabled ?? true,
    notificationTime: user?.dailyNotificationTime ?? "09:00",
  });
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { notificationsEnabled, notificationTime } = await req.json();

  await prisma.user.update({
    where: { id: userId },
    data: { notificationsEnabled, dailyNotificationTime: notificationTime },
  });

  return NextResponse.json({ message: "Settings updated" });
}
