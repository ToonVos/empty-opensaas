# Test Directory Context

**AUTO-LOADED** when Claude Code works with files in `app/src/test/`. **Parent context**: Root CLAUDE.md provides TDD workflow, app/CLAUDE.md provides Wasp patterns.

---

## What's in src/test/

**Vitest configuration and test setup** for component/unit tests:

```
src/test/
├── setup.ts           # Test environment setup (polyfills, global mocks)
└── vitest.config.ts   # Vitest configuration
```

**Test files** are co-located with components:

```
src/components/TaskList.tsx
src/components/TaskList.test.tsx  ✅ Next to component
```

---

## Vitest Configuration

**File: `src/test/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // Browser-like environment
    setupFiles: "./src/test/setup.ts", // Global test setup
    globals: true, // Import describe/it/expect without importing
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        statements: 80, // ≥80% statement coverage
        branches: 75, // ≥75% branch coverage
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../src"), // @/ paths
    },
  },
});
```

**Key settings**:

- `environment: 'jsdom'` - DOM APIs available (document, window)
- `setupFiles` - Runs before each test file (polyfills, mocks)
- `globals: true` - No need to import `describe`, `it`, `expect`
- `coverage.thresholds` - Enforces minimum test coverage

---

## Test Setup (Polyfills & Mocks)

**File: `src/test/setup.ts`**

```typescript
import "@testing-library/jest-dom"; // Matchers like toBeInTheDocument()

// Polyfill ResizeObserver (Radix UI needs this)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill scrollIntoView (Radix UI dropdowns)
Element.prototype.scrollIntoView = () => {};

// Mock pointer events (Radix UI)
HTMLElement.prototype.hasPointerCapture = () => false;
HTMLElement.prototype.releasePointerCapture = () => {};

// Mock window.matchMedia (responsive components)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});
```

**Why these polyfills?**

- **ResizeObserver**: Radix UI uses for responsive positioning
- **scrollIntoView**: Radix dropdowns scroll items into view
- **Pointer events**: Radix uses pointer capture for modals
- **matchMedia**: ShadCN components use for responsive behavior

**Without these**: Tests timeout or fail with "not implemented" errors

---

## Writing Component Tests

### Basic Structure

```typescript
// File: src/components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Testing Async Components

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TaskList } from './TaskList'

describe('TaskList', () => {
  it('shows loading state initially', () => {
    render(<TaskList />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows tasks after loading', async () => {
    render(<TaskList />)

    // Wait for tasks to appear
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument()
    })

    // Or use findBy (simpler)
    expect(await screen.findByText('Task 1')).toBeInTheDocument()
  })

  it('shows error message on failure', async () => {
    // Mock API to return error
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    })

    render(<TaskList />)

    expect(await screen.findByText(/error/i)).toBeInTheDocument()
  })
})
```

---

## Mocking

### Mocking Functions

```typescript
import { vi } from 'vitest'

// Create mock function
const onSubmit = vi.fn()

// Use in component
render(<Form onSubmit={onSubmit} />)

// Assert called
expect(onSubmit).toHaveBeenCalled()
expect(onSubmit).toHaveBeenCalledWith({ title: 'Task 1' })
expect(onSubmit).toHaveBeenCalledOnce()

// Mock implementation
const onSubmit = vi.fn((data) => {
  return { id: 1, ...data }
})

// Mock resolved value (async)
const fetchTasks = vi.fn().mockResolvedValue([{ id: 1, title: 'Task 1' }])

// Mock rejected value (errors)
const fetchTasks = vi.fn().mockRejectedValue(new Error('Failed'))
```

### Mocking Modules

```typescript
// Mock entire module
vi.mock("wasp/client/operations", () => ({
  useQuery: vi.fn(),
  getTasks: vi.fn(),
  createTask: vi.fn(),
}));

// Import after mock
import { useQuery } from "wasp/client/operations";

// Use in test
vi.mocked(useQuery).mockReturnValue({
  data: [{ id: 1, title: "Task 1" }],
  isLoading: false,
  error: null,
});
```

### Mocking Specific Exports

