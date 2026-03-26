import { bundle } from "@remotion/bundler";
import {
  renderStill,
  selectComposition,
  openBrowser,
} from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (config) => config,
});

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: {
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({
  serveUrl: bundled,
  id: "main",
  puppeteerInstance: browser,
});

const frames = [0, 60, 140, 280, 380, 500];
for (const f of frames) {
  await renderStill({
    composition,
    serveUrl: bundled,
    output: `/tmp/qa-frame-${f}.png`,
    frame: f,
    puppeteerInstance: browser,
  });
  console.log(`Frame ${f} rendered`);
}

await browser.close({ silent: false });
console.log("QA frames done");
