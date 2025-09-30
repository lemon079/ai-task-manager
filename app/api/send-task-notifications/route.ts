import { sendTaskEmailNotifications } from "@/lib/actions/notification";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await sendTaskEmailNotifications();

    return NextResponse.json(
      { message: "Task notifications sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to send notifications." },
      { status: 500 }
    );
  }
}
