import { sendDeadlineNotifications } from "@/lib/actions/notification";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await sendDeadlineNotifications();
    return NextResponse.json({ message: "Deadline notifications processed" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
