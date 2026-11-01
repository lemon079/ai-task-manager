import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendPushToUser } from "@/lib/push";
import { buildNotification } from "@/lib/notifications/templates";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notification = buildNotification("TEST");

    const result = await sendPushToUser(
      session.user.id,
      {
        title: notification.title,
        body: notification.body,
        url: notification.url,
        tag: notification.tag,
      },
      "TEST"
    );

    if (result.sent === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No active push subscriptions found on your account. Please enable push notifications on this device first.",
          result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Test notification sent to ${result.sent} active device(s).`,
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Push Test Error]", error);
    return NextResponse.json(
      { error: "Failed to dispatch test notification" },
      { status: 500 }
    );
  }
}
