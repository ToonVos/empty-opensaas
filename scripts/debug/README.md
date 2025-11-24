# Debug Scripts

This directory contains Playwright-based debugging tools for investigating application behavior.

## Scripts

### `debug-console-errors.ts`

Captures and displays console messages, errors, and network failures on the A3 Detail page.

**Usage:**

```bash
cd e2e-tests
npx playwright test ../../scripts/debug/debug-console-errors.ts --headed
```

**Output:**

- Console logs categorized by type
- Network request failures
- Screenshot saved to `.tmp/console-debug.png`

---

### `debug-permission.ts`

Interactive debugging tool for permission issues (requires Prisma Studio).

**Usage:**

```bash
# Terminal 1: Start Prisma Studio
wasp db studio

# Terminal 2: Run debug script
cd e2e-tests
npx playwright test ../../scripts/debug/debug-permission.ts --headed
```

**What it does:**

- Opens Prisma Studio in browser
- Navigates through database tables (User, UserDepartment, A3Document, Department)
- Takes screenshots of each table
- Helps identify permission-related data issues

**Output:**
Screenshots saved to `.tmp/`:

- `prisma-user-table.png`
- `prisma-userdept-table.png`
- `prisma-a3-table.png`
- `prisma-dept-table.png`

---

### `inspect-prisma-studio.ts`

Similar to `debug-permission.ts` but with more detailed inspection of specific records.

**Usage:**

```bash
# Terminal 1: Start Prisma Studio
wasp db studio

# Terminal 2: Run debug script
cd e2e-tests
npx playwright test ../../scripts/debug/inspect-prisma-studio.ts --headed
```

**What it does:**

- Searches for specific user (toontest@test.com)
- Inspects A3 document by ID
- Checks UserDepartment relationships
- Provides detailed console output of table data

---

## Notes

- All scripts use `page.pause()` at the end to keep the browser open for manual inspection
- Press any key in the terminal to close the browser after inspection
- These are **NOT** regression tests - they are development tools
- Screenshots are saved to `.tmp/` directory (auto-cleanup via git hooks after 7 days)
