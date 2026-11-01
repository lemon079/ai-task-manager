/**
 * NeuraTask Web Push Notification Templates (Part 5B Spec)
 *
 * Product Rules & Invariants:
 * 1. Title MUST start with exactly ONE leading emoji from the map.
 * 2. Never any emoji anywhere else in the title.
 * 3. Never any emoji in the body.
 * 4. Title length <= 40 graphemes (counted with Intl.Segmenter).
 * 5. Body length <= 110 characters (word-boundary truncated with '...').
 * 6. Strip all Markdown formatting from user task titles.
 * 7. Privacy mode (showTaskTitles === false): completely generic text, no task IDs/titles.
 */

export type NotificationKind =
  | "DUE_TODAY"
  | "DUE_TOMORROW"
  | "OVERDUE"
  | "DIGEST"
  | "TEST";

export const NOTIFICATION_EMOJIS: Record<NotificationKind, string> = {
  DUE_TODAY: "⏰",
  DUE_TOMORROW: "📅",
  OVERDUE: "⚠️",
  DIGEST: "📋",
  TEST: "🔔",
};

export interface TaskSummaryItem {
  id: string;
  title: string;
  dueDate?: Date | string | null;
  status?: string;
  priority?: string;
}

export interface NotificationContext {
  showTaskTitles?: boolean; // default: true
  timeZone?: string;
  userName?: string | null;
}

export interface NotificationResult {
  title: string;
  body: string;
  url: string;
  tag: string;
  data: {
    url: string;
    taskId?: string;
    kind: NotificationKind;
  };
}

/**
 * Strips common Markdown tokens from text to ensure clean plaintext notifications.
 */
export function sanitizeMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/[#*_~`]/g, "") // strip headers, bold, italics, strikethrough, backticks
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // replace markdown links [text](url) with text
    .replace(/\s+/g, " ") // collapse multiple spaces/newlines
    .trim();
}

/**
 * Counts visual user-perceived grapheme clusters using Intl.Segmenter.
 */
export function countGraphemes(text: string): number {
  if (!text) return 0;
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text)).length;
  }
  // Fallback if Segmenter is unavailable
  return Array.from(text).length;
}

/**
 * Truncates text to a maximum number of graphemes, preserving word boundaries when possible.
 */
export function truncateGraphemes(text: string, maxGraphemes: number): string {
  if (!text) return "";
  const total = countGraphemes(text);
  if (total <= maxGraphemes) return text;

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const graphemes = Array.from(segmenter.segment(text)).map((s) => s.segment);
    // Reserve 1 grapheme for ellipsis '…' or '...'
    const targetLength = Math.max(1, maxGraphemes - 1);
    const sliced = graphemes.slice(0, targetLength).join("");
    return `${sliced.trimEnd()}…`;
  }

  return `${Array.from(text).slice(0, maxGraphemes - 1).join("").trimEnd()}…`;
}

/**
 * Truncates text to a maximum character length, breaking on word boundaries when possible.
 */
export function truncateCharacters(text: string, maxChars: number): string {
  if (!text || text.length <= maxChars) return text || "";
  const sub = text.slice(0, maxChars - 3);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace > maxChars * 0.5) {
    return `${sub.slice(0, lastSpace).trimEnd()}...`;
  }
  return `${sub.trimEnd()}...`;
}

/**
 * Strips all emojis from arbitrary user text to enforce the single-leading-emoji invariant.
 */
