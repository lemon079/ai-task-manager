import { prisma } from "@/prisma/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendTaskEmailNotifications() {
  console.log("Fetching tasks from the database...");
  const tasks = await prisma.task.findMany({
    where: { dueDate: { not: null } },
    include: { user: true }, // includes user.email from NextAuth
  });
  console.log(`Found ${tasks.length} tasks.`);

  // Group tasks by user
  const tasksByUser: Record<string, typeof tasks> = {};
  for (const task of tasks) {
    if (!task.user?.email) {
      console.log(`Skipping task ${task.id} because user email is missing`);
      continue;
    }
    const userId = task.user.id;
    if (!tasksByUser[userId]) tasksByUser[userId] = [];
    tasksByUser[userId].push(task);
  }
  console.log(
    `Tasks grouped by user: ${Object.keys(tasksByUser).length} users found.`
  );

  const now = new Date();

  for (const userId in tasksByUser) {
    const userTasks = tasksByUser[userId];
    const email = userTasks[0].user.email;

    console.log(`Preparing email for user ${userId} (${email})...`);

    let body = "Here are your tasks:\n\n";

    for (const task of userTasks) {
      const diffDays = Math.ceil(
        (new Date(task.dueDate!).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (diffDays < 0) body += `⚠️ Overdue: ${task.title}\n`;
      else if (diffDays === 0) body += `📌 Due Today: ${task.title}\n`;
      else if (diffDays <= 3)
        body += `⏰ Upcoming in ${diffDays} day(s): ${task.title}\n`;
    }

    if (body === "Here are your tasks:\n\n") {
      console.log(`No due tasks for user ${userId}, skipping email.`);
      continue; // skip if no tasks
    }

    console.log(`Sending email to ${email} with body:\n${body}`);
    const res = await transporter.sendMail({
      from: `"Ai-Task-Manager ${process.env.EMAIL_FROM}`,
      to: email,
      subject: "Your Task Notifications",
      text: body,
    });
    console.log(`Email sent: ${res.response}`);
  }
  console.log("All email notifications processed.");
}

export async function sendDeadlineNotifications() {
  const now = new Date();

  // Fetch only tasks with deadlines
  const tasks = await prisma.task.findMany({
    where: {
      dueDate: { not: null },
      deadlineNotified: false, // 🚀 only fetch tasks not notified yet
    },
    include: { user: true },
  });

  for (const task of tasks) {
    if (!task.user?.email) continue;

    const diffHours = Math.floor(
      (new Date(task.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60)
    );

    let subject: string | null = null;
    let message: string | null = null;

    if (diffHours < 0) {
      subject = `⚠️ Task Overdue: ${task.title}`;
      message = `Your task "${
        task.title
      }" was due on ${task.dueDate?.toDateString()} and is now overdue!`;
    } else if (diffHours <= 24) {
      subject = `📌 Task Due Soon: ${task.title}`;
      message = `Your task "${
        task.title
      }" is due within the next 24 hours (${task.dueDate?.toLocaleString()}).`;
    }

    if (subject && message) {
      await transporter.sendMail({
        from: `"Ai-Task-Manager <${process.env.EMAIL_FROM}>`,
        to: task.user.email,
        subject,
        text: message,
      });

      // ✅ Mark task as notified so it won’t trigger again
      await prisma.task.update({
        where: { id: task.id },
        data: { deadlineNotified: true },
      });
    }
  }
}
