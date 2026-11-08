import { DateTime } from "luxon";
import { NextResponse } from "next/server";
import { dispatchDuePushNotifications } from "@/lib/push";
import { getCronSecret } from "@/lib/api-keys";

/**
 * NeuraTask Push-Only Notification Cron Endpoint
 *
 * Product Invariant:
 * Scheduled job is a push sender ONLY. No email reminder code, templates,
 * env vars, dependencies, or crons exist anywhere in this system.
 */
export async function GET(req: Request) {
  try {
    // Secure cron endpoint with CRON_SECRET
    const authHeader = req.headers.get("authorization");
    const cronSecret = getCronSecret();
    if (cronSecret) {
      const token = authHeader?.replace(/^Bearer\s+/i, "");
      if (token !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const nowUTC = DateTime.utc();
    console.log(`[CRON] Running global push sweep at UTC ${nowUTC.toFormat("yyyy-MM-dd HH:mm:ss")}`);

    // Sweep and dispatch Web Push reminders (day before, morning of, overdue <= 3d, 9am digest)
    const pushResults = await dispatchDuePushNotifications();

    return NextResponse.json(
      {
        message: "Push notifications dispatched successfully.",
        timestamp: nowUTC.toISO(),
        results: pushResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CRON ERROR]", error);
    return NextResponse.json({ message: "Cron execution failed." }, { status: 500 });
  }
}
