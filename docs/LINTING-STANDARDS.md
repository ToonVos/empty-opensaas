# Linting Standards & Type Safety

**Version**: 2.0
**Date**: 2025-10 (Q3 2025)
**Stack**: Wasp 0.18.0, Vitest 3.2.4, TypeScript 5.8.2
**Status**: Active Standard

This document defines our approach to TypeScript type safety and linting, establishing a **2-tier standard** that balances strictness with pragmatism.

---

## Philosophy

**Why we care about types:**

1. **Catch bugs early** - Type errors found at compile time, not production
2. **Self-documenting** - Types serve as inline documentation
3. **Refactoring confidence** - TypeScript guides safe refactoring
4. **Team consistency** - Shared understanding of data structures

**The danger of `any`:**

```typescript
// ❌ BAD: Silent runtime failures
function processData(data: any) {
  return data.items.map((item) => item.value.toFixed(2));
  // Compiles fine, crashes if data is wrong shape
}

// ✅ GOOD: Compile-time safety
function processData(data: { items: Array<{ value: number }> }) {
  return data.items.map((item) => item.value.toFixed(2));
  // TypeScript catches wrong data shapes immediately
}
```

---

## The 2-Tier Standard

Not all code has the same type safety requirements. We distinguish between:

### Tier 1: Production Code (STRICT - 0 tolerance for `any`)

**Applies to:**

- `src/server/*/operations.ts` - Backend operations
- `src/server/*/validators.ts` - Input validation
- `src/server/*/filters.ts` - Query builders
- `src/server/permissions/*.ts` - Authorization logic
- All React components
- All business logic

**Rules:**

- ❌ NEVER use `any` type
- ❌ NEVER use `@ts-ignore` or `@ts-nocheck`
- ❌ NEVER use broad eslint-disable comments
- ✅ USE proper types: `Prisma.JsonValue`, `unknown`, specific types
- ✅ USE inline eslint-disable ONLY for unavoidable tool limitations (with comment explaining why)

### Tier 2: Test Infrastructure (PRAGMATIC - focused on test quality)

**Applies to:**

- `src/**/*.test.ts` - Unit tests
- `src/**/*.test.tsx` - Component tests
- `e2e-tests/**/*.spec.ts` - E2E tests

**Rules:**

- ✅ Mock type casts MAY use `as any` with inline comment
- ✅ Test helpers MAY use `unknown` where appropriate
- ❌ Business logic in tests must still be properly typed
- ❌ Test data/assertions should use specific types where possible

**Why different standards?**

Test infrastructure has different priorities:

- **Mocking** - Test frameworks often have type mismatches with production types
- **Ergonomics** - Tests should be easy to write and maintain
- **Focus** - Test quality matters more than mock infrastructure types

---

## When `any` is Acceptable

### Helper Functions: Delegate Pattern vs Context Any

**Problem:** Helper functions called from Wasp operations need entity access but lose Wasp's automatic type inference

**🥇 FIRST CHOICE: Delegate Pattern** (OpenSaaS pattern - 0 `any`)

```typescript
// activityLog.ts - uses delegate pattern (PREFERRED)
export async function logA3Activity(params: {
  a3Id: string;
  userId: string;
  action: string;
  a3ActivityDelegate: PrismaClient["a3Activity"]; // ✅ Specific delegate
}): Promise<A3Activity> {
  return a3ActivityDelegate.create({
    data: { a3Id: params.a3Id, userId: params.userId, action: params.action },
  });
}

// Called from operation
export const createA3: CreateA3 = async (args, context) => {
  // context is properly typed by Wasp here
  await logA3Activity({
    a3Id: a3.id,
    userId: context.user.id,
    action: "CREATED",
    a3ActivityDelegate: context.entities.A3Activity, // Pass specific delegate!
  });
};
```

**Why delegate pattern is preferred:**

- ✅ Zero `any` types (100% type safety)
- ✅ Explicit dependencies (clear what entities helper needs)
- ✅ Easy to test (mock specific delegates)
- ✅ OpenSaaS recommended pattern

