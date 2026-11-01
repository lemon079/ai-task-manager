import assert from "node:assert";
import {
  buildNotification,
  countGraphemes,
  stripEmojis,
  sanitizeMarkdown,
  truncateGraphemes,
  truncateCharacters,
  NOTIFICATION_EMOJIS,
  NotificationKind,
} from "../lib/notifications/templates";

console.log("\n🔔 Running Test Suite: Notification Templates (Part 5B Spec)\n");

let passed = 0;
let failed = 0;

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    failed++;
  }
}

console.log("Suite 1: Emoji Invariants & Header Constraints");

const kinds: NotificationKind[] = ["DUE_TODAY", "DUE_TOMORROW", "OVERDUE", "DIGEST", "TEST"];

for (const kind of kinds) {
  it(`should start ${kind} title with exactly the required emoji`, () => {
    const res = buildNotification(kind, [{ id: "t1", title: "Review quarterly report" }]);
    const expectedEmoji = NOTIFICATION_EMOJIS[kind];
    assert.ok(
      res.title.startsWith(`${expectedEmoji} `),
      `Title "${res.title}" must start with "${expectedEmoji} "`
    );

    // Verify exactly one emoji in title
    const stripped = stripEmojis(res.title);
    assert.strictEqual(
      res.title.replace(expectedEmoji, "").trim(),
      stripped.trim(),
      `Title should have no other emojis beyond the leading one: ${res.title}`
    );

    // Verify NO emojis in body
    assert.strictEqual(
      res.body,
      stripEmojis(res.body),
      `Body must not contain emojis: "${res.body}"`
    );
  });
}

console.log("\nSuite 2: Grapheme Cluster & Length Limits");

it("should enforce title <= 40 graphemes on ultra-long titles", () => {
  const superLongTitle =
    "Complete the comprehensive architectural review and security auditing for enterprise multi-tenant database synchronization protocol";
  const res = buildNotification("DUE_TODAY", [{ id: "t1", title: superLongTitle }]);
  const graphemes = countGraphemes(res.title);
  assert.ok(
    graphemes <= 40,
    `Title grapheme count (${graphemes}) exceeds 40: "${res.title}"`
  );
  assert.ok(res.title.endsWith("…"), "Must be truncated with ellipsis");
});

it("should accurately count complex multi-byte graphemes (flags, family ZWJ sequences)", () => {
  // 👨‍👩‍👧‍👦 is 1 visual grapheme cluster but multiple code units
  const familyGrapheme = "👨‍👩‍👧‍👦";
  assert.strictEqual(countGraphemes(familyGrapheme), 1);
  const truncated = truncateGraphemes("Hello 👨‍👩‍👧‍👦 World", 8);
  assert.ok(countGraphemes(truncated) <= 8);
});

it("should enforce body <= 110 characters with clean word boundary truncation", () => {
  const longTask = {
    id: "t1",
    title: "Short Task",
  };
  const res = buildNotification("DIGEST", [
    longTask,
    { id: "t2", title: "Second Task with extremely descriptive details that continue on and on to fill the entire buffer" },
    { id: "t3", title: "Third Task" },
    { id: "t4", title: "Fourth Task" },
  ]);
  assert.ok(
    res.body.length <= 110,
    `Body length (${res.body.length}) must be <= 110: "${res.body}"`
  );
});

console.log("\nSuite 3: Markdown Sanitization & User Emoji Stripping");

it("should strip markdown symbols from user task titles", () => {
  const markdownTask = {
    id: "t1",
    title: "# Urgent: **Fix** [auth issue](https://example.com) & `clean` database",
  };
  const res = buildNotification("DUE_TODAY", [markdownTask]);
  assert.ok(!res.title.includes("**"), "Must strip bold markdown");
  assert.ok(!res.title.includes("#"), "Must strip header markdown");
  assert.ok(!res.title.includes("`"), "Must strip code backticks");
  assert.ok(!res.title.includes("https://"), "Must strip markdown link urls");
});

it("should strip emojis embedded in user task titles to prevent duplicate emojis", () => {
  const emojiTask = {
    id: "t1",
    title: "🚀 Launch satellite 🛰️ into orbit 🌌",
  };
  const res = buildNotification("DUE_TODAY", [emojiTask]);
  // Title starts with ⏰ but must not contain 🚀, 🛰️, or 🌌
  assert.ok(res.title.startsWith("⏰ "), "Must start with ⏰");
  assert.ok(!res.title.includes("🚀"), "Must strip user 🚀");
  assert.ok(!res.title.includes("🛰️"), "Must strip user 🛰️");
  assert.ok(!res.title.includes("🌌"), "Must strip user 🌌");
});

console.log("\nSuite 4: Privacy Mode (showTaskTitles === false)");

it("should omit task titles and IDs when privacy mode is active", () => {
  const sensitiveTask = {
    id: "secret-task-999",
    title: "Confidential M&A discussion with investors",
  };
  const res = buildNotification("OVERDUE", [sensitiveTask], { showTaskTitles: false });

  // Invariants
  assert.ok(res.title.startsWith("⚠️ "), "Must start with ⚠️");
  assert.ok(!res.title.includes("Confidential"), "Must NOT reveal title in notification title");
  assert.ok(!res.body.includes("Confidential"), "Must NOT reveal title in notification body");
  assert.strictEqual(res.data.taskId, undefined, "Must NOT include taskId in payload data");
  assert.strictEqual(res.url, "/dashboard", "Must route generic privacy notifications to /dashboard");
});

it("should handle privacy mode for multiple tasks / digest", () => {
  const tasks = [
    { id: "1", title: "Secret 1" },
    { id: "2", title: "Secret 2" },
    { id: "3", title: "Secret 3" },
  ];
  const res = buildNotification("DUE_TODAY", tasks, { showTaskTitles: false });
  assert.ok(res.title.includes("3 tasks due today"));
  assert.ok(!res.title.includes("Secret"));
  assert.ok(!res.body.includes("Secret"));
});

console.log("\n================================");
console.log(`Passed: ${passed} | Failed: ${failed}`);
console.log("================================\n");

if (failed > 0) {
  process.exit(1);
}