```typescript
// Mock only part of module
vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual("@/lib/utils");
  return {
    ...actual,
    formatDate: vi.fn(() => "2023-01-01"), // Mock this function
    // All other exports use actual implementation
  };
});
```

### Clearing Mocks

```typescript
import { beforeEach, vi } from 'vitest'

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()  // Clear call history
    // or
    vi.resetAllMocks()  // Clear + reset implementation
  })

  it('test 1', () => { ... })
  it('test 2', () => { ... })
})
```

---

## Test Matchers

### Jest-DOM Matchers (from @testing-library/jest-dom)

```typescript
// Visibility
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toHaveTextContent("Hello");

// Form elements
expect(input).toHaveValue("test@example.com");
expect(input).toBeDisabled();
expect(input).toBeEnabled();
expect(checkbox).toBeChecked();

// Attributes
expect(button).toHaveClass("btn-primary");
expect(link).toHaveAttribute("href", "/dashboard");

// Accessibility
expect(button).toHaveAccessibleName("Submit form");
expect(input).toHaveAccessibleDescription("Enter your email");
```

### Vitest Matchers

```typescript
// Equality
expect(value).toBe(5); // Strict equality (===)
expect(object).toEqual({ a: 1 }); // Deep equality
expect(array).toContain("item"); // Array includes

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(10);
expect(value).toBeLessThan(20);
expect(value).toBeCloseTo(0.3); // Floating point

// Strings
expect(string).toMatch(/hello/i);
expect(string).toContain("world");

// Functions
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg1, arg2);
expect(fn).toHaveBeenCalledOnce();
expect(fn).toHaveReturnedWith(value);

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow("Error message");
expect(async () => await fn()).rejects.toThrow();

// Promises
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

---

## Running Tests

### Watch Mode (TDD - Recommended)

```bash
# From project root
./scripts/test-watch.sh

# From app directory
cd app
wasp test client
```

**Features**:

- Auto-runs tests on file save
- Only runs tests for changed files
- Interactive filter (press 'p' for filename, 't' for test name)

### Single Run (CI/CD)

```bash
cd app
wasp test client run                          # All tests
wasp test client run src/components/          # Specific directory
wasp test client run TaskList.test.tsx        # Specific file
wasp test client run --coverage               # With coverage report
```

### Coverage Report

```bash
cd app
wasp test client run --coverage

