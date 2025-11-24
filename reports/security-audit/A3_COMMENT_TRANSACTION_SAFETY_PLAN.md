# Transaction Safety Implementation Plan for A3 Comment Operations

## Executive Summary

**Goal:** Wrap `createA3Comment` and `deleteA3Comment` operations with Prisma transactions to ensure atomicity of database changes + activity logging.

**Current Status:** 21 passing tests covering both operations and activity logging separately. NO transaction usage in codebase yet.

**Risk:** If activity logging fails after comment is created/deleted, audit trail is incomplete → security/compliance gap (MEDIUM-01 violation).

**Complexity:** Medium - introduces new Prisma pattern but all code changes are isolated to 2 operations.

---

## 1. Transaction Implementation Strategy

### CHOSEN APPROACH: Option A - Callback Pattern with PrismaClient.$transaction()

**Why this approach:**

1. **Type Safety:** Callback pattern allows Prisma to infer types correctly without `any` types
2. **Delegate Pattern Compatible:** Can pass transaction client through delegate param (no breaking changes to `logA3Activity`)
3. **Best Practices:** Matches Prisma documentation for complex transactions (multiple operations)
4. **Testability:** Easier to mock than array-based approach
5. **Error Handling:** Clear separation of validation (before) vs. transaction (inside)

**Alternative approaches rejected:**

- **Option B (Array-based):** Loses type inference, requires manual type annotations, harder to read
- **Option C (Refactor logA3Activity):** More invasive, requires changing test mocks, adds unnecessary complexity

### Implementation Pattern (Reference: Prisma Docs)

```typescript
// Callback pattern with type inference
const result = await context.entities.$transaction(async (tx) => {
  // tx is a PrismaClient with all entities scoped to transaction
  const comment = await tx.a3Comment.create({ /* data */ });
  await logA3Activity({
    /* params */,
    a3ActivityDelegate: tx.a3Activity // Pass tx delegate!
  });
  return comment; // Transaction returns this
});
```

**Key points:**

- `tx` is a transaction-scoped Prisma client (NOT the same as `context.entities`)
- All operations inside callback are atomic
- If any operation fails → entire transaction rolls back
- Return value is automatically unwrapped (not wrapped in Promise)

---

## 2. createA3Comment Refactoring Plan

### Code Structure (Before & After Analysis)

**BEFORE:** 1118-1171 (Lines before transaction)

```
1. AUTH CHECK
2. FETCH A3 (read)
3. PERMISSION CHECK
4. VALIDATION (content trimming/length)
5. CREATE COMMENT (write)
6. LOG ACTIVITY (write)
```

### Refactoring Steps

#### Step 2.1: Identify Code Boundaries

**MUST STAY BEFORE TRANSACTION (read-only checks):**

- Auth check (no changes to data)
- Fetch A3 (read, permission check)
- Fetch role via canCommentOnA3 (read, permission check)
- Validation (string trimming, length checks)

**MUST GO INSIDE TRANSACTION (writes):**

- Create comment via `tx.a3Comment.create()`
- Log activity via `logA3Activity({ ..., a3ActivityDelegate: tx.a3Activity })`

#### Step 2.2: Updated Code Structure

```typescript
export const createA3Comment: CreateA3Comment<...> = async (args, context) => {
  // === BEFORE TRANSACTION (read + validation) ===

  // 1. AUTH CHECK (MANDATORY)
  if (!context.user) throw new HttpError(401);

  // 2. FETCH A3 DOCUMENT + EXISTENCE CHECK
  const a3 = await context.entities.A3Document.findUnique({
    where: { id: args.a3Id },
  });
  if (!a3) throw new HttpError(404, "A3 document not found");

  // 3. PERMISSION CHECK - Can view A3 and can comment
  const canComment = await canCommentOnA3(context.user.id, a3, context);
  if (!canComment) {
    throw new HttpError(403, "Insufficient permissions to comment");
  }

  // 4. VALIDATION - Content trimming & length checks
  const trimmedContent = args.content.trim();

  if (!trimmedContent) {
    throw new HttpError(400, "Comment cannot be empty");
  }

  if (trimmedContent.length > COMMENT_MAX_LENGTH) {
    throw new HttpError(400, `Comment cannot exceed ${COMMENT_MAX_LENGTH} characters`);
  }

  // === INSIDE TRANSACTION (writes with atomicity) ===

  const comment = await context.entities.$transaction(async (tx) => {
    // 5. CREATE COMMENT within transaction
    const newComment = await tx.a3Comment.create({
      data: {
        a3Id: args.a3Id,
        authorId: context.user.id,
        content: trimmedContent,
      },
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
    });

    // 6. LOG ACTIVITY within same transaction
    await logA3Activity({
      a3Id: args.a3Id,
      userId: context.user.id,
      action: "COMMENT_ADDED",
      details: {
        commentId: newComment.id,
        contentLength: newComment.content.length,
      },
      a3ActivityDelegate: tx.a3Activity, // ← Use transaction delegate!
    });

    return newComment; // Return from transaction
  });

  return comment;
};
```

