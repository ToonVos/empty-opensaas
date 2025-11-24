# Skills Development Guide

**AUTO-LOADED**: When working in `.claude/skills/` directory.

**See also**: `README.md` for complete skill overview and catalog.

---

## Quick Format

```yaml
---
name: skill-name
description: What this skill does and when to use it (include trigger keywords)
triggers: ["keyword1", "keyword2", "keyword3"]
version: 1.0
last_updated: 2025-10-18
---

# Skill Name

One-line summary of what this skill provides.

## Purpose

1-2 sentences explaining when to use this skill.

## Quick Reference

[Table/checklist of common patterns]

## Complete Workflow

[Step-by-step procedures with examples]

## Examples

[Copy-paste ready code examples]

## Common Pitfalls

[❌ Wrong vs ✅ Correct patterns]

## References

- Related skills
- Templates
- Documentation
```

---

## Best Practices

**Description:**

- Include natural language triggers ("error", "test", "auth")
- Be specific about what skill covers
- Mention key frameworks/tools

**Triggers:**

- User's natural language (what they'd type)
- Technical terms (error codes, framework names)
- Variations ("test", "tests", "testing")

**Content:**

- Focus on ONE capability per skill (composable)
- Complete workflows (end-to-end)
- Copy-paste ready examples
- Use ✅/❌ markers for clarity
- Reference templates instead of duplicating

**Length:**

- As long as needed for complete workflow
- 200-1,200 lines typical
- ~650-5,500 tokens

---

## Skill Tiers

**Tier 1: Critical** (always recommended)

- Core framework patterns (wasp-operations, tdd-workflow)
- High-frequency use (shadcn-ui)

**Tier 2: High Value** (frequently needed)

- Problem solving (troubleshooting-guide)
- Common workflows (wasp-database, wasp-auth)

**Tier 3: Medium Value** (specialized)

- Advanced patterns (error-handling, permissions)
- Optional features (wasp-jobs)

---

## Token Economics

**Skills load on-demand:**

- Not all skills load at once
- Claude selects 1-2 relevant skills per task
- Typical: ~3,000-6,000 tokens per task

**Efficiency:**

- Always-loaded: ~8,300 tokens (CLAUDE.md files)
- Skills (on-demand): +650 to +5,500 tokens
- **Total per task**: ~9,000-14,000 tokens

---

## Creating a New Skill

1. **Create directory:** `.claude/skills/new-skill-name/`
2. **Create SKILL.md** with YAML frontmatter (see format above)
3. **Add content:**
   - Purpose (when to use)
   - Quick reference (cheatsheet)
   - Complete workflow (step-by-step)
   - Examples (copy-paste ready)
   - Common pitfalls (❌ vs ✅)
   - References (related skills, docs)
4. **Update README.md** with skill entry in appropriate tier

---

## Common Patterns

**Cross-referencing skills:**

```markdown
Refer to **wasp-operations** skill for operation patterns.
See **error-handling** skill for HTTP status codes.
```

**Copy-paste ready examples:**

```typescript
// ✅ CORRECT - Descriptive comment
export const operation = async (args, context) => {
  if (!context.user) throw new HttpError(401);
  // ... implementation
};

// ❌ WRONG - What not to do
export const operation = (args, context) => {
  // Missing auth check!
};
```

**Checklists:**

```markdown
Before committing:

- [ ] Tests pass
- [ ] Linter clean
- [ ] Types correct
```

---

## References

- **README.md** - Complete skill catalog
- **Root CLAUDE.md** - Universal rules
- **app/CLAUDE.md** - Wasp patterns
- **docs/LINTING-STANDARDS.md** - Type safety standards
