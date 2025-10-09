# 🧠 AI Task Manager

The **AI Task Manager** is an intelligent task management application that allows users to create, manage, and analyze tasks using **natural language**. It combines the power of **LangChain**, **Next.js**, and **AI agents** to provide an automated productivity experience.  

Users can communicate with a **custom-built AI Task Manager Agent** that performs CRUD operations on tasks through natural language commands. The system also offers a modern dashboard, smart notifications, and AI-driven insights.

---

## 🚀 Features

### 🗣️ AI-Powered Task Management
- Create, update, delete, or retrieve tasks using **natural language**.
- Powered by a **LangChain-based custom AI agent**.
- Automatically interprets intent and manages your task database.

### 📅 Smart Dashboard
- **Calendar View** to visualize tasks by date.
  - Displays visual pings to indicate upcoming deadlines.
  - Clicking a date reveals all tasks due that day.
- **Task Table** to list all tasks chronologically.
  - Includes **pagination (10 tasks per page)**.
  - Displays key details: title, status, priority, and due date.

### ⚙️ User Settings
- Manage personal preferences:
  - Time zone configuration.
  - Toggle **email notifications**.
  - Define **daily reminder time**.
- Receives **automated email notifications** containing:
  - AI-generated task summaries and insights.
  - Upcoming task reminders.

### 📬 Email & Insights
- Scheduled daily summaries sent via **Nodemailer**.
- AI-generated productivity insights using **LangChain** models.
- Provides actionable intelligence to improve planning and task execution.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | [Next.js 15 (Turbopack)](https://nextjs.org/), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/) |
| **Backend** | [Next.js API Routes](https://nextjs.org/docs/api-routes), [Prisma ORM](https://www.prisma.io/), [PostgreSQL] |
| **AI & Automation** | [LangChain](https://js.langchain.com/), [LangGraph](https://www.langchain.com/langgraph), [Google GenAI API], [Ollama] |
| **UI Components** | [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/), [shadcn/ui] |
| **Form Handling** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Notifications** | [Nodemailer](https://nodemailer.com/), [Sonner](https://sonner.emilkowal.ski/) |
| **State Management** | [TanStack Query](https://tanstack.com/query) |
| **Auth** | [NextAuth.js](https://next-auth.js.org/) with Prisma Adapter |
| **Utilities** | [date-fns](https://date-fns.org/), [Luxon](https://moment.github.io/luxon/), [Axios](https://axios-http.com/) |

---

## 🧩 Folder Structure

