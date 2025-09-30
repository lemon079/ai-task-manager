import cron from "node-cron";
import { sendTaskEmailNotifications } from "@/lib/actions/notification";

// Run every day at 8 AM server time
cron.schedule("0 8 * * *", async () => {
  console.log("Running scheduled task notifications...");
  await sendTaskEmailNotifications();
});