**Decision rule:** Helper needs 1-2 specific entities → Use delegate pattern

**⚠️ FALLBACK: Context Any** (When delegate pattern becomes impractical)

```typescript
// Context: permissions/index.ts (helper needs 3+ entities)

/**
 * Permission Helper Functions
 *
 * These helpers accept Wasp operation context (`context: any`) because:
 * 1. Needs 3+ entities (UserDepartment, User, Organization)
 * 2. Passing all delegates would create verbose function signatures
 * 3. Operations calling these ARE properly typed (GetA3, CreateA3, etc.)
 *
 * This is a Wasp framework limitation - operations get automatic type inference,
 * but helper functions outside operations lose this inference.
 */

export async function canAccessDepartment(
  userId: string,
  departmentId: string,
  context: any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Wasp context varies by operation, needs 3+ entities (see file header)
): Promise<boolean> {
  const membership = await context.entities.UserDepartment.findUnique({
    where: { userId_departmentId: { userId, departmentId } },
  });
  return membership !== null;
}
```

**When context any is acceptable:**

- Helper needs 3+ entities (delegate pattern too verbose)
- Complex cross-entity queries
- File header documents justification
- Inline eslint-disable with comment explaining reason
- Operations calling helpers ARE properly typed (type safety at operation boundary)

**Decision rule:** Helper needs 3+ entities → Consider `context: any` with documentation

**Wasp 0.18+ Type Inference:**

- Operations with type annotations (`GetA3<Args, Return>`) get **automatic context typing**
- Helper functions **outside** operations lose this inference (framework limitation)
- Reevaluate helper patterns when Wasp adds official typing for helpers

**Our codebase examples:**

- **Delegate pattern:** `app/src/server/a3/activityLog.ts` (if exists)
- **Context any:** `app/src/server/permissions/index.ts` (lines 25-40)

### ✅ ACCEPTABLE: Mock Type Casts (Test Infrastructure)

**Problem:** Vitest mock types don't always match complex Prisma delegate types

**Recommended Approach (Vitest 3.x+):**

```typescript
// Context: operations.test.ts
import { vi } from "vitest";

// ✅ PREFERRED - Try vi.mocked() first (Vitest 3.x)
const mockLogActivity = vi.mocked(activityLog.logA3Activity);

it("should log activity after creation", async () => {
  mockLogActivity.mockResolvedValue({ id: "activity-1" });
  // Proper type inference for mock methods
});
```

**Fallback for Complex Cases:**

```typescript
// ✅ ACCEPTABLE - If vi.mocked() has type mismatches
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mock cast: Vitest types don't match Prisma delegates
const mockLogActivity = activityLog.logA3Activity as any;

it("should log activity after creation", async () => {
  mockLogActivity.mockResolvedValue({ id: "activity-1" });
  // Test logic uses proper types
});
```

**Why this approach:**

- `vi.mocked()` provides proper typing in most cases (Vitest 3.x+)
- `as any` fallback for edge cases (Prisma delegate types, complex generics)
- Isolated to test infrastructure
- Documented reason when using fallback
- Doesn't compromise test quality

**Our codebase:** See `app/src/server/a3/operations.test.ts` for factory pattern examples

### ✅ ACCEPTABLE: CLI Scripts & Seed Data

**Problem:** One-time scripts prioritize clarity over type perfection

```typescript
// Context: seed.ts (CLI script)
/* eslint-disable no-console */
// Seed script - console.log is appropriate for CLI output

export async function seedMultiTenant() {
  console.log("Seeding multi-tenant data...");
  // ... seed logic
}
```

**Why acceptable:**

- Script runs once during development
- Console output is the intended behavior
- Not part of production runtime

---

## When `any` is Cheating

### ❌ CHEATING: Hiding Production Code Issues

```typescript
// ❌ WRONG: Using any to avoid proper typing
export const updateA3 = async (args: { data: any }, context: any) => {
  // No type safety! Can pass anything!
  return context.entities.A3Document.update({
    where: { id: args.id },
    data: args.data, // Could be anything!
  });
};

// ✅ RIGHT: Proper Prisma types
import { Prisma } from "@prisma/client";

export const updateA3 = async (
  args: { data: Prisma.A3DocumentUpdateInput },
  context: Context,
) => {
  // Type-safe! IDE autocomplete + compile-time checks
  return context.entities.A3Document.update({
    where: { id: args.id },
    data: args.data, // TypeScript validates structure
  });
};
```