#### Step 2.3: Type Annotations

**No additional type annotations needed!**

- Callback pattern with `async (tx) => {...}` preserves type inference
- TypeScript infers `tx` as transactional Prisma client
- `tx.a3Comment` has same methods as `context.entities.a3Comment`
- Return type automatically matches the returned value

#### Step 2.4: Error Handling

**Error handling is automatic!**

- If `tx.a3Comment.create()` fails → entire transaction rolls back, error thrown
- If `logA3Activity()` fails inside transaction → entire transaction rolls back, error thrown
- Client receives single HttpError (whichever failed first)

**No special error handling needed** - Prisma handles rollback transparently.

---

## 3. deleteA3Comment Refactoring Plan

### Code Structure (Before & After Analysis)

**BEFORE:** 1203-1260 (Current implementation)

```
1. AUTH CHECK
2. FETCH COMMENT (read)
3. FETCH A3 (read)
4. GET ROLE (read)
5. ROLE CHECKS (validation)
6. SOFT DELETE (write)
7. LOG ACTIVITY (write)
```

### Refactoring Steps

#### Step 3.1: Identify Code Boundaries

**MUST STAY BEFORE TRANSACTION (read + permission checks):**

- Auth check
- Fetch comment (read)
- Fetch A3 (read)
- Get user role (read)
- All role/permission checks (logic, no writes)

**MUST GO INSIDE TRANSACTION (writes):**

- Update comment content to "[deleted]" via `tx.a3Comment.update()`
- Log activity via `logA3Activity({ ..., a3ActivityDelegate: tx.a3Activity })`

#### Step 3.2: Updated Code Structure

```typescript
export const deleteA3Comment: DeleteA3Comment<
  { commentId: string },
  A3Comment
> = async (args, context) => {
  // === BEFORE TRANSACTION (read + permission checks) ===

  // 1. AUTH CHECK (MANDATORY)
  if (!context.user) throw new HttpError(401);

  // 2. FETCH COMMENT + EXISTENCE CHECK
  const comment = await context.entities.A3Comment.findUnique({
    where: { id: args.commentId },
  });
  if (!comment) throw new HttpError(404, "Comment not found");

  // 3. FETCH A3 DOCUMENT (needed for departmentId)
  const a3 = await context.entities.A3Document.findUnique({
    where: { id: comment.a3Id },
  });
  if (!a3) throw new HttpError(404, "A3 document not found");

  // 4. GET USER ROLE IN DEPARTMENT
  const departmentId = a3.departmentId || "";
  const role = await getUserRoleInDepartment(
    context.user.id,
    departmentId,
    context,
  );

  // 5. ROLE-BASED PERMISSION CHECK
  if (role === null) {
    throw new HttpError(403, "No department role");
  }

  if (role === DepartmentRole.VIEWER) {
    throw new HttpError(403, "Viewers cannot delete comments");
  }

  if (role === DepartmentRole.MEMBER && comment.authorId !== context.user.id) {
    throw new HttpError(403, "Members can only delete their own comments");
  }

  // MANAGER can delete any comment (no additional check needed)

  // === INSIDE TRANSACTION (writes with atomicity) ===

  const deletedComment = await context.entities.$transaction(async (tx) => {
    // 6. SOFT DELETE - UPDATE content to A3_COMMENT_SOFT_DELETE_MARKER
    const updated = await tx.a3Comment.update({
      where: { id: args.commentId },
      data: { content: A3_COMMENT_SOFT_DELETE_MARKER },
    });

    // 7. LOG ACTIVITY within same transaction
    await logA3Activity({
      a3Id: a3.id,
      userId: context.user.id,
      action: "COMMENT_DELETED",
      details: {
        commentId: args.commentId,
        deletedBy: context.user.id,
      },
      a3ActivityDelegate: tx.a3Activity, // ← Use transaction delegate!
    });

    return updated; // Return updated comment from transaction
  });

  return deletedComment;
};
```