export function stripEmojis(text: string): string {
  if (!text) return "";
  // Matches Unicode emoji sequences, symbols, pictographs, variation selectors, and ZWJ
  return text
    .replace(
      /(?:[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]|[\u{200D}\u{FE0E}\u{FE0F}])/gu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pure builder function for all Web Push notifications.
 */
export function buildNotification(
  kind: NotificationKind,
  tasks: TaskSummaryItem[] = [],
  ctx: NotificationContext = {}
): NotificationResult {
  const emoji = NOTIFICATION_EMOJIS[kind];
  const showTitles = ctx.showTaskTitles !== false; // default true
  const firstTask = tasks[0];
  const count = tasks.length;

  // 1. Privacy Mode: Generic copy with no task details or IDs
  if (!showTitles && kind !== "TEST") {
    let titlePrefix = "";
    let bodyText = "";

    switch (kind) {
      case "DUE_TODAY":
        titlePrefix = count === 1 ? "Task due today" : `${count} tasks due today`;
        bodyText = count === 1
          ? "You have 1 task due today. Open NeuraTask to view."
          : `You have ${count} tasks due today. Open NeuraTask to view.`;
        break;
      case "DUE_TOMORROW":
        titlePrefix = count === 1 ? "Task due tomorrow" : `${count} tasks due tomorrow`;
        bodyText = count === 1
          ? "You have 1 task due tomorrow. Open NeuraTask to prepare."
          : `You have ${count} tasks due tomorrow. Open NeuraTask to prepare.`;
        break;
      case "OVERDUE":
        titlePrefix = count === 1 ? "Task overdue" : `${count} tasks overdue`;
        bodyText = count === 1
          ? "You have 1 overdue task. Open NeuraTask to update."
          : `You have ${count} overdue tasks. Open NeuraTask to update.`;
        break;
      case "DIGEST":
      default:
        titlePrefix = "Daily task summary";
        bodyText = count === 1
          ? "You have 1 task on your agenda today."
          : `You have ${count} tasks on your agenda today.`;
        break;
    }

    const title = `${emoji} ${titlePrefix}`;
    return {
      title: truncateGraphemes(title, 40),
      body: truncateCharacters(bodyText, 110),
      url: "/dashboard",
      tag: `neuratask-${kind.toLowerCase()}`,
      data: {
        url: "/dashboard",
        kind,
      },
    };
  }

  // 2. Normal Mode: Clean titles & details with strict length invariants
  switch (kind) {
    case "TEST": {
      const title = `${emoji} Test notification`;
      const body = "Push notifications are active and ready on your device.";
      return {
        title,
        body,
        url: "/settings",
        tag: "neuratask-test",
        data: {
          url: "/settings",
          kind: "TEST",
        },
      };
    }

    case "DUE_TODAY": {
      const cleanTitle = stripEmojis(sanitizeMarkdown(firstTask?.title || "Task"));
      const rawTitle = count === 1
        ? `${emoji} Due today: ${cleanTitle}`
        : `${emoji} ${count} tasks due today`;
      const title = truncateGraphemes(rawTitle, 40);

      const rawBody = count === 1
        ? `Scheduled for completion today. Tap to view or complete.`
        : `${cleanTitle} and ${count - 1} other task${count - 1 > 1 ? "s" : ""} scheduled today.`;
      const body = truncateCharacters(rawBody, 110);

      return {
        title,
        body,
        url: count === 1 ? "/task-ai" : "/dashboard",
        tag: `due-today-${firstTask?.id || "batch"}`,
        data: {
          url: count === 1 ? "/task-ai" : "/dashboard",
          taskId: count === 1 ? firstTask?.id : undefined,
          kind: "DUE_TODAY",
        },
      };
    }

    case "DUE_TOMORROW": {
      const cleanTitle = stripEmojis(sanitizeMarkdown(firstTask?.title || "Task"));
      const rawTitle = count === 1
        ? `${emoji} Due tomorrow: ${cleanTitle}`
        : `${emoji} ${count} tasks due tomorrow`;
      const title = truncateGraphemes(rawTitle, 40);

      const rawBody = count === 1
        ? `Upcoming deadline tomorrow. Tap to review your task.`
        : `${cleanTitle} and ${count - 1} other task${count - 1 > 1 ? "s" : ""} due tomorrow.`;
      const body = truncateCharacters(rawBody, 110);

      return {
        title,
        body,
        url: count === 1 ? "/task-ai" : "/dashboard",
        tag: `due-tomorrow-${firstTask?.id || "batch"}`,
        data: {
          url: count === 1 ? "/task-ai" : "/dashboard",
          taskId: count === 1 ? firstTask?.id : undefined,
          kind: "DUE_TOMORROW",
        },
      };
    }

    case "OVERDUE": {
      const cleanTitle = stripEmojis(sanitizeMarkdown(firstTask?.title || "Task"));
      const rawTitle = count === 1
        ? `${emoji} Overdue: ${cleanTitle}`
        : `${emoji} ${count} tasks overdue`;
      const title = truncateGraphemes(rawTitle, 40);

      const rawBody = count === 1
        ? `This task is past its deadline. Tap to update or complete.`
        : `${cleanTitle} and ${count - 1} other task${count - 1 > 1 ? "s" : ""} are past deadline.`;
      const body = truncateCharacters(rawBody, 110);

      return {
        title,
        body,
        url: count === 1 ? "/task-ai" : "/dashboard",
        tag: `overdue-${firstTask?.id || "batch"}`,
        data: {
          url: count === 1 ? "/task-ai" : "/dashboard",
          taskId: count === 1 ? firstTask?.id : undefined,
          kind: "OVERDUE",
        },
      };
    }

    case "DIGEST":
    default: {
      const title = `${emoji} Daily task summary`;
      const cleanFirst = stripEmojis(sanitizeMarkdown(firstTask?.title || ""));
      const remaining = count - 1;

      const rawBody = cleanFirst && remaining > 0
        ? `You have ${count} tasks today: ${cleanFirst} and ${remaining} more.`
        : `You have ${count} task${count !== 1 ? "s" : ""} on your agenda today. Tap to review.`;
      const body = truncateCharacters(rawBody, 110);

      return {
        title: truncateGraphemes(title, 40),
        body,
        url: "/dashboard",
        tag: `digest-${new Date().toISOString().slice(0, 10)}`,
        data: {
          url: "/dashboard",
          kind: "DIGEST",
        },
      };
    }
  }
}
