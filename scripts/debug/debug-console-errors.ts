import { test } from '@playwright/test';

test('Debug console errors on A3 Detail page', async ({ page }) => {
  test.setTimeout(120000);

  // Capture console messages
  const consoleMessages: string[] = [];
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);

    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push(`[PAGE ERROR] ${error.message}`);
  });

  page.on('requestfailed', request => {
    networkErrors.push(`[NETWORK] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log('='.repeat(80));
  console.log('DEBUGGING CONSOLE ERRORS');
  console.log('='.repeat(80));

  // 1. Login
  console.log('\n1. Logging in...');
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'toontest@test.com');
  await page.fill('input[type="password"]', 'Yoepieyoepie12!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/app', { timeout: 10000 });

  // 2. Navigate to A3 detail page
  const a3Id = '8c0b8854-ddca-468a-a739-1add0c08458d';
  const a3Url = `http://localhost:3000/app/a3/${a3Id}`;

  console.log(`\n2. Navigating to: ${a3Url}`);
  await page.goto(a3Url);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000); // Wait for error to appear

  // 3. Print all console messages
  console.log('\n' + '='.repeat(80));
  console.log('CONSOLE MESSAGES:');
  console.log('='.repeat(80));
  if (consoleMessages.length === 0) {
    console.log('(no console messages)');
  } else {
    consoleMessages.forEach(msg => console.log(msg));
  }

  // 4. Print console errors
  console.log('\n' + '='.repeat(80));
  console.log('CONSOLE ERRORS:');
  console.log('='.repeat(80));
  if (consoleErrors.length === 0) {
    console.log('(no console errors)');
  } else {
    consoleErrors.forEach(err => console.log(err));
  }

  // 5. Print network errors
  console.log('\n' + '='.repeat(80));
  console.log('NETWORK ERRORS:');
  console.log('='.repeat(80));
  if (networkErrors.length === 0) {
    console.log('(no network errors)');
  } else {
    networkErrors.forEach(err => console.log(err));
  }

  // 6. Take screenshot
  await page.screenshot({
    path: '.tmp/console-debug.png',
    fullPage: true
  });

  console.log('\n' + '='.repeat(80));
  console.log('Screenshot saved to .tmp/console-debug.png');
  console.log('='.repeat(80));

  await page.pause();
});