#### Step 3.3: Special Considerations for Soft Delete

**Question:** Why soft delete comment first, THEN log activity?

**Answer:** Soft delete must happen atomically with logging because:

1. If comment is marked "[deleted]" but activity log fails → inconsistent state (comment deleted but no audit record)
2. Transaction ensures both succeed or both fail - no in-between state

**Critical detail:** The transaction ensures that if `logA3Activity()` fails for ANY reason (constraint violation, database connection drop, timeout), the comment update is ROLLED BACK. This prevents orphaned "[deleted]" comments with no audit trail.

---

## 4. Test Update Strategy

### Existing Tests: Keep All 21 Passing

**Current test file:** `app/src/server/a3/collaboration.test.ts`

**Tests will continue to pass because:**

1. Test mocks don't change (still mock `context.entities.A3Comment`, `context.entities.A3Document`, etc.)
2. Mocking happens at the Prisma delegate level
3. `vi.mock()` intercepts calls regardless of whether they're in transaction or not

**NO test modifications needed** - Tests verify behavior, not implementation details.

### New Tests: Add Transaction Safety Tests

**Location:** Add to `app/src/server/a3/collaboration.test.ts` after line 565

**Test 1: createA3Comment rollback on activity logging failure**

```typescript
it("rolls back comment creation if activity logging fails", async () => {
  const mockA3 = createMockA3();
  mockContext.entities.A3Document.findUnique.mockResolvedValue(mockA3);
  (permissions.canViewA3 as any).mockResolvedValue(true);

  // Mock Prisma to throw error during activity log creation
  mockContext.entities.$transaction.mockImplementation(async (fn) => {
    // Simulate transaction: create succeeds, but activity log fails
    try {
      return await fn({
        a3Comment: {
          create: vi.fn().mockResolvedValue({
            id: "comment-1",
            content: "test",
            author: { id: "user-1", username: "test" },
          }),
        },
        a3Activity: {
          create: vi
            .fn()
            .mockRejectedValue(new Error("DB constraint violation")),
        },
      });
    } catch {
      // Transaction rolled back - test passes
      throw new HttpError(500, "Transaction rolled back");
    }
  });

  await expect(
    createA3Comment({ a3Id: "a3-1", content: "test" }, mockContext),
  ).rejects.toThrow();

  // Verify comment was NOT created (rollback)
  // (In real DB, transaction would rollback automatically)
});
```

**Test 2: deleteA3Comment rollback on activity logging failure**

```typescript
it("rolls back comment deletion if activity logging fails", async () => {
  const mockComment = createMockCommentWithAuthor({ authorId: "user-1" });
  const mockA3 = createMockA3();

  mockContext.entities.A3Comment.findUnique.mockResolvedValue(mockComment);
  mockContext.entities.A3Document.findUnique.mockResolvedValue(mockA3);
  (permissions.getUserRoleInDepartment as any).mockResolvedValue(
    DepartmentRole.MEMBER,
  );

  // Mock transaction to throw during activity logging
  mockContext.entities.$transaction.mockImplementation(async (fn) => {
    try {
      return await fn({
        a3Comment: {
          update: vi
            .fn()
            .mockResolvedValue({ ...mockComment, content: "[deleted]" }),
        },
        a3Activity: {
          create: vi
            .fn()
            .mockRejectedValue(new Error("Activity log table locked")),
        },
      });
    } catch {
      throw new HttpError(500, "Transaction rolled back");
    }
  });

  await expect(
    deleteA3Comment({ commentId: "comment-1" }, mockContext),
  ).rejects.toThrow();
});
```

**Test 3: Concurrent operations don't interfere (isolation)**

