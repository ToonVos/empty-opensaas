# Components Directory Context

**AUTO-LOADED** when Claude Code works with files in `app/src/components/`. **Parent context**: Root CLAUDE.md provides testing workflow, app/CLAUDE.md provides Wasp patterns.

---

## What's in src/components/

**Reusable React components** organized by category:

```
src/components/
├── ui/                    # ShadCN UI primitives (button, dialog, card, etc.)
├── layout/                # Layout components (Header, Footer, Sidebar)
└── {feature}/             # Feature-specific components
    ├── FeatureList.tsx
    ├── FeatureList.test.tsx  # Co-located test
    └── FeatureItem.tsx
```

---

## Component Testing with Vitest

### Test Location

**ALWAYS co-locate tests** next to components:

```
✅ CORRECT:
src/components/TaskList.tsx
src/components/TaskList.test.tsx

❌ WRONG:
src/components/TaskList.tsx
src/test/components/TaskList.test.tsx
```

### Basic Test Structure

```typescript
// File: src/components/TaskList.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@testing-library/react'
import { TaskList } from './TaskList'

describe('TaskList', () => {
  it('renders tasks', () => {
    const tasks = [
      { id: 1, title: 'Task 1' },
      { id: 2, title: 'Task 2' }
    ]

    render(<TaskList tasks={tasks} />)

    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const tasks = [{ id: 1, title: 'Task 1' }]

    render(<TaskList tasks={tasks} onDelete={onDelete} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith(1)
  })
})
```

---

## Radix UI Testing Patterns (CRITICAL for ShadCN)

### Problem: Radix Dropdown/Dialog/Combobox Tests Fail

**Symptom**: Tests timeout or can't find dropdown items

**Root Cause**: Radix UI uses browser APIs not available in Vitest (jsdom):

- Pointer events
- ResizeObserver
- Element.scrollIntoView

### Solution: Polyfills in Test Setup

**File: `app/src/test/setup.ts`** (already configured in boilerplate)

```typescript
// Polyfill ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill scrollIntoView
Element.prototype.scrollIntoView = () => {};

// Mock pointer events
HTMLElement.prototype.hasPointerCapture = () => false;
HTMLElement.prototype.releasePointerCapture = () => {};
```

### Testing Dropdown Menus (DropdownMenu, Select, Combobox)

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, userEvent } from '@testing-library/react'
import { TaskActionsDropdown } from './TaskActionsDropdown'

describe('TaskActionsDropdown', () => {
  it('opens dropdown and shows actions', async () => {
    const user = userEvent.setup()

    render(<TaskActionsDropdown taskId={1} />)

    // 1. Find trigger button
    const trigger = screen.getByRole('button', { name: /actions/i })

    // 2. Click to open dropdown
    await user.click(trigger)

    // 3. Wait for dropdown items (Radix renders in portal)
    const editItem = await screen.findByRole('menuitem', { name: /edit/i })
    const deleteItem = await screen.findByRole('menuitem', { name: /delete/i })

    expect(editItem).toBeInTheDocument()
    expect(deleteItem).toBeInTheDocument()
  })

  it('calls onEdit when edit item clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(<TaskActionsDropdown taskId={1} onEdit={onEdit} />)

    // Open dropdown
    await user.click(screen.getByRole('button', { name: /actions/i }))

    // Click edit item
    const editItem = await screen.findByRole('menuitem', { name: /edit/i })
    await user.click(editItem)

    expect(onEdit).toHaveBeenCalledWith(1)
  })
})
```

**Key points**:

- Use `await screen.findByRole()` for dropdown items (async rendering)
- Use `userEvent.click()` not `fireEvent.click()` (more realistic)
- Radix renders dropdown content in a portal (outside component tree)

### Testing Dialog Components

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, userEvent } from '@testing-library/react'
import { CreateTaskDialog } from './CreateTaskDialog'

describe('CreateTaskDialog', () => {
  it('opens dialog and submits form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<CreateTaskDialog onSubmit={onSubmit} />)

    // 1. Open dialog
    const openButton = screen.getByRole('button', { name: /create task/i })
    await user.click(openButton)

    // 2. Fill form (dialog content in portal)
    const titleInput = await screen.findByLabelText(/title/i)
    await user.type(titleInput, 'New Task')

    // 3. Submit
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith({ title: 'New Task' })
  })

  it('closes dialog when cancel clicked', async () => {
    const user = userEvent.setup()

    render(<CreateTaskDialog />)

    // Open dialog
    await user.click(screen.getByRole('button', { name: /create task/i }))

    // Cancel
    const cancelButton = await screen.findByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    // Dialog content should be removed
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument()
  })
})
```

