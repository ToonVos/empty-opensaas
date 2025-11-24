# Day XX - Sprint N - [YYYY-MM-DD]

<!-- Optional: Auto-generated via /breakdown command -->
<!-- Generated from: [PLAN or SPEC file path] -->
<!-- Worktree: [worktree-name] -->
<!-- Branch: feature/[branch-name] -->

## Goals

<!-- Use [P] marker for parallel work, [ ] for sequential -->

- [P] Goal 1 (parallel with other worktrees)
- [P] Goal 2 (parallel with other worktrees)
- [ ] Goal 3 (sequential, depends on other worktree)

## Tasks

### [P] Task 1: [Task Name]

**Branch:** feature/XX-description
**Status:** ⏳ Pending | 🔄 In Progress | ✅ Done | ❌ Blocked

<!-- Optional fields for coordinated work -->

**Parallel:** ✅ Can run simultaneously with worktree [other-worktree]

<!-- OR -->

**Depends on:** [Other worktree] Task [N] completed
**Coordination:** [What needs to happen first, e.g., "Pull feature/other-branch"]

<!-- Optional: TDD phase and agent recommendation -->

**TDD Phase:** Schema | RED | GREEN | REFACTOR | Component
**Agent:** wasp-migration-helper | wasp-test-automator | wasp-code-generator | wasp-refactor-executor

**Steps:**

1. [ ] Step 1
2. [ ] Step 2
3. [ ] Step 3

<!-- Optional: Specify files being modified -->

**Files:**

- app/[path]/[file].ts
- app/main.wasp

<!-- Optional: What should exist after task completes -->

**Expected Output:**

- [What should be created/modified]

<!-- Optional: How to verify task is complete -->

**Validation:**

- [ ] Tests pass
- [ ] Types available
- [ ] wasp start works

**Notes:**

- Note 1
- Note 2

---

### Task 2: [Task Name]

**Branch:** feature/XX-description
**Status:** ⏳ Pending

**Steps:**

1. [ ] Step 1
2. [ ] Step 2

**Notes:**

- Note 1

---

## Blockers

<!-- List coordination blockers if applicable -->

- None
<!-- OR -->
- ⏸️ Waiting for [worktree] to push schema changes
- ⏸️ Waiting for PR #[X] to merge

## Coordination Notes

<!-- Optional: For multi-worktree coordination -->

**Schema Changes:**

- [ ] [Worktree X] must migrate first
- [ ] Pull feature/[branch] before our migration

**Merge Dependencies:**

- [ ] PR #[X] must merge before we can proceed

## Learnings

- Learning 1
- Learning 2

## Tomorrow

- Continue with [next phase]
- Start [next task]

## References

<!-- Optional: Links to related docs -->

- Plan: [PLAN file path]
- Spec: [SPEC file path]
- Guide: docs/TDD-WORKFLOW.md
