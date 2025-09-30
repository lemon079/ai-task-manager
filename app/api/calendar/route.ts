import { auth } from "@/auth";
import { google } from "googleapis";
import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   const session = await auth();

//   if (!session?.user?.accessToken) {
//     return new Response(JSON.stringify({ error: "Not authenticated" }), {
//       status: 401,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   const googleAuth = new google.auth.OAuth2();
//   googleAuth.setCredentials({ access_token: session.user.accessToken });

//   const calendar = google.calendar({ version: "v3", auth: googleAuth });

//   const now = new Date();
//   const oneWeekLater = new Date();
//   oneWeekLater.setDate(now.getDate() + 7);

//   try {
//     const response = await calendar.events.list({
//       calendarId: "primary",
//       timeMin: now.toISOString(),
//       timeMax: oneWeekLater.toISOString(),
//       singleEvents: true,
//       orderBy: "startTime",
//     });

//     return new Response(JSON.stringify(response.data.items), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (err) {
//     console.error(err);
//     return new Response(JSON.stringify({ error: "Failed to fetch events" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }

export async function GET() {
  const mockCalendarEvents = [
    {
      title: "Meeting with Ali",
      start: "2025-09-02T10:00:00",
      end: "2025-09-02T11:00:00",
    },
    {
      title: "Study Session",
      start: "2025-09-02T13:00:00",
      end: "2025-09-02T15:00:00",
    },
    { title: "Gym", start: "2025-09-02T17:00:00", end: "2025-09-02T18:00:00" },
  ];

  return NextResponse.json(mockCalendarEvents);
}
