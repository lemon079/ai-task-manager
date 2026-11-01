# 🧠 AI Task Manager

The **AI Task Manager** is an intelligent task management application that allows users to create, manage, and analyze tasks using **natural language**. It combines the power of **LangChain**, **Next.js**, and **AI agents** to deliver an automated productivity experience.

Users can interact with a **custom-built AI Task Manager Agent** that performs CRUD operations on tasks through conversational commands. The system also includes a **modern dashboard**, **AI-driven insights**, and **semantic memory** powered by **vector embeddings**.

---

## 🚀 Features

### 🗣️ AI-Powered Task Management
- Create, update, delete, or retrieve tasks using **natural language**.
- Powered by a **LangChain-based AI agent** with **tool-based reasoning**.
- Performs CRUD operations using structured **LangGraph workflows**.
- Integrates **vector embeddings** for intelligent task recall and semantic understanding.

### 🔍 Semantic Search with Vector Embeddings
- Tasks are **encoded into high-dimensional embeddings** using **LangChain’s embedding models**.
- Stored in **Pinecone Vector Database**, enabling **semantic similarity search**.
- Users can search naturally, e.g.:
  - “Show me tasks related to improving the dashboard UI.”
  - “What are my pending high-priority items?”
- Enables **Long-Term Memory (LTM)** for the AI agent, allowing it to retrieve relevant historical context based on meaning rather than keywords.
- Supports **re-indexing** and **automatic vector updates** whenever tasks are created, edited, or deleted.

### 📅 Smart Dashboard
- **Calendar View** to visualize tasks by date.
  - Displays visual pings for upcoming deadlines.
  - Clicking a date reveals tasks due on that day.
- **Task Table** to list tasks chronologically with **pagination (10 per page)**.
  - Displays **title**, **status**, **priority**, and **due date**.
  - Intelligent color coding for quick visual scanning.

### 📱 Install-Only PWA & Web Push
- **Install-Only Architecture**: Operates exclusively as an installed application (Chrome/Edge desktop, macOS Safari Add to Dock, Android & iOS Home Screen). Browser tabs show a Notion-style install page without exposing internal UI or session data.
- **Web Push Reminders**: Zero-email reminder system. Dispatches deadline warnings (day before and morning of) and overdue reminders.
- **Part 5B Notification Contract**: Strict leading emojis (`⏰`, `📅`, `⚠️`, `📋`, `🔔`), &le; 40 grapheme titles, &le; 110 char bodies, and user privacy toggle.
- **Offline Resilient**: Precached offline fallback and background sync via custom Service Worker.

---

## 🧠 Memory & AI Architecture

| Memory Type | Description | Backed By |
|--------------|--------------|------------|
| **Short-Term Memory (STM)** | Recent user queries and conversation context. | LangGraph / Session State |
| **Long-Term Memory (LTM)** | Persistent memory of tasks and their embeddings for semantic search. | Pinecone Vector Database |
| **Procedural Memory** | AI’s knowledge of available tools and actions (CRUD operations). | LangChain Tools |

This hybrid memory system allows the AI to combine **reasoning (STM)** and **retrieval (LTM)**, enabling both contextual understanding and factual recall.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | [Next.js 15 (Turbopack)](https://nextjs.org/), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/) |
| **Backend** | [Next.js API Routes](https://nextjs.org/docs/api-routes), [Prisma ORM](https://www.prisma.io/), [PostgreSQL] |
| **AI & Automation** | [LangChain](https://js.langchain.com/), [LangGraph](https://www.langchain.com/langgraph), [Google GenAI API], [Ollama] |
| **Memory & Semantic Search** | [Pinecone Vector DB](https://www.pinecone.io/), [LangChain Embeddings] |
| **UI Components** | [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/), [shadcn/ui] |
| **Form Handling** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Notifications** | [Nodemailer](https://nodemailer.com/), [Sonner](https://sonner.emilkowal.ski/) |
| **State Management** | [TanStack Query](https://tanstack.com/query) |
| **Auth** | [NextAuth.js](https://next-auth.js.org/) with Prisma Adapter |
| **Utilities** | [date-fns](https://date-fns.org/), [Luxon](https://moment.github.io/luxon/), [Axios](https://axios-http.com/) |

---

## 🧩 Core AI Flow

1. The user inputs a natural language command (e.g., *“Show me tasks about deployment”*).
2. The LangChain agent parses intent and selects the appropriate tool.
3. The query is embedded using the **Embeddings Model**.
4. **Pinecone Vector Database** retrieves semantically similar tasks.
5. The AI formats and responds with contextual insights or executes the corresponding action (create, update, delete, search).

---

## 🧪 Example Prompts

You can test the system by interacting naturally with the AI agent:

### Create Tasks
- “Add a task to finish the analytics dashboard by Friday.”
- “Create a high-priority task for preparing slides for the AI presentation.”

### Retrieve Tasks (Semantic Search)
- “What tasks are related to the dashboard UI?”
- “Show me all pending tasks about Docker or deployment.”

### Update Tasks
- “Mark the task for reviewing pull requests as completed.”
- “Change the priority of the AI presentation slides to high.”

### Delete Tasks
- “Delete my task about renewing the passport.”
- “Remove the Docker setup task.”

---

## 🧾 License

This project is open-source and available for educational or personal use.
