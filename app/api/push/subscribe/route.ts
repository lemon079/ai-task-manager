import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma/prisma";
import { getVapidPublicKey } from "@/lib/api-keys";

export async function GET() {
  const publicKey = getVapidPublicKey() || null;

  return NextResponse.json(
    { vapidPublicKey: publicKey },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint, keys, userAgent } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription payload. Required: endpoint, keys.p256dh, keys.auth" },
        { status: 400 }
      );
    }

    // Upsert subscription by endpoint
    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: session.user.id,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || req.headers.get("user-agent") || null,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || req.headers.get("user-agent") || null,
      },
    });

    // Ensure user preference reflects enabled notifications
    await prisma.user.update({
      where: { id: session.user.id },
      data: { notificationsEnabled: true },
    }).catch((err) => {
      console.warn("[Push Subscribe] Failed to update user notificationsEnabled:", err);
    });

    return NextResponse.json(
      { success: true, id: subscription.id, message: "Push subscription registered" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Push Subscribe Error]", error);
    return NextResponse.json(
      { error: "Failed to register push subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { endpoint } = body;

    if (endpoint) {
      // Remove specific device subscription
      await prisma.pushSubscription.deleteMany({
        where: {
          userId: session.user.id,
          endpoint,
        },
      });
    } else {
      // Remove all subscriptions for current user
      await prisma.pushSubscription.deleteMany({
        where: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(
      { success: true, message: "Push subscription removed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Push Unsubscribe Error]", error);
    return NextResponse.json(
      { error: "Failed to remove push subscription" },
      { status: 500 }
    );
  }
}