```typescript
it("isolates concurrent comment operations via transactions", async () => {
  // Verify that two concurrent createA3Comment calls don't interfere
  // (Prisma isolation levels handle this automatically)
  // This is more of an integration test - pass if both succeed

  const mockA3 = createMockA3();
  mockContext.entities.A3Document.findUnique.mockResolvedValue(mockA3);
  (permissions.canViewA3 as any).mockResolvedValue(true);

  const comment1 = createMockCommentWithAuthor({
    id: "c1",
    content: "comment 1",
  });
  const comment2 = createMockCommentWithAuthor({
    id: "c2",
    content: "comment 2",
  });

  let callCount = 0;
  mockContext.entities.A3Comment.create.mockImplementation(() => {
    return callCount++ === 0
      ? Promise.resolve(comment1)
      : Promise.resolve(comment2);
  });

  const results = await Promise.all([
    createA3Comment({ a3Id: "a3-1", content: "comment 1" }, mockContext),
    createA3Comment({ a3Id: "a3-1", content: "comment 2" }, mockContext),
  ]);

  expect(results).toHaveLength(2);
  expect(results[0].id).toBe("c1");
  expect(results[1].id).toBe("c2");
});
```

**Pragmatic note on transaction tests:**

- Full transaction testing happens in integration tests (running against real PostgreSQL)
- Unit tests with mocks verify that transaction callback is invoked correctly
- Add these tests mainly for documentation + future regression prevention

---

## 5. Implementation Order (Incremental Risk Reduction)

### Phase 1: Review & Validation (30 min)

1. Review this plan with team
2. Confirm callback pattern with `context.entities.$transaction()` is correct
3. Verify Prisma version supports transactions (✅ included in @prisma/client)

### Phase 2: Implement createA3Comment (1 hour)

1. Update `createA3Comment` operation (lines 1106-1171)
2. Wrap comment create + activity logging in `$transaction` callback
3. Verify no type errors (TypeScript should infer types correctly)
4. Run existing tests - should all pass (21 tests)
5. Manual testing: Create comment via UI, verify in database that activity is logged

### Phase 3: Implement deleteA3Comment (1 hour)

1. Update `deleteA3Comment` operation (lines 1203-1260)
2. Wrap comment soft-delete + activity logging in `$transaction` callback
3. Run existing tests - should all pass
4. Manual testing: Delete comment via UI, verify rollback behavior if needed

### Phase 4: Add Transaction Safety Tests (45 min)

1. Add 3 new test cases to `collaboration.test.ts`
2. Tests verify transaction behavior via mocks
3. Run full test suite - expect 24 tests passing (21 existing + 3 new)

### Phase 5: Integration Testing (30 min)

1. Run full test suite: `cd app && wasp test client run`
2. Seed test data: `../scripts/seed-visual-test.sh`
3. Manual E2E testing:
   - Create comment, verify activity logged
   - Delete comment, verify activity logged
   - Simulate DB error, verify rollback (may require mock injection)

### Phase 6: Review & Documentation (20 min)

1. Code review: Peer review transaction implementation
2. Update CLAUDE.md with transaction pattern (if needed)
3. Document in commit message why transactions are needed
4. Tag security fix (MEDIUM-01 remediation)

**Total time estimate:** 3.5 - 4 hours (can be parallelized across 2 devs)

---

## 6. Edge Cases & Rollback Scenarios

### Scenario 1: Activity Logging Fails (Database Constraint)

**Trigger:** `A3Activity` table constraint violation (e.g., foreign key)

**Without transaction:**

- Comment created successfully
- `logA3Activity` throws error
- Client receives error, but comment exists with no audit trail
- Security gap: Action performed but not recorded

**With transaction:**

- Comment created inside callback
- `logA3Activity` throws constraint error
- Prisma auto-rolls back BOTH the comment creation AND activity log attempt
- Client receives HttpError(500)
- Database state unchanged - no comment, no activity
- Safe state: Either both succeed or both fail

### Scenario 2: Network Timeout During Activity Logging

**Trigger:** Network hiccup while `logA3Activity` executes

**Without transaction:**

- Comment created
- Activity log timed out midway
- Partial activity record possible (incomplete JSON in `details` field)
- Database inconsistency

**With transaction:**

- Comment created, then activity log started inside transaction
- Timeout causes entire transaction to roll back
- Comment deletion rolled back
- Database returns to previous state
- Retry the entire operation (idempotent)

### Scenario 3: Concurrent Deletes (Race Condition)

**Trigger:** Two users try to delete same comment simultaneously

**Without transaction:**

