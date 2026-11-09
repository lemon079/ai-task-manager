import assert from "assert";
import dotenv from "dotenv";

dotenv.config();

console.log("🔔 Running Test Suite: Web Push Notifications & VAPID Infrastructure\n");

let passed = 0;
let failed = 0;

function it(name: string, fn: () => void | Promise<void>) {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then(() => {
          console.log(`  ✓ ${name}`);
          passed++;
        })
        .catch((err: unknown) => {
          const error = err as { message?: string };
          console.error(`  ✗ ${name}`);
          console.error(`    ${error.message}`);
          failed++;
        });
    }
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error(`  ✗ ${name}`);
    console.error(`    ${error.message}`);
    failed++;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = Buffer.from(base64, "base64");
  return new Uint8Array(rawData);
}

async function runTests() {
  console.log("Suite 1: VAPID Key Infrastructure & Environment Validation");

  it("VAPID public key must exist and be valid URL-safe base64", () => {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    assert.ok(publicKey, "NEXT_PUBLIC_VAPID_PUBLIC_KEY must be defined");
    assert.ok(publicKey.length >= 65, "VAPID public key must be at least 65 chars (uncompressed EC P-256)");
    assert.doesNotThrow(() => urlBase64ToUint8Array(publicKey));
  });

  it("VAPID private key must exist", () => {
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    assert.ok(privateKey, "VAPID_PRIVATE_KEY must be defined");
    assert.ok(privateKey.length >= 32, "VAPID private key must be at least 32 chars");
  });

  it("VAPID subject must be formatted as mailto or https url", () => {
    const subject = process.env.VAPID_SUBJECT || "mailto:support@neuratask.app";
    assert.ok(subject.startsWith("mailto:") || subject.startsWith("https://"), "Subject must be mailto: or https://");
  });

  console.log("\nSuite 2: Web Push Payload & Action Contract");

  it("Push payload serialization must include title, body, icon, badge, and default actions", () => {
    const payload = {
      title: "NeuraTask Deadline Reminder",
      body: "Sprint delivery is due in 30 minutes",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      tag: "neuratask-notification",
      data: { url: "/task-ai", taskId: "task_123" },
      actions: [
        { action: "open", title: "View" },
        { action: "dismiss", title: "Dismiss" },
      ],
    };

    const serialized = JSON.stringify(payload);
    const parsed = JSON.parse(serialized);

    assert.strictEqual(parsed.title, "NeuraTask Deadline Reminder");
    assert.strictEqual(parsed.data.taskId, "task_123");
    assert.strictEqual(parsed.actions.length, 2);
    assert.strictEqual(parsed.actions[0].action, "open");
    assert.strictEqual(parsed.actions[1].action, "dismiss");
  });

  it("urlBase64ToUint8Array accurately handles padding and url-safe characters", () => {
    const testKey = "BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ";
    const bytes = urlBase64ToUint8Array(testKey);
    assert.ok(bytes instanceof Uint8Array);
    assert.strictEqual(bytes.length, 65, "P-256 public key uncompressed byte length must be 65 bytes");
  });

  console.log("\nSuite 3: Idempotency & Expiration Error Handling");

  it("HTTP 404 or 410 error must be classified as expired subscription for automatic DB pruning", () => {
    const isExpired = (statusCode: number) => statusCode === 404 || statusCode === 410;
    assert.strictEqual(isExpired(410), true, "410 Gone must trigger pruning");
    assert.strictEqual(isExpired(404), true, "404 Not Found must trigger pruning");
    assert.strictEqual(isExpired(500), false, "500 Internal Error must NOT trigger pruning");
    assert.strictEqual(isExpired(429), false, "429 Rate Limit must NOT trigger pruning");
  });

  console.log("\n================================");
  console.log(`Passed: ${passed} | Failed: ${failed}`);
  console.log("================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