### ❌ CHEATING: Broad eslint-disable

```typescript
// ❌ WRONG: Blanket disable
/* eslint-disable @typescript-eslint/no-explicit-any */

function validateData(data: any) {
  /* ... */
}
function processData(input: any) {
  /* ... */
}
function storeData(record: any) {
  /* ... */
}

// ✅ RIGHT: Specific fixes or inline disables
function validateData(data: unknown) {
  if (typeof data !== "object" || !data) {
    throw new Error("Invalid data");
  }
  // Type guard narrows to object
}
```

---

## Inline eslint-disable Best Practices

When using inline `eslint-disable-next-line`, ALWAYS include a comment explaining **why**:

```typescript
// ✅ GOOD: Explains the limitation
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mock cast: Vitest types don't match Prisma delegates
const mockFn = module.func as any;

// ❌ BAD: No explanation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = module.func as any;
```

**Comment format:**

```
// eslint-disable-next-line <rule> -- <reason why disable is needed>
```

**Good reasons:**

- "Mock cast: Framework types don't match"
- "CLI script: console output is intentional"
- "Type guard: narrowing from unknown"

**Bad reasons:**

- "Too hard to type"
- "Faster this way"
- "Will fix later"

---

## Real Examples from Our Codebase

### Example 1: Production Code (STRICT)

**Before (WRONG):**

```typescript
// src/server/a3/operations.ts
export const updateA3 = async (
  args: { id: string; data: any }, // ❌ any in production!
  context: any, // ❌ any in production!
) => {
  const updateData: any = {}; // ❌ any in production!
  if (args.data.title) updateData.title = args.data.title;
  // No type safety!
};
```

**After (RIGHT):**

```typescript
// src/server/a3/operations.ts
import { Prisma } from "@prisma/client";
import type { UpdateA3 } from "wasp/server/operations";

export const updateA3: UpdateA3 = async (args, context) => {
  // ✅ Wasp infers proper context type
  const updateData: Prisma.A3DocumentUpdateInput = {};
  // ✅ TypeScript knows available fields
  if (args.data.title) updateData.title = args.data.title;

  return context.entities.A3Document.update({
    where: { id: args.id },
    data: updateData, // ✅ Type-safe!
  });
};
```

### Example 2: Test Mocks (PRAGMATIC)

**Before (BREAKS):**

```typescript
// src/server/a3/operations.test.ts
const mockLogActivity = activityLog.logA3Activity as vi.MockedFunction<
  typeof activityLog.logA3Activity
>;
// ❌ TypeScript error: Vitest mock types don't match Prisma delegate types
```

**After (WORKS):**

```typescript
// src/server/a3/operations.test.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mock cast: Vitest types don't match Prisma delegates
const mockLogActivity = activityLog.logA3Activity as any;
// ✅ Compiles, test quality unaffected, reason documented
```

### Example 3: Validators (STRICT)

**Before (WRONG):**

```typescript
// src/server/a3/validators.ts
export function validateA3SectionContent(content: any): void {
  // ❌ any allows anything!
  const depth = getJsonDepth(content);
  if (depth > 10) throw new Error("Too deep");
}

function getJsonDepth(obj: any, depth: number = 0): number {
  // ❌ Recursive any
  // ...
}
```

**After (RIGHT):**

```typescript
// src/server/a3/validators.ts
export function validateA3SectionContent(content: unknown): void {
  // ✅ unknown forces validation
  const depth = getJsonDepth(content);
  if (depth > 10) throw new Error("Too deep");
}

function getJsonDepth(obj: unknown, depth: number = 0): number {
  // ✅ unknown at boundaries, type guards inside
  if (!obj || typeof obj !== "object") return depth;
  // Type narrowed to object here
}
```

---

## Industry Standards

