// Genera los PNG de los iconos desde los SVG usando Chromium (npm run icons).
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
const require = createRequire(process.env.PW_MODULE ? process.env.PW_MODULE + '/' : import.meta.url);
const { chromium } = require('playwright');
const exe = process.env.CHROMIUM_PATH || undefined;
const browser = await chromium.launch({ executablePath: exe });
const jobs = [['icon', 192, 'icon-192'], ['icon', 512, 'icon-512'], ['icon', 180, 'icon-180'], ['icon-maskable', 512, 'icon-maskable-512']];
for (const [src, size, out] of jobs) {
  const svg = readFileSync(new URL(`../icons/${src}.svg`, import.meta.url), 'utf8');
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{width:${size}px;height:${size}px;display:block}</style>${svg}`);
  writeFileSync(new URL(`../icons/${out}.png`, import.meta.url), await page.screenshot({ omitBackground: true }));
  await page.close();
}
await browser.close();
console.log('iconos generados');
