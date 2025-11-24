# Reports Directory

**Purpose**: Project reports and analysis outputs (QA reports, security audits, performance analysis).

## Directory Structure

```
reports/
├── qa/                    # QA test quality reports
├── security-audit/        # Security audit reports (OWASP Top 10)
├── performance/           # Performance analysis
└── README.md              # This file
```

## When to Create Reports

- **QA Reports**: After test quality audits
- **Security Reports**: After security audits (/security-tdd phase)
- **Performance Reports**: After performance testing or optimization

## Report Naming Convention

`YYYY-MM-DD-category-description.md`

Examples:

- `2024-01-15-qa-test-coverage-analysis.md`
- `2024-01-20-security-audit-owasp-top-10.md`
- `2024-01-25-performance-api-optimization.md`

## Archive Policy

- Archive reports older than 3 months to `reports/archive/YYYY-MM/`
- Keep reports relevant to active features
- Reference reports in commit messages when fixing issues

## See Also

- [docs/TDD-WORKFLOW.md](../docs/TDD-WORKFLOW.md) - Test quality guidelines
- [docs/SECURITY-RULES.md](../docs/SECURITY-RULES.md) - Security best practices
