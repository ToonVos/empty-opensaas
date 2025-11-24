# Documentation Directory Guide

**AUTO-LOADED**: This file is automatically loaded by Claude Code when you work with files in the `docs/` directory.

**Parent context**: Root CLAUDE.md provides project overview and file location rules.

---

## What Belongs in docs/

**Permanent project documentation** that serves as reference for the team:

- Architecture guides
- Development workflows (TDD, CI/CD, troubleshooting)
- Code organization and conventions
- Team structure and philosophy
- Technical specifications
- Security guidelines

**See [README.md](README.md) for complete list of docs.**

---

## What Does NOT Belong in docs/

**Do NOT put these here:**

| File Type                                | Correct Location | Guide                                                                   |
| ---------------------------------------- | ---------------- | ----------------------------------------------------------------------- |
| **Task plans** (sprints, daily tasks)    | `tasks/`         | [tasks/CLAUDE.md](../tasks/CLAUDE.md)                                   |
| **Reports** (QA, security audits)        | `reports/`       | [reports/security-audit/CLAUDE.md](../reports/security-audit/CLAUDE.md) |
| **Temporary files** (scripts, temp data) | `.tmp/`          | [.tmp/CLAUDE.md](../.tmp/CLAUDE.md)                                     |

**→ See root CLAUDE.md (#do-not-touch)** for complete file location rules.

---

## Key Principle

**docs/ = Future reference**
If it's temporary or task-specific → it doesn't belong here.
