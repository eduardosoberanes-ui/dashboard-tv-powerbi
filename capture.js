const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const POWER_BI_URL = process.env.POWER_BI_URL;

if (!POWER_BI_URL) {
  console.error('Falta la variable/secret POWER_BI_URL.');
  process.exit(1);
}

const siteDir = path.join(__dirname, 'site');
const outputPath = path.join(siteDir, 'dashboard.png');
const metaPath = path.join(siteDir, 'last-updated.json');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  fs.mkdirSync(siteDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-dev-shm-usage',
      '--no-sandbox'
    ]
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  page.setDefaultTimeout(120000);

  console.log('Abriendo Power BI...');
  await page.goto(POWER_BI_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 120000
  });

  // Power BI puede mantener conexiones abiertas; networkidle puede no completarse.
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {
    console.log('networkidle no llegó; continuo con espera fija.');
  });

  // Espera extra para que Power BI termine de dibujar visuales.
  const extraWaitMs = Number(process.env.EXTRA_WAIT_MS || 75000);
  console.log(`Esperando ${extraWaitMs / 1000}s adicionales...`);
  await sleep(extraWaitMs);

  console.log('Tomando captura...');
  await page.screenshot({
    path: outputPath,
    fullPage: false,
    type: 'png'
  });

  const updatedAt = new Date().toISOString();
  fs.writeFileSync(metaPath, JSON.stringify({ updatedAt }, null, 2), 'utf8');

  console.log(`Captura guardada en ${outputPath}`);
  console.log(`Actualizado: ${updatedAt}`);

  await browser.close();
})().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
