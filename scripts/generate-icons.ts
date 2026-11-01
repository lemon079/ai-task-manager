import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ICONS_DIR = path.join(process.cwd(), "public", "icons");

async function generateIcons() {
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  const standardSvg = fs.readFileSync(path.join(ICONS_DIR, "icon.svg"), "utf-8");
  const maskableSvg = fs.readFileSync(path.join(ICONS_DIR, "icon-maskable.svg"), "utf-8");

  console.log("🎨 Launching headless Chrome to render crisp PWA PNG icons...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  const targets = [
    { name: "icon-192x192.png", size: 192, svg: standardSvg },
    { name: "icon-512x512.png", size: 512, svg: standardSvg },
    { name: "apple-touch-icon.png", size: 180, svg: standardSvg },
    { name: "maskable-512x512.png", size: 512, svg: maskableSvg },
    { name: "badge-72x72.png", size: 72, svg: standardSvg },
  ];

  for (const target of targets) {
    const page = await browser.newPage();
    await page.setViewport({ width: target.size, height: target.size, deviceScaleFactor: 1 });
    const html = `<!DOCTYPE html><html><head><style>* { margin: 0; padding: 0; } body, html { width: ${target.size}px; height: ${target.size}px; overflow: hidden; background: #09090b; } svg { width: 100%; height: 100%; display: block; }</style></head><body>${target.svg}</body></html>`;

    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 5000 });
    const outPath = path.join(ICONS_DIR, target.name);
    await page.screenshot({ path: outPath, omitBackground: false });
    await page.close();
    console.log(`  ✓ Generated ${target.name} (${target.size}x${target.size})`);
  }

  await browser.close();
  console.log("✨ All PWA icons generated successfully in public/icons/");
}

generateIcons().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
