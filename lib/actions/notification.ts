import { TaskWithUser } from "@/types/util-types";
import { Task } from "@prisma/client";
import nodemailer from "nodemailer";
import { marked } from "marked";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendTaskEmailNotifications(
  tasks: Task[],
  summary: string
) {
  const tasksWithUser = tasks as TaskWithUser[];

  if (!tasksWithUser.length) {
    console.log("No tasks to notify for this user.");
    return;
  }

  const now = new Date();

  // Build task list in HTML
  let taskHtml = "<ul>";
  for (const task of tasksWithUser) {
    const diffDays = Math.ceil(
      (new Date(task.dueDate!).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) taskHtml += `<li>⚠️ Overdue: ${task.title}</li>`;
    else if (diffDays === 0) taskHtml += `<li>📌 Due Today: ${task.title}</li>`;
    else if (diffDays <= 3)
      taskHtml += `<li>⏰ Upcoming in ${diffDays} day(s): ${task.title}</li>`;
    else taskHtml += `<li>${task.title}</li>`; // optional: future tasks
  }
  taskHtml += "</ul>";

  // Convert AI Markdown summary to HTML using marked
  const summaryHtml = summary ? marked(summary) : "";

  // Construct the full email HTML
  const emailHtml = `
    <h2>Your Task Summary</h2>
    ${taskHtml}
    ${summaryHtml}
    <p>Keep up the productivity! 🚀</p>
  `;

  // Extract user email from the first task
  const email = tasksWithUser[0].user?.email;
  if (!email) {
    console.warn("User email missing, skipping email send.");
    return;
  }

  try {
    const res = await transporter.sendMail({
      from: `"AI Task Manager" <${process.env.EMAIL_FROM}>`,
      replyTo: "no-reply@ai-task-manager.com",
      to: email,
      subject: "Your Daily Task Summary",
      html: emailHtml,
    });
    console.log(`Email sent to ${email}: ${res.response}`);
  } catch (err) {
    console.error(`Failed to send email to ${email}`, err);
  }
}
