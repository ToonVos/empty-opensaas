# Documentation Directory

This directory contains project documentation for Wasp-based applications using the Open SaaS template.

## Core Documentation

### Development Guides

- **[CLAUDE.md](CLAUDE.md)** - Directory-specific guide for Claude Code (auto-loaded when working in docs/)
- **[CODE-ORGANIZATION.md](CODE-ORGANIZATION.md)** - Master guide for directory structure, file naming, routing patterns, and code placement
- **[TEAM-STRUCTURE-AND-WASP-PHILOSOPHY.md](TEAM-STRUCTURE-AND-WASP-PHILOSOPHY.md)** - Wasp's feature-based architecture philosophy and full-stack development approach
- **[PLANNING-WORKFLOW.md](PLANNING-WORKFLOW.md)** - Complete workflow from feature planning to execution (/initiate → /specify → /plan → /breakdown)

### TDD & Testing

- **[TDD-WORKFLOW.md](TDD-WORKFLOW.md)** - Complete TDD workflow (RED → GREEN → REFACTOR → SECURITY), test quality verification, 5 quality criteria
- **[LESSONS-LEARNED.md](LESSONS-LEARNED.md)** - Living document template for capturing project learnings across sprints

### Code Standards

- **[CODE-STYLE.md](CODE-STYLE.md)** - Coding style conventions and formatting rules
- **[IMPORT-RULES.md](IMPORT-RULES.md)** - Wasp-specific import patterns (`wasp/` vs `@wasp/`, enum imports from `@prisma/client`)
- **[ERROR-HANDLING.md](ERROR-HANDLING.md)** - Error handling patterns (401/403/404/400 HTTP errors, operation error order)
- **[LINTING-STANDARDS.md](LINTING-STANDARDS.md)** - ESLint and Prettier configuration standards

### Security

- **[SECURITY-RULES.md](SECURITY-RULES.md)** - Security best practices (auth checks, secrets management, OWASP patterns)
- **[SECURITY-CHECKLIST.md](SECURITY-CHECKLIST.md)** - Security review checklist for features and commits
- **[SECURITY-EXCEPTIONS.md](SECURITY-EXCEPTIONS.md)** - Documented security exceptions and their justifications

### Infrastructure

- **[CI-CD-SETUP.md](CI-CD-SETUP.md)** - CI/CD pipeline, git hooks, GitHub Actions, branch strategy
- **[MULTI-WORKTREE-DEVELOPMENT.md](MULTI-WORKTREE-DEVELOPMENT.md)** - Multi-worktree development with database isolation and port management
- **[SEED-STRATEGY.md](SEED-STRATEGY.md)** - Demo user seeding strategy for development and testing
- **[VERSION-LOCKS.md](VERSION-LOCKS.md)** - Critical version locks (ShadCN v2.3.0, Node.js, React 18)
- **[REACT-19-FIX.md](REACT-19-FIX.md)** - React 19 compatibility fix after `wasp clean`

### Troubleshooting

- **[TROUBLESHOOTING-GUIDE.md](TROUBLESHOOTING-GUIDE.md)** - Comprehensive diagnostic procedures for all error types
- **[COMMON-PITFALLS.md](COMMON-PITFALLS.md)** - Common mistakes and their solutions

## Reference Documentation

### Framework Documentation (Archived)

- **[opensaas-docs-full.txt](opensaas-docs-full.txt)** - Complete Open SaaS template documentation (offline reference)

  - Source: https://docs.opensaas.sh/llms-full.txt
  - Size: ~109KB
  - Last Updated: October 15, 2025

- **[wasp-docs-full.txt](wasp-docs-full.txt)** - Complete Wasp framework documentation (offline reference)

  - Source: https://wasp.sh/llms-full.txt
  - Size: ~709KB
  - Last Updated: October 15, 2025

- **[online-directory.md](online-directory.md)** - Directory of online resources and references

## Online References

Live documentation available at:

- **Open SaaS Docs**: https://docs.opensaas.sh/
- **Wasp Framework Docs**: https://wasp.sh/docs/

## Usage

These documents serve as:

1. **Development Reference** - Patterns, conventions, and best practices
2. **Onboarding Guide** - Help new team members understand the project structure
3. **Offline Access** - Work without internet connection
4. **Version Control** - Track documentation changes alongside code

## Organization

Documentation is organized by topic:

| Category            | Files                                                                            |
| ------------------- | -------------------------------------------------------------------------------- |
| **Getting Started** | CLAUDE.md, CODE-ORGANIZATION.md, TEAM-STRUCTURE-AND-WASP-PHILOSOPHY.md           |
| **Development**     | PLANNING-WORKFLOW.md, TDD-WORKFLOW.md, SEED-STRATEGY.md                          |
| **Code Quality**    | CODE-STYLE.md, IMPORT-RULES.md, ERROR-HANDLING.md, LINTING-STANDARDS.md          |
| **Security**        | SECURITY-RULES.md, SECURITY-CHECKLIST.md, SECURITY-EXCEPTIONS.md                 |
| **Infrastructure**  | CI-CD-SETUP.md, MULTI-WORKTREE-DEVELOPMENT.md, VERSION-LOCKS.md, REACT-19-FIX.md |
| **Support**         | TROUBLESHOOTING-GUIDE.md, COMMON-PITFALLS.md                                     |
| **Project History** | LESSONS-LEARNED.md (living document)                                             |

## Notes

- **CLAUDE.md** is auto-loaded by Claude Code when working in the docs/ directory
- Archived `.txt` files preserve specific documentation versions for offline use
- Always refer to online sources for the most up-to-date information
- The Open SaaS template is built on top of the Wasp framework
- Both framework documentations are essential for understanding and extending the application