**→ Complete template**: Root `.claude/templates/dialog-component-test.template.ts`

---

## Testing Components with Wasp Operations

### Problem: Can't Mock useQuery/useAction

**Symptom**: `useQuery is not a function` or `Cannot read property 'data' of undefined`

**Solution**: Mock Wasp operations module

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskListPage } from './TaskListPage'

// Mock wasp/client/operations
vi.mock('wasp/client/operations', () => ({
  useQuery: vi.fn(),
  getTasks: vi.fn(),
}))

import { useQuery } from 'wasp/client/operations'

describe('TaskListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<TaskListPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows tasks when loaded', () => {
    const mockTasks = [
      { id: 1, title: 'Task 1' },
      { id: 2, title: 'Task 2' },
    ]

    vi.mocked(useQuery).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
    })

    render(<TaskListPage />)
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    })

    render(<TaskListPage />)
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

**Key points**:

- Mock `wasp/client/operations` BEFORE importing component
- Use `vi.mocked()` for type-safe mocking
- Clear mocks in `beforeEach()` to avoid test interference

---

## User Interaction Testing with userEvent

**ALWAYS use `@testing-library/user-event`** - more realistic than `fireEvent`

### Setup

```typescript
import { userEvent } from "@testing-library/react";

// In test:
const user = userEvent.setup();
```

### Common Patterns

```typescript
// Click
await user.click(button);

// Type text
await user.type(input, "Hello world");

// Clear and type
await user.clear(input);
await user.type(input, "New text");

// Select dropdown option
await user.selectOptions(select, "option1");

// Check/uncheck checkbox
await user.click(checkbox);

// Hover
await user.hover(element);
await user.unhover(element);

// Tab navigation
await user.tab();
```

**Why userEvent?**

