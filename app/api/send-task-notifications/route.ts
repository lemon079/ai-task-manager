import { sendTaskEmailNotifications } from "@/lib/actions/notification";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
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
