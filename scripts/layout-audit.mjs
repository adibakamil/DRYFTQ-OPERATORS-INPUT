import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});
const context = await browser.newContext();
const page = await context.newPage();
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail });

// Login screen at desktop
await page.setViewportSize({ width: 1440, height: 900 });
const loginSplit = await page.evaluate(() => {
  const visual = document.querySelector('.login-visual')?.getBoundingClientRect();
  const panel = document.querySelector('.login-panel')?.getBoundingClientRect();
  return visual && panel ? { visual: Math.round(visual.width), panel: Math.round(panel.width) } : null;
});
check('desktop login split ~53/47', loginSplit && Math.abs(loginSplit.visual - 763) < 12, JSON.stringify(loginSplit));
const primaryBg = await page.locator('button[type="submit"]').first().evaluate((el) => getComputedStyle(el).backgroundColor);
check('primary orange #F15A19', primaryBg === 'rgb(241, 90, 25)', primaryBg);
const font = await page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily);
check('Inter body font', font.includes('Inter'), font);

// Sign in and reach operator dashboard
await page.getByRole('button', { name: 'Use' }).first().click();
await page.getByRole('button', { name: 'Login' }).click();
await page.getByRole('button', { name: /Continue/ }).click();
await page.getByText(/Welcome back, Alex/).waitFor();

const kpiColumns = (width) => page.evaluate(() => {
  const grid = document.querySelector('.kpi-grid');
  return grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0;
});

check('desktop KPI grid 4 columns', (await kpiColumns()) === 4, String(await kpiColumns()));
const sidebarWidth = await page.locator('.sidebar').evaluate((el) => Math.round(el.getBoundingClientRect().width));
check('desktop sidebar 258px', sidebarWidth === 258, String(sidebarWidth));

await page.setViewportSize({ width: 900, height: 900 });
await page.waitForTimeout(600); // allow the sidebar drawer transition to settle
check('tablet KPI grid 2 columns', (await kpiColumns()) === 2, String(await kpiColumns()));
const sidebarHiddenAtTablet = await page.locator('.sidebar').evaluate((el) => el.getBoundingClientRect().right <= 0);
check('tablet sidebar collapsed', sidebarHiddenAtTablet);

await page.setViewportSize({ width: 390, height: 844 });
check('mobile KPI grid 1 column', (await kpiColumns()) === 1, String(await kpiColumns()));
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('mobile no horizontal overflow', overflow <= 1, `${overflow}px`);
const btnHeight = await page.getByRole('button', { name: 'New observation' }).evaluate((el) => Math.round(el.getBoundingClientRect().height));
check('mobile primary button >= 44px', btnHeight >= 44, `${btnHeight}px`);

// Wizard at mobile
await page.getByRole('button', { name: 'New observation' }).click();
await page.getByRole('heading', { name: 'Machine Context' }).waitFor();
const wizardOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('mobile wizard no horizontal overflow', wizardOverflow <= 1, `${wizardOverflow}px`);
const stepVisible = await page.locator('.step__circle').count();
check('5 progress steps visible', stepVisible === 5, String(stepVisible));

await browser.close();

console.log('\n=== LAYOUT AUDIT ===');
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? ` (${r.detail})` : ''}`);
const failures = results.filter((r) => !r.ok);
console.log(`\n${results.length - failures.length}/${results.length} checks passed`);
if (failures.length) process.exitCode = 1;
