import { test } from '@playwright/test';

test('Debug permission issue - inspect all tables', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes

  console.log('='.repeat(80));
  console.log('PERMISSION DEBUG - INSPECTING ALL TABLES');
  console.log('='.repeat(80));

  // 1. Go to Prisma Studio
  await page.goto('http://localhost:5555');
  await page.waitForTimeout(3000);

  console.log('\n1. USER TABLE');
  // Click User table
  await page.click('text=User');
  await page.waitForTimeout(2000);

  // Screenshot User table
  await page.screenshot({
    path: '.tmp/debug-1-user-table.png',
    fullPage: true
  });
  console.log('   Screenshot: .tmp/debug-1-user-table.png');

  console.log('\n2. USER DEPARTMENT TABLE');
  // Click UserDepartment table
  await page.click('text=UserDepartment');
  await page.waitForTimeout(2000);

  // Screenshot
  await page.screenshot({
    path: '.tmp/debug-2-userdepartment-table.png',
    fullPage: true
  });
  console.log('   Screenshot: .tmp/debug-2-userdepartment-table.png');

  // Count rows
  const udRows = await page.locator('tbody tr').count();
  console.log(`   Rows: ${udRows}`);

  console.log('\n3. DEPARTMENT TABLE');
  // Click Department
  await page.click('text=Department');
  await page.waitForTimeout(2000);

  // Screenshot
  await page.screenshot({
    path: '.tmp/debug-3-department-table.png',
    fullPage: true
  });
  console.log('   Screenshot: .tmp/debug-3-department-table.png');

  // Count departments
  const deptRows = await page.locator('tbody tr').count();
  console.log(`   Rows: ${deptRows}`);

  console.log('\n4. A3 DOCUMENT TABLE');
  // Click A3Document
  await page.click('text=A3Document');
  await page.waitForTimeout(2000);

  // Screenshot
  await page.screenshot({
    path: '.tmp/debug-4-a3document-table.png',
    fullPage: true
  });
  console.log('   Screenshot: .tmp/debug-4-a3document-table.png');

  // Count A3s
  const a3Rows = await page.locator('tbody tr').count();
  console.log(`   Rows: ${a3Rows}`);

  console.log('\n5. ORGANIZATION TABLE');
  // Click Organization
  await page.click('text=Organization');
  await page.waitForTimeout(2000);

  // Screenshot
  await page.screenshot({
    path: '.tmp/debug-5-organization-table.png',
    fullPage: true
  });
  console.log('   Screenshot: .tmp/debug-5-organization-table.png');

  // Count organizations
  const orgRows = await page.locator('tbody tr').count();
  console.log(`   Rows: ${orgRows}`);

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY:');
  console.log(`  UserDepartment rows: ${udRows}`);
  console.log(`  Department rows: ${deptRows}`);
  console.log(`  A3Document rows: ${a3Rows}`);
  console.log(`  Organization rows: ${orgRows}`);
  console.log('\nCheck screenshots in .tmp/ directory');
  console.log('='.repeat(80));

  // Keep open for manual inspection
  await page.pause();
});