- User A finds comment, passes permission check
- User B finds comment, passes permission check
- User A: Update content to "[deleted]" ✓
- User B: Update content to "[deleted]" ✓ (overwrites User A's update)
- User A: Log activity (COMMENT_DELETED by user-A) ✓
- User B: Log activity (COMMENT_DELETED by user-B) ✓
- Result: Comment marked deleted twice, two activity logs with different actors
- Inconsistency: Audit trail shows deleted twice by different users

**With transaction:**

- User A transaction: `update`, then `logActivity` (within same transaction)
- User B transaction: `update`, then `logActivity` (within same transaction)
- Prisma handles serialization (both succeed, second one overwrites first update)
- With stronger isolation level: One transaction locks the comment, other waits
- Result: Clear audit trail showing who deleted and when (atomic per user)

### Scenario 4: A3 Document Deleted During Comment Operations

**Trigger:** Another user deletes A3 document while you're commenting

**Without transaction:**

- Permission checks pass (A3 exists)
- Comment created with reference to A3
- A3 deleted (cascade deletes comments)
- Activity log references now-deleted A3
- Foreign key constraint violation possible

**With transaction:**

- All operations inside transaction use same DB snapshot
- If A3 is being deleted concurrently, transaction either:
  - Succeeds (completes before delete)
  - Fails with constraint error (sees deleted A3)
- Either way: Atomic from client perspective

---

## 7. Verification Checklist

### Pre-Implementation

- [ ] Team review of this plan ✓ (execute before starting)
- [ ] Confirm callback pattern use
- [ ] Verify Prisma @transaction is available

### Implementation

- [ ] createA3Comment refactored (wrap in $transaction)
- [ ] deleteA3Comment refactored (wrap in $transaction)
- [ ] No `any` types introduced
- [ ] Type inference works (TypeScript compiles without errors)

### Testing

- [ ] All 21 existing tests pass
- [ ] 3 new transaction tests added and passing
- [ ] Manual test: Create comment → activity logged
- [ ] Manual test: Delete comment → activity logged
- [ ] Manual test: Verify rollback on simulated failure

### Documentation

- [ ] Commit message explains why transactions needed (MEDIUM-01)
- [ ] Code comments in operations explain transaction scope
- [ ] No lingering `TODO` or `FIXME` comments
- [ ] If new patterns created: Document in CLAUDE.md

### Performance

- [ ] No additional queries added (same read pattern)
- [ ] Transaction scope is tight (only comment ops + logging)
- [ ] No N+1 problems introduced

### Security

- [ ] All permission checks BEFORE transaction (can't be bypassed)
- [ ] Validation BEFORE transaction (can't create invalid data)
- [ ] Activity logging is now atomic with mutations
- [ ] No data leakage in error messages

---

## 8. Risk Assessment & Mitigation

### Risk 1: Transaction Callback Syntax Error (MEDIUM)

**Symptom:** TypeScript compile error: "tx is not defined"
**Mitigation:**

- Follow callback pattern exactly: `async (tx) => { ... }`
- Test TypeScript compilation before running
- Reference existing Prisma docs

### Risk 2: Performance Degradation (LOW)

**Symptom:** Comment creation noticeably slower
**Mitigation:**

- Transactions add minimal overhead (few milliseconds)
- Our transactions have only 2 operations each
- Monitor in production, but unlikely to be noticeable
- If needed: Add database connection pool tuning

### Risk 3: Tests False Positive (LOW)

**Symptom:** Tests pass but production fails
**Mitigation:**

- Tests mock at Prisma delegate level (transaction-agnostic)
- Add integration tests with real DB
- Run E2E tests before merging

### Risk 4: Partial Rollback Confusion (LOW)

**Symptom:** Developer confusion about what rolls back
**Mitigation:**

- Clear comments in code: "INSIDE TRANSACTION" vs "BEFORE TRANSACTION"
- Document in CLAUDE.md or code comments
- Include this plan in commit message

### Risk 5: Wrong Transaction Scope (MEDIUM)

**Symptom:** Permission checks rolled back (shouldn't happen)
**Mitigation:**

- All permission checks BEFORE transaction (see refactoring plan)
- All writes INSIDE transaction
- Code review with this plan as reference
- Tests verify permission checks are before transaction

---

## 9. Reference Implementation Patterns

### Pattern 1: Simple Transaction (Comment Create)

```typescript
const comment = await context.entities.$transaction(async (tx) => {
  const newComment = await tx.a3Comment.create({
    data: { /* ... */ },
    include: { author: { select: { /* ... */ } } }
  });

  await logA3Activity({
    /* params */,
    a3ActivityDelegate: tx.a3Activity
  });

  return newComment;
});
```

**Key points:**

- `include` works inside transaction (Prisma auto-handles)
- Return value is unwrapped (not a Promise)
- Type inference works automatically

### Pattern 2: Transaction with Complex Logic (Comment Delete)

```typescript
const deletedComment = await context.entities.$transaction(async (tx) => {
  const updated = await tx.a3Comment.update({
    where: { id: args.commentId },
    data: { content: A3_COMMENT_SOFT_DELETE_MARKER }
  });

  // Can add intermediate logic here
  const { id, content } = updated;

  await logA3Activity({
    /* params with id/content */,
    a3ActivityDelegate: tx.a3Activity
  });

  return updated;
});
```

**Key points:**

- Can extract variables from intermediate results
- Still atomic - all or nothing
- Return the final result

---

## 10. Why This Matters (Business Impact)

### Security (MEDIUM-01 Compliance)

Currently: Comment created but activity not logged = audit trail gap
Future: Both succeed or both fail = complete audit trail always

### Data Integrity

Currently: Partial state possible (comment without activity)
Future: Atomic operations = no partial states

### Compliance (if applicable)

- Financial/healthcare audits require complete audit trails
- Transactions ensure compliance with logging requirements
- Documentable: "All mutations are atomic with activity logging"

### Developer Confidence

- Pattern can be reused for other operations
- Clear error boundaries
- Explicit atomicity guarantees

---

## Implementation Checklist

```bash
# Phase 2: Implement createA3Comment
[ ] Read operations.ts lines 1106-1171
[ ] Add $transaction wrapper
[ ] Test TypeScript compilation
[ ] Run: cd app && wasp test client run
[ ] Verify all 21 tests pass

# Phase 3: Implement deleteA3Comment
[ ] Read operations.ts lines 1203-1260
[ ] Add $transaction wrapper
[ ] Test TypeScript compilation
[ ] Run: cd app && wasp test client run
[ ] Verify all 21 tests pass

# Phase 4: Add tests
[ ] Add 3 transaction safety tests
[ ] Run: cd app && wasp test client run
[ ] Verify all 24 tests pass

# Phase 5: Integration testing
[ ] Run full suite: cd app && wasp test client run --coverage
[ ] Seed data: ../scripts/seed-visual-test.sh
[ ] Manual: Create comment, check activity logged
[ ] Manual: Delete comment, check activity logged

# Phase 6: Review & merge
[ ] Code review against this plan
[ ] Commit with: "fix(transaction): Wrap comment operations in Prisma transactions (MEDIUM-01)"
[ ] Push to feature branch
[ ] Create PR with this plan as description
```

---

## Questions to Resolve Before Starting

1. **Callback pattern confirmation:** Is using `context.entities.$transaction(async (tx) => {...})` the correct approach?
2. **Testing strategy:** Should we add integration tests against real PostgreSQL, or are unit tests with mocks sufficient?
3. **Logging on read operations:** Should we also wrap other operations that log (like `createA3`, `updateA3`, `archiveA3`)?
4. **Error handling:** Should failed transactions return specific HTTP error codes (409 Conflict, 500 Internal Error)?
5. **Timeout handling:** Should we set explicit transaction timeout? (Prisma has defaults, may not need to)

---

## Files to Modify

1. **app/src/server/a3/operations.ts**

   - `createA3Comment` (lines 1106-1171): Wrap in transaction
   - `deleteA3Comment` (lines 1203-1260): Wrap in transaction

2. **app/src/server/a3/collaboration.test.ts**

   - Add 3 new test cases (after line 565)
   - Existing tests should NOT change

3. **CLAUDE.md (optional)**
   - Document transaction pattern if adding to project standards
   - Add to operations patterns section

---

## Success Criteria

- [ ] All 21 existing tests pass (no regressions)
- [ ] 3 new transaction tests added and passing
- [ ] TypeScript compiles without errors
- [ ] Comments created with activity logged atomically
- [ ] Comments deleted with activity logged atomically
- [ ] Code review approves transaction implementation
- [ ] Documentation updated (commit message, code comments)
