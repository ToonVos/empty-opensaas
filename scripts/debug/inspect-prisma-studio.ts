import { test, expect } from '@playwright/test';

const USER_EMAIL = 'toontest@test.com';
const A3_ID = '117218ea-7de1-428c-af46-e9cc37747c86';

test('Inspect Prisma Studio data for permission debugging', async ({ page }) => {
  console.log('='.repeat(80));
  console.log('PRISMA STUDIO INSPECTION');
  console.log('='.repeat(80));

  // 1. Go to Prisma Studio
  await page.goto('http://localhost:5555');
  await page.waitForTimeout(2000);

  console.log('\n1. Opening User table...');

  // 2. Open User table
  await page.click('text=User');
  await page.waitForTimeout(1000);

  // 3. Find toontest@test.com
  const searchBox = page.locator('input[placeholder*="Search"]').first();
  await searchBox.fill(USER_EMAIL);
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: '.tmp/prisma-user-table.png', fullPage: true });
  console.log('   Screenshot saved: .tmp/prisma-user-table.png');

  // Try to get user data from table
  const userRow = page.locator(`tr:has-text("${USER_EMAIL}")`).first();
  const isVisible = await userRow.isVisible();

  if (isVisible) {
    console.log(`   ✅ Found user: ${USER_EMAIL}`);

    // Try to extract organizationId from the row
    const cells = await userRow.locator('td').allTextContents();
    console.log('   User row cells:', cells);
  } else {
    console.log(`   ❌ User not found: ${USER_EMAIL}`);
  }

  console.log('\n2. Opening UserDepartment table...');

  // 4. Open UserDepartment table
  await page.click('text=UserDepartment');
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: '.tmp/prisma-userdept-table.png', fullPage: true });
  console.log('   Screenshot saved: .tmp/prisma-userdept-table.png');

  // Count rows
  const deptRows = await page.locator('tbody tr').count();
  console.log(`   UserDepartment rows: ${deptRows}`);

  if (deptRows === 0) {
    console.log('   ❌ PROBLEM FOUND: No UserDepartment entries!');
    console.log('   User is not linked to any department.');
  } else {
    console.log(`   ✅ Found ${deptRows} department membership(s)`);
  }

  console.log('\n3. Opening A3Document table...');

  // 5. Open A3Document table
  await page.click('text=A3Document');
  await page.waitForTimeout(1000);

  // Search for A3
  const a3SearchBox = page.locator('input[placeholder*="Search"]').first();
  await a3SearchBox.fill(A3_ID.substring(0, 8)); // Search by first part of UUID
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: '.tmp/prisma-a3-table.png', fullPage: true });
  console.log('   Screenshot saved: .tmp/prisma-a3-table.png');

  const a3Row = page.locator(`tr:has-text("${A3_ID.substring(0, 8)}")`).first();
  const a3Visible = await a3Row.isVisible();

  if (a3Visible) {
    console.log(`   ✅ Found A3: ${A3_ID}`);
    const a3Cells = await a3Row.locator('td').allTextContents();
    console.log('   A3 row cells:', a3Cells);
  } else {
    console.log(`   ❌ A3 not found: ${A3_ID}`);
  }

  console.log('\n4. Opening Department table...');

  // 6. Check Department table
  await page.click('text=Department');
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: '.tmp/prisma-dept-table.png', fullPage: true });
  console.log('   Screenshot saved: .tmp/prisma-dept-table.png');

  const deptCount = await page.locator('tbody tr').count();
  console.log(`   Departments: ${deptCount}`);

  if (deptCount === 0) {
    console.log('   ❌ PROBLEM: No departments exist!');
  } else {
    const deptRows = await page.locator('tbody tr').allTextContents();
    console.log('   Department rows:', deptRows);
  }

  console.log('\n' + '='.repeat(80));
  console.log('INSPECTION COMPLETE');
  console.log('Check screenshots in .tmp/ directory');
  console.log('='.repeat(80));

  // Keep browser open for manual inspection
  await page.pause();
});
