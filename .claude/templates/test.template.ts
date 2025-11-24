/**
 * Test Template for LEAN AI COACH
 *
 * Use this template when creating new tests in TDD RED phase.
 *
 * Location examples:
 * - Unit tests (operations): app/src/feature/operations.test.ts
 * - Component tests: app/src/feature/ComponentName.spec.tsx
 * - Integration tests: app/src/feature/feature.integration.test.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpError } from 'wasp/server';
import { renderInContext, mockServer } from 'wasp/client/test';
import { screen, waitFor } from '@testing-library/react';

// ============================================================
// UNIT TEST TEMPLATE (Operations)
// ============================================================

/**
 * Template for testing Wasp operations (queries/actions)
 * Location: app/src/feature/operations.test.ts
 */
describe('operationName', () => {
  it('should handle success case', async () => {
    // Arrange
    const mockContext = {
      user: { id: 'user-123' },
      entities: {
        EntityName: {
          findMany: vi.fn().mockResolvedValue([
            { id: '1', name: 'Test 1' },
            { id: '2', name: 'Test 2' },
          ]),
        },
      },
    };

    const args = { /* test arguments */ };

    // Act
    const result = await operationName(args, mockContext);

    // Assert
    expect(result).toBeDefined();
    expect(result).toHaveLength(2);
    expect(mockContext.entities.EntityName.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
    });
  });

  it('should throw 401 if not authenticated', async () => {
    // Arrange
    const mockContext = { user: null, entities: {} };
    const args = { /* test arguments */ };

    // Act & Assert
    await expect(operationName(args, mockContext)).rejects.toThrow(HttpError);
    await expect(operationName(args, mockContext)).rejects.toThrow('Not authenticated');
  });

  it('should throw 400 if required field is missing', async () => {
    // Arrange
    const mockContext = {
      user: { id: 'user-123' },
      entities: {},
    };
    const args = { name: '' }; // Invalid: empty name

    // Act & Assert
    await expect(operationName(args, mockContext)).rejects.toThrow(HttpError);
    await expect(operationName(args, mockContext)).rejects.toThrow('Name required');
  });

  it('should throw 404 if resource not found', async () => {
    // Arrange
    const mockContext = {
      user: { id: 'user-123' },
      entities: {
        EntityName: {
          findUnique: vi.fn().mockResolvedValue(null), // Not found
        },
      },
    };
    const args = { id: 'nonexistent-id' };

    // Act & Assert
    await expect(operationName(args, mockContext)).rejects.toThrow(HttpError);
    await expect(operationName(args, mockContext)).rejects.toThrow('not found');
  });

  it('should throw 403 if user lacks permission', async () => {
    // Arrange
    const mockContext = {
      user: { id: 'user-123' },
      entities: {
        EntityName: {
          findUnique: vi.fn().mockResolvedValue({
            id: '1',
            userId: 'different-user-id', // Owned by different user
          }),
        },
      },
    };
    const args = { id: '1' };

    // Act & Assert
    await expect(operationName(args, mockContext)).rejects.toThrow(HttpError);
    await expect(operationName(args, mockContext)).rejects.toThrow('Not authorized');
  });
});

// ============================================================
// COMPONENT TEST TEMPLATE (React)
// ============================================================

/**
 * Template for testing React components
 * Location: app/src/feature/ComponentName.spec.tsx
 */
describe('ComponentName', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockServer();
  });

  it('should render loading state initially', () => {
    // Arrange & Act
    renderInContext(<ComponentName />);

    // Assert
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render data when loaded', async () => {
    // Arrange
    const { mockQuery } = mockServer();
    const mockData = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];
    mockQuery(getQueryName, mockData);

    // Act
    renderInContext(<ComponentName />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  it('should render error message on failure', async () => {
    // Arrange
    const { mockQuery } = mockServer();
    mockQuery(getQueryName, () => {
      throw new Error('Failed to fetch');
    });

    // Act
    renderInContext(<ComponentName />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should render empty state when no data', async () => {
    // Arrange
    const { mockQuery } = mockServer();
    mockQuery(getQueryName, []); // Empty array

    // Act
    renderInContext(<ComponentName />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/no items/i)).toBeInTheDocument();
    });
  });

  it('should handle user interaction', async () => {
    // Arrange
    const { mockQuery } = mockServer();
    mockQuery(getQueryName, [{ id: '1', name: 'Item 1' }]);
    const { user } = renderInContext(<ComponentName />);

    // Act
    const button = await waitFor(() => screen.getByRole('button', { name: /click me/i }));
    await user.click(button);

    // Assert
    expect(screen.getByText(/clicked/i)).toBeInTheDocument();
  });
});

