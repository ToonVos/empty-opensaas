# E2E Tests Directory Context

**AUTO-LOADED** when Claude Code works with files in `e2e-tests/`. **Parent context**: Root CLAUDE.md provides TDD workflow, test strategy.

---

## What's in e2e-tests/

**End-to-end integration tests** with Playwright - tests complete user workflows:

```
e2e-tests/
├── tests/                    # Test files
│   ├── auth.spec.ts          # Login, signup, logout flows
│   ├── navigation.spec.ts    # Page navigation, routing
│   └── {feature}.spec.ts     # Feature-specific flows
├── playwright.config.ts      # Playwright configuration
└── CLAUDE.md                 # This file
```

---

## When to Use E2E Tests

**E2E tests cover integration scenarios** that unit/component tests cannot:

| Scenario              | Unit/Component Test | E2E Test           |
| --------------------- | ------------------- | ------------------ |
| Button click handler  | ✅ Mock callback    | ❌ Too simple      |
| Form validation       | ✅ Component test   | ❌ Too simple      |
| Login flow + redirect | ❌ Mocked auth      | ✅ Real auth flow  |
| Multi-page workflow   | ❌ Single component | ✅ Full navigation |
| Database operations   | ❌ Mocked data      | ✅ Real database   |
| Authentication        | ❌ Mocked user      | ✅ Real auth       |

**Rule of thumb**:

- **Unit/Component**: Single component, mocked dependencies
- **E2E**: Multiple pages, real backend, real database

---

## Running E2E Tests

### Automated Script (Recommended)

```bash
# From project root - ALWAYS use this
./scripts/run-e2e-tests.sh

# With browser visible
./scripts/run-e2e-tests.sh --headed

# Debug mode (step-by-step)
./scripts/run-e2e-tests.sh --debug

# Skip database seeding (if already seeded)
./scripts/run-e2e-tests.sh --no-seed
```

**What it does**:

1. ✅ Check/start frontend & backend servers
2. ✅ Seed database with demo user
3. ✅ Run Playwright tests
4. ✅ Show summary report

### Manual Run (If Script Unavailable)

```bash
# 1. Start servers (in separate terminal)
./scripts/safe-start.sh

# 2. Seed database
./scripts/seed-demo-user.sh

# 3. Run tests
cd e2e-tests
npx playwright test

# With options
npx playwright test --headed          # Show browser
npx playwright test --debug           # Step-by-step
npx playwright test auth.spec.ts      # Specific file
```

---

## Playwright Configuration

**File: `e2e-tests/playwright.config.ts`**

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000, // 30s per test
  retries: process.env.CI ? 2 : 0, // Retry on CI
  use: {
    baseURL: "http://localhost:3000", // Frontend URL
    trace: "on-first-retry", // Trace on failure
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "cd .. && ./scripts/safe-start.sh",
    url: "http://localhost:3000",
    timeout: 120000, // 2min startup time
    reuseExistingServer: true, // Don't restart if running
  },
});
```

**Key settings**:

- `baseURL` - Base URL for all page.goto() calls
- `webServer` - Auto-starts app if not running
- `trace` - Records traces on failure (for debugging)
- `reuseExistingServer` - Uses already-running servers

---

## Writing E2E Tests

### Basic Test Structure

```typescript
// File: e2e-tests/tests/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can login with valid credentials", async ({ page }) => {
    // 1. Navigate to login page
    await page.goto("/login");

    // 2. Fill form
    await page.fill('input[name="email"]', "demo@example.com");
    await page.fill('input[name="password"]', "DemoPassword123!");

    // 3. Submit
    await page.click('button[type="submit"]');

    // 4. Assert redirect to dashboard
    await expect(page).toHaveURL("/app");
    await expect(page.locator("text=Welcome")).toBeVisible();
  });

  test("shows error with invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "invalid@example.com");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Should stay on login page with error
    await expect(page).toHaveURL("/login");
    await expect(page.locator("text=Invalid credentials")).toBeVisible();
  });
});
```

### Multi-Page Workflow

```typescript
test("user can create and view task", async ({ page }) => {
  // 1. Login
  await page.goto("/login");
  await page.fill('input[name="email"]', "demo@example.com");
  await page.fill('input[name="password"]', "DemoPassword123!");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/app");

  // 2. Navigate to tasks
  await page.click('a[href="/app/tasks"]');
  await expect(page).toHaveURL("/app/tasks");

  // 3. Create task
  await page.click('button:has-text("Create Task")');
  await page.fill('input[name="title"]', "My New Task");
  await page.click('button:has-text("Submit")');

  // 4. Verify task appears
  await expect(page.locator("text=My New Task")).toBeVisible();

  // 5. Click task to view details
  await page.click("text=My New Task");
  await expect(page).toHaveURL(/\/app\/tasks\/\d+/);
  await expect(page.locator('h1:has-text("My New Task")')).toBeVisible();
});
```

---

## Playwright Selectors

### Preferred Selectors (Best to Worst)

```typescript
// 1. Text content (most user-like)
page.locator("text=Login");
page.locator('button:has-text("Submit")');

