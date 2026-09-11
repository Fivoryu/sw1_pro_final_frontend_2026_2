import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const baseUrl = process.env.PANEL_BASE_URL ?? 'http://127.0.0.1:5173';
const email = process.env.CP005_BROWSER_EMAIL ?? 'cp005-admin-q@example.com';
const password = process.env.CP005_BROWSER_PASSWORD ?? 'CP005-Password-2026!';
const reportPath = process.env.CP005_BROWSER_REPORT ?? 'cp005-browser-results.json';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
let consoleErrors = 0;
let failedRequests = 0;

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors += 1;
});
page.on('requestfailed', () => {
  failedRequests += 1;
});

const result = {
  status: 'BLOCKED',
  base_url: baseUrl,
  login: false,
  dashboard: false,
  api_origin: null,
  local_storage_keys: [],
  session_storage_keys: [],
  cookie_names: [],
  console_errors: 0,
  failed_requests: 0,
  axe: { violations: [] },
};

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Correo').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await page.getByRole('heading', { name: 'Suscripción' }).waitFor();
  await page.getByText('Uso y cuotas').waitFor();

  result.login = true;
  result.dashboard = true;
  result.api_origin = new URL(baseUrl).origin;
  result.local_storage_keys = await page.evaluate(() => Object.keys(localStorage));
  result.session_storage_keys = await page.evaluate(() => Object.keys(sessionStorage));
  result.cookie_names = (await context.cookies()).map((cookie) => cookie.name);
  result.axe = await new AxeBuilder({ page }).analyze().then(({ violations }) => ({
    violations: violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })),
  }));
  const severeAxeViolations = result.axe.violations.some(
    ({ impact }) => impact === 'critical' || impact === 'serious',
  );
  result.status = severeAxeViolations || consoleErrors > 0 || failedRequests > 0
    ? 'PARTIAL'
    : 'PASS';
} catch (error) {
  result.status = 'PARTIAL';
  result.error_type = error instanceof Error ? error.name : 'UnknownError';
} finally {
  result.console_errors = consoleErrors;
  result.failed_requests = failedRequests;
  await writeFile(reportPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  await browser.close();
}

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exitCode = 1;
