# Claude Code MCP Configuration

This directory contains Model Context Protocol (MCP) server configurations for Claude Code.

## Configured MCP Servers

### Playwright Browser Automation

**Package**: `@playwright/mcp` (Microsoft Official)
**Purpose**: Browser automation and testing via Playwright

#### Available Tools

| Tool                                | Description     | Use Case                             |
| ----------------------------------- | --------------- | ------------------------------------ |
| `playwright_navigate`               | Navigate to URL | Open HTML prototypes, localhost apps |
| `playwright_screenshot`             | Take screenshot | Visual reference, comparison         |
| `playwright_click`                  | Click element   | Test interactions                    |
| `playwright_fill`                   | Fill input      | Test forms                           |
| `playwright_evaluate`               | Run JavaScript  | Inspect DOM, extract data            |
| `playwright_accessibility_snapshot` | Get a11y tree   | Accessibility testing                |

#### Usage Examples

**Screenshot HTML Prototype:**

```typescript
// Claude Code can use:
playwright_navigate({ url: "file:///path/to/prototype.html" });
playwright_screenshot({ path: "./screenshots/prototype.png" });
```

**Test Local Component:**

```typescript
// With wasp start running on localhost:3000:
playwright_navigate({ url: "http://localhost:3000/a3/editor" });
playwright_click({ selector: 'button[data-testid="save"]' });
playwright_screenshot({ path: "./test-results/editor.png" });
```

**Visual Regression Testing:**

```typescript
// Compare ShadCN component with Ant Design version:
playwright_navigate({ url: "http://localhost:3000/components/button" });
playwright_screenshot({ path: "./comparison/button-shadcn.png" });
```

## Integration with Wasp

This MCP setup integrates seamlessly with our existing Playwright E2E test setup:

- **Test Framework**: Uses same `@playwright/test` as `/e2e-tests`
- **Browser Config**: Reuses `playwright.config.ts` settings
- **Compatibility**: Works with Wasp dev server (localhost:3000)

## Use Cases for Component Conversion

### 1. Visual Reference

- Screenshot HTML prototypes from `/leanproject-design-export`
- Compare Ant Design vs ShadCN implementations
- Validate responsive breakpoints

### 2. Component Testing

- Test converted ShadCN components in browser
- Validate interactions (click, hover, type)
- Check accessibility tree

### 3. E2E Validation

- Test A3 workflow end-to-end
- Validate multi-step forms
- Test AI chat integration

### 4. Responsive Testing

- Test mobile layouts (375px, 768px)
- Validate tablet breakpoints
- Check desktop views (1024px+)

## Troubleshooting

**MCP Server Not Loading?**

- Restart Claude Code: `/doctor` then reload
- Check Node.js version: `node --version` (requires 18+)
- Install Playwright browsers: `npx playwright install`

**Connection Errors?**

- Ensure `wasp start` is running for localhost tests
- Check port 3000 is available
- Verify Playwright is installed in project

## Documentation

- **Official MCP Docs**: https://github.com/microsoft/playwright-mcp
- **Playwright Docs**: https://playwright.dev
- **Wasp Testing**: https://wasp.sh/docs/testing

---

**Last Updated**: 2025-10-17
**Maintained By**: OpenSaaS Boilerplate Development Team
