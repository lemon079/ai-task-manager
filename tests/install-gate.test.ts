import assert from "node:assert";
import {
  detectBrowserPlatform,
  isStandaloneDisplayMode,
  isBrowserAllowed,
} from "../lib/pwa/display-mode";

console.log("\n🔒 Running Test Suite: PWA Install Gate & Platform Detection\n");

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

console.log("Suite 1: Platform Sniffing & UA Detection");

it("should correctly identify iOS Safari", () => {
  const iosSafariUA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
  const platform = detectBrowserPlatform(iosSafariUA);
  assert.strictEqual(platform.isIos, true, "Must detect iOS");
  assert.strictEqual(platform.isInAppBrowser, false, "Must not be flagged as in-app browser");
});

it("should correctly identify In-App Browsers (Instagram)", () => {
  const instagramUA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 280.0.0.17.112";
  const platform = detectBrowserPlatform(instagramUA);
  assert.strictEqual(platform.isInAppBrowser, true, "Must detect In-App Browser");
  assert.strictEqual(platform.isIos, true, "Must also detect iOS environment");
});

it("should correctly identify In-App Browsers (TikTok / ByteDance)", () => {
  const tiktokUA =
    "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36 BytedanceWebview/1.0";
  const platform = detectBrowserPlatform(tiktokUA);
  assert.strictEqual(platform.isInAppBrowser, true, "Must detect TikTok as in-app browser");
});

it("should correctly identify macOS Safari (Desktop Add to Dock)", () => {
  const macSafariUA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15";
  const platform = detectBrowserPlatform(macSafariUA);
  assert.strictEqual(platform.isMacSafari, true, "Must detect macOS Safari");
  assert.strictEqual(platform.isIos, false, "Must not be iOS");
  assert.strictEqual(platform.isChromeOrEdge, false, "Must not be Chrome");
});

it("should correctly identify Firefox", () => {
  const firefoxUA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0";
  const platform = detectBrowserPlatform(firefoxUA);
  assert.strictEqual(platform.isFirefox, true, "Must detect Firefox");
  assert.strictEqual(platform.isChromeOrEdge, false, "Must not be Chrome/Edge");
});

it("should correctly identify Chrome on Windows/Linux/Mac", () => {
  const chromeUA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
  const platform = detectBrowserPlatform(chromeUA);
  assert.strictEqual(platform.isChromeOrEdge, true, "Must detect Chrome");
  assert.strictEqual(platform.isFirefox, false, "Must not be Firefox");
  assert.strictEqual(platform.isIos, false, "Must not be iOS");
});

console.log("\nSuite 2: Gate Invariants & Safe Defaults");

it("isStandaloneDisplayMode returns false when window is undefined (SSR)", () => {
  assert.strictEqual(typeof window === "undefined", true);
  assert.strictEqual(isStandaloneDisplayMode(), false, "Must default to non-standalone in SSR");
});

it("isBrowserAllowed returns false by default unless explicitly overridden in non-prod", () => {
  delete process.env.NEXT_PUBLIC_ALLOW_BROWSER;
  assert.strictEqual(isBrowserAllowed(), false, "Must default to false");
});

console.log("\n================================");
console.log(`Passed: ${passed} | Failed: ${failed}`);
console.log("================================\n");

if (failed > 0) {
  process.exit(1);
}
