# Cleanup Temporary Files

**Interactive cleanup of temporary files in `.tmp/` directory**

---

## Task: Provide Interactive Temporary Files Cleanup

### MANDATORY STEPS (DO ALL EXACTLY):

#### 1. Show Current Status

First, show the user statistics about temporary files:

```bash
# Run these commands in parallel
npm run list:temp
echo "---"
find .tmp -type f ! -name 'README.md' ! -name 'CLAUDE.md' ! -name '.gitkeep' -exec stat -f "%Sm %N" -t "%Y-%m-%d" {} \; 2>/dev/null | sort
echo "---"
du -sh .tmp/
```

#### 2. Present Cleanup Options

Present the user with these options:

**Available cleanup commands:**

- `npm run clean:temp:old` - Remove files older than 7 days (safe)
- `npm run clean:temp` - Remove ALL temporary files (keeps docs)
- `npm run clean:temp:all` - Remove all + verify structure (keeps docs)
- `npm run list:temp` - Just list files (no cleanup)

#### 3. Ask User

Ask the user which cleanup action they want to perform:
"Which cleanup would you like to run? (old/all/list/cancel)"

#### 4. Execute Chosen Action

Based on user's choice:

- If "old": Run `npm run clean:temp:old`
- If "all": Run `npm run clean:temp:all`
- If "list": Run `npm run list:temp` only
- If "cancel": Exit without cleanup

#### 5. Show Results

After cleanup, show:

- Success message from npm script
- Current temp files status with `npm run list:temp`
- Disk space freed (compare before/after)

---

## IMPORTANT NOTES:

1. **NEVER remove README.md or CLAUDE.md** - These are documentation files
2. **NEVER remove .gitkeep files** - These preserve directory structure
3. **Verify structure after cleanup** - Ensure scripts/, tests/, data/ exist
4. **Show clear feedback** - User should see what was removed

---

## Example Interaction:

```
User: /cleanup-temp

Claude: I'll check the current temporary files status.

[Shows output of npm run list:temp]
[Shows file ages]
[Shows disk usage]

You have 5 temporary files using 2.4 MB:
- 2 files older than 7 days (1.8 MB)
- 3 recent files (0.6 MB)

Available cleanup commands:
- old: Remove files older than 7 days (safe, removes ~1.8 MB)
- all: Remove ALL temporary files (removes ~2.4 MB)
- list: Just list files (no cleanup)
- cancel: Exit without cleanup

Which cleanup would you like to run?

User: old

Claude: Running cleanup for old files...

[Executes npm run clean:temp:old]

✓ Cleanup complete!
- Removed 2 files (1.8 MB)
- 3 files remaining (0.6 MB)

[Shows updated npm run list:temp]
```

---

## Edge Cases:

1. **No temporary files found**: Inform user, no cleanup needed
2. **All files are recent**: Suggest manual review before cleanup
3. **Large files found**: Warn user about size before deletion
4. **.tmp/ directory missing**: Offer to recreate with npm run clean:temp:all
