import assert from "assert";
import { validateInput } from "../lib/langchain/guardrails";
import { checkRateLimit } from "../lib/rate-limit";

console.log("🚀 Running Test Suite: AI Task Manager Audit Verification\n");

let passed = 0;
let failed = 0;

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------
// 1. Guardrail Validation Tests
// ---------------------------------------------------------
console.log("Suite 1: Input Guardrails & Punctuation");

it("should allow natural language with ampersands (&)", () => {
  const res = validateInput("Create a task to buy apples & oranges tomorrow");
  assert.strictEqual(res.passed, true);
});

it("should allow natural language with dollar signs ($)", () => {
  const res = validateInput("Create a task: client budget review for $5000");
  assert.strictEqual(res.passed, true);
});

it("should allow natural language with semicolons (;)", () => {
  const res = validateInput("Schedule a task; need to prepare slides for meeting");
  assert.strictEqual(res.passed, true);
});

it("should block malicious script injection", () => {
  const res = validateInput("<script>alert('xss')</script>");
  assert.strictEqual(res.passed, false);
});

it("should block destructive shell execution commands", () => {
  const res = validateInput("rm -rf /");
  assert.strictEqual(res.passed, false);
});

// ---------------------------------------------------------
// 2. Rate Limiting Tests
// ---------------------------------------------------------
console.log("\nSuite 2: Rate Limiting Engine");

it("should allow requests under the limit", () => {
  const testId = `test-client-${Date.now()}`;
  const cfg = { maxRequests: 3, windowMs: 10000 };
  const r1 = checkRateLimit(testId, cfg);
  const r2 = checkRateLimit(testId, cfg);
  const r3 = checkRateLimit(testId, cfg);

  assert.strictEqual(r1.success, true);
  assert.strictEqual(r2.success, true);
  assert.strictEqual(r3.success, true);
});

it("should block requests exceeding the limit", () => {
  const testId = `test-blocked-${Date.now()}`;
  const cfg = { maxRequests: 2, windowMs: 10000 };
  checkRateLimit(testId, cfg);
  checkRateLimit(testId, cfg);
  const r3 = checkRateLimit(testId, cfg);

  assert.strictEqual(r3.success, false);
  assert.strictEqual(r3.remaining, 0);
});

// ---------------------------------------------------------
// 3. Custom Calendar Date Key Formatting Tests
// ---------------------------------------------------------
console.log("\nSuite 3: Custom Calendar Date Normalization");

function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

it("should format calendar date key consistently as YYYY-MM-DD", () => {
  const sample = new Date(2026, 9, 28); // Month is 0-indexed: 9 = October
  const key = formatDateKey(sample);
  assert.strictEqual(key, "2026-10-28");
});

it("should group tasks correctly by date key", () => {
  const tasks = [
    { id: "1", title: "Task 1", dueDate: new Date(2026, 9, 28) },
    { id: "2", title: "Task 2", dueDate: new Date(2026, 9, 28) },
    { id: "3", title: "Task 3", dueDate: new Date(2026, 9, 29) },
    { id: "4", title: "Task 4", dueDate: null },
  ];

  const map = new Map<string, typeof tasks>();
  let unscheduled = 0;

  for (const t of tasks) {
    if (!t.dueDate) {
      unscheduled++;
      continue;
    }
    const key = formatDateKey(t.dueDate);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }

  assert.strictEqual(map.get("2026-10-28")?.length, 2);
  assert.strictEqual(map.get("2026-10-29")?.length, 1);
  assert.strictEqual(unscheduled, 1);
});

// ---------------------------------------------------------
// Summary
// ---------------------------------------------------------
console.log(`\n================================`);
console.log(`Passed: ${passed} | Failed: ${failed}`);
console.log(`================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