- Fires all browser events in correct order
- Handles pointer events (important for Radix UI)
- Validates element state (e.g., disabled buttons can't be clicked)

---

## Accessibility Testing

### Use Accessible Queries

**Prefer queries that users would use:**

```typescript
// ✅ GOOD - Queries by accessible attributes
screen.getByRole("button", { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByText(/welcome/i);
screen.getByAltText(/logo/i);

// ❌ AVOID - Implementation details
screen.getByTestId("submit-button");
screen.getByClassName("btn-primary");
```

**Query priority** (best to worst):

1. `getByRole` - Screen readers use roles
2. `getByLabelText` - Form accessibility
3. `getByText` - Visible text
4. `getByAltText` - Images
5. `getByTestId` - Last resort

### Common Roles

```typescript
// Buttons
screen.getByRole("button", { name: /create/i });

// Links
screen.getByRole("link", { name: /learn more/i });

// Form inputs
screen.getByRole("textbox", { name: /email/i });
screen.getByRole("checkbox", { name: /agree/i });

// Headings
screen.getByRole("heading", { name: /dashboard/i, level: 1 });

// Lists
screen.getByRole("list");
screen.getByRole("listitem");

// Dialogs
screen.getByRole("dialog");

// Menu items (dropdowns)
screen.getByRole("menuitem", { name: /edit/i });
```

---

## Testing Async Behavior

### Finding Elements That Appear Later

```typescript
// ❌ WRONG - Immediate query fails
const item = screen.getByText("Loaded data");

// ✅ CORRECT - Wait for element
const item = await screen.findByText("Loaded data");

// ✅ CORRECT - Wait and assert
await waitFor(() => {
  expect(screen.getByText("Loaded data")).toBeInTheDocument();
});
```

### Waiting for Element to Disappear

```typescript
import { waitForElementToBeRemoved } from "@testing-library/react";

// Wait for loading spinner to disappear
await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

// Or use waitFor
await waitFor(() => {
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

**Key difference**:

- `getBy*` - Sync, throws if not found (immediate assertions)
- `findBy*` - Async, waits up to 1s (for appearing elements)
- `queryBy*` - Sync, returns null if not found (for absence checks)

---

## Component Test Checklist

**For every component, test:**

1. ✅ **Rendering** - Component displays correct content
2. ✅ **Props** - Props affect rendered output correctly
3. ✅ **User Interactions** - Clicks, typing, form submission work
4. ✅ **Callbacks** - Event handlers called with correct arguments
5. ✅ **Conditional Rendering** - Show/hide based on state/props
6. ✅ **Accessibility** - Keyboard navigation, screen reader support
7. ✅ **Error States** - Handles errors gracefully

**Example:**

```typescript
describe("TaskCard", () => {
  it("renders task details"); // 1. Rendering
  it("applies priority color based on prop"); // 2. Props
  it("calls onEdit when edit clicked"); // 3,4. Interaction + Callback
  it("shows edit form when editing"); // 5. Conditional
  it("can be navigated with keyboard"); // 6. Accessibility
  it("shows error message on save failure"); // 7. Error states
});
```

---

## Running Tests

```bash
# Watch mode (TDD - recommended)
./scripts/test-watch.sh

# Single run (CI/CD)
cd app && wasp test client run

# Specific file
cd app && wasp test client run src/components/TaskList.test.tsx

# Coverage
cd app && wasp test client run --coverage
```

**→ Complete TDD workflow**: Root `docs/TDD-WORKFLOW.md`

---

## Common Pitfalls

### 1. Not Using await with userEvent

```typescript
// ❌ WRONG
user.click(button);
expect(onSubmit).toHaveBeenCalled();

// ✅ CORRECT
await user.click(button);
expect(onSubmit).toHaveBeenCalled();
```

### 2. Using getBy for Async Elements

```typescript
// ❌ WRONG - Throws immediately
await user.click(trigger);
const item = screen.getByText("Dropdown item");

// ✅ CORRECT - Waits for element
await user.click(trigger);
const item = await screen.findByText("Dropdown item");
```

### 3. Not Cleaning Up Mocks

```typescript
// ❌ WRONG - Mocks persist between tests
describe('MyComponent', () => {
  it('test 1', () => {
    vi.mocked(useQuery).mockReturnValue({ data: [...] })
    // Test uses mock
  })

  it('test 2', () => {
    // Still uses mock from test 1!
  })
})

// ✅ CORRECT - Clean between tests
describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('test 1', () => { ... })
  it('test 2', () => { ... })
})
```

---

## See Also

- **[../test/CLAUDE.md](../test/CLAUDE.md)** - Vitest test setup and configuration
- **[../../../e2e-tests/CLAUDE.md](../../../e2e-tests/CLAUDE.md)** - E2E testing with Playwright
- **[../../../docs/TDD-WORKFLOW.md](../../../docs/TDD-WORKFLOW.md)** - Complete TDD workflow
- **[../../../.claude/templates/dialog-component-test.template.ts](../../../.claude/templates/dialog-component-test.template.ts)** - Dialog test template
- **Testing Library Docs**: https://testing-library.com/docs/react-testing-library/intro/
- **Vitest Docs**: https://vitest.dev/