// ============================================================
// INTEGRATION TEST TEMPLATE
// ============================================================

/**
 * Template for integration tests (testing multiple components/operations together)
 * Location: app/src/feature/feature.integration.test.ts
 */
describe('Feature Integration', () => {
  beforeEach(() => {
    mockServer();
  });

  it('should complete full user flow', async () => {
    // Arrange
    const { mockQuery, mockApi } = mockServer();
    mockQuery(getQueryName, []);

    // Act
    const { user } = renderInContext(<FeaturePage />);

    // Step 1: User creates new item
    const input = screen.getByPlaceholderText(/enter name/i);
    await user.type(input, 'New Item');

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Step 2: Verify item appears in list
    await waitFor(() => {
      expect(screen.getByText('New Item')).toBeInTheDocument();
    });

    // Step 3: User edits item
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const editInput = screen.getByDisplayValue('New Item');
    await user.clear(editInput);
    await user.type(editInput, 'Updated Item');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Assert: Final state
    await waitFor(() => {
      expect(screen.getByText('Updated Item')).toBeInTheDocument();
      expect(screen.queryByText('New Item')).not.toBeInTheDocument();
    });
  });
});

// ============================================================
// EDGE CASE TESTING CHECKLIST
// ============================================================

/**
 * When writing tests, consider these edge cases:
 *
 * Auth & Permissions:
 * - [x] Not authenticated (user = null)
 * - [x] Authenticated but no permission (different userId)
 * - [ ] User with different role (VIEWER vs MANAGER)
 * - [ ] User from different organization/department
 *
 * Input Validation:
 * - [x] Empty string
 * - [ ] Null/undefined
 * - [ ] Too long input (exceeds max length)
 * - [ ] Invalid format (e.g., email, URL)
 * - [ ] Special characters (SQL injection, XSS)
 *
 * Data States:
 * - [x] Resource not found (404)
 * - [x] Empty array/list
 * - [ ] Single item vs multiple items
 * - [ ] Very long list (pagination)
 *
 * Error Handling:
 * - [x] Network error
 * - [ ] Database error
 * - [ ] Timeout
 * - [ ] Partial failure (some succeed, some fail)
 *
 * Concurrent Operations:
 * - [ ] Race conditions (multiple users editing same resource)
 * - [ ] Optimistic updates
 * - [ ] Stale data
 *
 * Business Logic:
 * - [ ] Boundary conditions (min/max values)
 * - [ ] State transitions (draft → published → archived)
 * - [ ] Cascading deletes/updates
 */

// ============================================================
// HELPFUL TESTING UTILITIES
// ============================================================

/**
 * Create mock user context for testing
 */
function createMockContext(userId: string = 'user-123', isAuthenticated: boolean = true) {
  return {
    user: isAuthenticated ? { id: userId } : null,
    entities: {},
  };
}

/**
 * Create mock Prisma entity methods
 */
function createMockEntity<T>(data: T | T[] | null = null) {
  return {
    findUnique: vi.fn().mockResolvedValue(data),
    findMany: vi.fn().mockResolvedValue(Array.isArray(data) ? data : []),
    create: vi.fn().mockResolvedValue(data),
    update: vi.fn().mockResolvedValue(data),
    delete: vi.fn().mockResolvedValue(data),
  };
}

/**
 * Wait for async operations to complete
 */
async function waitForAsyncUpdates() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}
