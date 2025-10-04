import { sendTaskEmailNotifications } from "@/lib/actions/notification";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await sendTaskEmailNotifications();

    return NextResponse.json(
      { message: "Daily notification sent successfully." },
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