// 2. Accessible attributes (screen reader compatible)
page.getByRole("button", { name: "Submit" });
page.getByLabel("Email");
page.getByPlaceholder("Enter email");

// 3. Test IDs (reliable, but needs markup changes)
page.getByTestId("submit-button");

// 4. CSS selectors (brittle, avoid if possible)
page.locator('button[type="submit"]');
page.locator(".btn-primary");
```

### Common Locators

```typescript
// Buttons
page.getByRole("button", { name: /submit/i });
page.locator('button:has-text("Create")');

// Links
page.getByRole("link", { name: "Dashboard" });
page.locator('a[href="/app"]');

// Form inputs
page.getByLabel("Email");
page.locator('input[name="email"]');
page.locator('input[type="password"]');

// Headings
page.getByRole("heading", { name: "Welcome", level: 1 });

// Combination (text within element)
page.locator('div.card:has-text("Task 1")');
page.locator("li", { hasText: "Item 1" });
```

---

## Assertions

### Page Assertions

```typescript
// URL
await expect(page).toHaveURL("/app");
await expect(page).toHaveURL(/\/tasks\/\d+/); // Regex

// Title
await expect(page).toHaveTitle("Dashboard");

// Content visible
await expect(page.locator("text=Welcome")).toBeVisible();
await expect(page.getByRole("button", { name: "Submit" })).toBeEnabled();

// Content not visible
await expect(page.locator("text=Loading")).not.toBeVisible();
await expect(page.locator("text=Error")).toBeHidden();

// Count
await expect(page.locator("li.task-item")).toHaveCount(5);

// Text content
await expect(page.locator("h1")).toHaveText("Dashboard");
await expect(page.locator("h1")).toContainText("Dash");

// Attributes
await expect(page.locator("button")).toHaveClass("btn-primary");
await expect(page.locator("a")).toHaveAttribute("href", "/app");

// Input values
await expect(page.locator('input[name="email"]')).toHaveValue(
  "demo@example.com",
);
```

---

## Test Fixtures & Hooks

### beforeEach / afterEach

```typescript
import { test } from "@playwright/test";

test.describe("Authenticated features", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('input[name="email"]', "demo@example.com");
    await page.fill('input[name="password"]', "DemoPassword123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("/app");
  });

  test("can access dashboard", async ({ page }) => {
    // Already logged in from beforeEach
    await expect(page.locator("text=Welcome")).toBeVisible();
  });

  test("can access tasks", async ({ page }) => {
    // Already logged in from beforeEach
    await page.goto("/app/tasks");
    await expect(page.locator("text=Tasks")).toBeVisible();
  });
});
```

### Custom Fixtures

```typescript
// Define reusable fixture
import { test as base } from "@playwright/test";

const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login
    await page.goto("/login");
    await page.fill('input[name="email"]', "demo@example.com");
    await page.fill('input[name="password"]', "DemoPassword123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("/app");

    // Use in test
    await use(page);

    // Teardown (if needed)
  },
});

// Use fixture in test
test("dashboard shows user tasks", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/app/tasks");
  await expect(authenticatedPage.locator("text=My Tasks")).toBeVisible();
});
```

---

## Waiting & Timing

### Explicit Waits (Recommended)

```typescript
// Wait for navigation
await page.click('a[href="/app"]');
await page.waitForURL("/app");

// Wait for element
await page.waitForSelector("text=Dashboard");

// Wait for element to disappear
await page.waitForSelector("text=Loading", { state: "hidden" });

// Wait for network request
const responsePromise = page.waitForResponse(
  (resp) => resp.url().includes("/api/tasks") && resp.status() === 200,
);
await page.click('button:has-text("Load Tasks")');
await responsePromise;

// Wait for function to return true
await page.waitForFunction(
  () => document.querySelectorAll(".task-item").length > 0,
);
```

### Implicit Waits (Built-in)

```typescript
// Playwright auto-waits for these actions:
await page.click("button"); // Waits for element to be visible & enabled
await page.fill("input", "text"); // Waits for element to be editable
await expect(page.locator("...")).toBeVisible(); // Waits up to timeout
```

### Timeouts

```typescript
// Per-action timeout
await page.click("button", { timeout: 5000 }); // 5s timeout

// Per-test timeout
test("slow test", async ({ page }) => {
  test.setTimeout(60000); // 60s for this test
  // ... slow operations
});

