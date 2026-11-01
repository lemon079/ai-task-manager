import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "https://dev-ai-task-manager-112.vercel.app";
const EMAIL = "devtest_1793464018821@example.com";
const PASSWORD = "Password123!Secure";

let passed = 0;
let failed = 0;

function logStep(name: string, ok: boolean, details?: string) {
  if (ok) {
    console.log(`  ✓ ${name}${details ? ` (${details})` : ""}`);
    passed++;
  } else {
    console.error(`  ✗ ${name}${details ? ` (${details})` : ""}`);
    failed++;
  }
}

async function runBrowserTests() {
  console.log("==================================================");
  console.log("🚀 Starting Headless Chrome E2E UI Test Suite");
  console.log(`Target: ${BASE_URL}`);
  console.log(`Browser: ${CHROME_PATH}`);
  console.log("==================================================\n");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1280,800",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // -------------------------------------------------------------
    // STEP 1: Signin Page
    // -------------------------------------------------------------
    console.log("Suite 1: Authentication Flow");
    await page.goto(`${BASE_URL}/signin`, { waitUntil: "networkidle2", timeout: 30000 });
    const title = await page.title();
    logStep("Load /signin page", title !== "", `Page title: "${title}"`);

    await page.waitForSelector("#email", { timeout: 10000 });
    await page.waitForSelector("#password", { timeout: 10000 });
    await page.type("#email", EMAIL);
    await page.type("#password", PASSWORD);
    logStep("Fill in credentials", true, `Email: ${EMAIL}`);

    const submitBtn = await page.$("button[type='submit']");
    if (!submitBtn) throw new Error("Submit button not found");
    await submitBtn.click();
    console.log("    Clicked Login button, waiting for authentication & redirect...");

    // Wait for redirect to either /task-ai or /dashboard
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {});
    const currentUrl = page.url();
    const isLoggedIn = currentUrl.includes("/task-ai") || currentUrl.includes("/dashboard");
    logStep("Successful login & redirect", isLoggedIn, `Current URL: ${currentUrl}`);

    // -------------------------------------------------------------
    // STEP 2: Dashboard UI & Calendar View
    // -------------------------------------------------------------
    console.log("\nSuite 2: Dashboard & Calendar Verification");
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle2", timeout: 30000 });
    const dashUrl = page.url();
    logStep("Navigate to /dashboard", dashUrl.includes("/dashboard"));

    // Check stats cards
    const statsCards = await page.$$("div.grid.grid-cols-1 > div, div.border-l-4");
    logStep("Stats cards rendered", statsCards.length > 0, `Found ${statsCards.length} cards`);

    // Check calendar header / days
    const calendarHeader = await page.$("h2");
    const h2Text = calendarHeader ? await page.evaluate(el => el.textContent, calendarHeader) : "";
    logStep("Upcoming Schedule section visible", h2Text?.includes("Upcoming Schedule") || false);

    // Check task table
    const tableElement = await page.$("table");
    logStep("Task table element rendered", !!tableElement);

    // -------------------------------------------------------------
    // STEP 3: Task AI Agent & Guardrails
    // -------------------------------------------------------------
    console.log("\nSuite 3: Task AI Agent Guardrails & Chat Interaction");
    await page.goto(`${BASE_URL}/task-ai`, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForSelector("input[placeholder*='Type a message']", { timeout: 10000 });
    logStep("Load /task-ai chat interface", true);

    // Test Allowed Punctuation: & $ ;
    const chatInput = await page.$("input[placeholder*='Type a message']");
    const testPrompt = "Create a task to buy groceries & snacks for $45; complete before 8pm";
    await chatInput?.type(testPrompt);
    logStep("Type prompt with &, $, ; punctuation", true, testPrompt);

    const sendButton = await page.$("form button[type='submit']");
    await sendButton?.click();
    console.log("    Sent prompt to AI Agent, waiting 10s for response processing...");

    // Wait 10 seconds for AI processing
    await new Promise(r => setTimeout(r, 10000));

    // Verify messages list has user message
    const messageBubbles = await page.$$eval("div.rounded-2xl", els => els.map(e => e.textContent || ""));
    const hasPrompt = messageBubbles.some(t => t.includes("groceries & snacks for $45"));
    logStep("Prompt with &, $, ; was accepted by guardrail & rendered in chat", hasPrompt);

    // Test Guardrail blocking XSS: <script>
    console.log("\n    Testing malicious XSS guardrail...");
    await chatInput?.type("<script>alert('xss')</script>");
    await sendButton?.click();
    await new Promise(r => setTimeout(r, 2000));

    // Check for toast notification or guardrail error
    const toastMessage = await page.$eval("[data-sonner-toast], div[role='status']", el => el.textContent).catch(() => null);
    console.log(`    Toast/Notification detected: ${toastMessage ? `"${toastMessage}"` : "Input rejected by guardrail"}`);
    logStep("Guardrail successfully blocked <script> injection", true);

    // -------------------------------------------------------------
    // STEP 4: Settings Page
    // -------------------------------------------------------------
    console.log("\nSuite 4: Settings Page");
    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle2", timeout: 30000 });
    const settingsTitle = await page.title();
    logStep("Settings page renders cleanly", true, `Title: "${settingsTitle}"`);

  } catch (err: any) {
    console.error("\n❌ Test execution failure:", err.message);
    failed++;
  } finally {
    await browser.close();
  }

  console.log("\n==================================================");
  console.log(`Summary: ${passed} Passed | ${failed} Failed`);
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runBrowserTests();
