import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const errors = [];
const results = [];

const check = (name, condition, detail = '') => {
  results.push({ name, ok: Boolean(condition), detail });
  if (!condition) errors.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

// A tiny valid PNG used as evidence in the upload step.
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII=',
  'base64',
);
writeFileSync('scripts/test-evidence.png', png);

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});

const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const consoleErrors = [];
const badResponses = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(`${msg.text()} @ ${msg.location().url || 'unknown'}`);
});
page.on('response', (response) => {
  if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
});
page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

const step = async (name, fn) => {
  try {
    await fn();
    check(name, true);
  } catch (error) {
    check(name, false, error.message.split('\n')[0]);
    throw error;
  }
};

try {
  await step('login page loads', async () => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Sign in to continue' }).waitFor();
    check('brand visible', await page.getByText('DRYFTQ', { exact: true }).first().isVisible());
    const heroBg = await page.locator('.login-page').evaluate((el) => getComputedStyle(el).backgroundImage);
    check('hero uses EngineerOverlooking.png', heroBg.includes('EngineerOverlooking'), heroBg);
    const heroUrl = heroBg.match(/url\(["']?(.+?)["']?\)/)?.[1];
    const heroLoaded = heroUrl
      ? await page.evaluate(async (url) => {
          const res = await fetch(url, { method: 'HEAD' });
          return res.ok && (res.headers.get('content-type') || '').includes('image');
        }, heroUrl)
      : false;
    check('hero image loads without 404', heroLoaded);
  });

  await step('login validation works', async () => {
    await page.getByLabel('Employee ID', { exact: true }).fill('x');
    await page.getByLabel('Password', { exact: true }).fill('123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByText('Use 4–20 letters, numbers or hyphens.').waitFor();
    await page.getByText('Password must be at least 6 characters.').waitFor();
  });

  await step('demo autofill + login', async () => {
    await page.getByRole('button', { name: 'Use' }).first().click();
    check('autofilled id', (await page.getByLabel('Employee ID', { exact: true }).inputValue()) === 'OP-1001');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('radio', { name: /Operator/ }).waitFor({ timeout: 8000 });
  });

  await step('role selection continues to operator dashboard', async () => {
    await page.getByRole('button', { name: /Continue/ }).click();
    await page.getByText(/Welcome back, Alex/).waitFor({ timeout: 8000 });
    check('operator observations tile', await page.getByText('Operator Observations').first().isVisible());
    check('production quality tile', await page.getByText('Production Quality').first().isVisible());
  });

  await step('wizard step 1 validation and completion', async () => {
    await page.getByRole('button', { name: 'New observation' }).click();
    await page.getByRole('heading', { name: 'Machine Context' }).waitFor();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Select a machine or line.').waitFor();
    await page.getByLabel('Plant').selectOption({ index: 1 });
    await page.getByLabel('Machine / Line').selectOption({ index: 1 });
    await page.getByLabel('Shift').selectOption({ index: 1 });
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('heading', { name: 'Observation Details' }).waitFor();
  });

  let observationId = '';
  await step('wizard step 2 details', async () => {
    await page.getByLabel('Observation Category').selectOption({ index: 1 });
    await page.getByLabel('Priority').selectOption('high');
    await page.getByLabel('Description').fill('Intermittent vibration detected on the gearbox casing during routine plant rounds.');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('heading', { name: 'Attach Evidence' }).waitFor();
  });

  await step('evidence upload and preview', async () => {
    await page.locator('#evidence-input').setInputFiles({
      name: 'gearbox-photo.png',
      mimeType: 'image/png',
      buffer: png,
    });
    await page.getByText('gearbox-photo.png').waitFor({ timeout: 8000 });
    check('evidence card count', (await page.locator('.evidence-card').count()) === 1);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('heading', { name: 'Review Submission' }).first().waitFor();
    check('review shows description', await page.getByText(/Intermittent vibration detected/).isVisible());
    check('review shows ready badge', await page.getByText('Ready to Submit').isVisible());
  });

  await step('submit observation generates ID on first click', async () => {
    await page.getByRole('button', { name: /Continue to final submission/ }).click();
    await page.getByRole('heading', { name: 'Submit Report' }).waitFor();
    // Submit is intentionally tapped once, without pre-ticking the checkbox.
    await page.getByRole('button', { name: /Submit Observation/ }).click();
    await page.getByRole('heading', { name: 'Submitted Successfully!' }).waitFor({ timeout: 10000 });
    check('first-click submit opens SUBMIT 7', true);
    const text = await page.locator('.id-pill').innerText();
    observationId = text.match(/OBS-\d{4}-\d{4}/)?.[0] ?? '';
    check('unique observation id generated', Boolean(observationId), text);
  });

  await step('history contains new observation', async () => {
    await page.getByRole('button', { name: 'View My Submissions' }).click();
    await page.getByText(observationId).first().waitFor({ timeout: 8000 });
    check('history row present', (await page.getByText(observationId).count()) >= 1);
  });

  await step('dashboard recent activity updated', async () => {
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByText(observationId).first().waitFor({ timeout: 8000 });
  });

  await step('quality inspector role flow', async () => {
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.getByLabel('Employee ID', { exact: true }).fill('QI-2001');
    await page.getByLabel('Password', { exact: true }).fill('inspector123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('radio', { name: /Quality Inspector/ }).waitFor({ timeout: 8000 });
    await page.getByRole('radio', { name: /Quality Inspector/ }).click();
    await page.getByRole('button', { name: /Continue/ }).click();
    await page.getByText(/Good day, Dana/).waitFor({ timeout: 8000 });
    check('quality KPI', await page.getByText('First Pass Yield').isVisible());
    check('line info', await page.getByText('Machine & line information').isVisible());
  });

  await step('inspection flow submits', async () => {
    await page.getByRole('button', { name: 'Create New Inspection' }).click();
    await page.getByRole('heading', { name: 'Machine Context' }).waitFor();
    await page.getByLabel('Plant').selectOption({ index: 1 });
    await page.getByLabel('Machine / Line').selectOption({ index: 2 });
    await page.getByLabel('Shift').selectOption({ index: 1 });
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByLabel('Lot / Batch Number').fill('C-7781');
    await page.getByLabel('Defect Type').selectOption({ index: 1 });
    await page.getByLabel('Units Inspected').fill('120');
    await page.getByLabel('Defective Units').fill('3');
    await page.getByLabel('Verdict').selectOption('hold');
    await page.getByLabel('Inspection Findings').fill('Three housings showed minor surface scratching on the upper face during sampling.');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('heading', { name: 'Attach Evidence' }).waitFor();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: /Continue to final submission/ }).click();
    await page.locator('input[type="checkbox"]').last().check();
    await page.getByRole('button', { name: /Submit Inspection/ }).click();
    await page.getByRole('heading', { name: 'Submitted Successfully!' }).waitFor({ timeout: 10000 });
    const text = await page.locator('.id-pill').innerText();
    check('inspection id generated', /INSP-\d{4}-\d{4}/.test(text), text);
  });

  await step('quality status update works', async () => {
    await page.getByRole('link', { name: 'Overview' }).click();
    const queueSelect = page.locator('select[aria-label^="Change status"]').first();
    await queueSelect.waitFor({ state: 'attached', timeout: 8000 });
    if ((await queueSelect.count()) > 0) {
      await queueSelect.selectOption('accepted');
      await page.getByText('Status updated').waitFor({ timeout: 8000 });
      check('status update toast', true);
    } else {
      check('status update controls present', false, 'no queue select found');
    }
  });

  await step('SUBMIT 7 receipt page', async () => {
    await page.goto(`${BASE}/submit-7`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Submitted Successfully!' }).waitFor();
    check('SUBMIT 7 breadcrumb', await page.getByText('Step 7: Finished').isVisible());
    check('7-step workflow strip', (await page.locator('.workflow-step').count()) === 7);
    check(
      'SUBMIT 7 site header + footer',
      (await page.locator('.site-header').count()) === 1 &&
        (await page.locator('.site-footer').count()) === 1,
    );
    await page.goto(`${BASE}/app/quality`, { waitUntil: 'networkidle' });
  });

  await step('mobile layout has no horizontal overflow', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation' }).click();
    check('mobile menu opens', await page.getByRole('link', { name: 'Overview' }).isVisible());
    await page.getByRole('link', { name: 'Overview' }).click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check('no horizontal overflow', overflow <= 1, `overflow ${overflow}px`);
  });

  console.log('\nHTTP >=400 responses:', badResponses);
  check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
} catch (error) {
  console.error('SMOKE TEST ABORTED:', error.message);
} finally {
  await browser.close();
}

console.log('\n=== SMOKE TEST RESULTS ===');
for (const result of results) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'}  ${result.name}${result.detail ? ` (${result.detail})` : ''}`);
}
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed`);
if (errors.length) {
  console.log('\nFAILURES:\n' + errors.map((e) => ` - ${e}`).join('\n'));
  process.exitCode = 1;
}