// Global timeout (playwright.config.ts)
export default defineConfig({
  timeout: 30000, // 30s per test
});
```

---

## Authentication Patterns

### Login Once, Reuse Session

```typescript
// File: e2e-tests/tests/auth.setup.ts
import { test as setup } from "@playwright/test";

const authFile = ".auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "demo@example.com");
  await page.fill('input[name="password"]', "DemoPassword123!");
  await page.click('button[type="submit"]');
  await page.waitForURL("/app");

  // Save session state
  await page.context().storageState({ path: authFile });
});
```

```typescript
// File: e2e-tests/playwright.config.ts
export default defineConfig({
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json", // Reuse auth session
      },
      dependencies: ["setup"],
    },
  ],
});
```

**Benefits**:

- Login once, reuse across all tests
- Faster test execution
- Consistent auth state

---

## Debugging E2E Tests

### Debug Mode (Step-by-Step)

```bash
./scripts/run-e2e-tests.sh --debug

# Or manually:
npx playwright test --debug
```

**Features**:

- Pause before each action
- Inspect page in browser
- Step through test line by line
- View console logs

### Screenshot on Failure

**Auto-enabled** in `playwright.config.ts`:

```typescript
use: {
  screenshot: 'only-on-failure',
}
```

Screenshots saved to: `e2e-tests/test-results/`

### Trace on Failure

**Auto-enabled** in `playwright.config.ts`:

```typescript
use: {
  trace: 'on-first-retry',
}
```

**View trace**:

```bash
npx playwright show-trace test-results/.../trace.zip
```

Shows:

- Timeline of actions
- Screenshots at each step
- Network requests
- Console logs

### Console Logs in Test

```typescript
test("debug test", async ({ page }) => {
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  await page.goto("/app");
  // All console.log from page will appear in terminal
});
```

---

## Common Pitfalls

### 1. Not Waiting for Navigation

```typescript
// ❌ WRONG - Assertion runs before navigation
await page.click('a[href="/app"]');
expect(page.url()).toBe("http://localhost:3000/app"); // Still old URL!

// ✅ CORRECT - Wait for navigation
await page.click('a[href="/app"]');
await page.waitForURL("/app");
expect(page.url()).toBe("http://localhost:3000/app");
```

### 2. Hardcoding Wait Times

```typescript
// ❌ WRONG - Flaky, depends on machine speed
await page.click("button");
await page.waitForTimeout(1000); // Arbitrary wait
expect(page.locator("text=Success")).toBeVisible();

// ✅ CORRECT - Wait for element
await page.click("button");
await page.waitForSelector("text=Success");
expect(page.locator("text=Success")).toBeVisible();
```

### 3. Not Seeding Database

```typescript
// ❌ WRONG - Test assumes data exists
test("view task details", async ({ page }) => {
  await page.goto("/app/tasks/1"); // Task 1 might not exist!
  // ... test fails randomly
});

// ✅ CORRECT - Seed before test
test.beforeEach(async ({ page }) => {
  // Run seed script or API call to create test data
  await page.request.post("/api/seed-test-data");
});
```

### 4. Tests Depend on Each Other

```typescript
// ❌ WRONG - Test 2 depends on Test 1
test("create task", async ({ page }) => {
  // Creates task with ID 1
});

test("view task", async ({ page }) => {
  await page.goto("/app/tasks/1"); // Assumes Test 1 ran first!
});

// ✅ CORRECT - Independent tests
test("view task", async ({ page }) => {
  // Create task in this test's setup
  await createTask({ title: "Test Task" });

  await page.goto("/app/tasks/1");
  // ... now independent
});
```

---

## Test Organization

### File Structure

```
e2e-tests/tests/
├── auth.spec.ts              # Authentication flows
├── navigation.spec.ts        # Page navigation
├── tasks/
│   ├── task-list.spec.ts     # Task list operations
│   ├── task-create.spec.ts   # Task creation flow
│   └── task-edit.spec.ts     # Task editing flow
└── admin/
    └── user-management.spec.ts
```

**Pattern**: Organize by feature, not by test type

### Naming Conventions

```typescript
// ✅ GOOD - Describes user action
test("user can create new task");
test("admin can delete user");
test("shows error when email invalid");

// ❌ BAD - Implementation details
test("POST /api/tasks returns 201");
test("calls createTask mutation");
```

---

## See Also

- **[../app/src/test/CLAUDE.md](../app/src/test/CLAUDE.md)** - Vitest component testing
- **[../app/src/components/CLAUDE.md](../app/src/components/CLAUDE.md)** - Component testing patterns
- **[../docs/TDD-WORKFLOW.md](../docs/TDD-WORKFLOW.md)** - Complete TDD workflow
- **[../scripts/run-e2e-tests.sh](../scripts/run-e2e-tests.sh)** - E2E test automation script
- **Playwright Docs**: https://playwright.dev/
- **Playwright Best Practices**: https://playwright.dev/docs/best-practices
