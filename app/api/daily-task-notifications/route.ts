import { sendTaskEmailNotifications } from "@/lib/actions/notification";
import { getTasks, summarizeTasks } from "@/lib/actions/task";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tasks = await getTasks();

    const summary = await summarizeTasks(tasks);

    await sendTaskEmailNotifications(tasks, summary as string);

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