This 2-tier approach is used by major projects:

**React Testing Library:**

```typescript
// React Testing Library source code
const screen = render(<Component />) as any; // Mock DOM
```

**Vitest (Modern Approach):**

```typescript
// Vitest 3.x provides vi.mocked() for proper typing
const mockFn = vi.mocked(module.function); // ✅ Preferred

// Legacy approach for complex cases
type MockedFunction<T> = T extends (...args: any[]) => any ? Mock<T> : never;
const mockFn = module.function as any; // ✅ Fallback
```

**TypeScript Compiler Tests:**

```typescript
// TypeScript's own tests use 'any' for test harnesses
const mockSystem: ts.System = createMockSystem() as any;
```

**Key insight:** Production code strictness enables test pragmatism.

---

## Enforcement

### CI/CD Checks

```bash
# Production code: STRICT (0 warnings allowed in Sprint code)
npx eslint src/server/a3/*.ts --max-warnings 0

# Full project: Template code may have warnings
npx eslint . --ext .ts,.tsx --max-warnings 50
```

### Pre-commit Hook

```bash
# .husky/pre-commit
npm run lint  # Catches any type issues before commit
```

### Code Review Checklist

When reviewing PRs, check:

- [ ] No `any` in production code (operations, validators, filters, permissions)
- [ ] Inline `eslint-disable` includes explanation comment
- [ ] Test mocks use `as any` only for type cast (not business logic)
- [ ] New code follows 2-tier standard

---

## Migration Strategy

For existing code with type issues:

1. **Identify context:**

   - Production code? Fix properly (use Prisma types, unknown, etc.)
   - Test infrastructure? Inline `eslint-disable` with comment

2. **Fix production code FIRST** (highest ROI)

3. **Document test infrastructure pragmatism** (this doc)

4. **Iterate** - Don't let perfect be enemy of good

---

## ESLint Configuration (`no-undef` Rule)

### Why `no-undef` is Disabled for TypeScript Files

**Problem:** ESLint's `no-undef` rule doesn't understand TypeScript types and flags DOM types like `HTMLSelectElement` as undefined.

**Official TypeScript ESLint Recommendation:**

> "We strongly recommend you do NOT use the `no-undef` lint rule on TypeScript projects. The checks it provides are **already** provided by TypeScript without the need for configuration - TypeScript just does this significantly better. As of our v4.0.0 release, this also applies to types."

Source: https://github.com/typescript-eslint/typescript-eslint/issues/2477

**Why This is Safe:**

- TypeScript compiler **already** checks for undefined variables
- TypeScript provides **better** type checking than ESLint's `no-undef`
- `no-undef` was designed for JavaScript, not TypeScript
- Modern TypeScript projects (React, Vue, Angular) all disable `no-undef` for `.ts` / `.tsx` files

**Configuration:**

**ESLint Flat Config (eslint.config.js):** (Recommended for ESLint v9+)

```javascript
{
  files: ["**/*.ts", "**/*.tsx"],
  rules: {
    "no-undef": "off"
  }
}
```

**Legacy .eslintrc.json:** (ESLint v8 and earlier)

```json
{
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "no-undef": "off"
      }
    }
  ]
}
```

**Applied in:**

- `app/eslint.config.js` (lines 91-96) - **Active config for ESLint v9**
- `app/.eslintrc.json` (lines 38-45) - Legacy format (ignored by ESLint v9)

**Result:**

- JavaScript files still checked by `no-undef` ✅
- TypeScript files checked by TypeScript compiler instead ✅
- No false positives on DOM types, React types, etc. ✅

**Note:** If you see `'HTMLSelectElement' is not defined` or `'global' is not defined` errors in TypeScript files, this is the ESLint `no-undef` rule failing. The TypeScript compiler already validated these types are correct.

---

## TSConfig Separation for Production vs Tests

### Why Separate Test Files from Production Builds

**Problem:** Test files should have full type checking during development (good DX) but be excluded from production builds (smaller bundle, faster compile).

**Solution:** Use TypeScript's `extends` feature with a separate build config.

### Configuration Pattern

