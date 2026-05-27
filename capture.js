const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const POWER_BI_URL = process.env.POWER_BI_URL;
const POWER_BI_URL_2 = process.env.POWER_BI_URL_2;

if (!POWER_BI_URL) {
  console.error('Falta la variable/secret POWER_BI_URL.');
  process.exit(1);
}

if (!POWER_BI_URL_2) {
  console.error('Falta la variable/secret POWER_BI_URL_2.');
  process.exit(1);
}

const siteDir = path.join(__dirname, 'site');
const metaPath = path.join(siteDir, 'last-updated.json');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capturarDashboard(browser, url, outputFileName, nombre) {
  const outputPath = path.join(siteDir, outputFileName);

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  page.setDefaultTimeout(120000);

  console.log(`Abriendo ${nombre}...`);
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 120000
  });

  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {
    console.log(`networkidle no llegó en ${nombre}; continuo con espera fija.`);
  });

  const extraWaitMs = Number(process.env.EXTRA_WAIT_MS || 120000);
  console.log(`Esperando ${extraWaitMs / 1000}s adicionales para ${nombre}...`);
  await sleep(extraWaitMs);

  console.log(`Tomando captura de ${nombre}...`);
  await page.screenshot({
    path: outputPath,
    fullPage: false,
    type: 'png'
  });

  console.log(`Captura guardada: ${outputPath}`);

  await page.close();
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

  await capturarDashboard(browser, POWER_BI_URL, 'dashboard.png', 'Dashboard 1');
  await capturarDashboard(browser, POWER_BI_URL_2, 'dashboard-2.png', 'Dashboard 2');

  const updatedAt = new Date().toISOString();
  fs.writeFileSync(
    metaPath,
    JSON.stringify({
      updatedAt,
      dashboards: [
        'dashboard.png',
        'dashboard-2.png'
      ]
    }, null, 2),
    'utf8'
  );

  console.log(`Actualizado: ${updatedAt}`);

  await browser.close();
})().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