# Opens HTML report
open coverage/index.html
```

**Coverage thresholds** (from vitest.config.ts):

- ≥80% statements
- ≥75% branches

---

## TDD Workflow

**RED → GREEN → REFACTOR**

### 1. RED Phase - Write Failing Test

```typescript
// File: src/components/TaskList.test.tsx
describe('TaskList', () => {
  it('filters tasks by status', () => {
    const tasks = [
      { id: 1, title: 'Task 1', status: 'TODO' },
      { id: 2, title: 'Task 2', status: 'DONE' },
    ]

    render(<TaskList tasks={tasks} filterStatus="TODO" />)

    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument()
  })
})
```

**Run test - should FAIL**:

```bash
./scripts/test-watch.sh
# ❌ FAIL: TaskList › filters tasks by status
#    TypeError: Cannot read property 'filter' of undefined
```

### 2. GREEN Phase - Make Test Pass

```typescript
// File: src/components/TaskList.tsx
export function TaskList({ tasks, filterStatus }) {
  const filteredTasks = tasks.filter(t =>
    filterStatus ? t.status === filterStatus : true
  )

  return (
    <ul>
      {filteredTasks.map(task => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}
```

**Run test - should PASS**:

```bash
# ✅ PASS: TaskList › filters tasks by status
```

### 3. REFACTOR Phase - Improve Code (Tests Stay Green)

```typescript
// Extract filter logic
function filterTasksByStatus(tasks, status) {
  return status ? tasks.filter((t) => t.status === status) : tasks;
}

export function TaskList({ tasks, filterStatus }) {
  const filteredTasks = filterTasksByStatus(tasks, filterStatus);
  // ... rest unchanged
}
```

**Run tests - should STILL PASS**:

```bash
# ✅ PASS: All tests passing
```

**→ Complete TDD workflow**: Root `docs/TDD-WORKFLOW.md`

---

## Test Quality Criteria

**5 criteria for high-quality tests:**

1. ✅ **Business Logic** - Tests verify behavior, not implementation
2. ✅ **Meaningful Assertions** - Tests check meaningful outputs
3. ✅ **Error Paths** - Tests cover error scenarios
4. ✅ **Edge Cases** - Tests include boundary conditions
5. ✅ **Behavior Not Implementation** - Tests don't break on refactoring

### ❌ Bad Test - Implementation Details

```typescript
it('calls useState with correct initial value', () => {
  const spy = vi.spyOn(React, 'useState')
  render(<Counter />)
  expect(spy).toHaveBeenCalledWith(0)
})
```

**Why bad**: Tests implementation (useState), not behavior

### ✅ Good Test - User Behavior

```typescript
it('shows count starting at 0', () => {
  render(<Counter />)
  expect(screen.getByText('Count: 0')).toBeInTheDocument()
})

it('increments count when button clicked', async () => {
  const user = userEvent.setup()
  render(<Counter />)

  await user.click(screen.getByRole('button', { name: /increment/i }))
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

**Why good**: Tests user-visible behavior

---

## Common Pitfalls

### 1. Not Waiting for Async Updates

```typescript
// ❌ WRONG - Doesn't wait for state update
await user.click(button);
expect(screen.getByText("Success")).toBeInTheDocument(); // Fails!

// ✅ CORRECT - Wait for element
await user.click(button);
expect(await screen.findByText("Success")).toBeInTheDocument();
```

### 2. Using getBy for Optional Elements

```typescript
// ❌ WRONG - Throws if not found
const error = screen.getByText("Error message");
expect(error).toBeInTheDocument();

// ✅ CORRECT - Returns null if not found
const error = screen.queryByText("Error message");
expect(error).toBeInTheDocument();

// Or for negation:
expect(screen.queryByText("Error message")).not.toBeInTheDocument();
```

### 3. Not Cleaning Up Between Tests

```typescript
// ❌ WRONG - State persists between tests
let sharedState = [];
describe("Component", () => {
  it("test 1", () => {
    sharedState.push("item");
    // Test uses sharedState
  });
  it("test 2", () => {
    // sharedState still has 'item' from test 1!
  });
});

// ✅ CORRECT - Reset in beforeEach
let sharedState;
beforeEach(() => {
  sharedState = [];
});
```

### 4. Testing Implementation Details

```typescript
// ❌ WRONG
expect(component.state.isLoading).toBe(false);

// ✅ CORRECT
expect(screen.queryByText("Loading")).not.toBeInTheDocument();
```

---

## Debugging Tests

### Print DOM Structure

```typescript
import { screen } from "@testing-library/react";

// Print entire DOM
screen.debug();

// Print specific element
screen.debug(screen.getByRole("button"));

// Limit output length
screen.debug(undefined, 10000); // 10000 char limit
```

### Find Available Queries

```typescript
import { logRoles } from '@testing-library/react'

const { container } = render(<MyComponent />)
logRoles(container)
// Outputs: All available roles and their counts
```

### Check Element Visibility

```typescript
import { prettyDOM } from "@testing-library/react";

const element = screen.getByTestId("my-element");
console.log(prettyDOM(element));
console.log("Visible:", element.checkVisibility());
```

---

## See Also

- **[../../test/vitest.config.ts](../../test/vitest.config.ts)** - Vitest configuration
- **[../../test/setup.ts](../../test/setup.ts)** - Test environment setup
- **[../components/CLAUDE.md](../components/CLAUDE.md)** - Component testing patterns
- **[../../../e2e-tests/CLAUDE.md](../../../e2e-tests/CLAUDE.md)** - E2E testing with Playwright
- **[../../../docs/TDD-WORKFLOW.md](../../../docs/TDD-WORKFLOW.md)** - Complete TDD workflow
- **Vitest Docs**: https://vitest.dev/
- **Testing Library Docs**: https://testing-library.com/
- **Jest-DOM Matchers**: https://github.com/testing-library/jest-dom