**Main tsconfig.json** (for development - includes tests):

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.test.ts", // ✅ Tests included for editor
    "src/**/*.test.tsx"
  ]
}
```

**tsconfig.build.json** (for production builds - excludes tests):

```json
{
  "extends": "./tsconfig.json",
  "exclude": [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/test-utils/**"
  ]
}
```

**Update build script in package.json:**

```json
{
  "scripts": {
    "build": "tsc --project tsconfig.build.json && vite build"
  }
}
```

### Benefits

- ✅ **Editor:** Full type checking for tests (IntelliSense, error detection)
- ✅ **Production:** Tests excluded from build (smaller bundle, faster compile)
- ✅ **CI/CD:** Can enforce zero errors in both test and production code
- ✅ **Industry standard:** Used by React, Vue, Angular projects (2024/2025)

### Our Project

**Note:** Wasp handles TypeScript compilation internally. This pattern applies to:

- Additional TypeScript tooling you might add
- Understanding how Wasp separates test vs production code
- Future custom build scripts

**Wasp's approach:**

- `wasp build` compiles production code (excludes tests automatically)
- `wasp test` compiles test code (includes tests)

---

## FAQ

### Q: Should I use `vi.mocked()` or `as any` for test mocks?

**A:** Try `vi.mocked()` first (Vitest 3.x+), fall back to `as any` if needed.

**Preferred approach (Vitest 3.x+):**

```typescript
// ✅ Try this first
const mockFn = vi.mocked(module.function);
// Provides proper type inference for mock methods
```

**Fallback for complex cases:**

```typescript
// ✅ Use when vi.mocked() has type mismatches
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mock cast: Vitest types don't match Prisma delegates
const mockFn = module.function as any;
```

**Why this approach:**

- Modern Vitest (3.x+) has better mock typing than older versions
- `vi.mocked()` works in most cases without `any`
- `as any` still needed for complex Prisma delegates or generics
- Document reason when using fallback

**Our codebase:** See `app/src/server/a3/operations.test.ts` for examples

### Q: When should I use `unknown` vs `any`?

**Production code:**

- ✅ `unknown` - Forces type checking before use
- ❌ `any` - Disables all type checking

**Test mocks:**

- ✅ `vi.mocked()` - Try this first (Vitest 3.x+)
- ✅ `as any` - Fallback for complex type mismatches (with inline comment)
- ❌ `as unknown` - Doesn't solve mock type issues

### Q: Can I use `@ts-ignore`?

**A:** Almost never. Use:

1. Proper types first
2. Inline `eslint-disable` with comment if unavoidable
3. `@ts-expect-error` if you're testing error handling

`@ts-ignore` silences errors without explanation - use `eslint-disable` with comment instead.

---

## Summary

**Production Operations:** Properly typed with Wasp's generated types (GetA3, CreateA3, etc.)

**Helper Functions:** Prefer delegate pattern, fall back to context any:

1. **🥇 Delegate pattern** (0 any) - Pass specific Prisma delegates (1-2 entities)
2. **⚠️ Context any** with doc - Only for complex helpers needing 3+ entities

**Test Mocking:** Modern Vitest approach:

1. **✅ Try `vi.mocked()`** first (Vitest 3.x+ provides proper typing)
2. **✅ Fallback to `as any`** for complex Prisma delegates (with inline comment)
3. Test business logic still properly typed

**When in doubt:**

1. Helper needs 1-2 entities? → Use delegate pattern (0 any)
2. Helper needs 3+ entities? → Consider `context: any` with doc comment
3. Test mock? → Try `vi.mocked()` first, fall back to `as any` if needed
4. Does this compromise operation type safety? If no, pragmatism wins.

**Key Principle:** Wasp 0.18 operations get automatic type inference. Helpers outside operations don't - use delegate pattern where possible, document when context: any is needed.

---

**Version:** 2.0
**Last Updated:** 2025-10 (Q3 2025)
**Stack:** Wasp 0.18.0, Vitest 3.2.4, TypeScript 5.8.2
**Review Cycle:** Quarterly or when linting patterns change
**Owner:** Technical Lead
